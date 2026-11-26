import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import {
  apiClient,
  isUnauthorizedError,
  readStoredSession,
  readStoredSessionSync,
  writeStoredSession,
  type StoredSession,
} from '../services/apiClient';
import {
  exchangeGoogleIdTokenForFirebase,
  refreshFirebaseClientIdToken,
  signInWithGooglePopup,
  signOutFirebaseClient,
} from '../services/googleAuthClient';
import { isTokenExpiringSoon } from '../services/sessionStorage';
import { playUiSound } from '../utils/soundEngine';
import type { PlanTier, UserAccount } from './types';

interface RefreshOutcome {
  session: StoredSession | null;
  revoked: boolean;
}

function toStoredSession(
  res: { token: string; refreshToken?: string; user: UserAccount },
  fallbackRefresh?: string
): StoredSession {
  const refreshToken = res.refreshToken || fallbackRefresh || undefined;
  return { token: res.token, ...(refreshToken ? { refreshToken } : {}), user: res.user };
}

async function requestSessionRefresh(target: StoredSession): Promise<StoredSession | null> {
  if (target.refreshToken) {
    const res = await apiClient.refreshSession(target.refreshToken);
    return toStoredSession(res, target.refreshToken);
  }
  const fb = await refreshFirebaseClientIdToken();
  if (!fb) return null;
  const res = await apiClient.googleAuth(fb.idToken, fb.refreshToken);
  return toStoredSession(res, fb.refreshToken);
}

export function useAuthStateController(onSyncProfile?: (u: UserAccount) => void) {
  const initialRef = useRef<StoredSession | null | undefined>(undefined);
  if (initialRef.current === undefined) initialRef.current = readStoredSessionSync();

  const [user, setUser] = useState<UserAccount | null>(() => initialRef.current?.user ?? null);
  const [token, setToken] = useState<string | null>(() => initialRef.current?.token ?? null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const sessionRef = useRef<StoredSession | null>(initialRef.current ?? null);
  const authEpochRef = useRef(0);
  const refreshPromiseRef = useRef<Promise<RefreshOutcome> | null>(null);
  const onSyncProfileRef = useRef(onSyncProfile);
  onSyncProfileRef.current = onSyncProfile;

  const applySession = useCallback((next: StoredSession | null, syncProfile = false, bumpEpoch = false) => {
    if (bumpEpoch) authEpochRef.current += 1;
    sessionRef.current = next;
    setToken(next?.token ?? null);
    setUser(next?.user ?? null);
    void writeStoredSession(next);
    if (next && syncProfile) onSyncProfileRef.current?.(next.user);
  }, []);

  const refreshSessionOnce = useCallback(
    async (seed?: StoredSession | null, clearIfMissing = false): Promise<RefreshOutcome> => {
      if (refreshPromiseRef.current) return refreshPromiseRef.current;
      const target = seed ?? sessionRef.current;
      if (!target) return { session: null, revoked: true };
      const startEpoch = authEpochRef.current;

      const task = (async (): Promise<RefreshOutcome> => {
        try {
          const next = await requestSessionRefresh(target);
          if (authEpochRef.current !== startEpoch) return { session: null, revoked: false };
          if (!next) {
            const expired = clearIfMissing || isTokenExpiringSoon(target.token, 0);
            if (expired) applySession(null);
            return { session: null, revoked: expired };
          }
          applySession(next, true);
          return { session: next, revoked: false };
        } catch (err) {
          if (authEpochRef.current !== startEpoch) return { session: null, revoked: false };
          if (isUnauthorizedError(err)) {
            applySession(null);
            void signOutFirebaseClient();
            return { session: null, revoked: true };
          }
          return { session: null, revoked: false };
        } finally {
          refreshPromiseRef.current = null;
        }
      })();

      refreshPromiseRef.current = task;
      return task;
    },
    [applySession]
  );

  useEffect(() => {
    let mounted = true;
    const startEpoch = authEpochRef.current;

    const hydrate = async () => {
      const stored = await readStoredSession();
      if (!mounted || authEpochRef.current !== startEpoch || !stored) return;
      sessionRef.current = stored;
      setToken(stored.token);
      setUser(stored.user);
      onSyncProfileRef.current?.(stored.user);

      if (isTokenExpiringSoon(stored.token) && stored.refreshToken) {
        await refreshSessionOnce(stored, true);
        return;
      }
      try {
        const res = await apiClient.fetchMe(stored.token);
        if (!mounted || authEpochRef.current !== startEpoch) return;
        const latest = sessionRef.current ?? stored;
        applySession({ ...latest, token: stored.token, user: res.user }, true);
      } catch (err) {
        if (!mounted || authEpochRef.current !== startEpoch) return;
        if (isUnauthorizedError(err)) await refreshSessionOnce(stored, true);
      }
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [applySession, refreshSessionOnce]);

  useEffect(() => {
    const maybeRefreshOnResume = () => {
      const current = sessionRef.current;
      if (current?.token && isTokenExpiringSoon(current.token)) void refreshSessionOnce(current);
    };
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
      const onVisibility = () => {
        if (document.visibilityState === 'visible') maybeRefreshOnResume();
      };
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('focus', maybeRefreshOnResume);
      window.addEventListener('online', maybeRefreshOnResume);
      return () => {
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('focus', maybeRefreshOnResume);
        window.removeEventListener('online', maybeRefreshOnResume);
      };
    }
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') maybeRefreshOnResume();
    });
    return () => sub.remove();
  }, [refreshSessionOnce]);

  const executeAuthed = useCallback(
    async <T,>(action: (activeToken: string) => Promise<T>): Promise<T> => {
      let current = sessionRef.current;
      if (!current?.token) throw new Error('Vui lòng đăng nhập lại.');
      if (isTokenExpiringSoon(current.token) && current.refreshToken) {
        const pre = await refreshSessionOnce(current);
        if (pre.revoked) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        if (pre.session) current = pre.session;
      }
      try {
        return await action(current.token);
      } catch (err) {
        if (!isUnauthorizedError(err)) throw err;
        const retried = await refreshSessionOnce(sessionRef.current ?? current, true);
        if (retried.session) return action(retried.session.token);
        if (retried.revoked) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        throw err;
      }
    },
    [refreshSessionOnce]
  );

  const runAuthAction = useCallback(
    async (task: () => Promise<StoredSession>, fallbackMsg: string) => {
      setAuthBusy(true);
      setAuthError(null);
      try {
        applySession(await task(), true, true);
        playUiSound('success');
        return true;
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : fallbackMsg);
        return false;
      } finally {
        setAuthBusy(false);
      }
    },
    [applySession]
  );

  const runUserMutation = useCallback(
    async (action: (activeToken: string) => Promise<{ user: UserAccount }>, fallbackMsg: string, syncProfile: boolean) => {
      if (!sessionRef.current?.token) return false;
      setAuthBusy(true);
      setAuthError(null);
      try {
        const res = await executeAuthed(action);
        const latest = sessionRef.current;
        if (latest) applySession({ ...latest, user: res.user }, syncProfile);
        playUiSound('success');
        return true;
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : fallbackMsg);
        return false;
      } finally {
        setAuthBusy(false);
      }
    },
    [applySession, executeAuthed]
  );

  const login = useCallback(
    (email: string, password: string) =>
      runAuthAction(async () => toStoredSession(await apiClient.loginUser({ email, password })), 'Không thể đăng nhập lúc này.'),
    [runAuthAction]
  );

  const loginWithGoogle = useCallback(
    () =>
      runAuthAction(async () => {
        const { idToken, refreshToken } = await signInWithGooglePopup();
        return toStoredSession(await apiClient.googleAuth(idToken, refreshToken), refreshToken);
      }, 'Không thể đăng nhập bằng Google lúc này.'),
    [runAuthAction]
  );

  const loginWithGoogleCredential = useCallback(
    (googleIdToken: string) =>
      runAuthAction(async () => {
        const { idToken, refreshToken } = await exchangeGoogleIdTokenForFirebase(googleIdToken);
        return toStoredSession(await apiClient.googleAuth(idToken, refreshToken), refreshToken);
      }, 'Không thể đăng nhập bằng Google lúc này.'),
    [runAuthAction]
  );

  const register = useCallback(
    (email: string, password: string, displayName: string) =>
      runAuthAction(async () => toStoredSession(await apiClient.registerUser({ email, password, displayName })), 'Không thể tạo tài khoản lúc này.'),
    [runAuthAction]
  );

  const logout = useCallback(() => {
    setAuthError(null);
    applySession(null, false, true);
    void signOutFirebaseClient();
    playUiSound('tap');
  }, [applySession]);

  const updateProfile = useCallback(
    (patch: Partial<Pick<UserAccount, 'displayName' | 'bio' | 'cameraProfile' | 'cameraSpecs'>>) =>
      runUserMutation((t) => apiClient.updateMe(t, patch), 'Không thể lưu thông tin.', true),
    [runUserMutation]
  );

  const changePlan = useCallback(
    (plan: PlanTier) =>
      runUserMutation((t) => apiClient.changePlan(t, plan), 'Không thể cập nhật gói.', false),
    [runUserMutation]
  );

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return {
    user, token, authBusy, authError,
    login, loginWithGoogle, loginWithGoogleCredential, register, logout,
    updateProfile, changePlan, clearAuthError,
  };
}
