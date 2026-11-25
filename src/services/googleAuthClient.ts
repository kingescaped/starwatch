import { Platform } from 'react-native';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';

const FIREBASE_ERROR_MAP: Record<string, string> = {
  'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập Google.',
  'auth/popup-blocked': 'Trình duyệt đã chặn cửa sổ bật lên Google. Vui lòng cho phép popup và thử lại.',
  'auth/operation-not-allowed':
    'Đăng nhập Google chưa được bật trên Firebase Console (Authentication → Sign-in method → Google).',
  'auth/unauthorized-domain': 'Tên miền hiện tại chưa được cấp phép trong Firebase Auth (Authorized domains).',
  'auth/cancelled-popup-request': 'Yêu cầu đăng nhập Google đã bị hủy.',
};

function getFirebaseWebConfig() {
  const apiKey = (process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '').trim();
  const projectId = (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '').trim();
  const authDomain = (
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || (projectId ? `${projectId}.firebaseapp.com` : '')
  ).trim();
  const appId = (process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '').trim();
  return { apiKey, authDomain, projectId, ...(appId ? { appId } : {}) };
}

function mapGoogleAuthError(err: unknown): string {
  const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code?: unknown }).code) : '';
  return FIREBASE_ERROR_MAP[code] ?? 'Không thể đăng nhập bằng Google lúc này.';
}

export async function signInWithGooglePopup(): Promise<{
  idToken: string;
  email: string;
  displayName: string;
}> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    throw new Error('Đăng nhập Google hiện chỉ khả dụng trên trình duyệt Web.');
  }
  const config = getFirebaseWebConfig();
  if (!config.apiKey || !config.projectId) {
    throw new Error('Chưa cấu hình khóa Firebase cho đăng nhập Google.');
  }
  try {
    const app = getApps().length ? getApp() : initializeApp(config);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(getAuth(app), provider);
    const idToken = await cred.user.getIdToken();
    return {
      idToken,
      email: cred.user.email ?? '',
      displayName: cred.user.displayName ?? '',
    };
  } catch (err) {
    throw new Error(mapGoogleAuthError(err));
  }
}
