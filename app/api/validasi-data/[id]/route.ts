import { ReviewDecision, ReviewStage, SubmissionStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveIkuReference, type IkuReference } from '@/lib/resolve-iku-reference';
import { getRequestSession } from '@/lib/request-session';
import { getAssignedPerformanceIndicatorIds, getAssignedPerformanceIndicatorIdsForPic } from '@/lib/katim-assignment';
import { logActivity } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Keep the endpoint compatible with a dev server that still has an older
// generated Prisma Client (without the newer REVISI_KATIM enum member).
const revisiKatimStatus = (SubmissionStatus as unknown as Record<string, SubmissionStatus>).REVISI_KATIM ?? ('REVISION_BY_KATIM' as SubmissionStatus);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ success: false, message: 'Sesi login tidak ditemukan.' }, { status: 401 });
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ success: false, message: 'ID laporan tidak valid.' }, { status: 400 });
  const item = await prisma.performanceSubmission.findUnique({ where: { id }, include: { indicator: true, submittedBy: { select: { id: true, name: true, email: true } }, fiscalYear: true, values: { orderBy: { quarter: 'asc' } }, reviews: { orderBy: { reviewedAt: 'desc' }, take: 5 } } });
  if (!item) return NextResponse.json({ success: false, message: 'Laporan tidak ditemukan.' }, { status: 404 });
  if (session.role === 'KATIM') {
    const assignedPerformanceIds = await getAssignedPerformanceIndicatorIds(session.id);
    if (!assignedPerformanceIds.includes(item.indicatorId)) return NextResponse.json({ success: false, message: 'Laporan ini bukan bagian dari indikator yang ditugaskan kepada Anda.' }, { status: 403 });
  } else if (session.role === 'PIC') {
    const assignedPerformanceIds = await getAssignedPerformanceIndicatorIdsForPic(session.id);
    const legacyOwnerFallback = item.submittedById === null && assignedPerformanceIds.includes(item.indicatorId);
    if (item.submittedById !== session.id && !legacyOwnerFallback) return NextResponse.json({ success: false, message: 'Laporan ini bukan milik PIC yang sedang login.' }, { status: 403 });
  } else {
    return NextResponse.json({ success: false, message: 'Detail laporan tidak dapat diakses oleh role ini.' }, { status: 403 });
  }
  const ikuRows = await prisma.indikatorKinerjaUtama.findMany({ include: { sasaran: { select: { namaSasaran: true } }, pic: { select: { name: true } } } });
  const iku = resolveIkuReference(item.indicator, ikuRows as IkuReference[]);
  return NextResponse.json({
    success: true,
    data: {
      ...item,
      ikuId: iku?.id ?? null,
      sasaranName: iku?.sasaran.namaSasaran ?? '',
      physicalRealization: item.physicalRealization?.toString() ?? null,
      evidenceFileUrl: item.evidenceFileUrl ?? item.values.find((value) => value.quarter === item.reportingQuarter)?.evidenceDriveViewUrl ?? item.values.find((value) => value.quarter === item.reportingQuarter)?.evidenceFileUrl ?? null,
      values: item.values.map((value) => ({
        quarter: value.quarter,
        targetValue: value.targetValue?.toString() ?? null,
        realizationValue: value.realizationValue?.toString() ?? null,
        evidenceFileUrl: value.evidenceDriveViewUrl ?? value.evidenceFileUrl,
        sourceSyncRunId: value.sourceSyncRunId,
      })),
    },
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);
    if (!session || session.role !== 'KATIM') return NextResponse.json({ success: false, message: 'Validasi hanya dapat dilakukan oleh KATIM.' }, { status: 403 });
    const id = Number((await params).id);
    const body = await request.json() as { action?: unknown; note?: unknown };
    const action = body.action === 'approve' ? 'approve' : body.action === 'reject' ? 'reject' : null;
    const note = typeof body.note === 'string' ? body.note.trim() : '';
    if (!Number.isInteger(id) || id < 1 || !action) return NextResponse.json({ success: false, message: 'Aksi validasi tidak valid.' }, { status: 400 });
    if (action === 'reject' && !note) return NextResponse.json({ success: false, message: 'Catatan revisi wajib diisi saat menolak laporan.' }, { status: 422 });
    const saved = await prisma.$transaction(async (tx) => {
      const current = await tx.performanceSubmission.findUnique({ where: { id }, select: { status: true } });
      const assignedPerformanceIds = await getAssignedPerformanceIndicatorIds(session.id);
      const submission = await tx.performanceSubmission.findUnique({ where: { id }, select: { indicatorId: true } });
      if (!submission || !assignedPerformanceIds.includes(submission.indicatorId)) throw new Error('Laporan ini bukan bagian dari indikator yang ditugaskan kepada Anda.');
      const reviewableStatuses: SubmissionStatus[] = [
        SubmissionStatus.MENUNGGU_VALIDASI_KATIM,
        SubmissionStatus.SUBMITTED_TO_KATIM,
        // Status REVISION_REQUIRED_BY_KATIM/REVISION_BY_KATIM/DITOLAK_KATIM
        // dikunci sampai PIC mengirim ulang melalui endpoint resend.
        SubmissionStatus.REVISION_BY_KAPOKJA,
        SubmissionStatus.REVISION_REQUIRED_BY_KAPOKJA,
      ];
      if (!current || !reviewableStatuses.includes(current.status)) throw new Error('Laporan tidak berada dalam antrean validasi Katim.');
      
      const nextStatus = action === 'approve' 
        ? SubmissionStatus.SUBMITTED_TO_KAPOKJA 
        : SubmissionStatus.REVISION_REQUIRED_BY_KATIM;
      const updated = await tx.performanceSubmission.update({
        where: { id },
        data: {
          status: nextStatus,
          revisionNote: action === 'reject' ? note : null,
          approvedAt: null, // Approval final ada di tangan Kapokja
        },
      });

      const effectiveReviewerId = session.id;

      await tx.submissionReview.create({
        data: {
          performanceSubmissionId: id,
          reviewerUserId: effectiveReviewerId,
          reviewStage: ReviewStage.KATIM,
          decision: action === 'approve' ? ReviewDecision.APPROVED : ReviewDecision.REVISION,
          note: note || (action === 'approve' ? 'Disetujui oleh Ketua Tim (Katim) dan diteruskan ke Kapokja.' : 'Perlu revisi.'),
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
      description: action === 'approve' ? 'Menyetujui laporan dan meneruskannya ke Kapokja.' : `Meminta revisi laporan: ${note}`,
      moduleReference: 'Validasi Katim',
      referenceType: 'PerformanceSubmission',
      referenceId: id,
    });
    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Laporan berhasil disetujui Katim dan diteruskan ke Kapokja.' : 'Laporan ditolak dan dikembalikan untuk revisi.',
      status: saved.status,
    });
  } catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Validasi gagal diproses.' }, { status: 422 }); }
}
