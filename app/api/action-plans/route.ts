import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readSessionToken } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export const runtime = 'nodejs';

const decimal = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return null;
  const raw = String(value).trim();
  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw.split('.').length > 2 ? raw.replace(/\./g, '') : raw;
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) throw new Error('Target triwulan harus berupa angka.');
  return new Prisma.Decimal(normalized);
};

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') ?? '';
    const sessionToken = cookieHeader.split(';').map((item) => item.trim()).find((item) => item.startsWith('session='))?.slice(8);
    const session = readSessionToken(sessionToken);
    if (session?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Hanya ADMIN yang dapat mengubah Rencana Aksi.' }, { status: 403 });
    }
    const body = await request.json() as { indicatorId?: unknown; picId?: unknown; quarters?: unknown };
    const indicatorId = Number(body.indicatorId);
    if (!Number.isInteger(indicatorId) || indicatorId < 1 || !Array.isArray(body.quarters) || body.quarters.length !== 4) {
      return NextResponse.json({ success: false, message: 'Indikator dan empat data triwulan wajib diisi.' }, { status: 400 });
    }
    const indicator = await prisma.indikatorKinerjaUtama.findUnique({ where: { id: indicatorId }, select: { id: true, namaIku: true } });
    if (!indicator) return NextResponse.json({ success: false, message: 'Indikator tidak ditemukan.' }, { status: 404 });
    const quarters = body.quarters as Array<{ quarter?: unknown; target?: unknown; activity?: unknown }>;
    const values = quarters.map((item, index) => ({ quarter: index + 1, target: decimal(item.target), activity: typeof item.activity === 'string' ? item.activity.trim() : '' }));
    if (values.some((item) => item.target === null || item.target.lt(0) || item.target.gt(100))) {
      return NextResponse.json({ success: false, message: 'Target fisik setiap triwulan harus berada di antara 0% sampai 100%.' }, { status: 422 });
    }
    const cumulative = values.reduce((sum, item) => sum.plus(item.target ?? 0), new Prisma.Decimal(0));
    if (!cumulative.equals(new Prisma.Decimal(100))) {
      return NextResponse.json({ success: false, message: `Total akumulasi target fisik: ${cumulative.toString()}% (Harus tepat 100%).` }, { status: 422 });
    }
    const hasPicId = Object.prototype.hasOwnProperty.call(body, 'picId');
    const picId = body.picId === null || body.picId === '' || body.picId === undefined ? null : Number(body.picId);
    if (hasPicId && picId !== null && (!Number.isInteger(picId) || picId < 1)) {
      return NextResponse.json({ success: false, message: 'PIC tidak valid.' }, { status: 422 });
    }
    const saved = await prisma.$transaction(async (tx) => {
      if (hasPicId && picId !== null) {
        const picRole = await tx.role.findUnique({ where: { name: 'PIC' }, select: { id: true } });
        const pic = picRole ? await tx.user.findFirst({ where: { id: picId, isActive: true, roles: { some: { roleId: picRole.id } } }, select: { id: true } }) : null;
        if (!pic) throw new Error('PIC tidak ditemukan atau tidak aktif.');
      }
      if (hasPicId) await tx.indikatorKinerjaUtama.update({ where: { id: indicatorId }, data: { picId } });
      const plan = await tx.actionPlan.upsert({ where: { indikatorId: indicatorId }, create: { indikatorId: indicatorId }, update: {} });
      for (const item of values) {
        await tx.quarterlyActionPlan.upsert({ where: { actionPlanId_quarter: { actionPlanId: plan.id, quarter: item.quarter } }, create: { actionPlanId: plan.id, quarter: item.quarter, target: item.target, activity: item.activity }, update: { target: item.target, activity: item.activity } });
      }
      return tx.actionPlan.findUnique({ where: { id: plan.id }, include: { quarters: { orderBy: { quarter: 'asc' } } } });
    });
    void logActivity({
      req: request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      actionType: 'MASTER DATA',
      description: `Menetapkan progres fisik dan rincian rencana kegiatan untuk indikator ${indicator.namaIku} pada empat triwulan.`,
      moduleReference: 'Rencana Aksi',
      referenceType: 'IndikatorKinerjaUtama',
      referenceId: indicatorId,
    });
    return NextResponse.json({ success: true, message: 'Rencana aksi berhasil disimpan.', data: saved });
  } catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Rencana aksi gagal disimpan.' }, { status: 422 }); }
}
