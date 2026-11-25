import fs from 'node:fs';
import path from 'node:path';

export interface ServerEnv {
  port: number;
  firebaseApiKey: string;
  firebaseProjectId: string;
  googleServiceAccountEmail: string;
  googleServiceAccountPrivateKey: string;
  openMeteoBaseUrl: string;
  allowedOrigins: string[];
  freeDailyPhotoPlans: number;
  freeDailyTargetSearches: number;
  freeDailyTripPlans: number;
  freeMaxTripLocations: number;
  proMaxTripLocations: number;
}

function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, 'utf8');
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

export function loadServerEnv(): ServerEnv {
  const candidates = [
    path.resolve(process.cwd(), 'server', '.env'),
    path.resolve(process.cwd(), '.env'),
  ];
  const fileVars = candidates.reduce<Record<string, string>>(
    (acc, file) => ({ ...acc, ...parseEnvFile(file) }),
    {}
  );
  const read = (key: string, fallback = ''): string =>
    (process.env[key] ?? fileVars[key] ?? fallback).trim();

  const port = Number(read('PORT', '8787')) || 8787;
  const originsRaw = read(
    'ALLOWED_ORIGINS',
    'http://127.0.0.1:4173,http://localhost:4173,http://localhost:8081,http://127.0.0.1:8081'
  );

  return {
    port,
    firebaseApiKey: read('FIREBASE_API_KEY') || read('EXPO_PUBLIC_FIREBASE_API_KEY'),
    firebaseProjectId: read('FIREBASE_PROJECT_ID') || read('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
    googleServiceAccountEmail: read('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
    googleServiceAccountPrivateKey: read('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'),
    openMeteoBaseUrl: read('OPEN_METEO_BASE_URL', 'https://api.open-meteo.com/v1/forecast'),
    allowedOrigins: originsRaw.split(',').map((s) => s.trim()).filter(Boolean),
    freeDailyPhotoPlans: Number(read('FREE_DAILY_PHOTO_PLANS', '3')) || 3,
    freeDailyTargetSearches: Number(read('FREE_DAILY_TARGET_SEARCHES', '10')) || 10,
    freeDailyTripPlans: Number(read('FREE_DAILY_TRIP_PLANS', '1')) || 1,
    freeMaxTripLocations: Number(read('FREE_MAX_TRIP_LOCATIONS', '3')) || 3,
    proMaxTripLocations: Number(read('PRO_MAX_TRIP_LOCATIONS', '10')) || 10,
  };
}

export function hasFirebaseAuth(env: ServerEnv): boolean {
  return Boolean(env.firebaseProjectId && env.firebaseApiKey);
}

export function hasFirestoreAccess(env: ServerEnv): boolean {
  return Boolean(
    env.firebaseProjectId &&
      env.googleServiceAccountEmail &&
      env.googleServiceAccountPrivateKey
  );
}
