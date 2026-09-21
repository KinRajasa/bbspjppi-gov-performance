import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestSession } from '@/lib/request-session';
import { getSheetCodeForIkuId } from '@/lib/resolve-iku-reference';
import { indicatorCatalog } from '@/lib/indicator-catalog';
import { normalizeIndicatorName } from '@/lib/resolve-iku-reference';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);
    if (!session || session.role !== 'PIC') return NextResponse.json({ success: false, message: 'Halaman ini hanya untuk PIC.' }, { status: 403 });
    const id = Number((await params).id);
    const quarter = Math.min(4, Math.max(1, Number(new URL(request.url).searchParams.get('quarter') ?? 1)));
    if (!Number.isInteger(id) || id < 1) return NextResponse.json({ success: false, message: 'ID indikator tidak valid.' }, { status: 400 });
    const indicator = await prisma.indikatorKinerjaUtama.findUnique({ where: { id }, include: { pic: { select: { id: true, name: true } }, actionPlan: { include: { quarters: true } } } });
    if (!indicator) return NextResponse.json({ success: false, message: 'Indikator tidak ditemukan.' }, { status: 404 });
    if (indicator.picId !== session.id) return NextResponse.json({ success: false, message: 'Indikator ini tidak ditugaskan kepada PIC yang sedang login.' }, { status: 403 });
    const normalized = normalizeIndicatorName(indicator.namaIku);
    const catalog = indicatorCatalog.find((item) => {
      const candidate = normalizeIndicatorName(item.label);
      return candidate === normalized || candidate.includes(normalized) || normalized.includes(candidate);
    });
    const code = getSheetCodeForIkuId(indicator.id) ?? catalog?.sheetName ?? null;
    const planned = indicator.actionPlan?.quarters.find((item) => item.quarter === quarter);
    return NextResponse.json({ success: true, data: { id, code, name: indicator.namaIku, targetAnnual: indicator.target?.toString() ?? null, unit: indicator.satuan, picName: indicator.pic?.name ?? '', picOptions: indicator.pic ? [indicator.pic] : [], quarter, planActivity: planned?.activity ?? '', physicalTarget: planned?.target?.toString() ?? null } });
  } catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Detail indikator gagal dimuat.' }, { status: 500 }); }
}
