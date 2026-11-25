import type { PlanTier, UserRole } from '../integrations/localStore.ts';

export interface UserQuotas {
  dailyPhotoPlans: number | null;
  dailyTargetSearches: number | null;
  dailyTripPlans: number | null;
  maxTripLocations: number | null;
  offlineMaps: number | null;
  cameraProfiles: number | null;
}

export interface UserCapabilities {
  isAdmin: boolean;
  unlimited: boolean;
  effectivePlan: PlanTier;
  hasProFeatures: boolean;
  hasExpeditionFeatures: boolean;
  canManageSystem: boolean;
  canDeleteSpots: boolean;
  canViewAdminPanel: boolean;
  quotas: UserQuotas;
}

export interface QuotaConfig {
  freeDailyPhotoPlans?: number;
  freeDailyTargetSearches?: number;
  freeDailyTripPlans?: number;
  freeMaxTripLocations?: number;
  proMaxTripLocations?: number;
}

const UNLIMITED_QUOTAS: UserQuotas = {
  dailyPhotoPlans: null,
  dailyTargetSearches: null,
  dailyTripPlans: null,
  maxTripLocations: null,
  offlineMaps: null,
  cameraProfiles: null,
};

function buildCapabilities(
  effectivePlan: PlanTier,
  unlimited: boolean,
  isAdmin: boolean,
  quotas: UserQuotas
): UserCapabilities {
  return {
    isAdmin,
    unlimited,
    effectivePlan,
    hasProFeatures: isAdmin || effectivePlan === 'pro' || effectivePlan === 'expedition',
    hasExpeditionFeatures: isAdmin || effectivePlan === 'expedition',
    canManageSystem: isAdmin,
    canDeleteSpots: isAdmin,
    canViewAdminPanel: isAdmin,
    quotas,
  };
}

export function normalizeRole(raw: unknown): UserRole {
  return typeof raw === 'string' && raw.trim().toLowerCase() === 'admin' ? 'admin' : 'user';
}

export function resolvePlanExpiresAt(
  role: UserRole,
  plan: PlanTier,
  remoteExpiresAt: unknown,
  existingExpiresAt: unknown,
  fallbackAnchorIso?: string
): string | null {
  if (role === 'admin' || plan === 'free') return null;
  if (typeof remoteExpiresAt === 'string' && Number.isFinite(Date.parse(remoteExpiresAt))) return remoteExpiresAt;
  if (typeof existingExpiresAt === 'string' && Number.isFinite(Date.parse(existingExpiresAt))) return existingExpiresAt;
  const anchorMs =
    typeof fallbackAnchorIso === 'string' && Number.isFinite(Date.parse(fallbackAnchorIso))
      ? Date.parse(fallbackAnchorIso)
      : Date.now();
  return new Date(anchorMs + 30 * 86_400_000).toISOString();
}

export function formatPublicUser(
  u: {
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
  },
  env?: QuotaConfig
) {
  const role = normalizeRole(u.role);
  const capabilities = resolveUserCapabilities(role, u.plan, env);
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    bio: u.bio,
    plan: u.plan,
    planExpiresAt: u.planExpiresAt ?? null,
    effectivePlan: capabilities.effectivePlan,
    role,
    entitlementSource: u.entitlementSource,
    unlimited: capabilities.unlimited,
    capabilities,
    cameraProfile: u.cameraProfile,
    cameraSpecs: u.cameraSpecs,
    updatedAt: u.updatedAt,
  };
}

export function resolveUserCapabilities(
  role: UserRole,
  plan: PlanTier,
  limits?: QuotaConfig
): UserCapabilities {
  if (role === 'admin') return buildCapabilities('expedition', true, true, { ...UNLIMITED_QUOTAS });
  if (plan === 'expedition') return buildCapabilities('expedition', true, false, { ...UNLIMITED_QUOTAS });
  if (plan === 'pro') {
    return buildCapabilities('pro', false, false, {
      dailyPhotoPlans: null,
      dailyTargetSearches: null,
      dailyTripPlans: 10,
      maxTripLocations: limits?.proMaxTripLocations ?? 10,
      offlineMaps: 10,
      cameraProfiles: 5,
    });
  }
  return buildCapabilities('free', false, false, {
    dailyPhotoPlans: limits?.freeDailyPhotoPlans ?? 3,
    dailyTargetSearches: limits?.freeDailyTargetSearches ?? 10,
    dailyTripPlans: limits?.freeDailyTripPlans ?? 1,
    maxTripLocations: limits?.freeMaxTripLocations ?? 3,
    offlineMaps: 2,
    cameraProfiles: 1,
  });
}
