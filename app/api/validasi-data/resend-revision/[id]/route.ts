import { SubmissionStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestSession } from '@/lib/request-session';
import { getAssignedPerformanceIndicatorIdsForPic } from '@/lib/katim-assignment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PATCH /api/validasi-data/resend-revision/[id]
 * PIC mengirim ulang laporan yang sudah diperbaiki setelah revisi dari Katim
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getRequestSession(request);
    if (!session || session.role !== 'PIC') {
      return NextResponse.json({ success: false, message: 'Pengiriman ulang hanya dapat dilakukan oleh PIC.' }, { status: 403 });
    }
    const id = Number((await params).id);
    
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json(
        { success: false, message: 'ID laporan tidak valid.' },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.performanceSubmission.findUnique({
        where: { id },
        select: { status: true, submittedById: true, indicatorId: true },
      });

      if (!current) {
        throw new Error('Laporan tidak ditemukan.');
      }
      const assignedPerformanceIds = await getAssignedPerformanceIndicatorIdsForPic(session.id);
      const legacyOwnerFallback = current.submittedById === null && assignedPerformanceIds.includes(current.indicatorId);
      if (current.submittedById !== session.id && !legacyOwnerFallback) {
        throw new Error('Laporan ini bukan milik PIC yang sedang login.');
      }

      // Hanya laporan dengan status REVISION_REQUIRED_BY_KATIM yang bisa dikirim ulang
      if (current.status !== SubmissionStatus.REVISION_REQUIRED_BY_KATIM) {
        throw new Error('Hanya laporan yang memerlukan revisi dari Katim yang dapat dikirim ulang.');
      }

      // Ubah status kembali ke SUBMITTED_TO_KATIM agar masuk antrean Katim lagi
      const submission = await tx.performanceSubmission.update({
        where: { id },
        data: {
          submittedById: session.id,
          status: SubmissionStatus.SUBMITTED_TO_KATIM,
          revisionNote: null, // Hapus catatan revisi lama
          submittedAt: new Date(), // Update waktu submit
        },
      });

      return submission;
    });

    return NextResponse.json({
      success: true,
      message: 'Laporan berhasil dikirim ulang ke Katim untuk ditinjau kembali.',
      status: updated.status,
    });
  } catch (error) {
    console.error('[RESEND_REVISION_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Gagal mengirim ulang laporan.',
      },
      { status: 422 }
    );
  }
}
