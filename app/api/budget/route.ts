import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readSessionToken } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
const decimal = (value: unknown, field: string, isPercentage = false) => {
  if (value === '' || value === null || value === undefined) return null;
  const raw = String(value).replace(/Rp/gi, '').trim();
  const normalized = isPercentage
    ? (/^\d{1,3}([.,]\d+)?$/.test(raw) ? raw.replace(',', '.') : raw.replace(/\./g, '').replace(',', '.'))
    : raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw.replace(/\./g, '');
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) throw new Error(`${field} harus berupa angka.`);
  return new Prisma.Decimal(normalized);
};
const plain = (value: Prisma.Decimal | null) => value === null ? null : Number(value.toString());

export async function GET(request: NextRequest) {
  try {
    const year = Number(request.nextUrl.searchParams.get('year') ?? 2026);
    const fiscalYear = await prisma.fiscalYear.findUnique({ where: { year } });
    if (!fiscalYear) return json({ success: true, data: null });
    const allocation = await prisma.budgetAllocation.findUnique({ where: { fiscalYearId: fiscalYear.id }, include: { realizations: { orderBy: { reportingMonth: 'desc' }, take: 1 } } });
    if (!allocation) return json({ success: true, data: null });
    const latest = allocation.realizations[0] ?? null;
    const revised = plain(allocation.latestRevisionCeilingAmount) ?? 0;
    const blocked = plain(allocation.blockedAmount) ?? 0;
    const effective = revised - blocked;
    const actual = plain(latest?.spendingActualAmount ?? null) ?? 0;
    return json({ success: true, data: { year, allocation: { ...allocation, initialCeilingAmount: plain(allocation.initialCeilingAmount), latestRevisionCeilingAmount: plain(allocation.latestRevisionCeilingAmount), blockedAmount: plain(allocation.blockedAmount), rupiahMurniAmount: plain(allocation.rupiahMurniAmount), pnbpAmount: plain(allocation.pnbpAmount) }, realization: latest && { ...latest, financialTargetPct: plain(latest.financialTargetPct), spendingActualAmount: plain(latest.spendingActualAmount), pnbpTargetAmount: plain(latest.pnbpTargetAmount), pnbpActualAmount: plain(latest.pnbpActualAmount) }, summary: { totalPaguEfektif: effective, realisasiAnggaranAktual: actual, persentaseTerhadapPagu: revised ? (actual / revised) * 100 : 0, persentaseTerhadapPaguEfektif: effective ? (actual / effective) * 100 : 0 } } });
  } catch (error) { return json({ success: false, message: error instanceof Error ? error.message : 'Data anggaran gagal dimuat.' }, 500); }
}

export async function POST(request: NextRequest) {
  try {
    const session = readSessionToken(request.cookies.get('session')?.value);
    if (session?.role !== 'ADMIN') {
      return json({ success: false, message: 'Hanya ADMIN yang dapat mengubah data anggaran.' }, 403);
    }
    const body = await request.json() as Record<string, unknown>;
    const year = Number(body.year ?? 2026);
    const fiscalYear = await prisma.fiscalYear.findUnique({ where: { year } });
    if (!fiscalYear) return json({ success: false, message: `Tahun anggaran ${year} belum terdaftar.` }, 404);
    const initialCeilingAmount = decimal(body.initialCeilingAmount, 'Pagu DIPA Awal');
    const latestRevisionCeilingAmount = decimal(body.latestRevisionCeilingAmount, 'Pagu Revisi Terakhir');
    const blockedAmount = decimal(body.blockedAmount, 'Blokir');
    const rupiahMurniAmount = decimal(body.rupiahMurniAmount, 'Rupiah Murni');
    const pnbpAmount = decimal(body.pnbpAmount, 'Pagu PNBP');
    const reportingMonth = Math.min(12, Math.max(1, Number(body.reportingMonth ?? 12)));
    const financialTargetPct = decimal(body.financialTargetPct, 'Target Keuangan', true);
    if (financialTargetPct && (financialTargetPct.lt(0) || financialTargetPct.gt(100))) {
      throw new Error('Target Keuangan harus berupa persentase antara 0 sampai 100 (contoh: 47,43).');
    }
    const spendingActualAmount = decimal(body.spendingActualAmount, 'Realisasi Anggaran Aktual');
    const pnbpTargetAmount = decimal(body.pnbpTargetAmount, 'Target PNBP');
    const pnbpActualAmount = decimal(body.pnbpActualAmount, 'Penerimaan PNBP Aktual');
    const result = await prisma.$transaction(async (tx) => {
      const allocation = await tx.budgetAllocation.upsert({ where: { fiscalYearId: fiscalYear.id }, create: { fiscalYearId: fiscalYear.id, initialCeilingAmount, latestRevisionCeilingAmount, blockedAmount, rupiahMurniAmount, pnbpAmount }, update: { initialCeilingAmount, latestRevisionCeilingAmount, blockedAmount, rupiahMurniAmount, pnbpAmount } });
      const realization = await tx.budgetRealization.upsert({ where: { budgetAllocationId_reportingMonth: { budgetAllocationId: allocation.id, reportingMonth } }, create: { budgetAllocationId: allocation.id, reportingMonth, financialTargetPct, spendingActualAmount, pnbpTargetAmount, pnbpActualAmount }, update: { financialTargetPct, spendingActualAmount, pnbpTargetAmount, pnbpActualAmount } });
      return { allocation, realization };
    });
    void logActivity({
      req: request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      actionType: 'MASTER DATA',
      description: `Mengelola pagu, blokir, dan realisasi anggaran TA ${year} untuk bulan pelaporan ${reportingMonth}.`,
      moduleReference: 'Kelola Anggaran',
      referenceType: 'BudgetAllocation',
      referenceId: result.allocation.id,
      metadataJson: { year, reportingMonth },
    });
    return json({ success: true, message: 'Perubahan anggaran berhasil disimpan.', data: result });
  } catch (error) { return json({ success: false, message: error instanceof Error ? error.message : 'Anggaran gagal disimpan.' }, 422); }
}
