import { importPKCS8, SignJWT } from 'jose';
import type { ServerEnv } from '../env.ts';

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const DATASTORE_SCOPE = 'https://www.googleapis.com/auth/datastore';

const tokenCache = new Map<string, { value: string; expiresAt: number }>();

export async function getGoogleAccessToken(env: ServerEnv): Promise<string | null> {
  if (!env.firebaseProjectId || !env.googleServiceAccountEmail || !env.googleServiceAccountPrivateKey) return null;
  const cacheKey = `${env.firebaseProjectId}:${env.googleServiceAccountEmail}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt - 60_000 > Date.now()) return cached.value;

  try {
    const pem = env.googleServiceAccountPrivateKey.replace(/\\n/g, '\n');
    const signingKey = await importPKCS8(pem, 'RS256');
    const now = Math.floor(Date.now() / 1000);
    const assertion = await new SignJWT({ scope: DATASTORE_SCOPE })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuer(env.googleServiceAccountEmail)
      .setAudience(TOKEN_ENDPOINT)
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(signingKey);

    const res = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { access_token?: string; expires_in?: number };
    if (typeof body.access_token !== 'string') return null;
    tokenCache.set(cacheKey, {
      value: body.access_token,
      expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
    });
    return body.access_token;
  } catch {
    return null;
  }
}
