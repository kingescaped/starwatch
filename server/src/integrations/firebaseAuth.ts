import crypto from 'node:crypto';
import type { ServerEnv } from '../env.ts';
import { firebaseSignIn, firebaseSignUp, verifyFirebaseIdToken, type AuthSessionResult } from './firebaseRest.ts';

export { firebaseSignIn, firebaseSignUp, verifyFirebaseIdToken, type AuthSessionResult };

const LOCAL_SECRET = crypto.createHash('sha256').update('starwatch-local-session-v1').digest('hex');

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`${password}:${LOCAL_SECRET}`).digest('hex');
}

export function createLocalToken(uid: string, email: string): string {
  const payload = Buffer.from(JSON.stringify({ uid, email, exp: Date.now() + 7 * 86_400_000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', LOCAL_SECRET).update(payload).digest('base64url');
  return `sw.${payload}.${sig}`;
}

export function verifyLocalToken(token: string): { uid: string; email: string } | null {
  if (!token.startsWith('sw.')) return null;
  const [, payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', LOCAL_SECRET).update(payload).digest('base64url');
  if (sig !== expected) return null;
  const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { uid?: string; email?: string; exp?: number };
  if (!parsed.uid || !parsed.exp || parsed.exp < Date.now()) return null;
  return { uid: parsed.uid, email: parsed.email ?? '' };
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
