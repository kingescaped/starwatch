import type { PlanTier, UserAccount, UserCapabilities, UserQuotas } from '../state/types';

const UNLIMITED_QUOTAS: UserQuotas = {
  dailyPhotoPlans: null,
  dailyTargetSearches: null,
  dailyTripPlans: null,
  maxTripLocations: null,
  offlineMaps: null,
  cameraProfiles: null,
};

const TIER_RANK: Record<PlanTier, number> = { free: 0, pro: 1, expedition: 2 };
const PLAN_TERM_MS = 30 * 86_400_000;

export function isAdminUser(user?: UserAccount | null): boolean {
  return user?.role === 'admin' || user?.capabilities?.isAdmin === true;
}

export function formatPlanExpiryLabel(user?: UserAccount | null): string {
  if (!user) return '';
  if (isAdminUser(user) || user.entitlementSource === 'lifetime_admin') return 'Đặc quyền vĩnh viễn';
  if (user.plan === 'free') return 'Gói miễn phí';
  const parsedExpiry =
    typeof user.planExpiresAt === 'string' && Number.isFinite(Date.parse(user.planExpiresAt))
      ? Date.parse(user.planExpiresAt)
      : null;
  const anchorMs =
    typeof user.updatedAt === 'string' && Number.isFinite(Date.parse(user.updatedAt))
      ? Date.parse(user.updatedAt)
      : Date.now();
  const date = new Date(parsedExpiry ?? anchorMs + PLAN_TERM_MS);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `Hết hạn: ${dd}/${mm}/${date.getFullYear()}`;
}

export function getUserCapabilities(user?: UserAccount | null): UserCapabilities {
  if (user?.capabilities) return user.capabilities;
  const admin = isAdminUser(user);
  const plan: PlanTier = user?.plan ?? 'free';
  const effectivePlan: PlanTier = admin ? 'expedition' : plan;
  const unlimited = admin || effectivePlan === 'expedition';
  const quotas: UserQuotas = unlimited
    ? { ...UNLIMITED_QUOTAS }
    : effectivePlan === 'pro'
      ? { dailyPhotoPlans: null, dailyTargetSearches: null, dailyTripPlans: 10, maxTripLocations: 10, offlineMaps: 10, cameraProfiles: 5 }
      : { dailyPhotoPlans: 3, dailyTargetSearches: 10, dailyTripPlans: 1, maxTripLocations: 3, offlineMaps: 2, cameraProfiles: 1 };

  return {
    isAdmin: admin,
    unlimited,
    effectivePlan,
    hasProFeatures: admin || effectivePlan === 'pro' || effectivePlan === 'expedition',
    hasExpeditionFeatures: admin || effectivePlan === 'expedition',
    canManageSystem: admin,
    canDeleteSpots: admin,
    canViewAdminPanel: admin,
    quotas,
  };
}

export function getEffectivePlan(user?: UserAccount | null): PlanTier {
  if (isAdminUser(user)) return 'expedition';
  return user?.effectivePlan ?? getUserCapabilities(user).effectivePlan;
}

export function hasUnlimitedAccess(user?: UserAccount | null): boolean {
  return isAdminUser(user) || Boolean(user?.unlimited) || getUserCapabilities(user).unlimited;
}

export function canAccessTier(user: UserAccount | null | undefined, requiredTier: PlanTier): boolean {
  if (isAdminUser(user)) return true;
  return TIER_RANK[getEffectivePlan(user)] >= TIER_RANK[requiredTier];
}
