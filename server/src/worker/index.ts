import type { ServerEnv } from '../env.ts';
import { hasWorkerFirebaseAuth, hasWorkerFirestoreAccess, loadWorkerEnv, type WorkerBindings } from './workerEnv.ts';
import {
  workerAdminOverview,
  workerChangePlan,
  workerGetMe,
  workerGoogleAuth,
  WorkerHttpError,
  workerLogin,
  workerRefreshSession,
  workerRegister,
  workerUpdateMe,
} from './workerAccountRoutes.ts';
import {
  workerAdvisorSetup,
  workerCreateSpot,
  workerDeleteSpot,
  workerGearPreview,
  workerGetCalendar,
  workerGetObservation,
  workerGetSpots,
  workerInspectMap,
} from './workerObservationRoutes.ts';

function isAllowedOrigin(origin: string | null, env: ServerEnv): boolean {
  if (!origin) return true;
  if (env.allowedOrigins.includes(origin)) return true;
  try {
    const parsed = new URL(origin);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') return true;
    if (parsed.protocol === 'https:' && parsed.hostname.endsWith('.github.io')) return true;
  } catch {
    return false;
  }
  return false;
}

export function createWorkerCorsHeaders(origin: string | null, env: ServerEnv): Record<string, string> {
  const allow = isAllowedOrigin(origin, env);
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
    ...(allow ? { 'Access-Control-Allow-Origin': origin || '*' } : {}),
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  };
}

function jsonResponse(status: number, data: unknown, origin: string | null, env: ServerEnv): Response {
  return new Response(JSON.stringify(data), { status, headers: createWorkerCorsHeaders(origin, env) });
}

async function dispatchRoute(request: Request, url: URL, env: ServerEnv): Promise<{ status: number; body: unknown }> {
  const method = request.method.toUpperCase();
  if (method === 'DELETE' && url.pathname.startsWith('/v1/spots/')) {
    const spotId = decodeURIComponent(url.pathname.slice('/v1/spots/'.length));
    return { status: 200, body: await workerDeleteSpot(request, env, spotId) };
  }
  switch (`${method} ${url.pathname}`) {
    case 'GET /v1/health':
      return {
        status: 200,
        body: {
          ok: true,
          runtime: 'cloudflare-workers',
          firebaseAuth: hasWorkerFirebaseAuth(env),
          firestore: hasWorkerFirestoreAccess(env),
          openMeteo: env.openMeteoBaseUrl,
        },
      };
    case 'GET /v1/spots':
      return { status: 200, body: await workerGetSpots(env) };
    case 'POST /v1/spots':
      return { status: 201, body: await workerCreateSpot(request, env) };
    case 'GET /v1/observation':
      return { status: 200, body: await workerGetObservation(url, env) };
    case 'POST /v1/map/inspect':
      return { status: 200, body: await workerInspectMap(request, env) };
    case 'POST /v1/advisor/setup':
      return { status: 200, body: await workerAdvisorSetup(request) };
    case 'POST /v1/advisor/gear-preview':
      return { status: 200, body: await workerGearPreview(request) };
    case 'GET /v1/calendar':
      return { status: 200, body: workerGetCalendar(url) };
    case 'POST /v1/auth/register':
      return { status: 201, body: await workerRegister(request, env) };
    case 'POST /v1/auth/login':
      return { status: 200, body: await workerLogin(request, env) };
    case 'POST /v1/auth/google':
      return { status: 200, body: await workerGoogleAuth(request, env) };
    case 'POST /v1/auth/refresh':
      return { status: 200, body: await workerRefreshSession(request, env) };
    case 'POST /v1/auth/logout':
      return { status: 200, body: { ok: true } };
    case 'GET /v1/me':
      return { status: 200, body: await workerGetMe(request, env) };
    case 'PATCH /v1/me':
      return { status: 200, body: await workerUpdateMe(request, env) };
    case 'PATCH /v1/me/plan':
      return { status: 200, body: await workerChangePlan(request, env) };
    case 'GET /v1/admin/overview':
      return { status: 200, body: await workerAdminOverview(request, env) };
    default:
      throw new WorkerHttpError(404, 'not_found', 'Không tìm thấy endpoint yêu cầu.');
  }
}

export async function handleWorkerFetch(request: Request, bindings: WorkerBindings = {}): Promise<Response> {
  const startedAt = Date.now();
  const env = loadWorkerEnv(bindings);
  const origin = request.headers.get('origin');
  const url = new URL(request.url);
  if (request.method.toUpperCase() === 'OPTIONS') {
    return new Response(null, { status: 204, headers: createWorkerCorsHeaders(origin, env) });
  }
  try {
    const { status, body } = await dispatchRoute(request, url, env);
    console.log(JSON.stringify({ method: request.method, path: url.pathname, status, ms: Date.now() - startedAt }));
    return jsonResponse(status, body, origin, env);
  } catch (err) {
    if (err instanceof WorkerHttpError) {
      console.log(JSON.stringify({ method: request.method, path: url.pathname, status: err.status, code: err.code }));
      return jsonResponse(err.status, { code: err.code, message: err.message }, origin, env);
    }
    console.error(JSON.stringify({ method: request.method, path: url.pathname, status: 500, error: String(err) }));
    return jsonResponse(500, { code: 'internal_error', message: 'Lỗi xử lý máy chủ StarWatch.' }, origin, env);
  }
}

export default { fetch: handleWorkerFetch };
