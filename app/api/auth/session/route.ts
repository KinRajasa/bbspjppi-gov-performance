import { NextResponse } from 'next/server';
import { readSessionToken } from '@/lib/auth';

export function GET(request: Request) {
  const token = request.headers.get('cookie')?.split(';').map((item) => item.trim()).find((item) => item.startsWith('session='))?.slice(8);
  const user = readSessionToken(token);
  return NextResponse.json({ authenticated: Boolean(user), user });
}
