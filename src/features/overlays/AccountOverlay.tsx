import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { MODAL_WIDTHS } from '../../design-system/tokens/spacing';
import { SegmentedControl } from '../../design-system/primitives/SegmentedControl';
import { TierBadge } from '../../design-system/primitives/TierBadge';
import { ActionButton } from '../../design-system/primitives/ActionButton';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { useAppState } from '../../state/AppStateContext';
import { AccountPlansSection } from './AccountPlansSection';
import { GoogleSignInWidget } from './GoogleSignInWidget';
import { ModalShell } from './ModalShell';

interface AccountOverlayProps {
  isMobileView?: boolean;
}

export function AccountOverlay({ isMobileView = false }: AccountOverlayProps) {
  const { colors } = useTheme();
  const {
    user, isAdmin, effectivePlan, authBusy, authError, clearAuthError,
    login, loginWithGoogle, loginWithGoogleCredential, register, logout, updateProfile, changePlan,
    openOverlay, closeOverlay, closeMobileSubScreen,
  } = useAppState();

  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [localMsg, setLocalMsg] = useState<string | null>(null);

  const [editName, setEditName] = useState(user?.displayName ?? '');
  const [editBio, setEditBio] = useState(user?.bio ?? '');
  const [savedFlag, setSavedFlag] = useState(false);

  useEffect(() => {
    setEditName(user?.displayName ?? '');
    setEditBio(user?.bio ?? '');
  }, [user?.uid, user?.displayName, user?.bio]);

  const goBack = () => {
    if (isMobileView) closeMobileSubScreen();
    else openOverlay('settings');
  };

  const handleSubmitAuth = async () => {
    setLocalMsg(null);
    clearAuthError();
    if (!email.trim() || !password) {
      setLocalMsg('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }
    if (authTab === 'register') {
      if (password !== confirmPw) {
        setLocalMsg('Mật khẩu xác nhận không khớp.');
        return;
      }
      const ok = await register(email.trim(), password, displayName.trim() || email.split('@')[0]);
      if (ok) {
        setPassword('');
        setConfirmPw('');
      }
    } else {
      const ok = await login(email.trim(), password);
      if (ok) setPassword('');
    }
  };

  const handleSaveProfile = async () => {
    const ok = await updateProfile({ displayName: editName.trim() || user?.displayName, bio: editBio.trim() });
    if (ok) {
      setSavedFlag(true);
      setTimeout(() => setSavedFlag(false), 2000);
    }
  };

  const inputStyle = {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: isMobileView ? 16 : 13,
    fontFamily: FONT_FAMILIES.sansRegular,
    color: colors.textPrimary,
  };

  return (
    <ModalShell
      title={user ? 'Hồ Sơ & Gói Dịch Vụ' : 'Đăng Nhập · Đăng Ký'}
      subtitle={user ? 'Chỉnh sửa thông tin tài khoản và quyền sử dụng gói' : 'Đồng bộ điểm yêu thích, hồ sơ máy ảnh & gói StarWatch'}
      width={MODAL_WIDTHS.goldenWindow}
      onClose={closeOverlay}
      backLabel={isMobileView ? 'Tài khoản' : 'Cài đặt'}
      onBack={goBack}
      isMobileView={isMobileView}
    >
      {!user ? (
        <View style={{ gap: 12 }}>
          <SegmentedControl
            value={authTab}
            onChange={(v) => { setAuthTab(v); setLocalMsg(null); clearAuthError(); }}
            options={[
              { value: 'login', label: 'Đăng nhập' },
              { value: 'register', label: 'Đăng ký tài khoản' },
            ]}
          />

          {authTab === 'register' ? (
            <View style={{ gap: 5 }}>
              <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textSecondary }}>Tên hiển thị</Text>
              <TextInput value={displayName} onChangeText={setDisplayName} placeholder="VD: Vinh Quang Vo" placeholderTextColor={colors.textMuted} style={inputStyle} />
            </View>
          ) : null}

          <View style={{ gap: 5 }}>
            <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textSecondary }}>Email</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="ten@example.com" placeholderTextColor={colors.textMuted} autoCapitalize="none" keyboardType="email-address" style={inputStyle} />
          </View>

          <View style={{ gap: 5 }}>
            <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textSecondary }}>Mật khẩu</Text>
            <TextInput value={password} onChangeText={setPassword} placeholder="Tối thiểu 6 ký tự" placeholderTextColor={colors.textMuted} secureTextEntry style={inputStyle} />
          </View>

          {authTab === 'register' ? (
            <View style={{ gap: 5 }}>
              <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textSecondary }}>Xác nhận mật khẩu</Text>
              <TextInput value={confirmPw} onChangeText={setConfirmPw} placeholder="Nhập lại mật khẩu" placeholderTextColor={colors.textMuted} secureTextEntry style={inputStyle} />
            </View>
          ) : null}

          {localMsg || authError ? (
            <View style={{ padding: 10, borderRadius: 10, backgroundColor: colors.accentRoseBg, borderWidth: 1, borderColor: colors.accentRoseBorder }}>
              <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansMedium, color: colors.accentRose }}>
                {localMsg || authError}
              </Text>
            </View>
          ) : null}

          <ActionButton
            label={authBusy ? 'Đang xử lý...' : authTab === 'login' ? 'Đăng nhập StarWatch' : 'Tạo tài khoản mới'}
            variant="primary"
            fullWidth
            onPress={handleSubmitAuth}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ height: 1, flex: 1, backgroundColor: colors.borderSubtle }} />
            <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textMuted }}>hoặc</Text>
            <View style={{ height: 1, flex: 1, backgroundColor: colors.borderSubtle }} />
          </View>

          <GoogleSignInWidget
            mode={authTab}
            busy={authBusy}
            onCredential={loginWithGoogleCredential}
            onFallbackPopup={loginWithGoogle}
            onClearErrors={() => { setLocalMsg(null); clearAuthError(); }}
          />
        </View>
      ) : (
        <View style={{ gap: 14 }}>
          <View style={{ padding: 14, borderRadius: 14, backgroundColor: colors.cardInner, borderWidth: 1, borderColor: colors.borderSubtle, gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>Chỉnh sửa thông tin</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {isAdmin ? <TierBadge variant="admin" size="sm" /> : null}
                <TierBadge variant={effectivePlan} size="sm" />
              </View>
            </View>

            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textSecondary }}>Tên hiển thị</Text>
              <TextInput value={editName} onChangeText={setEditName} placeholder="Tên hiển thị" placeholderTextColor={colors.textMuted} style={inputStyle} />
            </View>

            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textSecondary }}>Giới thiệu & Ghi chú thiết bị</Text>
              <TextInput value={editBio} onChangeText={setEditBio} placeholder="VD: Săn Ngân Hà miền núi" placeholderTextColor={colors.textMuted} style={inputStyle} />
            </View>

            <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.monoRegular, color: colors.textMuted }}>
              Email đồng bộ: {user.email}
            </Text>

            <ActionButton
              label={savedFlag ? 'Đã lưu thông tin' : authBusy ? 'Đang lưu...' : 'Lưu thông tin cá nhân'}
              leftIcon={savedFlag ? <AppIcon name="check" size={14} color={colors.buttonPrimaryText} /> : undefined}
              variant="primary"
              fullWidth
              onPress={handleSaveProfile}
            />
          </View>

          <AccountPlansSection
            plan={user.plan}
            effectivePlan={effectivePlan}
            isAdmin={isAdmin}
            entitlementSource={user.entitlementSource}
            userEmail={user.email}
            authBusy={authBusy}
            onSelectPlan={changePlan}
          />

          <ActionButton label="Đăng xuất tài khoản" variant="ghost" fullWidth onPress={logout} />
        </View>
      )}
    </ModalShell>
  );
}
