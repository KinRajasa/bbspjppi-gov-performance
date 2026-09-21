import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const role = await prisma.role.findUnique({ where: { name: 'KATIM' }, select: { id: true } });
  if (!role) return NextResponse.json({ success: true, data: [] });
  const users = await prisma.user.findMany({ where: { isActive: true, roles: { some: { roleId: role.id } } }, select: { id: true, name: true }, orderBy: { name: 'asc' } });
  return NextResponse.json({ success: true, data: users });
}
