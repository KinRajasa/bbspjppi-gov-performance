import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readSessionToken } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export const runtime = 'nodejs';

const response = (data: unknown, status = 200) => NextResponse.json(data, { status });
const intId = (v: unknown) => (Number.isInteger(Number(v)) && Number(v) > 0 ? Number(v) : null);

export async function POST(request: NextRequest) {
  try {
    const session = readSessionToken(request.cookies.get('session')?.value);
    if (session?.role !== 'ADMIN') {
      return response({ success: false, message: 'Hanya ADMIN yang dapat mengubah Master IKU dan penugasan PIC/Katim.' }, 403);
    }
    const body = await request.json() as { perjanjianId?: unknown; sasaranId?: unknown; iku?: Record<string, unknown> };
    const perjanjianId = intId(body.perjanjianId);
    const iku = body.iku ?? {};
    const ikuId = intId(iku.id);
    const sasaranId = intId(body.sasaranId);
    if (!perjanjianId || !sasaranId) return response({ success: false, message: 'ID perjanjian dan sasaran wajib diisi.' }, 400);
    const sasaran = await prisma.sasaranKegiatan.findFirst({ where: { id: sasaranId, perjanjianId } });
    if (!sasaran) return response({ success: false, message: 'Sasaran tidak ditemukan.' }, 404);
    const rawTarget = iku.target === '' || iku.target == null ? null : String(iku.target).replace(',', '.');
    let picId = intId(iku.picUserId ?? iku.picId);
    if (!picId && typeof iku.pic === 'string' && iku.pic.trim()) {
      const pic = await prisma.user.findFirst({ where: { name: iku.pic.trim(), isActive: true }, select: { id: true } });
      picId = pic?.id ?? null;
    }
    const requestedPicIds = Array.isArray(iku.picIds) ? iku.picIds.map(intId).filter((value): value is number => value !== null) : [];
    picId = requestedPicIds[0] ?? picId;
    const picRole = await prisma.role.findUnique({ where: { name: 'PIC' }, select: { id: true } });
    if (!picRole) throw new Error('Role PIC belum tersedia.');
    if (picId) {
      const validPic = await prisma.user.count({ where: { id: picId, isActive: true, roles: { some: { roleId: picRole.id } } } });
      if (validPic !== 1) throw new Error('PIC harus berupa user aktif dengan role PIC.');
    }
    const hasKatimId = Object.prototype.hasOwnProperty.call(iku, 'katimId');
    let katimId = hasKatimId ? intId(iku.katimId) : null;
    const katimRole = await prisma.role.findUnique({ where: { name: 'KATIM' }, select: { id: true } });
    if (!katimRole) throw new Error('Role KATIM belum tersedia.');
    const data = { namaIku: String(iku.namaIku ?? iku.nama ?? '').trim(), satuan: String(iku.satuan ?? '').trim(), target: rawTarget == null ? null : new Prisma.Decimal(rawTarget), picId };
    const existingIku = ikuId
      ? await prisma.indikatorKinerjaUtama.findFirst({ where: { id: ikuId, sasaranId }, select: { id: true } })
      : null;
    if (!hasKatimId && existingIku) {
      const currentKatim = await prisma.$queryRaw<Array<{ katim_id: number | null }>>(Prisma.sql`SELECT katim_id FROM indikator_kinerja_utama WHERE id = ${existingIku.id} LIMIT 1`);
      katimId = currentKatim[0]?.katim_id == null ? null : Number(currentKatim[0].katim_id);
    }
    if (katimId) {
      const validKatim = await prisma.user.count({ where: { id: katimId, isActive: true, roles: { some: { roleId: katimRole.id } } } });
      if (validKatim !== 1) throw new Error('Katim harus berupa user aktif dengan role KATIM.');
    }
    const saved = existingIku
      ? await prisma.indikatorKinerjaUtama.update({ where: { id: existingIku.id }, data })
      : await prisma.indikatorKinerjaUtama.create({ data: { ...data, sasaranId } });
    await prisma.$executeRaw(Prisma.sql`UPDATE indikator_kinerja_utama SET katim_id = ${katimId} WHERE id = ${saved.id}`);
    void logActivity({
      req: request,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      actionType: 'MASTER DATA',
      description: `Memperbarui Sasaran/Indikator Kinerja #${saved.id}, termasuk target dan penanggung jawab.`,
      moduleReference: 'Perjanjian Kinerja / Master IKU',
      referenceType: 'IndikatorKinerjaUtama',
      referenceId: saved.id,
    });
    return response({ success: true, message: 'Perubahan IKU tersimpan otomatis.', data: saved });
  } catch (error) {
    return response({ success: false, message: error instanceof Error ? error.message : 'Autosave gagal.' }, 422);
  }
}
