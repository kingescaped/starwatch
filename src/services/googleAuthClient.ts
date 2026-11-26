import { Platform } from 'react-native';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, signInWithCredential, signInWithPopup, signOut } from 'firebase/auth';

const DEFAULT_GOOGLE_WEB_CLIENT_ID =
  '844069530611-givs2i2ppopgobb6plqtkthj1i8ljemv.apps.googleusercontent.com';
const GIS_SCRIPT_ID = 'google-gsi-client';
const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

export interface GoogleCredentialResponse {
  credential?: string;
  select_by?: string;
}

export interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: 'signin' | 'signup' | 'use';
    ux_mode?: 'popup' | 'redirect';
    use_fedcm_for_prompt?: boolean;
    use_fedcm_for_button?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: 'standard' | 'icon';
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      logo_alignment?: 'left' | 'center';
      width?: number;
      locale?: string;
    }
  ) => void;
  prompt: () => void;
  cancel: () => void;
}

interface GoogleWindow extends Window {
  google?: { accounts?: { id?: GoogleAccountsId } };
}

const FIREBASE_ERROR_MAP: Record<string, string> = {
  'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập Google.',
  'auth/popup-blocked': 'Trình duyệt đã chặn cửa sổ bật lên Google. Vui lòng cho phép popup và thử lại.',
  'auth/operation-not-allowed':
    'Đăng nhập Google chưa được bật trên Firebase Console (Authentication → Sign-in method → Google).',
  'auth/unauthorized-domain': 'Tên miền hiện tại chưa được cấp phép trong Firebase Auth (Authorized domains).',
  'auth/cancelled-popup-request': 'Yêu cầu đăng nhập Google đã bị hủy.',
};

let gisLoadPromise: Promise<GoogleAccountsId> | null = null;

function getFirebaseWebConfig() {
  const apiKey = (process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '').trim();
  const projectId = (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '').trim();
  const authDomain = (
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || (projectId ? `${projectId}.firebaseapp.com` : '')
  ).trim();
  const appId = (process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '').trim();
  return { apiKey, authDomain, projectId, ...(appId ? { appId } : {}) };
}

function getFirebaseAuthInstance() {
  const config = getFirebaseWebConfig();
  if (!config.apiKey || !config.projectId) {
    throw new Error('Chưa cấu hình khóa Firebase cho đăng nhập Google.');
  }
  const app = getApps().length ? getApp() : initializeApp(config);
  return getAuth(app);
}

function mapGoogleAuthError(err: unknown): string {
  const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code?: unknown }).code) : '';
  return FIREBASE_ERROR_MAP[code] ?? 'Không thể đăng nhập bằng Google lúc này.';
}

export function getGoogleWebClientId(): string {
  return (process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || DEFAULT_GOOGLE_WEB_CLIENT_ID).trim();
}

export function loadGoogleIdentityScript(): Promise<GoogleAccountsId> {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Google Identity Services chỉ hỗ trợ trên Web.'));
  }
  const win = window as GoogleWindow;
  if (win.google?.accounts?.id) return Promise.resolve(win.google.accounts.id);
  if (gisLoadPromise) return gisLoadPromise;

  gisLoadPromise = new Promise<GoogleAccountsId>((resolve, reject) => {
    const timer = setTimeout(() => {
      gisLoadPromise = null;
      reject(new Error('Hết thời gian tải Google Identity Services.'));
    }, 8000);

    const resolveReady = () => {
      clearTimeout(timer);
      const api = (window as GoogleWindow).google?.accounts?.id;
      if (api) resolve(api);
      else {
        gisLoadPromise = null;
        reject(new Error('Google Identity Services chưa sẵn sàng.'));
      }
    };

    const existing = document.getElementById(GIS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', resolveReady, { once: true });
      existing.addEventListener('error', () => {
        clearTimeout(timer);
        gisLoadPromise = null;
        reject(new Error('Không thể tải script Google Sign-In.'));
      }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GIS_SCRIPT_ID;
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = resolveReady;
    script.onerror = () => {
      clearTimeout(timer);
      gisLoadPromise = null;
      reject(new Error('Không thể tải script Google Sign-In.'));
    };
    document.head.appendChild(script);
  });

  return gisLoadPromise;
}

export async function exchangeGoogleIdTokenForFirebase(googleIdToken: string): Promise<{
  idToken: string;
  refreshToken: string;
  email: string;
  displayName: string;
}> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    throw new Error('Đăng nhập Google hiện chỉ khả dụng trên trình duyệt Web.');
  }
  try {
    const auth = getFirebaseAuthInstance();
    const credential = GoogleAuthProvider.credential(googleIdToken);
    const cred = await signInWithCredential(auth, credential);
    const idToken = await cred.user.getIdToken();
    return {
      idToken,
      refreshToken: cred.user.refreshToken ?? '',
      email: cred.user.email ?? '',
      displayName: cred.user.displayName ?? '',
    };
  } catch (err) {
    throw new Error(mapGoogleAuthError(err));
  }
}

export async function signInWithGooglePopup(): Promise<{
  idToken: string;
  refreshToken: string;
  email: string;
  displayName: string;
}> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    throw new Error('Đăng nhập Google hiện chỉ khả dụng trên trình duyệt Web.');
  }
  try {
    const auth = getFirebaseAuthInstance();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    const idToken = await cred.user.getIdToken();
    return {
      idToken,
      refreshToken: cred.user.refreshToken ?? '',
      email: cred.user.email ?? '',
      displayName: cred.user.displayName ?? '',
    };
  } catch (err) {
    throw new Error(mapGoogleAuthError(err));
  }
}

export async function refreshFirebaseClientIdToken(): Promise<{
  idToken: string;
  refreshToken: string;
} | null> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const config = getFirebaseWebConfig();
  if (!config.apiKey || !config.projectId) return null;
  try {
    const auth = getFirebaseAuthInstance();
    await auth.authStateReady();
    if (!auth.currentUser) return null;
    const idToken = await auth.currentUser.getIdToken(true);
    return {
      idToken,
      refreshToken: auth.currentUser.refreshToken ?? '',
    };
  } catch {
    return null;
  }
}

export async function signOutFirebaseClient(): Promise<void> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const config = getFirebaseWebConfig();
  if (!config.apiKey || !config.projectId) return;
  try {
    await signOut(getFirebaseAuthInstance());
  } catch {
    // Ignore Firebase client sign-out errors
  }
}
