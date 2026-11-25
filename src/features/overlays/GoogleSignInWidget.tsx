import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { GoogleGIcon } from '../../design-system/icons/GoogleGIcon';
import {
  getGoogleWebClientId,
  type GoogleAccountsId,
  loadGoogleIdentityScript,
} from '../../services/googleAuthClient';

interface GoogleSignInWidgetProps {
  mode: 'login' | 'register';
  busy: boolean;
  onCredential: (googleIdToken: string) => Promise<boolean>;
  onFallbackPopup: () => Promise<boolean>;
  onClearErrors: () => void;
}

export function GoogleSignInWidget({
  mode,
  busy,
  onCredential,
  onFallbackPopup,
  onClearErrors,
}: GoogleSignInWidgetProps) {
  const { colors, isLight } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const [gisReady, setGisReady] = useState(false);
  const [gisFailed, setGisFailed] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const promptedRef = useRef(false);
  const onCredentialRef = useRef(onCredential);
  const onClearErrorsRef = useRef(onClearErrors);

  onCredentialRef.current = onCredential;
  onClearErrorsRef.current = onClearErrors;

  const webClientId = getGoogleWebClientId();
  const canUseGis = Platform.OS === 'web' && Boolean(webClientId) && !gisFailed;
  const clampedWidth = Math.max(220, Math.min(400, Math.round(containerWidth || 0)));

  useEffect(() => {
    if (!canUseGis || containerWidth <= 0 || !hostRef.current) return;
    let active = true;
    let gsiInstance: GoogleAccountsId | null = null;

    loadGoogleIdentityScript()
      .then((gsi) => {
        if (!active || !hostRef.current) return;
        gsiInstance = gsi;
        gsi.initialize({
          client_id: webClientId,
          callback: (resp) => {
            if (resp.credential) {
              onClearErrorsRef.current();
              void onCredentialRef.current(resp.credential);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          context: mode === 'register' ? 'signup' : 'signin',
          ux_mode: 'popup',
          use_fedcm_for_prompt: true,
          use_fedcm_for_button: true,
        });

        hostRef.current.innerHTML = '';
        gsi.renderButton(hostRef.current, {
          type: 'standard',
          theme: isLight ? 'outline' : 'filled_black',
          size: 'large',
          shape: 'rectangular',
          text: mode === 'register' ? 'signup_with' : 'signin_with',
          locale: 'vi',
          logo_alignment: 'left',
          width: clampedWidth,
        });
        setGisReady(true);

        if (!promptedRef.current) {
          promptedRef.current = true;
          try {
            gsi.prompt();
          } catch {
            // One Tap optional when browser suppresses prompt
          }
        }
      })
      .catch(() => {
        if (active) setGisFailed(true);
      });

    return () => {
      active = false;
      try {
        gsiInstance?.cancel();
      } catch {
        // Ignore cleanup cancellation errors
      }
    };
  }, [canUseGis, containerWidth, clampedWidth, isLight, mode, webClientId]);

  const fallbackLabel = mode === 'login' ? 'Đăng nhập bằng Google' : 'Đăng ký bằng Google';

  return (
    <View
      onLayout={(e) => {
        const w = Math.round(e.nativeEvent.layout.width);
        if (w > 0 && Math.abs(w - containerWidth) > 2) setContainerWidth(w);
      }}
      style={{ gap: 8, alignItems: 'center' }}
    >
      {canUseGis ? (
        <View
          pointerEvents={busy ? 'none' : 'auto'}
          style={{
            width: '100%',
            alignItems: 'center',
            opacity: busy ? 0.55 : 1,
            minHeight: gisReady ? 44 : 0,
            overflow: 'hidden',
          }}
        >
          <div ref={hostRef} style={{ display: 'flex', justifyContent: 'center', width: '100%' }} />
        </View>
      ) : null}

      {!gisReady || !canUseGis ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={fallbackLabel}
          disabled={busy}
          onPress={() => {
            onClearErrors();
            void onFallbackPopup();
          }}
          style={({ pressed }) => ({
            width: '100%',
            height: 44,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            backgroundColor: colors.cardInner,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            opacity: busy ? 0.5 : pressed ? 0.82 : 1,
          })}
        >
          <GoogleGIcon size={17} />
          <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textPrimary }}>
            {fallbackLabel}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mở cửa sổ Google dự phòng"
          disabled={busy}
          onPress={() => {
            onClearErrors();
            void onFallbackPopup();
          }}
          style={({ pressed }) => ({ paddingVertical: 2, opacity: pressed ? 0.72 : 1 })}
        >
          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textMuted }}>
            Gặp lỗi hiển thị? Mở cửa sổ Google dự phòng
          </Text>
        </Pressable>
      )}
    </View>
  );
}
