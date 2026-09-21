import { NextRequest, NextResponse } from 'next/server';

import { findIndicatorCatalogItem } from '@/lib/indicator-catalog';
import { prisma } from '@/lib/prisma';
import { resolveIkuReference, type IkuReference } from '@/lib/resolve-iku-reference';
import { getRequestSession } from '@/lib/request-session';
import { getAssignedPerformanceIndicatorIdsForPic } from '@/lib/katim-assignment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Endpoint khusus halaman Input Realisasi.
 *
 * Respons hanya berisi Data Aktual IKU dari Google Sheets
 * (QuarterlyPerformanceValue yang memiliki sourceSyncRunId). Data fisik PIC
 * tidak pernah digunakan sebagai target atau realisasi di endpoint ini.
 */
export async function GET(request: NextRequest) {
  try {
    const session = getRequestSession(request);
    if (!session || session.role !== 'PIC') return NextResponse.json({ message: 'Data realisasi hanya dapat diakses oleh PIC.' }, { status: 403 });
    const params = request.nextUrl.searchParams;
    const indicatorCode = params.get('indicatorCode')?.trim();
    const year = Number(params.get('year'));
    const quarter = Number(params.get('quarter'));

    if (!indicatorCode || !Number.isInteger(year) || !Number.isInteger(quarter) || quarter < 1 || quarter > 4) {
      return NextResponse.json({ message: 'indicatorCode, year, dan quarter (1–4) wajib valid.' }, { status: 400 });
    }

    const requestedIndicator = await prisma.performanceIndicator.findUnique({ where: { code: indicatorCode }, select: { id: true } });
    const assignedPerformanceIds = await getAssignedPerformanceIndicatorIdsForPic(session.id);
    if (!requestedIndicator || !assignedPerformanceIds.includes(requestedIndicator.id)) {
      return NextResponse.json({ message: 'Indikator ini tidak ditugaskan kepada PIC yang sedang login.' }, { status: 403 });
    }

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
      include: {
        performanceSubmission: {
          select: {
            id: true,
            status: true,
            indicator: { select: { code: true, name: true, unit: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!value) {
      return NextResponse.json({ message: 'Data Aktual IKU dari sinkronisasi Excel belum tersedia untuk triwulan ini.' }, { status: 404 });
    }

    const sourceIndicator = value.performanceSubmission.indicator;
    const catalogItem = findIndicatorCatalogItem(indicatorCode);
    const ikuRows = await prisma.indikatorKinerjaUtama.findMany({
      include: { sasaran: { select: { namaSasaran: true } }, pic: { select: { name: true } } },
    });
    const iku = resolveIkuReference(
      { code: sourceIndicator.code, name: catalogItem?.label ?? sourceIndicator.name },
      ikuRows as IkuReference[],
    );
    const unit = sourceIndicator.unit ?? iku?.satuan ?? null;
    const name = iku?.namaIku ?? catalogItem?.label ?? sourceIndicator.name;

    return NextResponse.json({
      id: value.id,
      quarter: value.quarter,
      source: 'GOOGLE_SHEETS',
      indicator: { code: sourceIndicator.code, name, unit },
      actualIku: {
        targetValue: value.targetValue?.toString() ?? null,
        realizationValue: value.realizationValue?.toString() ?? null,
        unit,
      },
      evidenceFileUrl: value.evidenceFileUrl,
      submission: { id: value.performanceSubmission.id, status: value.performanceSubmission.status },
    });
  } catch (error) {
    console.error('[PERFORMANCE_QUARTERLY_GET_ERROR]', error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Gagal mengambil Data Aktual IKU.' }, { status: 500 });
  }
}
