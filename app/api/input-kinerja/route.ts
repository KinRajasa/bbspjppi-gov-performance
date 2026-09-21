import { Prisma, SubmissionStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestSession } from '@/lib/request-session';
import { canonicalizePerformanceIndicatorCode } from '@/lib/indicator-catalog';
import { logActivity } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const decimal = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return null;
  const raw = String(value).trim();
  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw.split('.').length > 2 ? raw.replace(/\./g, '') : raw;
  if (!/^\d+(\.\d+)?$/.test(normalized)) throw new Error('Realisasi fisik harus berupa angka.');
  return new Prisma.Decimal(normalized);
};

const text = (value: unknown) => String(value ?? '').trim();

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const session = getRequestSession(request);
    if (!session || session.role !== 'PIC') return NextResponse.json({ success: false, message: 'Input realisasi hanya dapat dilakukan oleh PIC.' }, { status: 403 });
    const ikuId = Number(body.indicatorId);
    const quarter = Number(body.quarter);
    const month = Number(body.reportingMonth);
    const narrative = text(body.realizationNarrative);
    if (!Number.isInteger(ikuId) || ikuId < 1 || ![1, 2, 3, 4].includes(quarter) || !Number.isInteger(month) || month < 1 || month > 12 || !narrative) {
      return NextResponse.json({ success: false, message: 'Indikator, periode, dan realisasi kegiatan wajib diisi.' }, { status: 400 });
    }
    const physicalRealization = decimal(body.physicalRealization);
    if (physicalRealization === null) {
      return NextResponse.json({ success: false, message: 'Realisasi fisik wajib diisi.' }, { status: 400 });
    }
    if (physicalRealization && (physicalRealization.lt(0) || physicalRealization.gt(100))) {
      return NextResponse.json({ success: false, message: 'Realisasi fisik harus berada di antara 0 sampai 100%.' }, { status: 422 });
    }
    const iku = await prisma.indikatorKinerjaUtama.findUnique({ where: { id: ikuId } });
    if (!iku) return NextResponse.json({ success: false, message: 'Indikator tidak ditemukan pada Perjanjian Kinerja.' }, { status: 404 });
    if (iku.picId !== session.id) return NextResponse.json({ success: false, message: 'Indikator ini tidak ditugaskan kepada PIC yang sedang login.' }, { status: 403 });
    const actionPlan = await prisma.actionPlan.findUnique({ where: { indikatorId: iku.id }, include: { quarters: { where: { quarter }, select: { target: true } } } });
    const physicalTarget = actionPlan?.quarters[0]?.target;
    if (physicalTarget !== null && physicalTarget !== undefined && physicalRealization.lt(physicalTarget) && !text(body.constraints)) {
      return NextResponse.json({ success: false, message: 'Kendala wajib diisi karena realisasi fisik masih di bawah target.' }, { status: 422 });
    }
    const fiscalYear = await prisma.fiscalYear.findUnique({ where: { year: 2026 } });
    if (!fiscalYear) return NextResponse.json({ success: false, message: 'Tahun anggaran 2026 belum tersedia.' }, { status: 404 });
    
    const { getSheetCodeForIkuId, normalizeIndicatorName } = await import('@/lib/resolve-iku-reference');
    const sheetCode = getSheetCodeForIkuId(iku.id);
    const canonicalCode = sheetCode ? canonicalizePerformanceIndicatorCode(sheetCode) : null;
    // Gunakan indikator hasil sinkronisasi (kode worksheet) sebagai record
    // submission fisik. Sebelumnya record IKU-${id} selalu dibuat lebih dulu,
    // sehingga proses upload bukti menghasilkan dua submission berbeda.
    let performanceIndicator = canonicalCode
      ? await prisma.performanceIndicator.findFirst({ where: { code: canonicalCode } })
      : null;

    if (!performanceIndicator && canonicalCode) {
      const normalizedSheetCode = canonicalCode!.toLowerCase().replace(/[^a-z0-9]/g, '');
      const allPerf = await prisma.performanceIndicator.findMany();
      performanceIndicator = allPerf.find(
        (item) => item.code.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedSheetCode
      ) ?? null;
    }

    if (!performanceIndicator) {
      const allPerf = await prisma.performanceIndicator.findMany();
      const ikuNorm = normalizeIndicatorName(iku.namaIku);
      performanceIndicator = allPerf.find((item) => {
        const itemNorm = normalizeIndicatorName(item.name);
        return ikuNorm && (itemNorm.includes(ikuNorm) || ikuNorm.includes(itemNorm));
      }) ?? null;
    }

    if (!performanceIndicator) {
      if (!canonicalCode) {
        return NextResponse.json({ success: false, message: 'Indikator belum memiliki kode kanonik dari 18 IKU resmi.' }, { status: 422 });
      }
      performanceIndicator = await prisma.performanceIndicator.create({
        data: {
          code: canonicalCode,
          name: iku.namaIku,
          unit: iku.satuan,
        },
      });
    } else if (!performanceIndicator.unit && iku.satuan) {
      await prisma.performanceIndicator.update({
        where: { id: performanceIndicator.id },
        data: { unit: iku.satuan },
      });
    }

    const saved = await prisma.$transaction(async (tx) => {
      const picUserId = session.id;

      // Pengecekan status kunci hanya untuk triwulan yang dikirim (reportingQuarter = quarter)
      const currentQuarterSubmission = await tx.performanceSubmission.findUnique({
        where: {
          fiscalYearId_indicatorId_reportingQuarter: {
            fiscalYearId: fiscalYear.id,
            indicatorId: performanceIndicator.id,
            reportingQuarter: quarter,
          },
        },
        select: { status: true },
      });

      if (
        currentQuarterSubmission?.status === SubmissionStatus.APPROVED ||
        currentQuarterSubmission?.status === SubmissionStatus.PUBLISHED ||
        currentQuarterSubmission?.status === SubmissionStatus.DISETUJUI
      ) {
        throw new Error(`Laporan Triwulan ${quarter} untuk indikator ini sudah disetujui (APPROVED) dan tidak dapat diubah.`);
      }

      const submission = await tx.performanceSubmission.upsert({
        where: {
          fiscalYearId_indicatorId_reportingQuarter: {
            fiscalYearId: fiscalYear.id,
            indicatorId: performanceIndicator.id,
            reportingQuarter: quarter,
          },
        },
        create: { 
          fiscalYearId: fiscalYear.id, 
          indicatorId: performanceIndicator.id, 
          submittedById: picUserId,
          status: SubmissionStatus.SUBMITTED_TO_KATIM, 
          reportingQuarter: quarter, 
          reportingMonth: month,
          realizationNarrative: narrative, 
          evaluation: text(body.evaluation) || null, 
          constraints: text(body.constraints) || null, 
          followUp: text(body.followUp) || null, 
          physicalRealization,
          submittedAt: new Date(),
        },
        update: { 
          // Submission yang dibuat lebih dulu oleh sinkronisasi Excel biasanya
          // masih berstatus DRAFT dan submittedById-nya kosong. Saat PIC
          // mengirim realisasi, klaim kepemilikan harus ikut disimpan agar
          // laporan muncul di Riwayat Pengajuan miliknya.
          submittedById: picUserId,
          status: SubmissionStatus.SUBMITTED_TO_KATIM, 
          reportingQuarter: quarter, 
          reportingMonth: month,
          realizationNarrative: narrative, 
          evaluation: text(body.evaluation) || null, 
          constraints: text(body.constraints) || null, 
          followUp: text(body.followUp) || null, 
          physicalRealization, 
          revisionNote: null,
          submittedAt: new Date(),
        },
      });

      // Pastikan ada row di quarterly_performance_values untuk triwulan ini
      const existingValue = await tx.quarterlyPerformanceValue.findUnique({
        where: { performanceSubmissionId_quarter: { performanceSubmissionId: submission.id, quarter } },
      });

      if (!existingValue) {
        await tx.quarterlyPerformanceValue.create({
          data: {
            performanceSubmissionId: submission.id,
            quarter,
            targetValue: null,
            realizationValue: null,
          },
        });
      }

      return submission;
    });
    void logActivity({
      req: request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      actionType: 'INPUT DATA',
      description: `Mengirim realisasi fisik untuk indikator ${performanceIndicator.name}, TW ${quarter}.`,
      moduleReference: 'Input Kinerja',
      referenceType: 'PerformanceSubmission',
      referenceId: saved.id,
    });
    return NextResponse.json({ success: true, message: 'Laporan berhasil dikirim ke Katim.', submissionId: saved.id, status: SubmissionStatus.SUBMITTED_TO_KATIM });
  } catch (error) {
    console.error('[INPUT_KINERJA_SAVE_ERROR]', error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Laporan gagal disimpan.' }, { status: 422 });
  }
}
