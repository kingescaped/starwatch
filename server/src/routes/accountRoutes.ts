import crypto from 'node:crypto';
import type http from 'node:http';
import type { ServerEnv } from '../env.ts';
import {
  formatPublicUser,
  normalizeRole,
  resolvePlanExpiresAt,
  type QuotaConfig,
} from '../domain/accessPolicy.ts';
export { resolvePlanExpiresAt };
import { HttpError, readJsonBody } from '../http/helpers.ts';
import {
  createLocalToken,
  firebaseSignIn,
  firebaseSignUp,
  hashPassword,
  verifyBearerSession,
  verifyFirebaseIdToken,
} from '../integrations/firebaseAuth.ts';
import { readFirestoreUser, writeFirestorePlan, writeFirestoreProfile } from '../integrations/firestore.ts';
import {
  findLocalUserByEmail,
  getLocalUserById,
  readLocalStore,
  upsertLocalUser,
  type PlanTier,
  type StoredUserRecord,
  type UserRole,
} from '../integrations/localStore.ts';

const VALID_PLANS = new Set<PlanTier>(['free', 'pro', 'expedition']);

export function toPublicUser(u: StoredUserRecord, env?: QuotaConfig) {
  return formatPublicUser(u, env);
}

async function requireSession(req: http.IncomingMessage, env: ServerEnv, message: string) {
  const session = await verifyBearerSession(env, req.headers.authorization ?? null);
  if (!session) throw new HttpError(401, 'unauthenticated', message);
  return session;
}

async function syncUserFromRemote(
  env: ServerEnv,
  uid: string,
  opts: { email?: string; fallbackName?: string; updatedNow?: boolean; fallbackPasswordHash?: string }
): Promise<StoredUserRecord> {
  const existing = getLocalUserById(uid);
  const remote = await readFirestoreUser(env, uid);
  const plan = VALID_PLANS.has(remote?.plan as PlanTier) ? (remote?.plan as PlanTier) : (existing?.plan ?? 'free');
  const role = normalizeRole(remote?.role ?? existing?.role);
  const planExpiresAt = resolvePlanExpiresAt(role, plan, remote?.expiresAt, existing?.planExpiresAt, existing?.updatedAt);
  const merged: StoredUserRecord = {
    uid,
    email: opts.email || existing?.email || 'member@starwatch.vn',
    displayName: String(remote?.displayName ?? existing?.displayName ?? opts.fallbackName ?? 'Thành viên StarWatch'),
    bio: String(remote?.bio ?? existing?.bio ?? 'Thợ săn bầu trời đêm StarWatch'),
    plan,
    planExpiresAt,
    role,
    entitlementSource: typeof remote?.source === 'string' ? remote.source : existing?.entitlementSource,
    cameraProfile: String(remote?.cameraProfile ?? existing?.cameraProfile ?? 'Sony A7 IV · FE 14mm f/1.8 GM'),
    cameraSpecs: String(remote?.cameraSpecs ?? existing?.cameraSpecs ?? 'Full-Frame · NPF 13.0s · Dual ISO 3200'),
    updatedAt: opts.updatedNow ? new Date().toISOString() : (existing?.updatedAt ?? new Date().toISOString()),
    ...(existing?.passwordHash || opts.fallbackPasswordHash
      ? { passwordHash: existing?.passwordHash ?? opts.fallbackPasswordHash }
      : {}),
  };
  upsertLocalUser(merged);
  return merged;
}

export async function handleRegister(req: http.IncomingMessage, env: ServerEnv) {
  const body = await readJsonBody(req);
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const displayName = String(body.displayName ?? '').trim() || email.split('@')[0];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'invalid_email', 'Email chưa đúng định dạng.');
  if (password.length < 6) throw new HttpError(400, 'weak_password', 'Mật khẩu cần tối thiểu 6 ký tự.');

  let uid = `sw-${crypto.randomUUID().slice(0, 12)}`;
  let token = '';
  try {
    const fb = await firebaseSignUp(env, email, password, displayName);
    uid = fb.uid;
    token = fb.idToken;
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Email này') || msg.includes('Mật khẩu') || msg.includes('Định dạng')) throw new HttpError(400, 'auth_rejected', msg);
    if (findLocalUserByEmail(email)) throw new HttpError(400, 'email_exists', 'Email này đã được đăng ký trước đó.');
    token = createLocalToken(uid, email);
  }

  const record: StoredUserRecord = {
    uid, email, displayName, bio: 'Thợ săn bầu trời đêm StarWatch', plan: 'free', planExpiresAt: null, role: 'user',
    cameraProfile: 'Sony A7 IV · FE 14mm f/1.8 GM', cameraSpecs: 'Full-Frame · NPF 13.0s · Dual ISO 3200',
    updatedAt: new Date().toISOString(), passwordHash: hashPassword(password),
  };
  upsertLocalUser(record);
  await Promise.all([
    writeFirestoreProfile(env, uid, { displayName: record.displayName, email: record.email, bio: record.bio, cameraProfile: record.cameraProfile, cameraSpecs: record.cameraSpecs, updatedAt: record.updatedAt }),
    writeFirestorePlan(env, uid, record.plan),
  ]);
  return { token, user: toPublicUser(record, env) };
}

export async function handleLogin(req: http.IncomingMessage, env: ServerEnv) {
  const body = await readJsonBody(req);
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  if (!email || !password) throw new HttpError(400, 'missing_credentials', 'Vui lòng nhập đầy đủ email và mật khẩu.');

  let uid = '';
  let displayName = email.split('@')[0];
  let token = '';
  try {
    const fb = await firebaseSignIn(env, email, password);
    uid = fb.uid;
    displayName = fb.displayName;
    token = fb.idToken;
  } catch (err) {
    const local = findLocalUserByEmail(email);
    if (local && local.passwordHash === hashPassword(password)) {
      uid = local.uid;
      displayName = local.displayName;
      token = createLocalToken(local.uid, local.email);
    } else {
      throw new HttpError(401, 'invalid_credentials', (err instanceof Error ? err.message : '') || 'Email hoặc mật khẩu chưa chính xác.');
    }
  }
  const merged = await syncUserFromRemote(env, uid, { email, fallbackName: displayName, updatedNow: true, fallbackPasswordHash: hashPassword(password) });
  return { token, user: toPublicUser(merged, env) };
}

export async function handleGoogleAuth(req: http.IncomingMessage, env: ServerEnv) {
  const { idToken } = await readJsonBody(req);
  if (!idToken || typeof idToken !== 'string' || !idToken.trim()) {
    throw new HttpError(400, 'missing_token', 'Thiếu mã xác thực Google.');
  }
  const token = idToken.trim();
  const verified = await verifyFirebaseIdToken(env, token);
  if (!verified) {
    throw new HttpError(401, 'invalid_google_token', 'Phiên xác thực Google không hợp lệ hoặc đã hết hạn.');
  }
  const remoteBefore = await readFirestoreUser(env, verified.uid);
  const localBefore = getLocalUserById(verified.uid);
  const fallbackName = verified.displayName || verified.email.split('@')[0] || 'Thành viên Google';
  const merged = await syncUserFromRemote(env, verified.uid, {
    email: verified.email,
    fallbackName,
    updatedNow: true,
  });
  if (!remoteBefore?.displayName && !localBefore?.displayName) {
    await Promise.all([
      writeFirestoreProfile(env, merged.uid, {
        displayName: merged.displayName,
        email: merged.email,
        bio: merged.bio,
        cameraProfile: merged.cameraProfile,
        cameraSpecs: merged.cameraSpecs,
        updatedAt: merged.updatedAt,
      }),
      writeFirestorePlan(env, merged.uid, merged.plan, merged.planExpiresAt),
    ]);
  }
  return { token, user: toPublicUser(merged, env) };
}

export async function handleGetMe(req: http.IncomingMessage, env: ServerEnv) {
  const session = await requireSession(req, env, 'Phiên đăng nhập chưa hợp lệ.');
  const user = await syncUserFromRemote(env, session.uid, { email: session.email });
  return { user: toPublicUser(user, env) };
}

export async function handleUpdateMe(req: http.IncomingMessage, env: ServerEnv) {
  const session = await requireSession(req, env, 'Vui lòng đăng nhập để chỉnh sửa hồ sơ.');
  const body = await readJsonBody(req);
  const cur = await syncUserFromRemote(env, session.uid, { email: session.email });
  const updated: StoredUserRecord = {
    ...cur,
    role: cur.role,
    entitlementSource: cur.entitlementSource,
    displayName: typeof body.displayName === 'string' && body.displayName.trim() ? body.displayName.trim() : cur.displayName,
    bio: typeof body.bio === 'string' ? body.bio.trim() : cur.bio,
    cameraProfile: typeof body.cameraProfile === 'string' && body.cameraProfile.trim() ? body.cameraProfile.trim() : cur.cameraProfile,
    cameraSpecs: typeof body.cameraSpecs === 'string' && body.cameraSpecs.trim() ? body.cameraSpecs.trim() : cur.cameraSpecs,
    updatedAt: new Date().toISOString(),
  };
  upsertLocalUser(updated);
  await writeFirestoreProfile(env, updated.uid, {
    displayName: updated.displayName, bio: updated.bio, cameraProfile: updated.cameraProfile, cameraSpecs: updated.cameraSpecs, updatedAt: updated.updatedAt,
  });
  return { user: toPublicUser(updated, env) };
}

export async function handleChangePlan(req: http.IncomingMessage, env: ServerEnv) {
  const session = await requireSession(req, env, 'Vui lòng đăng nhập để đổi gói dịch vụ.');
  const body = await readJsonBody(req);
  const plan = body.plan as PlanTier;
  if (!VALID_PLANS.has(plan)) throw new HttpError(400, 'invalid_plan', 'Gói dịch vụ không hợp lệ.');
  const cur = await syncUserFromRemote(env, session.uid, { email: session.email });
  const planExpiresAt = cur.role === 'admin' || plan === 'free' ? null : new Date(Date.now() + 30 * 86_400_000).toISOString();
  const updated: StoredUserRecord = {
    ...cur,
    plan,
    planExpiresAt,
    role: cur.role,
    entitlementSource: cur.entitlementSource,
    updatedAt: new Date().toISOString(),
  };
  upsertLocalUser(updated);
  await writeFirestorePlan(env, updated.uid, plan, planExpiresAt);
  return { user: toPublicUser(updated, env) };
}

export async function requireAdminSession(req: http.IncomingMessage, env: ServerEnv) {
  const session = await requireSession(req, env, 'Phiên đăng nhập chưa hợp lệ.');
  const record = await syncUserFromRemote(env, session.uid, { email: session.email });
  const user = toPublicUser(record, env);
  if (user.role !== 'admin') {
    throw new HttpError(403, 'forbidden', 'Chỉ tài khoản quản trị (Admin) mới có quyền thực hiện thao tác này.');
  }
  return { session, user };
}

export async function handleAdminOverview(req: http.IncomingMessage, env: ServerEnv) {
  await requireAdminSession(req, env);
  const store = readLocalStore();
  return {
    role: 'admin' as const,
    unlimited: true,
    effectivePlan: 'expedition' as const,
    stats: {
      totalCachedUsers: Object.keys(store.users).length,
      customSpotsCount: store.customSpots.length,
    },
  };
}
