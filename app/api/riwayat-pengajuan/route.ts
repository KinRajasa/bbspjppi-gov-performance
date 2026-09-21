import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findIndicatorCatalogItem } from '@/lib/indicator-catalog';
import { resolveIkuReference, type IkuReference } from '@/lib/resolve-iku-reference';
import { getRequestSession } from '@/lib/request-session';
import { getAssignedPerformanceIndicatorIds, getAssignedPerformanceIndicatorIdsForPic } from '@/lib/katim-assignment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/riwayat-pengajuan
 * Mengambil riwayat pengajuan kinerja yang telah diinput / diajukan.
 */
export async function GET(request: Request) {
  try {
    const session = getRequestSession(request);
    if (!session) return NextResponse.json({ success: false, message: 'Sesi login tidak ditemukan.' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const fiscalYearId = Number(searchParams.get('fiscalYearId') ?? 0);
    const quarter = searchParams.get('quarter') ? Number(searchParams.get('quarter')) : null;
    
    // Ambil fiscal year aktif jika tidak ada input
    const fiscalYear = fiscalYearId > 0 
      ? await prisma.fiscalYear.findUnique({ where: { id: fiscalYearId } })
      : await prisma.fiscalYear.findFirst({ where: { isActive: true } }) ?? await prisma.fiscalYear.findFirst({ orderBy: { year: 'desc' } });
    
    if (!fiscalYear) {
      return NextResponse.json(
        { success: false, message: 'Tahun anggaran tidak tersedia.' },
        { status: 404 }
      );
    }

    // Filter agar riwayat hanya menampilkan yang relevan:
    // bukan placeholder DRAFT kosong tanpa realisasi fisik dan tanpa tanggal pengajuan
    const whereClause: any = {
      fiscalYearId: fiscalYear.id,
      AND: [{
        OR: [
          { status: { not: 'DRAFT' } },
          { physicalRealization: { not: null } },
          { submittedAt: { not: null } },
        ],
      }],
    };
    
    if (quarter) {
      whereClause.reportingQuarter = quarter;
    }
    if (session.role === 'KATIM') {
      const assignedPerformanceIds = await getAssignedPerformanceIndicatorIds(session.id);
      whereClause.indicatorId = { in: assignedPerformanceIds };
    } else if (session.role === 'PIC') {
      const assignedPerformanceIds = await getAssignedPerformanceIndicatorIdsForPic(session.id);
      // Data lama yang dibuat dari DRAFT hasil sinkronisasi mungkin belum
      // memiliki submittedById. Tampilkan hanya fallback yang indikatornya
      // memang ditugaskan kepada PIC ini; pengajuan milik PIC lain tetap aman.
      whereClause.AND.push({
        OR: [
          { submittedById: session.id },
          ...(assignedPerformanceIds.length > 0
            ? [{ submittedById: null, indicatorId: { in: assignedPerformanceIds } }]
            : []),
        ],
      });
    }

    const [submissions, ikuRows] = await Promise.all([
      prisma.performanceSubmission.findMany({
        where: whereClause,
        include: {
          indicator: { select: { id: true, code: true, name: true, unit: true } },
          submittedBy: { select: { id: true, name: true } },
          fiscalYear: { select: { year: true } },
          values: {
            orderBy: { quarter: 'asc' },
          },
          reviews: {
            orderBy: { reviewedAt: 'desc' },
            take: 1,
          },
        },
        orderBy: [{ submittedAt: 'desc' }, { updatedAt: 'desc' }],
      }),
      prisma.indikatorKinerjaUtama.findMany({
        include: { sasaran: { select: { namaSasaran: true } }, pic: { select: { name: true } } },
      }),
    ]);

    const data = submissions.map((item) => {
      // Ambil nilai quarter aktif/terakhir yang memiliki data
      const activeValue = item.values.find((v) => v.quarter === item.reportingQuarter) ?? item.values[0];
      
      const catalogItem = findIndicatorCatalogItem(item.indicator.code);
      const iku = resolveIkuReference(
        { code: item.indicator.code, name: catalogItem?.label ?? item.indicator.name },
        ikuRows as IkuReference[]
      );

      const displayName = iku?.namaIku ?? catalogItem?.label ?? item.indicator.name;
      const displayCode = catalogItem?.code ?? (iku?.id ? `IKU-${iku.id}` : item.indicator.code);
      const unit = item.indicator.unit ?? iku?.satuan ?? '';
      const picName = item.submittedBy?.name ?? iku?.pic?.name ?? 'PIC Terkait';

      return {
        id: item.id,
        date: item.submittedAt?.toISOString() ?? item.updatedAt.toISOString(),
        indicator: {
          id: iku?.id ?? item.indicatorId,
          code: displayCode,
          name: displayName,
          unit: unit,
        },
        pic: picName,
        quarter: item.reportingQuarter ?? activeValue?.quarter ?? 1,
        physicalRealization: item.physicalRealization !== null && item.physicalRealization !== undefined ? item.physicalRealization.toString() : '0',
        status: item.status,
        revisionNote: item.revisionNote ?? null,
        lastReviewNote: item.reviews[0]?.note ?? null,
        targetValue: activeValue?.targetValue?.toString() ?? null,
        realizationValue: activeValue?.realizationValue?.toString() ?? null,
        evidenceFileUrl: item.evidenceFileUrl ?? activeValue?.evidenceFileUrl ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      fiscalYears: await prisma.fiscalYear.findMany({ orderBy: { year: 'desc' } }),
    });
  } catch (error) {
    console.error('[RIWAYAT_PENGAJUAN_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Riwayat pengajuan gagal dimuat.',
      },
      { status: 500 }
    );
  }
}

