import http from 'node:http';
import { hasFirebaseAuth, hasFirestoreAccess, loadServerEnv } from './env.ts';
import { buildCorsHeaders, HttpError, sendJson } from './http/helpers.ts';
import {
  handleAdvisorSetup,
  handleCreateSpot,
  handleDeleteSpot,
  handleGearPreview,
  handleGetCalendar,
  handleGetObservation,
  handleGetSpots,
  handleInspectMap,
} from './routes/observationRoutes.ts';
import {
  handleAdminOverview,
  handleChangePlan,
  handleGetMe,
  handleGoogleAuth,
  handleLogin,
  handleRefreshSession,
  handleRegister,
  handleUpdateMe,
} from './routes/accountRoutes.ts';

const env = loadServerEnv();

export const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (req.method === 'OPTIONS') {
    res.writeHead(204, buildCorsHeaders(origin, env));
    res.end();
    return;
  }

  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? '127.0.0.1'}`);
    const method = (req.method ?? 'GET').toUpperCase();
    if (method === 'DELETE' && url.pathname.startsWith('/v1/spots/')) {
      let spotId = '';
      try {
        spotId = decodeURIComponent(url.pathname.slice('/v1/spots/'.length));
      } catch {
        throw new HttpError(400, 'invalid_spot_id', 'Mã địa điểm cần xóa không hợp lệ.');
      }
      return sendJson(res, 200, await handleDeleteSpot(req, env, spotId), origin, env);
    }
    const route = `${method} ${url.pathname}`;

    switch (route) {
      case 'GET /v1/health':
        return sendJson(res, 200, {
          ok: true,
          firebaseAuth: hasFirebaseAuth(env),
          firestore: hasFirestoreAccess(env),
          openMeteo: env.openMeteoBaseUrl,
        }, origin, env);
      case 'GET /v1/spots':
        return sendJson(res, 200, handleGetSpots(), origin, env);
      case 'POST /v1/spots':
        return sendJson(res, 201, await handleCreateSpot(req), origin, env);
      case 'GET /v1/observation':
        return sendJson(res, 200, await handleGetObservation(url, env), origin, env);
      case 'POST /v1/map/inspect':
        return sendJson(res, 200, await handleInspectMap(req, env), origin, env);
      case 'POST /v1/advisor/setup':
        return sendJson(res, 200, await handleAdvisorSetup(req), origin, env);
      case 'POST /v1/advisor/gear-preview':
        return sendJson(res, 200, await handleGearPreview(req), origin, env);
      case 'GET /v1/calendar':
        return sendJson(res, 200, handleGetCalendar(url), origin, env);
      case 'POST /v1/auth/register':
        return sendJson(res, 201, await handleRegister(req, env), origin, env);
      case 'POST /v1/auth/login':
        return sendJson(res, 200, await handleLogin(req, env), origin, env);
      case 'POST /v1/auth/google':
        return sendJson(res, 200, await handleGoogleAuth(req, env), origin, env);
      case 'POST /v1/auth/refresh':
        return sendJson(res, 200, await handleRefreshSession(req, env), origin, env);
      case 'POST /v1/auth/logout':
        return sendJson(res, 200, { ok: true }, origin, env);
      case 'GET /v1/me':
        return sendJson(res, 200, await handleGetMe(req, env), origin, env);
      case 'PATCH /v1/me':
        return sendJson(res, 200, await handleUpdateMe(req, env), origin, env);
      case 'PATCH /v1/me/plan':
        return sendJson(res, 200, await handleChangePlan(req, env), origin, env);
      case 'GET /v1/admin/overview':
        return sendJson(res, 200, await handleAdminOverview(req, env), origin, env);
      default:
        throw new HttpError(404, 'not_found', 'Không tìm thấy endpoint yêu cầu.');
    }
  } catch (err) {
    if (err instanceof HttpError) {
      return sendJson(res, err.status, { code: err.code, message: err.message }, origin, env);
    }
    return sendJson(res, 500, { code: 'internal_error', message: 'Lỗi xử lý máy chủ StarWatch.' }, origin, env);
  }
});

const isMain = process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js');
if (isMain) {
  server.listen(env.port, '127.0.0.1', () => {
    console.log(`STARWATCH_API_READY http://127.0.0.1:${env.port}`);
  });
}
