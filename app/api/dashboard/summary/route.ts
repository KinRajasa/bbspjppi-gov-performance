import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { buildMasterTargetMap, type MasterIkuRow } from '@/lib/dashboard/canonical-iku';
import { buildCanonicalRows, type IndicatorSource } from '@/lib/dashboard/iku-rows';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_YEAR = 2026;
const DEFAULT_QUARTER = 4;
const MIN_QUARTER = 1;
const MAX_QUARTER = 4;

function parseYear(raw: string | null) {
  const parsed = Number(raw ?? DEFAULT_YEAR);
  return Number.isInteger(parsed) ? parsed : DEFAULT_YEAR;
}

function parseQuarter(raw: string | null) {
  const parsed = Number(raw ?? DEFAULT_QUARTER);
  if (!Number.isInteger(parsed)) return DEFAULT_QUARTER;
  return Math.min(MAX_QUARTER, Math.max(MIN_QUARTER, parsed));
}

/**
 * GET /api/dashboard/summary?year=2026&quarter=2
 *
 * Mengembalikan 18 IKU dengan nilai target/realisasi dari triwulan yang dipilih.
 * Nilai diambil dari SELURUH submission indikator pada tahun anggaran tersebut
 * (hasil integrasi Excel membuat satu submission per triwulan), bukan dari satu
 * submission terbaru saja.
 */
export async function GET(request: NextRequest) {
  try {
    const year = parseYear(request.nextUrl.searchParams.get('year'));
    const quarter = parseQuarter(request.nextUrl.searchParams.get('quarter'));

    const fiscalYear = await prisma.fiscalYear.findUnique({ where: { year } });
    const fiscalYearId = fiscalYear?.id ?? -1;

    const [indicators, masterIkuRows] = await Promise.all([
      prisma.performanceIndicator.findMany({
        where: { isActive: true },
        orderBy: { id: 'asc' },
        include: {
          assignments: {
            where: { fiscalYearId },
            include: { picUser: { select: { name: true } } },
          },
          submissions: {
            where: { fiscalYearId },
            orderBy: { reportingQuarter: 'asc' },
            include: { values: { orderBy: { quarter: 'asc' } } },
          },
        },
      }),
      prisma.indikatorKinerjaUtama.findMany({
        select: {
          id: true,
          namaIku: true,
          satuan: true,
          target: true,
          pic: { select: { name: true } },
        },
      }),
    ]);

    const masterTargets = buildMasterTargetMap(masterIkuRows as MasterIkuRow[]);
    const rows = buildCanonicalRows(indicators as unknown as IndicatorSource[], masterTargets, quarter);

    const tercapai = rows.filter((row) => row.hasData && row.status).length;
    const tidakTercapai = rows.filter((row) => row.hasData && !row.status).length;
    const tanpaData = rows.length - tercapai - tidakTercapai;
    const totalDenganData = tercapai + tidakTercapai;

    return NextResponse.json({
      success: true,
      data: {
        year,
        quarter,
        indicators: rows,
        totalIku: rows.length,
        tercapai,
        tidakTercapai,
        tanpaData,
        totalDenganData,
        proporsiTercapai: rows.length ? (tercapai / rows.length) * 100 : 0,
        proporsiTidakTercapai: rows.length ? (tidakTercapai / rows.length) * 100 : 0,
        proporsiTanpaData: rows.length ? (tanpaData / rows.length) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('[DASHBOARD_SUMMARY_ERROR]', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Ringkasan dashboard gagal dimuat.' },
      { status: 500 },
    );
  }
}
