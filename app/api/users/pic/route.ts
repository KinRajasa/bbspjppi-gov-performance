import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Return active users with role PIC.
 */
export async function GET(request: NextRequest) {
  const picRole = await prisma.role.findUnique({ where: { name: 'PIC' } });
  if (!picRole) return NextResponse.json({ success: true, data: [] });
  const indicatorId = Number(request.nextUrl.searchParams.get('indicatorId'));
  const hasIndicatorFilter = Number.isInteger(indicatorId) && indicatorId > 0;
  const legacy = hasIndicatorFilter
    ? await prisma.indikatorKinerjaUtama.findUnique({ where: { id: indicatorId }, select: { picId: true } })
    : null;
  const assignedIds = legacy?.picId ? [legacy.picId] : [];
  const users = await prisma.user.findMany({
    where: { isActive: true, roles: { some: { roleId: picRole.id } }, ...(hasIndicatorFilter ? { id: { in: assignedIds } } : {}) },
    select: { id: true, name: true },
  });
  return NextResponse.json({ success: true, data: users });
}
