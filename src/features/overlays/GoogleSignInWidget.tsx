import React, { useEffect, useRef } from 'react';
import { Platform, Pressable, Text } from 'react-native';
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
  const { colors } = useTheme();
  const promptedRef = useRef(false);
  const onCredentialRef = useRef(onCredential);
  const onClearErrorsRef = useRef(onClearErrors);

  onCredentialRef.current = onCredential;
  onClearErrorsRef.current = onClearErrors;

  const webClientId = getGoogleWebClientId();

  useEffect(() => {
    if (Platform.OS !== 'web' || !webClientId) return;
    let active = true;
    let gsiInstance: GoogleAccountsId | null = null;

    loadGoogleIdentityScript()
      .then((gsi) => {
        if (!active) return;
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
        // Fallback button handles sign-in cleanly if GIS script cannot load
      });

    return () => {
      active = false;
      try {
        gsiInstance?.cancel();
      } catch {
        // Ignore cleanup cancellation errors
      }
    };
  }, [mode, webClientId]);

  const buttonLabel = mode === 'login' ? 'Đăng nhập bằng Google' : 'Đăng ký bằng Google';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={buttonLabel}
      disabled={busy}
      onPress={() => {
        onClearErrors();
        void onFallbackPopup();
      }}
      style={({ pressed }) => ({
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 11,
        borderRadius: 12,
        backgroundColor: colors.buttonSecondaryBg,
        borderWidth: 1,
        borderColor: colors.buttonSecondaryBorder,
        opacity: busy ? 0.45 : pressed ? 0.82 : 1,
      })}
    >
      <GoogleGIcon size={16} />
      <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textPrimary }}>
        {buttonLabel}
      </Text>
    </Pressable>
  );
}
