import type {
  CalendarDay,
  DailyAstroEvent,
  GoldenWindowItem,
  HourlyForecast,
  LightDomeItem,
  MapCloudSystem,
  PlanTier,
  SkySceneData,
  Spot,
  TonightSlot,
  UserAccount,
} from '../state/types';
import type { AstroSetupSpec } from '../data/advisor';
import type { CameraGearProfile } from '../data/cameraCatalog';
import {
  readSessionDriver,
  readSessionDriverSync,
  writeSessionDriver,
} from './nativeSecureStorage';
import type { StoredSession } from './sessionStorage';

const API_BASE =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_BASE_URL) ||
  'http://127.0.0.1:8787';

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function isUnauthorizedError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}

export type { StoredSession };
export const readStoredSessionSync = readSessionDriverSync;
export const readStoredSession = readSessionDriver;
export const writeStoredSession = writeSessionDriver;

async function requestJson<T>(path: string, init?: RequestInit, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
  });
  const body = (await res.json().catch(() => ({}))) as T & { message?: string; code?: string };
  if (!res.ok) throw new ApiError(res.status, body.message || `Lỗi máy chủ (${res.status})`, body.code);
  return body;
}

export interface ObservationResponse {
  source: string;
  retrievedAt: string;
  scores: { milkyWayScore: number; twilightScore: number; cloudSeaScore: number; overallScore: number };
  forecast: HourlyForecast[];
  dailyEvents: DailyAstroEvent[];
  skyScene: SkySceneData;
  goldenWindows: GoldenWindowItem[];
  tonightSlots: TonightSlot[];
  lightDomes: LightDomeItem[];
  cloudSystems: MapCloudSystem[];
}

export interface AdminOverviewResponse {
  role: 'admin';
  unlimited: boolean;
  effectivePlan: PlanTier;
  stats: {
    totalCachedUsers: number;
    customSpotsCount: number;
  };
}

export const apiClient = {
  fetchSpots: () => requestJson<{ spots: Spot[] }>('/v1/spots'),
  createSpot: (payload: Record<string, unknown>) =>
    requestJson<{ spot: Spot }>('/v1/spots', { method: 'POST', body: JSON.stringify(payload) }),
  fetchObservation: (params: { spotId: string; lat: number; lng: number; bortle: number; elevation: number; targetId: string; date: string; hourIndex: number }) => {
    const q = new URLSearchParams({
      spotId: params.spotId,
      lat: String(params.lat),
      lng: String(params.lng),
      bortle: String(params.bortle),
      elevation: String(params.elevation),
      targetId: params.targetId,
      date: params.date,
      hourIndex: String(params.hourIndex),
    });
    return requestJson<ObservationResponse>(`/v1/observation?${q.toString()}`);
  },
  inspectCoords: (lat: number, lng: number) =>
    requestJson<{ lat: number; lng: number; bortle: number; sqm: number; label: string; cloud: number; name: string }>(
      '/v1/map/inspect',
      { method: 'POST', body: JSON.stringify({ lat, lng }) }
    ),
  fetchAdvisorSetup: (payload: {
    mode: string;
    device: string;
    focalLengthMm: number;
    bortle: number;
    dewRisk: boolean;
    gear?: CameraGearProfile;
    targetDecDeg?: number;
    targetName?: string;
    moonIllum?: number;
    moonAlt?: number;
    windKmh?: number;
    cloudPct?: number;
  }) => requestJson<{ spec: AstroSetupSpec }>('/v1/advisor/setup', { method: 'POST', body: JSON.stringify(payload) }),
  fetchCalendar: (year: number, month: number, lat: number, lng: number, bortle: number) =>
    requestJson<{ days: CalendarDay[] }>(`/v1/calendar?year=${year}&month=${month}&lat=${lat}&lng=${lng}&bortle=${bortle}`),
  registerUser: (payload: { email: string; password: string; displayName: string }) =>
    requestJson<{ token: string; refreshToken?: string; user: UserAccount }>('/v1/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  loginUser: (payload: { email: string; password: string }) =>
    requestJson<{ token: string; refreshToken?: string; user: UserAccount }>('/v1/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  googleAuth: (idToken: string, refreshToken?: string) =>
    requestJson<{ token: string; refreshToken?: string; user: UserAccount }>('/v1/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken, ...(refreshToken ? { refreshToken } : {}) }),
    }),
  refreshSession: (refreshToken: string) =>
    requestJson<{ token: string; refreshToken: string; user: UserAccount }>('/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
  fetchMe: (token: string) => requestJson<{ user: UserAccount }>('/v1/me', undefined, token),
  updateMe: (token: string, patch: Partial<Pick<UserAccount, 'displayName' | 'bio' | 'cameraProfile' | 'cameraSpecs'>>) =>
    requestJson<{ user: UserAccount }>('/v1/me', { method: 'PATCH', body: JSON.stringify(patch) }, token),
  changePlan: (token: string, plan: PlanTier) =>
    requestJson<{ user: UserAccount }>('/v1/me/plan', { method: 'PATCH', body: JSON.stringify({ plan }) }, token),
  fetchAdminOverview: (token: string) =>
    requestJson<AdminOverviewResponse>('/v1/admin/overview', undefined, token),
  deleteSpot: (token: string, spotId: string) =>
    requestJson<{ ok: boolean; deletedId: string }>(`/v1/spots/${encodeURIComponent(spotId)}`, { method: 'DELETE' }, token),
};
