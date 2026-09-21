import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readSessionToken } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type IkuInput = { id?: unknown; nama?: unknown; namaIku?: unknown; satuan?: unknown; target?: unknown; picId?: unknown; picUserId?: unknown; picIds?: unknown; pic?: unknown; katimId?: unknown };
type SasaranInput = { id?: unknown; namaSasaran?: unknown; indikators?: unknown[]; indikator?: unknown[] };
type Body = { id?: unknown; timelinePelaksanaan?: unknown; status?: unknown; sasarans?: unknown[] };

const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const id = (v: unknown) => {
  const parsed = typeof v === 'number' ? v : (typeof v === 'string' && /^\d+$/.test(v.trim()) ? Number(v) : NaN);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

function target(v: unknown) {
  if (v === '' || v === null || v === undefined) return null;
  const raw = String(v).trim();
  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) throw new Error('Target harus berupa angka.');
  return new Prisma.Decimal(normalized);
}

function normalize(body: Body) {
  const timelinePelaksanaan = text(body.timelinePelaksanaan);
  if (!timelinePelaksanaan) throw new Error('Timeline pelaksanaan wajib diisi.');
  if (!Array.isArray(body.sasarans)) throw new Error('Data sasaran harus berupa array.');
  return { id: id(body.id), timelinePelaksanaan, status: text(body.status) || 'DRAFT', sasarans: body.sasarans as SasaranInput[] };
}

export async function GET(request: NextRequest) {
  const requestedId = id(request.nextUrl.searchParams.get('id'));
  const include = { sasaran: { orderBy: { id: 'asc' as const }, include: { indikator: { orderBy: { id: 'asc' as const }, include: { pic: { select: { id: true, name: true } } } } } } };
  const record = requestedId
    ? await prisma.perjanjianKinerja.findUnique({ where: { id: requestedId }, include })
    : await prisma.perjanjianKinerja.findFirst({ orderBy: { updatedAt: 'desc' }, include });
  if (!record) return json({ success: true, data: null });
  // Prisma Client yang sedang berjalan mungkin belum memuat kolom baru katimId.
  // Ambil penugasan Katim melalui SQL agar API tetap aman saat proses generate client.
  const katimAssignments = await prisma.$queryRaw<Array<{ id: number; katim_id: number | null }>>(
    Prisma.sql`SELECT id, katim_id FROM indikator_kinerja_utama`
  );
  const katimByIndicator = new Map(katimAssignments.map((item) => [Number(item.id), item.katim_id == null ? null : Number(item.katim_id)]));
  const data = {
    ...record,
    sasaran: record.sasaran.map((sasaran) => ({
      ...sasaran,
      indikator: sasaran.indikator.map((indikator) => ({ ...indikator, katimId: katimByIndicator.get(indikator.id) ?? null })),
    })),
  };
  return json({ success: true, data });
}

export async function POST(request: NextRequest) {
  try {
    const session = readSessionToken(request.cookies.get('session')?.value);
    if (session?.role !== 'ADMIN') {
      return json({ success: false, message: 'Hanya ADMIN yang dapat mengubah Master IKU dan penugasan PIC/Katim.' }, 403);
    }
    const body = normalize((await request.json()) as Body);
    const perjanjianId = id(body.id);
    const saved = await prisma.$transaction(async (tx) => {
      const existingPerjanjian = perjanjianId
        ? await tx.perjanjianKinerja.findUnique({ where: { id: perjanjianId }, select: { id: true } })
        : null;
      const perjanjian = existingPerjanjian
        ? await tx.perjanjianKinerja.update({ where: { id: existingPerjanjian.id }, data: { timelinePelaksanaan: body.timelinePelaksanaan, status: body.status } })
        : await tx.perjanjianKinerja.create({ data: { timelinePelaksanaan: body.timelinePelaksanaan, status: body.status } });
      const picRole = await tx.role.findUnique({ where: { name: 'PIC' }, select: { id: true } });
      if (!picRole) throw new Error('Role PIC belum tersedia.');
      const katimRole = await tx.role.findUnique({ where: { name: 'KATIM' }, select: { id: true } });
      if (!katimRole) throw new Error('Role KATIM belum tersedia.');
      const sasaranIds: number[] = [];
      for (const sasaranInput of body.sasarans) {
        const sasaranId = id(sasaranInput.id);
        const existingSasaran = sasaranId
          ? await tx.sasaranKegiatan.findFirst({ where: { id: sasaranId, perjanjianId: perjanjian.id }, select: { id: true } })
          : null;
        const sasaran = existingSasaran
          ? await tx.sasaranKegiatan.update({ where: { id: existingSasaran.id }, data: { namaSasaran: text(sasaranInput.namaSasaran) } })
          : await tx.sasaranKegiatan.create({ data: { perjanjianId: perjanjian.id, namaSasaran: text(sasaranInput.namaSasaran) } });
        sasaranIds.push(sasaran.id);
        const indikatorInputs = (sasaranInput.indikators ?? sasaranInput.indikator ?? []) as IkuInput[];
        const indikatorIds: number[] = [];
        for (const input of indikatorInputs) {
          const ikuId = id(input.id);
          const requestedPicIds = Array.isArray(input.picIds) ? input.picIds.map(id).filter((value): value is number => value !== null) : [];
          let picId: number | null = id(input.picUserId) ?? requestedPicIds[0] ?? id(input.picId);
          if (!picId && text(input.pic)) {
            const pic = await tx.user.findFirst({ where: { name: text(input.pic), isActive: true }, select: { id: true } });
            picId = pic?.id ?? null;
          }
          if (picId) {
            const validPic = await tx.user.count({ where: { id: picId, isActive: true, roles: { some: { roleId: picRole.id } } } });
            if (validPic !== 1) throw new Error('PIC harus berupa user aktif dengan role PIC.');
          }
          const hasKatimId = Object.prototype.hasOwnProperty.call(input, 'katimId');
          let katimId = hasKatimId ? id(input.katimId) : null;
          const data = { namaIku: text(input.namaIku ?? input.nama), satuan: text(input.satuan), target: target(input.target), picId };
          const existingIku = ikuId
            ? await tx.indikatorKinerjaUtama.findFirst({ where: { id: ikuId, sasaranId: sasaran.id }, select: { id: true } })
            : null;
          if (!hasKatimId && existingIku) {
            const currentKatim = await tx.$queryRaw<Array<{ katim_id: number | null }>>(Prisma.sql`SELECT katim_id FROM indikator_kinerja_utama WHERE id = ${existingIku.id} LIMIT 1`);
            katimId = currentKatim[0]?.katim_id == null ? null : Number(currentKatim[0].katim_id);
          }
          if (katimId) {
            const validKatim = await tx.user.count({ where: { id: katimId, isActive: true, roles: { some: { roleId: katimRole.id } } } });
            if (validKatim !== 1) throw new Error('Katim harus berupa user aktif dengan role KATIM.');
          }
          const iku = existingIku
            ? await tx.indikatorKinerjaUtama.update({ where: { id: existingIku.id }, data })
            : await tx.indikatorKinerjaUtama.create({ data: { ...data, sasaranId: sasaran.id } });
          await tx.$executeRaw(Prisma.sql`UPDATE indikator_kinerja_utama SET katim_id = ${katimId} WHERE id = ${iku.id}`);
          indikatorIds.push(iku.id);
        }
        await tx.indikatorKinerjaUtama.deleteMany({ where: { sasaranId: sasaran.id, id: { notIn: indikatorIds.length ? indikatorIds : [-1] } } });
      }
      await tx.sasaranKegiatan.deleteMany({ where: { perjanjianId: perjanjian.id, id: { notIn: sasaranIds.length ? sasaranIds : [-1] } } });
      return tx.perjanjianKinerja.findUnique({ where: { id: perjanjian.id }, include: { sasaran: { include: { indikator: true } } } });
    });
    const indicatorCount = body.sasarans.reduce((total, sasaran) => total + (Array.isArray(sasaran.indikators) ? sasaran.indikators.length : Array.isArray(sasaran.indikator) ? sasaran.indikator.length : 0), 0);
    void logActivity({
      req: request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      actionType: 'MASTER DATA',
      description: `Mengelola dan menetapkan Sasaran Kegiatan beserta ${indicatorCount} Indikator Kinerja tahunan.`,
      moduleReference: 'Perjanjian Kinerja / Master IKU',
      referenceType: 'PerjanjianKinerja',
      referenceId: saved?.id,
    });
    return json({ success: true, message: 'Perjanjian kinerja berhasil disimpan.', data: saved });
  } catch (error) {
    console.error('[PERJANJIAN_KINERJA_SAVE_ERROR]', error);
    return json({ success: false, message: error instanceof Error ? error.message : 'Data gagal disimpan.' }, 422);
  }
}
