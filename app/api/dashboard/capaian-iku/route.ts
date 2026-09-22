import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildCanonicalRows, type IndicatorSource } from '@/lib/dashboard/iku-rows';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/capaian-iku?fiscalYear=2026&quarter=4
 * Return 18 IKU indicators with targets and realizations filtered by fiscalYear and quarter.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYearVal = Number(searchParams.get('fiscalYear') || searchParams.get('year') || 2026);
    const quarterVal = Number(searchParams.get('quarter') || 4);

    if (!Number.isInteger(fiscalYearVal) || !Number.isInteger(quarterVal) || quarterVal < 1 || quarterVal > 4) {
      return NextResponse.json({ success: false, message: 'Parameter fiscalYear/quarter tidak valid.' }, { status: 400 });
    }

    const fiscalYear = await prisma.fiscalYear.findUnique({ where: { year: fiscalYearVal }, select: { id: true, year: true } });
    if (!fiscalYear) return NextResponse.json({ success: true, data: { fiscalYear: fiscalYearVal, quarter: quarterVal, indicators: [] } });

    // Semua submission dan nilai dibatasi fiscalYearId tahun yang dipilih.
    const perfIndicators = await prisma.performanceIndicator.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
      include: {
        assignments: { where: { fiscalYearId: fiscalYear.id }, include: { picUser: { select: { name: true } } } },
        submissions: {
          where: { fiscalYearId: fiscalYear.id },
          include: {
            submittedBy: { select: { name: true } },
            values: { where: { quarter: quarterVal }, select: { quarter: true, targetValue: true, realizationValue: true, sourceSyncRunId: true } },
          },
        },
      },
    });

    // Jangan berikan peta target master di endpoint ini. Master IKU bersifat
    // baseline (berisi data lama/2025), sedangkan tab dashboard harus murni
    // menampilkan target dan realisasi hasil sync untuk tahun + triwulan aktif.
    const rows = buildCanonicalRows(perfIndicators as unknown as IndicatorSource[], new Map(), quarterVal);
    const data = rows.map((row) => {
      const hasSync = row.hasData && row.targetValue !== null && row.realisasiValue !== null;
      return {
        ...row,
        targetValue: hasSync ? row.targetValue : null,
        capaianPercentage: hasSync ? row.capaianPercentage : 0,
        status: hasSync ? row.status : false,
        name: row.indikator,
        isOnTrack: hasSync && row.status,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        fiscalYear: fiscalYearVal,
        quarter: quarterVal,
        indicators: data,
      },
    });
  } catch (error) {
    console.error('[CAPAIAN_IKU_ERROR]', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Gagal memuat data IKU.' },
      { status: 500 }
    );
  }
}
