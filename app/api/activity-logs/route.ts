import { RoleName } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/activity-log-auth';
import { readSessionToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;
const validRoles = new Set(Object.values(RoleName));

function dateAtEndOfDay(value: string | null) {
  if (!value) return undefined;
  const date = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function GET(request: NextRequest) {
  const session = readSessionToken(request.cookies.get('session')?.value);
  if (!isAdminRequest(request) || session?.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Akses hanya untuk ADMIN.' }, { status: 403 });
  }
  try {
    const params = request.nextUrl.searchParams;
    const search = params.get('search')?.trim() ?? '';
    const role = params.get('role')?.trim().toUpperCase() ?? 'ALL';
    const pageValue = Number(params.get('page') ?? 1);
    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');

    const where = {
      ...(role !== 'ALL' && validRoles.has(role as RoleName)
        ? { user: { roles: { some: { role: { name: role as RoleName } } } } }
        : {}),
      ...(search
        ? {
            OR: [
              { description: { contains: search } },
              { ipAddress: { contains: search } },
              { user: { name: { contains: search } } },
            ],
          }
        : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              gte: startDate ? new Date(`${startDate}T00:00:00.000`) : undefined,
              lte: dateAtEndOfDay(endDate),
            },
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          user: {
            select: {
              name: true,
              roles: { select: { role: { select: { name: true } } } },
            },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    const data = logs.map((log) => {
      const metadata = log.metadataJson && typeof log.metadataJson === 'object' && !Array.isArray(log.metadataJson)
        ? log.metadataJson as Record<string, unknown>
        : {};
      const metadataRole = typeof metadata.userRole === 'string' ? metadata.userRole : '';
      return {
        id: log.id,
        createdAt: log.createdAt.toISOString(),
        userName: log.user?.name ?? (typeof metadata.userName === 'string' ? metadata.userName : 'Pengguna tidak diketahui'),
        userRoles: log.user?.roles.map(({ role: item }) => item.name) ?? (metadataRole ? [metadataRole] : []),
        module: log.module,
        action: log.action,
        description: log.description,
        referenceType: log.referenceType,
        referenceId: log.referenceId,
        ipAddress: log.ipAddress,
        metadataJson: log.metadataJson,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        currentPage: page,
        pageSize: PAGE_SIZE,
        totalRecords: total,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      },
    });
  } catch (error) {
    console.error('[ACTIVITY_LOGS_GET_ERROR]', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil log aktivitas.' }, { status: 500 });
  }
}
