import * as SecureStore from 'expo-secure-store';
import type { UserAccount } from '../state/types';
import { SECURE_SESSION_KEYS, type StoredSession } from './sessionStorage';

function toCompactUser(user: UserAccount): UserAccount {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName.slice(0, 80),
    bio: user.bio.slice(0, 120),
    plan: user.plan,
    planExpiresAt: user.planExpiresAt ?? null,
    ...(user.role ? { role: user.role } : {}),
    ...(user.effectivePlan ? { effectivePlan: user.effectivePlan } : {}),
    ...(user.entitlementSource ? { entitlementSource: user.entitlementSource } : {}),
    ...(typeof user.unlimited === 'boolean' ? { unlimited: user.unlimited } : {}),
    cameraProfile: user.cameraProfile.slice(0, 120),
    cameraSpecs: user.cameraSpecs.slice(0, 120),
    updatedAt: user.updatedAt,
  };
}

export function readSessionDriverSync(): StoredSession | null {
  return null;
}

export async function readSessionDriver(): Promise<StoredSession | null> {
  try {
    const [token, refreshToken, rawUser] = await Promise.all([
      SecureStore.getItemAsync(SECURE_SESSION_KEYS.token),
      SecureStore.getItemAsync(SECURE_SESSION_KEYS.refreshToken),
      SecureStore.getItemAsync(SECURE_SESSION_KEYS.user),
    ]);
    if (!token || !rawUser) return null;
    const user = JSON.parse(rawUser) as UserAccount | null;
    if (!user || typeof user.uid !== 'string') return null;
    return {
      token,
      ...(refreshToken ? { refreshToken } : {}),
      user,
    };
  } catch {
    return null;
  }
}

export async function writeSessionDriver(session: StoredSession | null): Promise<void> {
  if (!session) {
    await Promise.all([
      SecureStore.deleteItemAsync(SECURE_SESSION_KEYS.token).catch(() => {}),
      SecureStore.deleteItemAsync(SECURE_SESSION_KEYS.refreshToken).catch(() => {}),
      SecureStore.deleteItemAsync(SECURE_SESSION_KEYS.user).catch(() => {}),
    ]);
    return;
  }
  await SecureStore.setItemAsync(SECURE_SESSION_KEYS.token, session.token).catch(() => {});
  if (session.refreshToken) {
    await SecureStore.setItemAsync(SECURE_SESSION_KEYS.refreshToken, session.refreshToken).catch(() => {});
  } else {
    await SecureStore.deleteItemAsync(SECURE_SESSION_KEYS.refreshToken).catch(() => {});
  }
  try {
    await SecureStore.setItemAsync(SECURE_SESSION_KEYS.user, JSON.stringify(session.user));
  } catch {
    await SecureStore.setItemAsync(SECURE_SESSION_KEYS.user, JSON.stringify(toCompactUser(session.user))).catch(() => {});
  }
}
