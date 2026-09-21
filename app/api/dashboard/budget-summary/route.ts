import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const year = Number(request.nextUrl.searchParams.get('year') ?? 2026);
  const fiscalYear = await prisma.fiscalYear.findUnique({ where: { year } });
  if (!fiscalYear) return NextResponse.json({ success: true, data: null });
  const allocation = await prisma.budgetAllocation.findUnique({ where: { fiscalYearId: fiscalYear.id }, include: { realizations: { orderBy: { reportingMonth: 'desc' }, take: 1 } } });
  if (!allocation) return NextResponse.json({ success: true, data: null });
  const number = (v: unknown) => v == null ? 0 : Number(String(v));
  const revised = number(allocation.latestRevisionCeilingAmount);
  const effective = revised - number(allocation.blockedAmount);
  const actual = number(allocation.realizations[0]?.spendingActualAmount);
  return NextResponse.json({ success: true, data: { year, paguAwal: number(allocation.initialCeilingAmount), paguRevisiTerakhir: revised, anggaranBlokir: number(allocation.blockedAmount), totalPaguEfektif: effective, realisasiAnggaranAktual: actual, persentaseRealisasi: revised ? (actual / revised) * 100 : 0 } });
}
