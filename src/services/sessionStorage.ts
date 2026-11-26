import type { UserAccount } from '../state/types';

export const SESSION_KEY = 'starwatch_session_v1';

export const SECURE_SESSION_KEYS = {
  token: 'starwatch_session_token_v1',
  refreshToken: 'starwatch_session_refresh_v1',
  user: 'starwatch_session_user_v1',
} as const;

export interface StoredSession {
  token: string;
  refreshToken?: string;
  user: UserAccount;
}

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function parseStoredSession(raw: string | null): StoredSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredSession> | null;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.token !== 'string' || !parsed.token.trim()) return null;
    if (!parsed.user || typeof parsed.user !== 'object' || typeof parsed.user.uid !== 'string') return null;
    const refreshToken = typeof parsed.refreshToken === 'string' && parsed.refreshToken.trim()
      ? parsed.refreshToken.trim()
      : undefined;
    return {
      token: parsed.token.trim(),
      ...(refreshToken ? { refreshToken } : {}),
      user: parsed.user,
    };
  } catch {
    return null;
  }
}

export function serializeStoredSession(session: StoredSession): string {
  return JSON.stringify({
    token: session.token,
    ...(session.refreshToken ? { refreshToken: session.refreshToken } : {}),
    user: session.user,
  });
}

function decodeBase64Bytes(b64: string): Uint8Array {
  if (typeof globalThis.atob === 'function') {
    const bin = globalThis.atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  const clean = b64.replace(/=+$/, '');
  const out: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const c1 = BASE64_ALPHABET.indexOf(clean[i]);
    const c2 = BASE64_ALPHABET.indexOf(clean[i + 1]);
    const c3 = i + 2 < clean.length ? BASE64_ALPHABET.indexOf(clean[i + 2]) : -1;
    const c4 = i + 3 < clean.length ? BASE64_ALPHABET.indexOf(clean[i + 3]) : -1;
    if (c1 < 0 || c2 < 0) break;
    out.push((c1 << 2) | (c2 >> 4));
    if (c3 >= 0) out.push(((c2 & 15) << 4) | (c3 >> 2));
    if (c4 >= 0) out.push(((c3 & 3) << 6) | c4);
  }
  return new Uint8Array(out);
}

function decodeBase64UrlUtf8(input: string): string | null {
  try {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const bytes = decodeBase64Bytes(padded);
    if (typeof TextDecoder !== 'undefined') return new TextDecoder().decode(bytes);
    let ascii = '';
    for (let i = 0; i < bytes.length; i += 1) ascii += String.fromCharCode(bytes[i]);
    return ascii;
  } catch {
    return null;
  }
}

export function decodeTokenExpiryMs(token: string): number | null {
  const parts = token.trim().split('.');
  if (parts.length !== 3 || !parts[1]) return null;
  const decoded = decodeBase64UrlUtf8(parts[1]);
  if (!decoded) return null;
  try {
    const payload = JSON.parse(decoded) as { exp?: unknown };
    if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) return null;
    if (parts[0] === 'sw' || payload.exp > 1e12) return payload.exp;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function isTokenExpiringSoon(
  token: string,
  bufferMs = 5 * 60_000,
  nowMs = Date.now()
): boolean {
  const expMs = decodeTokenExpiryMs(token);
  if (expMs === null) return false;
  return expMs - bufferMs <= nowMs;
}
