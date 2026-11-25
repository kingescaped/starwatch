import React, { useState } from 'react';
import { Linking, Platform, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { SegmentedControl } from '../../design-system/primitives/SegmentedControl';
import { ActionButton } from '../../design-system/primitives/ActionButton';
import { AppIcon } from '../../design-system/icons/AppIcon';

type LegalTab = 'terms' | 'privacy' | 'report';

const LEGAL_TABS: { value: LegalTab; label: string }[] = [
  { value: 'terms', label: 'Điều khoản' },
  { value: 'privacy', label: 'Chính sách' },
  { value: 'report', label: 'Báo lỗi' },
];

const TERMS_POINTS = [
  '1. Dữ liệu dự báo mây, điểm sương, độ sáng Bortle và lịch sao băng chỉ mang tính tham khảo thực địa.',
  '2. Người dùng tự đánh giá an toàn đường đèo, thời tiết cực đoan và khu vực cắm trại trước khi di chuyển.',
  '3. Điểm săn ảnh cộng đồng cần có tọa độ trung thực và ghi chú đường tiếp cận rõ ràng.',
];

const PRIVACY_POINTS = [
  '1. Tài khoản Email/Google và điểm đóng góp được đồng bộ bảo mật qua Firebase Auth & Cloud Firestore.',
  '2. Giao diện, thiết bị và lịch sử điểm gần nhất được lưu cục bộ trên trình duyệt (localStorage).',
  '3. Tọa độ GPS chỉ được đọc khi bạn chủ động bấm nút định vị và dùng để tính toán bầu trời tại chỗ.',
];

function openExternalLink(url: string): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  void Linking.openURL(url);
}

export function AboutLegalSection() {
  const { colors } = useTheme();
  const [tab, setTab] = useState<LegalTab>('terms');

  const telegramBugUrl =
    'https://t.me/kingescaped?text=' +
    encodeURIComponent('Chào Quang Vo, mình muốn báo lỗi / góp ý cho ứng dụng StarWatch:');

  const renderLines = (items: string[]) => (
    <View style={{ gap: 6 }}>
      {items.map((line) => (
        <Text
          key={line}
          style={{ fontSize: 12, lineHeight: 18, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}
        >
          {line}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textMuted, letterSpacing: 0.7 }}>
        PHÁP LÝ & HỖ TRỢ
      </Text>

      <SegmentedControl<LegalTab>
        value={tab}
        onChange={setTab}
        compact
        tone="cyan"
        options={LEGAL_TABS}
      />

      <View
        style={{
          padding: 14,
          borderRadius: 14,
          backgroundColor: colors.cardInner,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          gap: 10,
        }}
      >
        {tab === 'terms' ? (
          <>
            <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
              Điều khoản sử dụng StarWatch
            </Text>
            {renderLines(TERMS_POINTS)}
          </>
        ) : null}

        {tab === 'privacy' ? (
          <>
            <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
              Chính sách bảo mật dữ liệu
            </Text>
            {renderLines(PRIVACY_POINTS)}
          </>
        ) : null}

        {tab === 'report' ? (
          <>
            <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
              Báo lỗi & Góp ý trực tiếp
            </Text>
            <Text style={{ fontSize: 12, lineHeight: 18, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
              Khi gặp lỗi hiển thị, sai tọa độ hoặc cần hỗ trợ tài khoản, hãy gửi ảnh chụp màn hình qua Telegram để được xử lý nhanh nhất.
            </Text>
            <ActionButton
              label="Nhắn báo lỗi qua Telegram (@kingescaped)"
              variant="primary"
              fullWidth
              leftIcon={<AppIcon name="send" size={14} color={colors.buttonPrimaryText} />}
              onPress={() => openExternalLink(telegramBugUrl)}
            />
            <ActionButton
              label="Gửi Email hỗ trợ (kingescaped.dev@gmail.com)"
              variant="ghost"
              compact
              fullWidth
              leftIcon={<AppIcon name="mail" size={13} color={colors.textSecondary} />}
              onPress={() => openExternalLink('mailto:kingescaped.dev@gmail.com?subject=Bao%20loi%20StarWatch')}
            />
          </>
        ) : null}
      </View>
    </View>
  );
}
