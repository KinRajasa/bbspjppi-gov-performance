import { ReviewDecision, ReviewStage, SubmissionStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveIkuReference, type IkuReference } from '@/lib/resolve-iku-reference';
import { getRequestSession } from '@/lib/request-session';
import { logActivity } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
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

    const item = await prisma.performanceSubmission.findUnique({
      where: { id },
      include: {
        indicator: true,
        submittedBy: { select: { id: true, name: true, email: true } },
        fiscalYear: true,
        values: { orderBy: { quarter: 'asc' } },
        reviews: {
          orderBy: { reviewedAt: 'desc' },
          include: {
            reviewer: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Laporan tidak ditemukan.' },
        { status: 404 }
      );
    }

    const ikuRows = await prisma.indikatorKinerjaUtama.findMany({
      include: {
        sasaran: { select: { namaSasaran: true } },
        pic: { select: { name: true } },
      },
    });

    const iku = resolveIkuReference(item.indicator, ikuRows as IkuReference[]);

    // Identifikasi review dari Katim (Tahap 1)
    const katimReview = item.reviews.find(
      (rev) => rev.reviewStage === ReviewStage.KATIM
    );

    // Identifikasi review dari Kapokja (jika ada review sebelumnya)
    const kapokjaReview = item.reviews.find(
      (rev) => rev.reviewStage === ReviewStage.KAPOKJA
    );

    const isLocked = item.status === SubmissionStatus.APPROVED || item.status === SubmissionStatus.PUBLISHED || item.status === SubmissionStatus.REVISION_REQUIRED_BY_KAPOKJA;

    return NextResponse.json({
      success: true,
      data: {
        ...item,
        sasaranName: iku?.sasaran.namaSasaran ?? 'Sasaran Kegiatan',
        physicalRealization: item.physicalRealization?.toString() ?? null,
        evidenceFileUrl:
          item.evidenceFileUrl ??
          item.values.find((value) => value.quarter === item.reportingQuarter)?.evidenceDriveViewUrl ??
          item.values.find((value) => value.quarter === item.reportingQuarter)?.evidenceFileUrl ??
          null,
        values: item.values.map((value) => ({
          quarter: value.quarter,
          targetValue: value.targetValue?.toString() ?? null,
          realizationValue: value.realizationValue?.toString() ?? null,
          evidenceFileUrl: value.evidenceDriveViewUrl ?? value.evidenceFileUrl,
          sourceSyncRunId: value.sourceSyncRunId,
        })),
        katimReview: katimReview
          ? {
              reviewerName: katimReview.reviewer.name,
              decision: katimReview.decision,
              note: katimReview.note,
              reviewedAt: katimReview.reviewedAt.toISOString(),
            }
          : null,
        kapokjaReview: kapokjaReview
          ? {
              reviewerName: kapokjaReview.reviewer.name,
              decision: kapokjaReview.decision,
              note: kapokjaReview.note,
              reviewedAt: kapokjaReview.reviewedAt.toISOString(),
            }
          : null,
        isLocked,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Detail gagal dimuat.',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getRequestSession(request);
    if (!session || session.role !== 'KAPOKJA') {
      return NextResponse.json({ success: false, message: 'Validasi hanya dapat dilakukan oleh KAPOKJA.' }, { status: 403 });
    }
    const id = Number((await params).id);
    const body = (await request.json()) as {
      action?: unknown;
      note?: unknown;
      reviewerUserId?: unknown;
    };

    const action =
      body.action === 'approve'
        ? 'approve'
        : body.action === 'reject'
        ? 'reject'
        : null;
    const note = typeof body.note === 'string' ? body.note.trim() : '';

    if (!Number.isInteger(id) || id < 1 || !action) {
      return NextResponse.json(
        { success: false, message: 'Aksi validasi tidak valid.' },
        { status: 400 }
      );
    }

    if (action === 'reject' && !note) {
      return NextResponse.json(
        { success: false, message: 'Catatan revisi wajib diisi saat menolak/mengembalikan laporan.' },
        { status: 422 }
      );
    }

    const saved = await prisma.$transaction(async (tx) => {
      const current = await tx.performanceSubmission.findUnique({
        where: { id },
        select: { status: true },
      });

      if (!current) {
        throw new Error('Laporan tidak ditemukan.');
      }

      if (current.status === SubmissionStatus.PUBLISHED || current.status === SubmissionStatus.APPROVED) {
        throw new Error('Laporan ini sudah disetujui final dan telah dikunci (locked).');
      }

      // Pastikan status laporan adalah antrean yang bisa ditinjau oleh Kapokja
      const reviewableStatuses: SubmissionStatus[] = [
        SubmissionStatus.SUBMITTED_TO_KAPOKJA,
      ];

      if (!reviewableStatuses.includes(current.status)) {
        throw new Error('Laporan belum disetujui oleh Katim atau tidak berada dalam antrean Kapokja.');
      }

      // Tentukan status baru
      const nextStatus =
        action === 'approve'
          ? SubmissionStatus.PUBLISHED
          : SubmissionStatus.REVISION_REQUIRED_BY_KAPOKJA;

      const updated = await tx.performanceSubmission.update({
        where: { id },
        data: {
          status: nextStatus,
          revisionNote: action === 'reject' ? note : null,
          approvedAt: action === 'approve' ? new Date() : null,
        },
      });

      // Tentukan reviewerUserId Kapokja
      const effectiveReviewerId = session.id;

      // Buat log submission_review untuk Kapokja
      await tx.submissionReview.create({
        data: {
          performanceSubmissionId: id,
          reviewerUserId: effectiveReviewerId,
          reviewStage: ReviewStage.KAPOKJA,
          decision: action === 'approve' ? ReviewDecision.APPROVED : ReviewDecision.REVISION,
          note:
            note ||
            (action === 'approve'
              ? 'Disetujui final dan dipublikasikan oleh Kepala Pokja (Kapokja).'
              : 'Perlu revisi/perbaikan.'),
        },
      });

      return updated;
    });

    void logActivity({
      req: request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      actionType: action === 'approve' ? 'VALIDASI' : 'PENOLAKAN',
      description: action === 'approve' ? 'Menyetujui final dan mempublikasikan laporan.' : `Meminta revisi laporan: ${note}`,
      moduleReference: 'Validasi Kapokja',
      referenceType: 'PerformanceSubmission',
      referenceId: id,
    });

    return NextResponse.json({
      success: true,
      message:
        action === 'approve'
          ? 'Laporan berhasil disetujui final, dikunci, dan dipublikasikan ke Dashboard Eksekutif.'
          : 'Laporan ditolak dan dikembalikan ke antrean Katim/PIC dengan catatan revisi.',
      status: saved.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Validasi Kapokja gagal diproses.',
      },
      { status: 422 }
    );
  }
}
