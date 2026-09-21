import { NextResponse } from 'next/server';

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  for (const name of ['session', 'userRole', 'userName', 'loginToast', 'role']) {
    response.cookies.set(name, '', { expires: new Date(0), path: '/' });
  }
  return response;
}

export const POST = GET;
