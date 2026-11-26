import {
  parseStoredSession,
  serializeStoredSession,
  SESSION_KEY,
  type StoredSession,
} from './sessionStorage';

export function readSessionDriverSync(): StoredSession | null {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return null;
  try {
    return parseStoredSession(window.localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export async function readSessionDriver(): Promise<StoredSession | null> {
  return readSessionDriverSync();
}

export async function writeSessionDriver(session: StoredSession | null): Promise<void> {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
  try {
    if (session) window.localStorage.setItem(SESSION_KEY, serializeStoredSession(session));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage restriction in private browsing
  }
}
