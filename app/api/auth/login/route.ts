import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createSessionToken, verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: unknown; password?: unknown };
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    if (!email || !password) return NextResponse.json({ success: false, message: 'Email dan password wajib diisi.' }, { status: 400 });
    // Keep the login query compatible with clients generated before the optional
    // PIC-assignment relation was added. Assignments are loaded independently.
    const user = await prisma.user.findUnique({ where: { email }, include: { roles: { include: { role: true } } } });
    if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) return NextResponse.json({ success: false, message: 'Email atau password salah.' }, { status: 401 });
    const role = user.roles[0]?.role.name;
    if (!role) return NextResponse.json({ success: false, message: 'Akun belum memiliki role.' }, { status: 403 });
    let assignedIndicatorIds: number[] = [];
    try {
      const rows = await prisma.$queryRaw<Array<{ indikator_id: number }>>(Prisma.sql`SELECT indikator_id FROM iku_pic_assignments WHERE pic_user_id = ${user.id}`);
      assignedIndicatorIds = rows.map((row) => Number(row.indikator_id));
    } catch {
      // The assignment table is optional for existing installations; login must
      // remain available while the schema is being migrated.
    }
    const sessionUser = { id: user.id, name: user.name, email: user.email, role, assignedIndicatorIds };
    const response = NextResponse.json({ success: true, data: sessionUser });
    response.cookies.set('session', createSessionToken(sessionUser), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 8, path: '/' });
    response.cookies.set('userRole', role, { httpOnly: false, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 8, path: '/' });
    response.cookies.set('userName', user.name, { httpOnly: false, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 8, path: '/' });
    response.cookies.set('loginToast', '1', { httpOnly: false, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 10, path: '/' });
    return response;
  } catch { return NextResponse.json({ success: false, message: 'Login gagal.' }, { status: 500 }); }
}
