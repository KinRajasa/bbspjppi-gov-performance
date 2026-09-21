import { ReviewStage, SubmissionStatus } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveIkuReference, type IkuReference } from '@/lib/resolve-iku-reference';
import { createAuditLog } from '@/lib/auditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Antrean Kapokja: Menampilkan laporan yang sudah disetujui Katim (SUBMITTED_TO_KAPOKJA atau DISETUJUI)
    // dan laporan yang sedang dalam revisi oleh Kapokja (REVISION_BY_KAPOKJA)
    // serta laporan yang dikembalikan dari Kapokja ke Katim (REVISION_REQUIRED_BY_KAPOKJA)
    const submissions = await prisma.performanceSubmission.findMany({
      where: {
        physicalRealization: { not: null },
        realizationNarrative: { not: null },
        NOT: { realizationNarrative: '' },
        status: {
          in: [
            SubmissionStatus.SUBMITTED_TO_KAPOKJA,
            SubmissionStatus.DISETUJUI,
            SubmissionStatus.REVISION_BY_KAPOKJA,
            SubmissionStatus.REVISION_REQUIRED_BY_KAPOKJA, // Tambah status yang dikembalikan
          ],
        },
      },
      orderBy: { submittedAt: 'asc' },
      include: {
        indicator: { select: { code: true, name: true, unit: true } },
        submittedBy: { select: { id: true, name: true, email: true } },
        fiscalYear: { select: { year: true } },
        values: { orderBy: { quarter: 'asc' } },
        reviews: {
          orderBy: { reviewedAt: 'desc' },
          include: {
            reviewer: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    const ikuRows = await prisma.indikatorKinerjaUtama.findMany({
      include: {
        sasaran: { select: { namaSasaran: true } },
        pic: { select: { name: true } },
      },
    });

    const data = submissions.map((item) => {
      const iku = resolveIkuReference(item.indicator, ikuRows as IkuReference[]);
      const picName = item.submittedBy?.name ?? iku?.pic?.name ?? 'PIC';
      
      // Ambil catatan & nama Katim dari SubmissionReview stage KATIM
      const katimReview = item.reviews.find(
        (rev) => rev.reviewStage === ReviewStage.KATIM
      );
      const katimName = katimReview?.reviewer?.name ?? 'Ketua Tim';
      const katimNote = katimReview?.note ?? null;
      const katimReviewedAt = katimReview?.reviewedAt?.toISOString() ?? null;

      const quarter = item.reportingQuarter ?? 1;
      const quarterVal = item.values.find((v) => v.quarter === quarter);

      return {
        id: item.id,
        submittedAt: item.submittedAt?.toISOString() ?? item.updatedAt.toISOString(),
        pic: picName,
        katim: katimName,
        katimNote,
        katimReviewedAt,
        sasaranName: iku?.sasaran.namaSasaran ?? 'Sasaran Kegiatan',
        indicator: item.indicator,
        fiscalYear: item.fiscalYear.year,
        reportingMonth: item.reportingMonth,
        reportingQuarter: item.reportingQuarter,
        realizationNarrative: item.realizationNarrative,
        evaluation: item.evaluation,
        constraints: item.constraints,
        followUp: item.followUp,
        physicalRealization: item.physicalRealization?.toString() ?? null,
        evidenceFileUrl:
          item.evidenceFileUrl ??
          item.values.find((value) => value.quarter === item.reportingQuarter)?.evidenceDriveViewUrl ??
          item.values.find((value) => value.quarter === item.reportingQuarter)?.evidenceFileUrl ??
          null,
        targetValue: quarterVal?.targetValue?.toString() ?? null,
        realizationValue: quarterVal?.realizationValue?.toString() ?? null,
        values: item.values.map((value) => ({
          quarter: value.quarter,
          targetValue: value.targetValue?.toString() ?? null,
          realizationValue: value.realizationValue?.toString() ?? null,
          evidenceFileUrl: value.evidenceDriveViewUrl ?? value.evidenceFileUrl,
          sourceSyncRunId: value.sourceSyncRunId,
        })),
        status: item.status,
        revisionNote: item.revisionNote,
        reviewsCount: item.reviews.length,
      };
    });

    // Hitung ringkasan statistik
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const approvedThisMonth = await prisma.performanceSubmission.count({
      where: {
        status: SubmissionStatus.APPROVED,
        approvedAt: { gte: startOfMonth },
      },
    });

    const pending = data.filter(
      (item) =>
        item.status === SubmissionStatus.SUBMITTED_TO_KAPOKJA ||
        item.status === SubmissionStatus.DISETUJUI
    ).length;

    const revised = data.filter(
      (item) =>
        item.status === SubmissionStatus.REVISION_BY_KAPOKJA ||
        item.status === SubmissionStatus.REVISION_REQUIRED_BY_KAPOKJA
    ).length;

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
      summary: {
        pending,
        revised,
        approvedThisMonth,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Antrean validasi Kapokja gagal dimuat.',
      },
      { status: 500 }
    );
  }
}
