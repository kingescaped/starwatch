import type { ServerEnv } from '../env.ts';

export interface WorkerBindings {
  FIREBASE_API_KEY?: string;
  FIREBASE_PROJECT_ID?: string;
  GOOGLE_SERVICE_ACCOUNT_EMAIL?: string;
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?: string;
  OPEN_METEO_BASE_URL?: string;
  ALLOWED_ORIGINS?: string;
  FREE_DAILY_PHOTO_PLANS?: string;
  FREE_DAILY_TARGET_SEARCHES?: string;
  FREE_DAILY_TRIP_PLANS?: string;
  FREE_MAX_TRIP_LOCATIONS?: string;
  PRO_MAX_TRIP_LOCATIONS?: string;
}

const DEFAULT_ORIGINS =
  'http://127.0.0.1:4173,http://localhost:4173,http://localhost:8081,http://127.0.0.1:8081,https://starwatch-fa50a.web.app,https://starwatch-fa50a.firebaseapp.com';

const readNum = (raw: string | undefined, fallback: number): number => {
  const n = Number((raw ?? '').trim());
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export function loadWorkerEnv(bindings: WorkerBindings): ServerEnv {
  const originsRaw = (bindings.ALLOWED_ORIGINS ?? DEFAULT_ORIGINS).trim();
  return {
    port: 8787,
    firebaseApiKey: (bindings.FIREBASE_API_KEY ?? '').trim(),
    firebaseProjectId: (bindings.FIREBASE_PROJECT_ID ?? '').trim(),
    googleServiceAccountEmail: (bindings.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '').trim(),
    googleServiceAccountPrivateKey: (bindings.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '').trim(),
    openMeteoBaseUrl: (bindings.OPEN_METEO_BASE_URL ?? 'https://api.open-meteo.com/v1/forecast').trim(),
    allowedOrigins: originsRaw.split(',').map((s) => s.trim()).filter(Boolean),
    freeDailyPhotoPlans: readNum(bindings.FREE_DAILY_PHOTO_PLANS, 3),
    freeDailyTargetSearches: readNum(bindings.FREE_DAILY_TARGET_SEARCHES, 10),
    freeDailyTripPlans: readNum(bindings.FREE_DAILY_TRIP_PLANS, 1),
    freeMaxTripLocations: readNum(bindings.FREE_MAX_TRIP_LOCATIONS, 3),
    proMaxTripLocations: readNum(bindings.PRO_MAX_TRIP_LOCATIONS, 10),
  };
}

export function hasWorkerFirebaseAuth(env: ServerEnv): boolean {
  return Boolean(env.firebaseProjectId && env.firebaseApiKey);
}

export function hasWorkerFirestoreAccess(env: ServerEnv): boolean {
  return Boolean(env.firebaseProjectId && env.googleServiceAccountEmail && env.googleServiceAccountPrivateKey);
}
