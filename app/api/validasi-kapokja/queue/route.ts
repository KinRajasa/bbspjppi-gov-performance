import { NextResponse } from 'next/server';
import { SubmissionStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/validasi-kapokja/queue
 * Mengambil antrean validasi untuk Kapokja dengan penguncian tombol
 * berdasarkan status revisi dari Katim.
 */
export async function GET() {
  try {
    const fiscalYear = await prisma.fiscalYear.findUnique({ where: { year: 2026 } });
    if (!fiscalYear) {
      return NextResponse.json(
        { success: false, message: 'Tahun anggaran 2026 belum tersedia.' },
        { status: 404 }
      );
    }

    // Status yang boleh masuk antrean Kapokja
    const reviewableStatuses: SubmissionStatus[] = [
      SubmissionStatus.SUBMITTED_TO_KAPOKJA,
    ];

    // Status yang sedang dalam revisi (tombol dikunci)
    const revisionStatuses: SubmissionStatus[] = [
      SubmissionStatus.REVISION_REQUIRED_BY_KAPOKJA,
      SubmissionStatus.REVISION_BY_KAPOKJA,
    ];

    const submissions = await prisma.performanceSubmission.findMany({
      where: {
        fiscalYearId: fiscalYear.id,
        physicalRealization: { not: null },
        realizationNarrative: { not: null },
        NOT: { realizationNarrative: '' },
        status: { in: [...reviewableStatuses, ...revisionStatuses] },
      },
      include: {
        indicator: { select: { code: true, name: true } },
        submittedBy: { select: { id: true, name: true } },
        reviews: {
          where: { reviewStage: 'KAPOKJA' },
          orderBy: { reviewedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    const queue = submissions.map((item) => ({
      id: item.id,
      submittedAt: item.submittedAt?.toISOString() ?? null,
      pic: item.submittedBy?.name ?? 'Tidak diketahui',
      indicator: {
        code: item.indicator.code,
        name: item.indicator.name,
      },
      reportingQuarter: item.reportingQuarter,
      status: item.status,
      revisionNote: item.revisionNote,
      isLocked: revisionStatuses.includes(item.status), // Tombol dikunci jika sedang revisi
      lastReview: item.reviews[0] ?? null,
    }));

    const summary = {
      pending: queue.filter((item) => reviewableStatuses.includes(item.status as SubmissionStatus)).length,
      inRevision: queue.filter((item) => revisionStatuses.includes(item.status as SubmissionStatus)).length,
    };

    return NextResponse.json({
      success: true,
      data: queue,
      summary,
    });
  } catch (error) {
    console.error('[VALIDASI_KAPOKJA_QUEUE_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Antrean gagal dimuat.',
      },
      { status: 500 }
    );
  }
}
