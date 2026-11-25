import type { ServerEnv } from '../env.ts';
import {
  formatPublicUser,
  normalizeRole,
  resolvePlanExpiresAt,
} from '../domain/accessPolicy.ts';
import { firebaseSignIn, firebaseSignUp, verifyFirebaseIdToken } from '../integrations/firebaseRest.ts';
import { readFirestoreUser, writeFirestorePlan, writeFirestoreProfile } from '../integrations/firestore.ts';
import { countFirestoreUsers, listFirestoreSpots } from '../integrations/firestoreSpots.ts';
import type { PlanTier, StoredUserRecord } from '../integrations/localStore.ts';

const VALID_PLANS = new Set<PlanTier>(['free', 'pro', 'expedition']);

export class WorkerHttpError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function readWorkerJson(req: Request): Promise<Record<string, unknown>> {
  const raw = (await req.text()).trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    throw new WorkerHttpError(400, 'invalid_json', 'Dữ liệu JSON gửi lên không hợp lệ.');
  }
}

async function requireBearerUser(req: Request, env: ServerEnv, message: string) {
  const header = req.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  const token = match?.[1]?.trim() ?? '';
  const verified = await verifyFirebaseIdToken(env, token);
  if (!verified) throw new WorkerHttpError(401, 'unauthenticated', message);
  return verified;
}

async function loadCloudProfile(
  env: ServerEnv,
  uid: string,
  opts: { email?: string; fallbackName?: string; updatedNow?: boolean }
): Promise<StoredUserRecord> {
  const remote = await readFirestoreUser(env, uid);
  const plan = VALID_PLANS.has(remote?.plan as PlanTier) ? (remote?.plan as PlanTier) : 'free';
  const role = normalizeRole(remote?.role);
  const updatedAt = opts.updatedNow
    ? new Date().toISOString()
    : typeof remote?.updatedAt === 'string'
      ? remote.updatedAt
      : new Date().toISOString();
  return {
    uid,
    email: String(remote?.email ?? opts.email ?? 'member@starwatch.vn'),
    displayName: String(remote?.displayName ?? opts.fallbackName ?? 'Thành viên StarWatch'),
    bio: String(remote?.bio ?? 'Thợ săn bầu trời đêm StarWatch'),
    plan,
    planExpiresAt: resolvePlanExpiresAt(role, plan, remote?.expiresAt, null, updatedAt),
    role,
    entitlementSource: typeof remote?.source === 'string' ? remote.source : undefined,
    cameraProfile: String(remote?.cameraProfile ?? 'Sony A7 IV · FE 14mm f/1.8 GM'),
    cameraSpecs: String(remote?.cameraSpecs ?? 'Full-Frame · NPF 13.0s · Dual ISO 3200'),
    updatedAt,
  };
}

export async function workerRegister(req: Request, env: ServerEnv) {
  const body = await readWorkerJson(req);
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const displayName = String(body.displayName ?? '').trim() || email.split('@')[0];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new WorkerHttpError(400, 'invalid_email', 'Email chưa đúng định dạng.');
  if (password.length < 6) throw new WorkerHttpError(400, 'weak_password', 'Mật khẩu cần tối thiểu 6 ký tự.');

  let fb;
  try {
    fb = await firebaseSignUp(env, email, password, displayName);
  } catch (err) {
    throw new WorkerHttpError(400, 'auth_rejected', err instanceof Error ? err.message : 'Không thể đăng ký tài khoản.');
  }
  const now = new Date().toISOString();
  const record: StoredUserRecord = {
    uid: fb.uid,
    email,
    displayName,
    bio: 'Thợ săn bầu trời đêm StarWatch',
    plan: 'free',
    planExpiresAt: null,
    role: 'user',
    cameraProfile: 'Sony A7 IV · FE 14mm f/1.8 GM',
    cameraSpecs: 'Full-Frame · NPF 13.0s · Dual ISO 3200',
    updatedAt: now,
  };
  await Promise.all([
    writeFirestoreProfile(env, fb.uid, {
      displayName: record.displayName, email: record.email, bio: record.bio,
      cameraProfile: record.cameraProfile, cameraSpecs: record.cameraSpecs, updatedAt: record.updatedAt,
    }),
    writeFirestorePlan(env, fb.uid, record.plan, null),
  ]);
  return { token: fb.idToken, user: formatPublicUser(record, env) };
}

export async function workerLogin(req: Request, env: ServerEnv) {
  const body = await readWorkerJson(req);
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  if (!email || !password) throw new WorkerHttpError(400, 'missing_credentials', 'Vui lòng nhập đầy đủ email và mật khẩu.');

  let fb;
  try {
    fb = await firebaseSignIn(env, email, password);
  } catch (err) {
    throw new WorkerHttpError(401, 'invalid_credentials', err instanceof Error ? err.message : 'Email hoặc mật khẩu chưa chính xác.');
  }
  const user = await loadCloudProfile(env, fb.uid, { email: fb.email, fallbackName: fb.displayName, updatedNow: true });
  return { token: fb.idToken, user: formatPublicUser(user, env) };
}

export async function workerGoogleAuth(req: Request, env: ServerEnv) {
  const body = await readWorkerJson(req);
  const idToken = typeof body.idToken === 'string' ? body.idToken.trim() : '';
  if (!idToken) throw new WorkerHttpError(400, 'missing_token', 'Thiếu mã xác thực Google.');
  const verified = await verifyFirebaseIdToken(env, idToken);
  if (!verified) throw new WorkerHttpError(401, 'invalid_google_token', 'Phiên xác thực Google không hợp lệ hoặc đã hết hạn.');

  const remoteBefore = await readFirestoreUser(env, verified.uid);
  const user = await loadCloudProfile(env, verified.uid, {
    email: verified.email,
    fallbackName: verified.displayName || verified.email.split('@')[0] || 'Thành viên Google',
    updatedNow: true,
  });
  if (!remoteBefore?.displayName) {
    await Promise.all([
      writeFirestoreProfile(env, user.uid, {
        displayName: user.displayName, email: user.email, bio: user.bio,
        cameraProfile: user.cameraProfile, cameraSpecs: user.cameraSpecs, updatedAt: user.updatedAt,
      }),
      writeFirestorePlan(env, user.uid, user.plan, user.planExpiresAt),
    ]);
  }
  return { token: idToken, user: formatPublicUser(user, env) };
}

export async function workerGetMe(req: Request, env: ServerEnv) {
  const session = await requireBearerUser(req, env, 'Phiên đăng nhập chưa hợp lệ.');
  const user = await loadCloudProfile(env, session.uid, { email: session.email, fallbackName: session.displayName });
  return { user: formatPublicUser(user, env) };
}

export async function workerUpdateMe(req: Request, env: ServerEnv) {
  const session = await requireBearerUser(req, env, 'Vui lòng đăng nhập để chỉnh sửa hồ sơ.');
  const body = await readWorkerJson(req);
  const cur = await loadCloudProfile(env, session.uid, { email: session.email, fallbackName: session.displayName });
  const updated: StoredUserRecord = {
    ...cur,
    displayName: typeof body.displayName === 'string' && body.displayName.trim() ? body.displayName.trim() : cur.displayName,
    bio: typeof body.bio === 'string' ? body.bio.trim() : cur.bio,
    cameraProfile: typeof body.cameraProfile === 'string' && body.cameraProfile.trim() ? body.cameraProfile.trim() : cur.cameraProfile,
    cameraSpecs: typeof body.cameraSpecs === 'string' && body.cameraSpecs.trim() ? body.cameraSpecs.trim() : cur.cameraSpecs,
    updatedAt: new Date().toISOString(),
  };
  await writeFirestoreProfile(env, updated.uid, {
    displayName: updated.displayName, bio: updated.bio, cameraProfile: updated.cameraProfile,
    cameraSpecs: updated.cameraSpecs, updatedAt: updated.updatedAt,
  });
  return { user: formatPublicUser(updated, env) };
}

export async function workerChangePlan(req: Request, env: ServerEnv) {
  const session = await requireBearerUser(req, env, 'Vui lòng đăng nhập để đổi gói dịch vụ.');
  const body = await readWorkerJson(req);
  const plan = body.plan as PlanTier;
  if (!VALID_PLANS.has(plan)) throw new WorkerHttpError(400, 'invalid_plan', 'Gói dịch vụ không hợp lệ.');
  const cur = await loadCloudProfile(env, session.uid, { email: session.email, fallbackName: session.displayName });
  const planExpiresAt = cur.role === 'admin' || plan === 'free' ? null : new Date(Date.now() + 30 * 86_400_000).toISOString();
  const updated: StoredUserRecord = { ...cur, plan, planExpiresAt, updatedAt: new Date().toISOString() };
  await writeFirestorePlan(env, updated.uid, plan, planExpiresAt);
  return { user: formatPublicUser(updated, env) };
}

export async function workerRequireAdmin(req: Request, env: ServerEnv) {
  const session = await requireBearerUser(req, env, 'Phiên đăng nhập chưa hợp lệ.');
  const record = await loadCloudProfile(env, session.uid, { email: session.email, fallbackName: session.displayName });
  const user = formatPublicUser(record, env);
  if (user.role !== 'admin') {
    throw new WorkerHttpError(403, 'forbidden', 'Chỉ tài khoản quản trị (Admin) mới có quyền thực hiện thao tác này.');
  }
  return { session, user };
}

export async function workerAdminOverview(req: Request, env: ServerEnv) {
  await workerRequireAdmin(req, env);
  const [totalCachedUsers, customSpots] = await Promise.all([countFirestoreUsers(env), listFirestoreSpots(env)]);
  return {
    role: 'admin' as const,
    unlimited: true,
    effectivePlan: 'expedition' as const,
    stats: { totalCachedUsers, customSpotsCount: customSpots.length },
  };
}
