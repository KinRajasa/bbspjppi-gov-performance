import { SubmissionStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findIndicatorCatalogItem } from '@/lib/indicator-catalog';
import { resolveIkuReference, type IkuReference } from '@/lib/resolve-iku-reference';
import { getRequestSession } from '@/lib/request-session';
import { getAssignedPerformanceIndicatorIds } from '@/lib/katim-assignment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const revisiKatimStatus = (SubmissionStatus as unknown as Record<string, SubmissionStatus>).REVISI_KATIM ?? ('REVISION_BY_KATIM' as SubmissionStatus);

export async function GET(request: Request) {
  try {
    const session = getRequestSession(request);
    if (!session || session.role !== 'KATIM') {
      return NextResponse.json({ success: false, message: 'Antrean ini hanya dapat diakses oleh KATIM.' }, { status: 403 });
    }
    const assignedPerformanceIds = await getAssignedPerformanceIndicatorIds(session.id);
    const submissions = await prisma.performanceSubmission.findMany({
      where: {
        fiscalYear: { year: 2026 },
        indicatorId: { in: assignedPerformanceIds },
        // Antrean hanya berisi laporan PIC yang benar-benar memiliki
        // realisasi fisik dan narasi. Draft/template kosong tidak ditampilkan.
        physicalRealization: { not: null },
        realizationNarrative: { not: null },
        NOT: { realizationNarrative: '' },
        status: {
          in: [
            SubmissionStatus.SUBMITTED_TO_KATIM,
            SubmissionStatus.MENUNGGU_VALIDASI_KATIM,
            revisiKatimStatus,
            SubmissionStatus.REVISION_BY_KATIM,
            SubmissionStatus.REVISION_REQUIRED_BY_KATIM,
            SubmissionStatus.DITOLAK_KATIM,
            SubmissionStatus.REVISION_BY_KAPOKJA,
            SubmissionStatus.REVISION_REQUIRED_BY_KAPOKJA,
          ],
        },
      },
      orderBy: { submittedAt: 'asc' },
      include: { 
        indicator: { select: { id: true, code: true, name: true, unit: true } }, 
        submittedBy: { select: { id: true, name: true } }, 
        fiscalYear: { select: { year: true } }, 
        values: { orderBy: { quarter: 'asc' } } 
      },
    });

    const ikuRows = await prisma.indikatorKinerjaUtama.findMany({ 
      include: { sasaran: { select: { namaSasaran: true } }, pic: { select: { name: true } } } 
    });

    const data = submissions.map((item) => {
      const catalogItem = findIndicatorCatalogItem(item.indicator.code);
      const iku = resolveIkuReference(
        { code: item.indicator.code, name: catalogItem?.label ?? item.indicator.name },
        ikuRows as IkuReference[]
      );

      const displayName = iku?.namaIku ?? catalogItem?.label ?? item.indicator.name;
      const displayCode = catalogItem?.code ?? (iku?.id ? `IKU-${iku.id}` : item.indicator.code);
      const unit = item.indicator.unit ?? iku?.satuan ?? '';
      const picName = item.submittedBy?.name ?? iku?.pic?.name ?? 'PIC Terkait';

      const quarter = item.reportingQuarter ?? 1;
      const quarterVal = item.values.find((v) => v.quarter === quarter) ?? item.values[0];

      return {
        id: item.id,
        submittedAt: item.submittedAt?.toISOString() ?? item.updatedAt.toISOString(),
        pic: picName,
        sasaranName: iku?.sasaran.namaSasaran ?? 'Sasaran Kegiatan',
        indicator: {
          id: item.indicator.id,
          code: displayCode,
          name: displayName,
          unit: unit,
        },
        fiscalYear: item.fiscalYear.year,
        reportingMonth: item.reportingMonth,
        reportingQuarter: item.reportingQuarter,
        realizationNarrative: item.realizationNarrative,
        evaluation: item.evaluation,
        constraints: item.constraints,
        followUp: item.followUp,
        physicalRealization: item.physicalRealization?.toString() ?? null,
        evidenceFileUrl: item.evidenceFileUrl ?? quarterVal?.evidenceDriveViewUrl ?? quarterVal?.evidenceFileUrl ?? null,
        values: item.values.map((value) => ({ 
          quarter: value.quarter, 
          targetValue: value.targetValue?.toString() ?? null, 
          realizationValue: value.realizationValue?.toString() ?? null, 
          evidenceFileUrl: value.evidenceDriveViewUrl ?? value.evidenceFileUrl,
        })),
        status: item.status,
        revisionNote: item.revisionNote,
      };
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const approvedThisMonth = await prisma.performanceSubmission.count({ 
      where: { status: { in: [SubmissionStatus.DISETUJUI, SubmissionStatus.APPROVED, SubmissionStatus.PUBLISHED] }, approvedAt: { gte: startOfMonth } } 
    });

    const pending = data.filter((item) => 
      item.status === SubmissionStatus.SUBMITTED_TO_KATIM || 
      item.status === SubmissionStatus.MENUNGGU_VALIDASI_KATIM
    ).length;

    const revised = data.filter((item) =>
      item.status === revisiKatimStatus ||
      item.status === SubmissionStatus.REVISION_BY_KATIM ||
      item.status === SubmissionStatus.REVISION_REQUIRED_BY_KATIM ||
      item.status === SubmissionStatus.DITOLAK_KATIM ||
      item.status === SubmissionStatus.REVISION_BY_KAPOKJA ||
      item.status === SubmissionStatus.REVISION_REQUIRED_BY_KAPOKJA
    ).length;

    return NextResponse.json({ success: true, data, total: data.length, summary: { pending, revised, approvedThisMonth } });
  } catch (error) { 
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Antrean validasi gagal dimuat.' }, { status: 500 }); 
  }
}
