import fs from 'node:fs';
import path from 'node:path';

export type PlanTier = 'free' | 'pro' | 'expedition';
export type UserRole = 'user' | 'admin';

export interface StoredUserRecord {
  uid: string;
  email: string;
  displayName: string;
  bio: string;
  plan: PlanTier;
  planExpiresAt?: string | null;
  role?: UserRole;
  entitlementSource?: string;
  cameraProfile: string;
  cameraSpecs: string;
  updatedAt: string;
  passwordHash?: string;
}

export interface LocalStoreData {
  users: Record<string, StoredUserRecord>;
  customSpots: Array<Record<string, unknown>>;
}

const STORE_PATH = path.resolve(process.cwd(), 'server', 'data', 'store.json');

export function readLocalStore(): LocalStoreData {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8')) as Partial<LocalStoreData>;
      return { users: parsed.users ?? {}, customSpots: parsed.customSpots ?? [] };
    }
  } catch {
    // Fall back to empty store
  }
  return { users: {}, customSpots: [] };
}

export function writeLocalStore(data: LocalStoreData): void {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export function upsertLocalUser(user: StoredUserRecord): void {
  const store = readLocalStore();
  store.users[user.uid] = user;
  writeLocalStore(store);
}

export function findLocalUserByEmail(email: string): StoredUserRecord | null {
  const store = readLocalStore();
  const target = email.trim().toLowerCase();
  return Object.values(store.users).find((u) => u.email.toLowerCase() === target) ?? null;
}

export function getLocalUserById(uid: string): StoredUserRecord | null {
  return readLocalStore().users[uid] ?? null;
}

export function deleteCustomSpotById(spotId: string): boolean {
  if (!spotId) return false;
  const store = readLocalStore();
  const next = store.customSpots.filter((spot) => spot.id !== spotId);
  if (next.length === store.customSpots.length) return false;
  store.customSpots = next;
  writeLocalStore(store);
  return true;
}
