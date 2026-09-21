import { NextResponse } from 'next/server';
import { ReviewDecision, ReviewStage, SubmissionStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getRequestSession } from '@/lib/request-session';
import { getAssignedPerformanceIndicatorIds } from '@/lib/katim-assignment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PATCH /api/validasi-data/revise-from-kapokja/[id]
 * Endpoint khusus untuk Katim mengirim ulang laporan yang ditolak Kapokja
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getRequestSession(request);
    if (!session || session.role !== 'KATIM') {
      return NextResponse.json({ success: false, message: 'Pengiriman ulang hanya dapat dilakukan oleh KATIM.' }, { status: 403 });
    }
    const id = Number((await params).id);
    const body = (await request.json()) as { note?: unknown };
    const note = typeof body.note === 'string' ? body.note.trim() : '';

    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json(
        { success: false, message: 'ID laporan tidak valid.' },
        { status: 400 }
      );
    }

    const saved = await prisma.$transaction(async (tx) => {
      const current = await tx.performanceSubmission.findUnique({
        where: { id },
        select: { status: true, indicatorId: true },
      });

      if (!current) {
        throw new Error('Laporan tidak ditemukan.');
      }
      const assignedPerformanceIds = await getAssignedPerformanceIndicatorIds(session.id);
      if (!assignedPerformanceIds.includes(current.indicatorId)) throw new Error('Laporan ini bukan bagian dari indikator yang ditugaskan kepada Anda.');

      // Hanya laporan yang ditolak Kapokja yang bisa direvisi oleh Katim
      if (current.status !== SubmissionStatus.REVISION_REQUIRED_BY_KAPOKJA) {
        throw new Error('Laporan ini tidak dalam status revisi dari Kapokja.');
      }

      // Update status menjadi SUBMITTED_TO_KAPOKJA (kirim ulang ke Kapokja)
      const updated = await tx.performanceSubmission.update({
        where: { id },
        data: {
          status: SubmissionStatus.SUBMITTED_TO_KAPOKJA,
          revisionNote: null, // Hapus catatan revisi lama
        },
      });

      // Tentukan reviewerUserId Katim
      const effectiveReviewerId = session.id;

      // Catat review bahwa Katim telah merevisi dan mengirim ulang
      await tx.submissionReview.create({
        data: {
          performanceSubmissionId: id,
          reviewerUserId: effectiveReviewerId,
          reviewStage: ReviewStage.KATIM,
          decision: ReviewDecision.APPROVED,
          note: note || 'Laporan telah diperbaiki oleh Katim dan dikirim ulang ke Kapokja.',
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: 'Laporan berhasil diperbaiki dan dikirim ulang ke Kapokja.',
      status: saved.status,
    });
  } catch (error) {
    console.error('[KATIM_REVISE_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Pengiriman ulang gagal.',
      },
      { status: 422 }
    );
  }
}
