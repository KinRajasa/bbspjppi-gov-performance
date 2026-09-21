import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!Number.isInteger(id) || id < 1) return NextResponse.json({ success: false, message: 'ID indikator tidak valid.' }, { status: 400 });
    const item = await prisma.indikatorKinerjaUtama.findUnique({ 
      where: { id }, 
      include: { 
        pic: { select: { id: true, name: true } },
        actionPlan: { include: { quarters: { orderBy: { quarter: 'asc' } } } } 
      } 
    });
    if (!item) return NextResponse.json({ success: false, message: 'Indikator tidak ditemukan.' }, { status: 404 });
    return NextResponse.json({ 
      success: true, 
      data: { 
        id: item.id, 
        name: item.namaIku, 
        targetTahunan: item.target?.toString() ?? null, 
        satuan: item.satuan, 
        picName: item.pic?.name ?? '',
        picId: item.pic?.id ?? null,
        quarters: [1, 2, 3, 4].map((quarter) => { 
          const value = item.actionPlan?.quarters.find((row) => row.quarter === quarter); 
          return { quarter, target: value?.target?.toString() ?? '', activity: value?.activity ?? '' }; 
        }) 
      } 
    });
  } catch (error) { 
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Detail indikator gagal dimuat.' }, { status: 500 }); 
  }
}
