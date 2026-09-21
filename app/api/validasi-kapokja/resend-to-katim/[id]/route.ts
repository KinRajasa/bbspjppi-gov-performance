import { SubmissionStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PATCH /api/validasi-kapokja/resend-to-katim/[id]
 * Ketua Tim mengirim ulang laporan yang direvisi dari Kapokja kembali ke Kapokja
 * Status berubah dari REVISION_REQUIRED_BY_KAPOKJA -> SUBMITTED_TO_KAPOKJA
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
        select: { status: true },
      });

      if (!current) {
        throw new Error('Laporan tidak ditemukan.');
      }

      // Hanya laporan dengan status REVISION_REQUIRED_BY_KAPOKJA yang bisa dikirim ulang ke Kapokja
      if (current.status !== SubmissionStatus.REVISION_REQUIRED_BY_KAPOKJA) {
        throw new Error('Hanya laporan yang memerlukan revisi dari Kapokja yang dapat dikirim ulang.');
      }

      // Ubah status kembali ke SUBMITTED_TO_KAPOKJA agar masuk antrean Kapokja lagi
      const submission = await tx.performanceSubmission.update({
        where: { id },
        data: {
          status: SubmissionStatus.SUBMITTED_TO_KAPOKJA,
          revisionNote: null, // Hapus catatan revisi lama
          submittedAt: new Date(), // Update waktu submit
        },
      });

      return submission;
    });

    return NextResponse.json({
      success: true,
      message: 'Laporan berhasil dikirim ulang ke Kapokja untuk ditinjau kembali.',
      status: updated.status,
    });
  } catch (error) {
    console.error('[RESEND_TO_KAPOKJA_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Gagal mengirim ulang laporan.',
      },
      { status: 422 }
    );
  }
}
