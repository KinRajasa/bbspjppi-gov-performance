import { readSessionToken, type SessionUser } from '@/lib/auth';

export function getRequestSession(request: Request): SessionUser | null {
  const token = request.headers.get('cookie')?.split(';').map((item) => item.trim()).find((item) => item.startsWith('session='))?.slice(8);
  return readSessionToken(token);
}
