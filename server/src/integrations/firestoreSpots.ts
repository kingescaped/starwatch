import type { ServerEnv } from '../env.ts';
import { getGoogleAccessToken } from './googleAuth.ts';
import { buildFirestorePatchUrl, docUrl } from './firestore.ts';

type FsSpotVal = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  arrayValue?: { values?: Array<{ stringValue?: string }> };
};

function encodeSpotFields(obj: Record<string, unknown>): Record<string, FsSpotVal> {
  const out: Record<string, FsSpotVal> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null) out[k] = { nullValue: null };
    else if (typeof v === 'boolean') out[k] = { booleanValue: v };
    else if (typeof v === 'number') out[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    else if (Array.isArray(v)) out[k] = { arrayValue: { values: v.map((item) => ({ stringValue: String(item) })) } };
    else if (v !== undefined) out[k] = { stringValue: String(v) };
  }
  return out;
}

function decodeSpotFields(fields: Record<string, FsSpotVal> | undefined): Record<string, unknown> {
  if (!fields) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if ('nullValue' in v) out[k] = null;
    else if (v.stringValue !== undefined) out[k] = v.stringValue;
    else if (v.integerValue !== undefined) out[k] = Number(v.integerValue);
    else if (v.doubleValue !== undefined) out[k] = v.doubleValue;
    else if (v.booleanValue !== undefined) out[k] = v.booleanValue;
    else if (v.arrayValue) out[k] = (v.arrayValue.values ?? []).map((x) => x.stringValue ?? '');
  }
  return out;
}

export async function listFirestoreSpots(env: ServerEnv): Promise<Array<Record<string, unknown>>> {
  const token = await getGoogleAccessToken(env);
  if (!token) return [];
  try {
    const res = await fetch(`${docUrl(env.firebaseProjectId, 'spots')}?pageSize=100`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { documents?: Array<{ fields?: Record<string, FsSpotVal> }> };
    return (json.documents ?? []).map((d) => decodeSpotFields(d.fields));
  } catch {
    return [];
  }
}

export async function writeFirestoreSpot(env: ServerEnv, spot: Record<string, unknown>): Promise<boolean> {
  const token = await getGoogleAccessToken(env);
  if (!token || typeof spot.id !== 'string') return false;
  const fields = encodeSpotFields(spot);
  const url = buildFirestorePatchUrl(env.firebaseProjectId, `spots/${encodeURIComponent(spot.id)}`, Object.keys(fields));
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
      signal: AbortSignal.timeout(4000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteFirestoreSpot(env: ServerEnv, spotId: string): Promise<boolean> {
  const token = await getGoogleAccessToken(env);
  if (!token || !spotId) return false;
  try {
    const res = await fetch(docUrl(env.firebaseProjectId, `spots/${encodeURIComponent(spotId)}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function countFirestoreUsers(env: ServerEnv): Promise<number> {
  const token = await getGoogleAccessToken(env);
  if (!token) return 0;
  try {
    const res = await fetch(`${docUrl(env.firebaseProjectId, 'users')}?pageSize=100&mask.fieldPaths=role`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return 0;
    const json = (await res.json()) as { documents?: Array<unknown> };
    return json.documents?.length ?? 0;
  } catch {
    return 0;
  }
}
