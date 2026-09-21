import { SubmissionStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getRequestSession } from '@/lib/request-session';
import { getAssignedPerformanceIndicatorIdsForPic } from '@/lib/katim-assignment';
import { logActivity } from '@/lib/logger';
import { uploadEvidenceToDrive } from '@/lib/google-drive';

export const runtime = 'nodejs';

const MAX_EVIDENCE_SIZE = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export async function POST(request: NextRequest) {
  try {
    const session = getRequestSession(request);
    if (!session || session.role !== 'PIC') return NextResponse.json({ message: 'Pengajuan bukti hanya dapat dilakukan oleh PIC.' }, { status: 403 });
    const form = await request.formData();
    const indicatorCode = String(form.get('indicatorCode') ?? '').trim();
    const year = Number(form.get('year'));
    const quarter = Number(form.get('quarter'));
    const physicalSubmissionId = Number(form.get('physicalSubmissionId'));
    const evidenceLink = String(form.get('evidenceLink') ?? '').trim();
    const uploadedFile = form.get('file');
    const file = uploadedFile instanceof File && uploadedFile.size > 0 ? uploadedFile : null;
    if (!indicatorCode || !Number.isInteger(year) || !Number.isInteger(quarter) || quarter < 1 || quarter > 4 || (!file && !evidenceLink)) {
      return NextResponse.json({ message: 'indicatorCode, year, quarter, dan bukti dukung wajib valid.' }, { status: 400 });
    }
    if (file) {
      if (file.size > MAX_EVIDENCE_SIZE) return NextResponse.json({ message: 'Ukuran bukti dukung maksimal 25 MB.' }, { status: 413 });
      if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) return NextResponse.json({ message: 'Tipe file tidak didukung. Gunakan PDF, DOCX, XLSX, JPG, PNG, atau WEBP.' }, { status: 415 });
    }
    const requestedIndicator = await prisma.performanceIndicator.findUnique({ where: { code: indicatorCode }, select: { id: true } });
    const assignedPerformanceIds = await getAssignedPerformanceIndicatorIdsForPic(session.id);
    if (!requestedIndicator || !assignedPerformanceIds.includes(requestedIndicator.id)) {
      return NextResponse.json({ message: 'Indikator ini tidak ditugaskan kepada PIC yang sedang login.' }, { status: 403 });
    }

    // Hanya nilai yang berasal dari proses Google Sheets yang boleh diajukan
    // dari halaman Input Realisasi.
    const value = await prisma.quarterlyPerformanceValue.findFirst({
      where: {
        quarter,
        sourceSyncRunId: { not: null },
        performanceSubmission: {
          fiscalYear: { year },
          indicator: { code: indicatorCode },
          reportingQuarter: quarter,
        },
      },
      select: {
        id: true,
        targetValue: true,
        realizationValue: true,
        performanceSubmissionId: true,
        performanceSubmission: { select: { status: true } },
      },
    });

    if (!value) return NextResponse.json({ message: 'Data Aktual IKU dari sinkronisasi Excel belum tersedia.' }, { status: 404 });
    if (value.targetValue === null || value.realizationValue === null) return NextResponse.json({ message: 'Target dan realisasi aktual dari Excel harus tersedia sebelum laporan diajukan.' }, { status: 422 });
    if (value.performanceSubmission.status === SubmissionStatus.APPROVED || value.performanceSubmission.status === SubmissionStatus.DISETUJUI) {
      return NextResponse.json({ message: 'Laporan yang sudah disetujui tidak dapat diubah.' }, { status: 409 });
    }

    const physicalSubmission = Number.isInteger(physicalSubmissionId) && physicalSubmissionId > 0
      ? await prisma.performanceSubmission.findUnique({
        where: { id: physicalSubmissionId },
        select: {
          id: true,
          indicatorId: true,
          submittedById: true,
          reportingMonth: true,
          reportingQuarter: true,
          realizationNarrative: true,
          evaluation: true,
          constraints: true,
          followUp: true,
          physicalRealization: true,
        },
      })
      : null;

    if (Number.isInteger(physicalSubmissionId) && physicalSubmissionId > 0 && !physicalSubmission) {
      return NextResponse.json({ message: 'Data realisasi fisik PIC tidak ditemukan.' }, { status: 404 });
    }
    const legacyPhysicalOwner = Boolean(
      physicalSubmission &&
      physicalSubmission.submittedById === null &&
      assignedPerformanceIds.includes(physicalSubmission.indicatorId),
    );
    if (physicalSubmission && physicalSubmission.submittedById !== session.id && !legacyPhysicalOwner) {
      return NextResponse.json({ message: 'Data realisasi ini bukan milik PIC yang sedang login.' }, { status: 403 });
    }

    const driveFile = file
      ? await uploadEvidenceToDrive({
        buffer: Buffer.from(await file.arrayBuffer()),
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
      })
      : null;
    const evidenceFileUrl = driveFile?.viewUrl ?? evidenceLink;
    const evidenceFileName = driveFile?.fileName ?? (evidenceLink ? evidenceLink.split('/').pop() ?? 'Tautan bukti dukung' : null);
    const evidenceMimeType = driveFile?.mimeType ?? null;
    const evidenceFileSize = driveFile?.fileSize ?? null;
    const evidenceDriveFileId = driveFile?.fileId ?? null;
    const evidenceDriveViewUrl = driveFile?.viewUrl ?? (evidenceLink || null);
    const updated = await prisma.$transaction(async (tx) => {
      const updatedValue = await tx.quarterlyPerformanceValue.update({
        where: { id: value.id },
        data: {
          evidenceFileUrl,
          evidenceDriveFileId,
          evidenceDriveViewUrl,
          evidenceFileName,
          evidenceMimeType,
          evidenceFileSize,
          evidenceUploadedAt: new Date(),
        },
      });
      await tx.performanceSubmission.update({
        where: { id: value.performanceSubmissionId },
        data: {
          status: SubmissionStatus.SUBMITTED_TO_KATIM,
          submittedAt: new Date(),
          ...(physicalSubmission ? {
            submittedById: session.id,
            reportingMonth: physicalSubmission.reportingMonth,
            reportingQuarter: physicalSubmission.reportingQuarter,
            realizationNarrative: physicalSubmission.realizationNarrative,
            evaluation: physicalSubmission.evaluation,
            constraints: physicalSubmission.constraints,
            followUp: physicalSubmission.followUp,
            physicalRealization: physicalSubmission.physicalRealization,
          } : {}),
        },
      });

      if (physicalSubmission && physicalSubmission.id !== value.performanceSubmissionId) {
        await tx.performanceSubmission.update({
          where: { id: physicalSubmission.id },
          data: {
            status: SubmissionStatus.SUBMITTED_TO_KATIM,
            evidenceFileUrl,
            submittedAt: new Date(),
          },
        });
        // Satukan record fisik lama ke submission indikator hasil sync agar
        // antrean Katim tidak menampilkan dua entri untuk satu pengajuan.
        await tx.performanceSubmission.delete({ where: { id: physicalSubmission.id } });
      }

      return updatedValue;
    });

    void logActivity({
      req: request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      actionType: 'INPUT DATA',
      description: `Mengunggah bukti dukung untuk indikator ${indicatorCode}, TW ${quarter}.`,
      moduleReference: 'Input Realisasi & Bukti Dukung',
      referenceType: 'PerformanceSubmission',
      referenceId: value.performanceSubmissionId,
    });

    return NextResponse.json({
      message: 'Bukti berhasil dicatat. Data Aktual IKU telah diajukan ke Katim.',
      evidenceFileUrl: updated.evidenceFileUrl,
      evidenceDriveFileId,
      status: SubmissionStatus.MENUNGGU_VALIDASI_KATIM,
      physicalDataIncluded: Boolean(physicalSubmission),
    });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Gagal menyimpan bukti.' }, { status: 422 });
  }
}
