import type { ServerEnv } from '../env.ts';
import { getGoogleAccessToken } from './googleAuth.ts';
import type { PlanTier } from './localStore.ts';

export type FsVal = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
};

function encodeFields(obj: Record<string, string | number | boolean>): Record<string, FsVal> {
  const out: Record<string, FsVal> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'boolean') out[k] = { booleanValue: v };
    else if (typeof v === 'number') out[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    else out[k] = { stringValue: String(v) };
  }
  return out;
}

export function decodeFields(fields: Record<string, FsVal> | undefined): Record<string, unknown> {
  if (!fields) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v.stringValue !== undefined) out[k] = v.stringValue;
    else if (v.integerValue !== undefined) out[k] = Number(v.integerValue);
    else if (v.doubleValue !== undefined) out[k] = v.doubleValue;
    else if (v.booleanValue !== undefined) out[k] = v.booleanValue;
    else if (v.timestampValue !== undefined) out[k] = v.timestampValue;
  }
  return out;
}

export function docUrl(projectId: string, docPath: string): string {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${docPath}`;
}

export function buildFirestorePatchUrl(projectId: string, docPath: string, fieldNames: string[]): string {
  const base = docUrl(projectId, docPath);
  if (!fieldNames.length) return base;
  const query = fieldNames.map((name) => `updateMask.fieldPaths=${encodeURIComponent(name)}`).join('&');
  return `${base}?${query}`;
}

async function fetchDocFields(url: string, token: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return {};
    const json = (await res.json()) as { fields?: Record<string, FsVal> };
    return decodeFields(json.fields);
  } catch {
    return null;
  }
}

export async function readFirestoreUser(env: ServerEnv, uid: string): Promise<Record<string, unknown> | null> {
  const token = await getGoogleAccessToken(env);
  if (!token) return null;
  const encodedUid = encodeURIComponent(uid);
  const [pData, eData] = await Promise.all([
    fetchDocFields(docUrl(env.firebaseProjectId, `users/${encodedUid}`), token),
    fetchDocFields(docUrl(env.firebaseProjectId, `entitlements/${encodedUid}`), token),
  ]);
  if (pData === null && eData === null) return null;
  const profile = pData ?? {};
  const entitlement = eData ?? {};
  return {
    ...profile,
    ...entitlement,
    role: profile.role === 'admin' || entitlement.role === 'admin' ? 'admin' : (entitlement.role ?? profile.role),
    source: entitlement.source,
    expiresAt: entitlement.expiresAt ?? entitlement.planExpiresAt ?? entitlement.currentPeriodEnd,
  };
}

export async function writeFirestoreProfile(
  env: ServerEnv,
  uid: string,
  values: Record<string, string | number | boolean>
): Promise<boolean> {
  const token = await getGoogleAccessToken(env);
  if (!token) return false;
  const patchUrl = buildFirestorePatchUrl(env.firebaseProjectId, `users/${encodeURIComponent(uid)}`, Object.keys(values));
  try {
    const res = await fetch(patchUrl, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: encodeFields(values) }),
      signal: AbortSignal.timeout(4000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function writeFirestorePlan(
  env: ServerEnv,
  uid: string,
  plan: PlanTier,
  expiresAt?: string | null
): Promise<boolean> {
  const token = await getGoogleAccessToken(env);
  if (!token) return false;
  const values: Record<string, string | number | boolean> = {
    plan,
    status: 'active',
    updatedAt: new Date().toISOString(),
  };
  if (typeof expiresAt === 'string' && expiresAt.trim()) {
    values.expiresAt = expiresAt.trim();
  }
  const patchUrl = buildFirestorePatchUrl(env.firebaseProjectId, `entitlements/${encodeURIComponent(uid)}`, Object.keys(values));
  try {
    const res = await fetch(patchUrl, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: encodeFields(values) }),
      signal: AbortSignal.timeout(4000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
