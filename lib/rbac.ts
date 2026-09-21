export const APP_ROLES = ['ADMIN', 'KAPOKJA', 'KATIM', 'PIC'] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const landingPage: Record<AppRole, string> = {
  ADMIN: '/dashboard',
  KAPOKJA: '/validasi-kapokja',
  KATIM: '/validasi-katim',
  PIC: '/input-kinerja',
};

const common = ['/', '/dashboard'];
const admin = ['*'];
const masterIku = '/perjanjian-kinerja/master-iku';
const kapokja = [...common, '/validasi-kapokja', '/perjanjian-kinerja', masterIku, '/perjanjian-kinerja/rencana-aksi'];
const katim = [...common, '/validasi-katim', '/riwayat-pengajuan', '/perjanjian-kinerja', masterIku];
const pic = [...common, '/input-kinerja', '/input-realisasi', '/riwayat-pengajuan'];

export const allowedRoutes: Record<AppRole, string[]> = { ADMIN: admin, KAPOKJA: kapokja, KATIM: katim, PIC: pic };

export function normalizeRole(value: string | undefined | null): AppRole | null {
  const role = String(value ?? '').trim().toUpperCase();
  return (APP_ROLES as readonly string[]).includes(role) ? role as AppRole : null;
}

export function routeAllowed(role: AppRole, pathname: string) {
  const routes = allowedRoutes[role];
  const operational = ['/input-realisasi', '/input-kinerja', '/validasi-katim', '/validasi-kapokja'];
  if (role === 'ADMIN' && operational.some((route) => pathname === route || pathname.startsWith(`${route}/`))) return false;
  if (routes.includes('*')) return true;
  if (pathname.startsWith('/perjanjian-kinerja/')) {
    return routes.some((route) => route !== '/perjanjian-kinerja' && pathname.startsWith(`${route}/`)) || routes.includes(pathname);
  }
  return routes.some((route) => route === pathname || (route !== '/' && pathname.startsWith(`${route}/`)));
}
