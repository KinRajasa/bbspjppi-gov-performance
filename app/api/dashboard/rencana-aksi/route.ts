import { NextRequest, NextResponse } from 'next/server';
import { SubmissionStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { canonicalIkuList, normalizeIndicatorLabel } from '@/lib/dashboard/canonical-iku';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/rencana-aksi
 *
 * Ringkasan ini adalah data eksekutif, jadi hanya laporan yang sudah selesai
 * di-approve Kapokja yang boleh masuk. Submission draft, antrean Katim,
 * antrean Kapokja, dan seluruh status revisi sengaja tidak ikut dihitung.
 */
export async function GET(request: NextRequest) {
  try {
    const year = Number(request.nextUrl.searchParams.get('year') ?? 2026);
    const requestedQuarter = Number(request.nextUrl.searchParams.get('quarter') ?? 4);
    const quarter = Number.isInteger(requestedQuarter) ? Math.min(4, Math.max(1, requestedQuarter)) : 4;
    const fiscalYear = await prisma.fiscalYear.findUnique({ where: { year }, select: { id: true } });
    const targetCumulative = quarter * 25;
    if (!fiscalYear) {
      return NextResponse.json({
        success: true,
        data: {
          year,
          quarter,
          targetCumulative,
          indicators: [],
          summary: { avgRealisasi: 0, targetCumulative, onTrack: 0, delayed: 0, total: 0 },
        },
      });
    }

    const [actionPlans, approvedSubmissions] = await Promise.all([
      prisma.actionPlan.findMany({
        include: {
          indikator: { select: { id: true, namaIku: true, satuan: true, pic: { select: { name: true } } } },
          // Target rencana aksi dijumlahkan dari TW I sampai periode aktif.
          quarters: { where: { quarter: { lte: quarter } }, orderBy: { quarter: 'asc' } },
        },
      }),
      // APPROVED adalah status final lama, sedangkan PUBLISHED adalah status
      // final pada alur Kapokja saat ini. Ambil semua TW sebelumnya agar
      // realisasi yang ditampilkan bersifat kumulatif.
      prisma.performanceSubmission.findMany({
        where: {
          fiscalYearId: fiscalYear.id,
          reportingQuarter: { lte: quarter },
          status: { in: [SubmissionStatus.PUBLISHED, SubmissionStatus.APPROVED] },
          physicalRealization: { not: null },
        },
        orderBy: [{ indicatorId: 'asc' }, { reportingQuarter: 'asc' }],
        select: {
          id: true,
          indicatorId: true,
          reportingQuarter: true,
          physicalRealization: true,
          indicator: { select: { name: true, unit: true } },
        },
      }),
    ]);

    const plansByIndicator = new Map(actionPlans.map((plan) => [plan.indikator.id, plan]));
    const submissionsByIndicator = new Map<number, typeof approvedSubmissions>();
    for (const submission of approvedSubmissions) {
      const values = submissionsByIndicator.get(submission.indicatorId) ?? [];
      values.push(submission);
      submissionsByIndicator.set(submission.indicatorId, values);
    }

    const rank = (name: string) => canonicalIkuList.findIndex((definition) =>
      normalizeIndicatorLabel(definition.name) === normalizeIndicatorLabel(name),
    );

    // Selalu kembalikan 18 bar sesuai daftar IKU, bukan hanya indikator yang
    // sudah memiliki submission approved. Bar tanpa data diberi hasData=false.
    const indicators = canonicalIkuList.map((definition, definitionIndex) => {
      const matching = [...submissionsByIndicator.entries()].find(([, submissions]) =>
        rank(submissions[0]?.indicator.name ?? '') === definitionIndex,
      );
      const indicatorId = matching?.[0] ?? -(definitionIndex + 1);
      const submissions = matching?.[1] ?? [];
      const plan = matching ? plansByIndicator.get(indicatorId) : undefined;
      const indicator = submissions[0]?.indicator;
      const hasData = submissions.length > 0;
      const targetKumulatif = plan && plan.quarters.length > 0
        ? plan.quarters.reduce((sum, item) => sum + Number(item.target ?? 0), 0)
        : targetCumulative;
      const realisasi = submissions.reduce((sum, item) => sum + Number(item.physicalRealization ?? 0), 0);
      return {
        id: indicatorId,
        name: definition.name,
        pic: plan?.indikator.pic?.name ?? 'PIC',
        satuan: plan?.indikator.satuan ?? indicator?.unit ?? '%',
        targetKumulatif: Number(targetKumulatif.toFixed(2)),
        realisasiKumulatif: Number(realisasi.toFixed(2)),
        isOnTrack: hasData && realisasi >= targetKumulatif,
        hasData,
      };
    });

    // Hitung ringkasan
    const indicatorsWithData = indicators.filter((ind) => ind.hasData);
    const onTrackCount = indicatorsWithData.filter((ind) => ind.isOnTrack).length;
    const delayedCount = indicatorsWithData.length - onTrackCount;
    const avgRealisasi =
      indicatorsWithData.length > 0
        ? indicatorsWithData.reduce((sum, ind) => sum + ind.realisasiKumulatif, 0) / indicatorsWithData.length
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        year,
        quarter,
        indicators,
        summary: {
          avgRealisasi: Number(avgRealisasi.toFixed(2)),
          targetCumulative,
          onTrack: onTrackCount,
          delayed: delayedCount,
          total: indicatorsWithData.length,
        },
      },
    });
  } catch (error) {
    console.error('[DASHBOARD_RENCANA_AKSI_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Gagal memuat data rencana aksi.',
      },
      { status: 500 }
    );
  }
}
