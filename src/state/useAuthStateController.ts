import { useCallback, useEffect, useState } from 'react';
import { apiClient, readStoredSession, writeStoredSession } from '../services/apiClient';
import { exchangeGoogleIdTokenForFirebase, signInWithGooglePopup } from '../services/googleAuthClient';
import { playUiSound } from '../utils/soundEngine';
import type { PlanTier, UserAccount } from './types';

export function useAuthStateController(onSyncProfile?: (u: UserAccount) => void) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStoredSession();
    if (!stored) return;
    setToken(stored.token);
    setUser(stored.user);
    onSyncProfile?.(stored.user);
    apiClient
      .fetchMe(stored.token)
      .then((res) => {
        setUser(res.user);
        writeStoredSession({ token: stored.token, user: res.user });
        onSyncProfile?.(res.user);
      })
      .catch(() => {
        writeStoredSession(null);
        setToken(null);
        setUser(null);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const res = await apiClient.loginUser({ email, password });
      setToken(res.token);
      setUser(res.user);
      writeStoredSession({ token: res.token, user: res.user });
      onSyncProfile?.(res.user);
      playUiSound('success');
      return true;
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Không thể đăng nhập lúc này.');
      return false;
    } finally {
      setAuthBusy(false);
    }
  }, [onSyncProfile]);

  const loginWithGoogle = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const { idToken } = await signInWithGooglePopup();
      const res = await apiClient.googleAuth(idToken);
      setToken(res.token);
      setUser(res.user);
      writeStoredSession({ token: res.token, user: res.user });
      onSyncProfile?.(res.user);
      playUiSound('success');
      return true;
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Không thể đăng nhập bằng Google lúc này.');
      return false;
    } finally {
      setAuthBusy(false);
    }
  }, [onSyncProfile]);

  const loginWithGoogleCredential = useCallback(
    async (googleIdToken: string) => {
      setAuthBusy(true);
      setAuthError(null);
      try {
        const { idToken } = await exchangeGoogleIdTokenForFirebase(googleIdToken);
        const res = await apiClient.googleAuth(idToken);
        setToken(res.token);
        setUser(res.user);
        writeStoredSession({ token: res.token, user: res.user });
        onSyncProfile?.(res.user);
        playUiSound('success');
        return true;
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : 'Không thể đăng nhập bằng Google lúc này.');
        return false;
      } finally {
        setAuthBusy(false);
      }
    },
    [onSyncProfile]
  );

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const res = await apiClient.registerUser({ email, password, displayName });
      setToken(res.token);
      setUser(res.user);
      writeStoredSession({ token: res.token, user: res.user });
      onSyncProfile?.(res.user);
      playUiSound('success');
      return true;
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Không thể tạo tài khoản lúc này.');
      return false;
    } finally {
      setAuthBusy(false);
    }
  }, [onSyncProfile]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthError(null);
    writeStoredSession(null);
    playUiSound('tap');
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<Pick<UserAccount, 'displayName' | 'bio' | 'cameraProfile' | 'cameraSpecs'>>) => {
      if (!token) return false;
      setAuthBusy(true);
      setAuthError(null);
      try {
        const res = await apiClient.updateMe(token, patch);
        setUser(res.user);
        writeStoredSession({ token, user: res.user });
        onSyncProfile?.(res.user);
        playUiSound('success');
        return true;
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : 'Không thể lưu thông tin.');
        return false;
      } finally {
        setAuthBusy(false);
      }
    },
    [token, onSyncProfile]
  );

  const changePlan = useCallback(
    async (plan: PlanTier) => {
      if (!token) return false;
      setAuthBusy(true);
      setAuthError(null);
      try {
        const res = await apiClient.changePlan(token, plan);
        setUser(res.user);
        writeStoredSession({ token, user: res.user });
        playUiSound('success');
        return true;
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : 'Không thể cập nhật gói.');
        return false;
      } finally {
        setAuthBusy(false);
      }
    },
    [token]
  );

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return {
    user,
    token,
    authBusy,
    authError,
    login,
    loginWithGoogle,
    loginWithGoogleCredential,
    register,
    logout,
    updateProfile,
    changePlan,
    clearAuthError,
  };
}
