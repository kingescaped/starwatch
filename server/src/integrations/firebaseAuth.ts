import crypto from 'node:crypto';
import type { ServerEnv } from '../env.ts';
import {
  firebaseRefreshIdToken,
  firebaseSignIn,
  firebaseSignUp,
  verifyFirebaseIdToken,
  type AuthSessionResult,
  type FirebaseRefreshResult,
} from './firebaseRest.ts';

export { firebaseRefreshIdToken, firebaseSignIn, firebaseSignUp, verifyFirebaseIdToken, type AuthSessionResult, type FirebaseRefreshResult };

const LOCAL_SECRET = crypto.createHash('sha256').update('starwatch-local-session-v1').digest('hex');
const LOCAL_TOKEN_TTL_MS = 7 * 86_400_000;
const LOCAL_REFRESH_TTL_MS = 90 * 86_400_000;

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`${password}:${LOCAL_SECRET}`).digest('hex');
}

function createSignedLocalToken(prefix: 'sw' | 'swr', uid: string, email: string, ttlMs: number): string {
  const payload = Buffer.from(JSON.stringify({ uid, email, exp: Date.now() + ttlMs })).toString('base64url');
  const sig = crypto.createHmac('sha256', LOCAL_SECRET).update(payload).digest('base64url');
  return `${prefix}.${payload}.${sig}`;
}

function verifySignedLocalToken(prefix: 'sw' | 'swr', token: string): { uid: string; email: string } | null {
  if (!token.startsWith(`${prefix}.`)) return null;
  const [, payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', LOCAL_SECRET).update(payload).digest('base64url');
  if (sig !== expected) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      uid?: string;
      email?: string;
      exp?: number;
    };
    if (!parsed.uid || !parsed.exp || parsed.exp < Date.now()) return null;
    return { uid: parsed.uid, email: parsed.email ?? '' };
  } catch {
    return null;
  }
}

export function createLocalToken(uid: string, email: string): string {
  return createSignedLocalToken('sw', uid, email, LOCAL_TOKEN_TTL_MS);
}

export function verifyLocalToken(token: string): { uid: string; email: string } | null {
  return verifySignedLocalToken('sw', token);
}

export function createLocalRefreshToken(uid: string, email: string): string {
  return createSignedLocalToken('swr', uid, email, LOCAL_REFRESH_TTL_MS);
}

export function verifyLocalRefreshToken(token: string): { uid: string; email: string } | null {
  return verifySignedLocalToken('swr', token);
}

export async function verifyBearerSession(
  env: ServerEnv,
  authHeader: string | null
): Promise<{ uid: string; email: string } | null> {
  if (!authHeader) return null;
  const m = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  const token = m?.[1];
  if (!token) return null;
  const local = verifyLocalToken(token);
  if (local) return local;
  const verified = await verifyFirebaseIdToken(env, token);
  return verified ? { uid: verified.uid, email: verified.email } : null;
}
