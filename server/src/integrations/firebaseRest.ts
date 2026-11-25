import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { ServerEnv } from '../env.ts';

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export interface AuthSessionResult {
  uid: string;
  email: string;
  displayName: string;
  idToken: string;
  provider: 'firebase' | 'local';
}

export async function firebaseSignUp(
  env: ServerEnv,
  email: string,
  password: string,
  displayName: string
): Promise<AuthSessionResult> {
  if (!env.firebaseApiKey) throw new Error('local_only');
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(env.firebaseApiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      signal: AbortSignal.timeout(5000),
    }
  );
  const body = (await res.json()) as { localId?: string; idToken?: string; email?: string; error?: { message?: string } };
  if (!res.ok || !body.localId || !body.idToken) {
    throw new Error(mapFirebaseError(body.error?.message));
  }
  await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${encodeURIComponent(env.firebaseApiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: body.idToken, displayName }),
    }
  ).catch(() => {});
  return { uid: body.localId, email: body.email ?? email, displayName, idToken: body.idToken, provider: 'firebase' };
}

export async function firebaseSignIn(env: ServerEnv, email: string, password: string): Promise<AuthSessionResult> {
  if (!env.firebaseApiKey) throw new Error('local_only');
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(env.firebaseApiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      signal: AbortSignal.timeout(5000),
    }
  );
  const body = (await res.json()) as {
    localId?: string;
    idToken?: string;
    email?: string;
    displayName?: string;
    error?: { message?: string };
  };
  if (!res.ok || !body.localId || !body.idToken) {
    throw new Error(mapFirebaseError(body.error?.message));
  }
  return {
    uid: body.localId,
    email: body.email ?? email,
    displayName: body.displayName || email.split('@')[0],
    idToken: body.idToken,
    provider: 'firebase',
  };
}

export async function verifyFirebaseIdToken(
  env: ServerEnv,
  idToken: string
): Promise<{ uid: string; email: string; displayName: string } | null> {
  if (!env.firebaseProjectId || !idToken) return null;
  try {
    const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
      issuer: `https://securetoken.google.com/${env.firebaseProjectId}`,
      audience: env.firebaseProjectId,
      algorithms: ['RS256'],
      clockTolerance: 5,
    });
    if (typeof payload.sub === 'string') {
      return {
        uid: payload.sub,
        email: typeof payload.email === 'string' ? payload.email.toLowerCase() : '',
        displayName: typeof payload.name === 'string' ? payload.name.trim() : '',
      };
    }
  } catch {
    return null;
  }
  return null;
}

function mapFirebaseError(code?: string): string {
  if (!code) return 'Không thể xác thực tài khoản lúc này.';
  if (code.includes('EMAIL_EXISTS')) return 'Email này đã được đăng ký trước đó.';
  if (code.includes('INVALID_LOGIN_CREDENTIALS') || code.includes('INVALID_PASSWORD') || code.includes('EMAIL_NOT_FOUND')) {
    return 'Email hoặc mật khẩu chưa chính xác.';
  }
  if (code.includes('WEAK_PASSWORD')) return 'Mật khẩu cần tối thiểu 6 ký tự.';
  if (code.includes('INVALID_EMAIL')) return 'Định dạng email không hợp lệ.';
  return `Lỗi xác thực Firebase: ${code}`;
}
