import type { NextRequest } from 'next/server';

/** Role cookie is set by the application's authentication layer after login. */
export function getRequestRole(request: NextRequest): string {
  return (
    request.cookies.get('userRole')?.value ??
    request.cookies.get('role')?.value ??
    ''
  ).trim().toUpperCase();
}

export function isAdminRequest(request: NextRequest): boolean {
  return getRequestRole(request) === 'ADMIN';
}

export function canAccessActivityLog(request: NextRequest): boolean {
  const role = getRequestRole(request);
  return role === 'ADMIN' || role === 'PIMPINAN';
}
