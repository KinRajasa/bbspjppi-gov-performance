import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const perjanjianId = Number(request.nextUrl.searchParams.get('perjanjianId')) || undefined;
    const perjanjian = perjanjianId
      ? await prisma.perjanjianKinerja.findUnique({ where: { id: perjanjianId } })
      : await prisma.perjanjianKinerja.findFirst({ orderBy: { updatedAt: 'desc' } });
    if (!perjanjian) return NextResponse.json({ success: true, data: [] });
    const data = await prisma.indikatorKinerjaUtama.findMany({ where: { sasaran: { perjanjianId: perjanjian.id } }, orderBy: { id: 'asc' }, include: { sasaran: { select: { id: true, namaSasaran: true } }, pic: { select: { id: true, name: true } } } });
    return NextResponse.json({ success: true, data: data.map((item) => ({ id: item.id, name: item.namaIku, target: item.target?.toString() ?? null, unit: item.satuan, picId: item.picId, picName: item.pic?.name ?? '', sasaranId: item.sasaran.id, sasaranName: item.sasaran.namaSasaran })) });
  } catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Indikator gagal dimuat.' }, { status: 500 }); }
}
