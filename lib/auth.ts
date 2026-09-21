import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SESSION_SECRET = process.env.AUTH_SECRET || 'bbspjppi-development-secret-change-me';

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, encoded: string) {
  const [scheme, salt, expected] = encoded.split(':');
  if (scheme !== 'scrypt' || !salt || !expected) return false;
  const actual = scryptSync(password, salt, 64).toString('hex');
  return actual.length === expected.length && timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export type SessionUser = { id: number; name: string; email: string; role: string; assignedIndicatorIds?: number[] };

export function createSessionToken(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
  const signature = createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function readSessionToken(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (signature !== expected) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString()) as SessionUser & { exp?: number };
    return value.exp && value.exp > Date.now() ? value : null;
  } catch { return null; }
}
