import { NextResponse, type NextRequest } from 'next/server';
import { canAccessActivityLog, getRequestRole } from '@/lib/activity-log-auth';
import { landingPage, normalizeRole, routeAllowed } from '@/lib/rbac';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isActivityApi = pathname === '/api/activity-logs' || pathname.startsWith('/api/activity-logs/');
  const isActivityPage = pathname === '/log-aktivitas' || pathname.startsWith('/log-aktivitas/');
  if (pathname.startsWith('/api/')) {
    if (isActivityApi && !canAccessActivityLog(request)) {
      return NextResponse.json({ success: false, message: 'Akses hanya untuk ADMIN dan PIMPINAN.' }, { status: 403 });
    }
    return NextResponse.next();
  }
  // Public assets in /public (logo, icons, fonts, etc.) must not be sent
  // through the authenticated page guard.
  if (/\.[a-z0-9]{2,8}$/i.test(pathname)) return NextResponse.next();
  if (pathname === '/login' || pathname.startsWith('/_next/') || pathname === '/favicon.ico') return NextResponse.next();
  const role = normalizeRole(getRequestRole(request));
  const hasSession = Boolean(request.cookies.get('session')?.value);
  if (!role || !hasSession) return NextResponse.redirect(new URL('/login', request.url));
  // Alihkan route legacy sebelum Server Component dirender. Redirect dari
  // Server Component memicu bug performance.measure negatif pada React/Turbopack.
  if (pathname === '/input-kinerja/perjakin' || pathname.startsWith('/input-kinerja/perjakin/')) {
    return NextResponse.redirect(new URL('/input-realisasi', request.url));
  }
  if (isActivityPage && !canAccessActivityLog(request)) return NextResponse.redirect(new URL(landingPage[role], request.url));
  if (!routeAllowed(role, pathname)) return NextResponse.redirect(new URL(landingPage[role], request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
