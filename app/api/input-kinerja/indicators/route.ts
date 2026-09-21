import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestSession } from '@/lib/request-session';
import { getSheetCodeForIkuId } from '@/lib/resolve-iku-reference';
import { indicatorCatalog } from '@/lib/indicator-catalog';
import { normalizeIndicatorName } from '@/lib/resolve-iku-reference';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = getRequestSession(request);
    if (!session || session.role !== 'PIC') return NextResponse.json({ success: false, message: 'Halaman ini hanya untuk PIC.' }, { status: 403 });
    const perjanjian = await prisma.perjanjianKinerja.findFirst({ orderBy: { updatedAt: 'desc' }, include: { sasaran: { orderBy: { id: 'asc' }, include: { indikator: { where: { picId: session.id, target: { not: null } }, orderBy: { id: 'asc' }, include: { pic: { select: { id: true, name: true } } } } } } } });
    const data = perjanjian?.sasaran.flatMap((sasaran) => sasaran.indikator.map((indikator) => {
      const normalized = normalizeIndicatorName(indikator.namaIku);
      const catalog = indicatorCatalog.find((item) => {
        const candidate = normalizeIndicatorName(item.label);
        return candidate === normalized || candidate.includes(normalized) || normalized.includes(candidate);
      });
      return { id: indikator.id, code: getSheetCodeForIkuId(indikator.id) ?? catalog?.sheetName ?? null, name: indikator.namaIku, target: indikator.target?.toString() ?? null, unit: indikator.satuan, picId: indikator.picId, picName: indikator.pic?.name ?? '', sasaranName: sasaran.namaSasaran };
    })) ?? [];
    return NextResponse.json({ success: true, data });
  } catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Indikator gagal dimuat.' }, { status: 500 }); }
}
