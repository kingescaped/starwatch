import React, { useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon, IconName } from '../../design-system/icons/AppIcon';
import { TierBadge } from '../../design-system/primitives/TierBadge';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { getTierBadgePalette, TierBadgePalette } from '../../design-system/tokens/colors';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import type { PlanTier } from '../../state/types';

export interface AccountPlansSectionProps {
  plan: PlanTier;
  effectivePlan: PlanTier;
  isAdmin: boolean;
  entitlementSource?: string;
  userEmail?: string;
  authBusy: boolean;
  onSelectPlan: (tier: PlanTier) => void;
}

export function buildTelegramPurchaseUrl(tierTitle: string, fullPrice: string, userEmail?: string): string {
  const emailPart = userEmail ? ` (tài khoản: ${userEmail})` : '';
  const msg = `Chào Quang Vo, mình muốn mua gói ${tierTitle} (${fullPrice}) cho ứng dụng StarWatch${emailPart}.`;
  return `https://t.me/kingescaped?text=${encodeURIComponent(msg)}`;
}

function openTelegramPurchase(url: string): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  void Linking.openURL(url);
}

interface PlanSpec {
  id: PlanTier;
  rank: number;
  title: string;
  fullPrice: string;
  priceMain: string;
  priceUnit?: string;
  tag?: string;
  heroDesc: string;
  features: [string, string, string];
}

const PLAN_SPECS: PlanSpec[] = [
  {
    id: 'free', rank: 0, title: 'Cơ Bản (FREE)', fullPrice: 'Miễn phí', priceMain: 'Miễn phí',
    heroDesc: 'Đầy đủ bản đồ GIS ô nhiễm sáng, lịch thiên văn & vòm trời 3D chuẩn.',
    features: ['Bản đồ GIS ô nhiễm sáng & lịch thiên văn', 'Vòm trời 3D chuẩn · 3 kế hoạch chụp/ngày', '1 hồ sơ máy ảnh & 2 bản đồ offline'],
  },
  {
    id: 'pro', rank: 1, title: 'StarWatch PRO', fullPrice: '79.000đ / tháng', priceMain: '79.000đ', priceUnit: '/tháng', tag: 'PHỔ BIẾN',
    heroDesc: 'Ưu tiên đồng bộ đám mây, cảnh báo trời quang & quản lý nhiều hồ sơ lens.',
    features: ['Đồng bộ đám mây · Không giới hạn kế hoạch chụp', 'Cảnh báo trời quang, sương đêm & 5 hồ sơ lens', 'Lịch trình tới 10 điểm & 10 bản đồ offline'],
  },
  {
    id: 'expedition', rank: 2, title: 'Expedition MAX', fullPrice: '149.000đ / tháng', priceMain: '149.000đ', priceUnit: '/tháng', tag: 'CAO CẤP NHẤT',
    heroDesc: 'Mở khóa bản đồ offline vô hạn, đồng bộ nhóm săn ảnh & lịch trình dài ngày.',
    features: ['Toàn bộ quyền PRO & bản đồ offline vô hạn', 'Đồng bộ nhóm săn ảnh & lịch trình dài ngày', 'Hồ sơ thiết bị vô hạn & dữ liệu thời tiết ưu tiên'],
  },
];

const ADMIN_PILLS: { icon: IconName; label: string }[] = [
  { icon: 'sparkles', label: 'Không giới hạn kế hoạch' },
  { icon: 'map', label: 'Bản đồ offline ∞' },
  { icon: 'shield-check', label: 'Quyền quản trị' },
];

function getExpeditionGlow(palette: TierBadgePalette): ViewStyle | undefined {
  return Platform.select<ViewStyle>({
    web: { boxShadow: palette.webGlow } as ViewStyle,
    default: { shadowColor: palette.glowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
  });
}

function AdminCapabilityPills({ palette }: { palette: TierBadgePalette }) {
  return (
    <View style={styles.badgeWrapRow}>
      {ADMIN_PILLS.map((pill) => (
        <View key={pill.label} style={[styles.adminPill, { backgroundColor: palette.bgGradient[1], borderColor: palette.surfaceBorder }]}>
          <AppIcon name={pill.icon} size={11} color={palette.iconPrimary} />
          <Text numberOfLines={1} style={[styles.adminPillText, { color: palette.text }]}>{pill.label}</Text>
        </View>
      ))}
    </View>
  );
}

function ActivePlanHeroCard({ activeTier, isAdmin, expanded, onToggle }: { activeTier: PlanTier; isAdmin: boolean; expanded: boolean; onToggle: () => void }) {
  const { mode } = useTheme();
  const palette = getTierBadgePalette(isAdmin ? 'admin' : activeTier, mode);
  const spec = PLAN_SPECS.find((p) => p.id === activeTier) ?? PLAN_SPECS[0];
  const toggleLabel = expanded ? 'Thu gọn' : isAdmin ? 'Xem các gói' : 'Đổi gói';

  return (
    <LinearGradient colors={palette.surfaceGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, { borderWidth: 1.5, borderColor: palette.surfaceBorder }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={[styles.heroTitle, { color: palette.text }]}>{isAdmin ? 'Toàn Quyền Quản Trị' : spec.title}</Text>
            {isAdmin ? <TierBadge variant="admin" size="sm" /> : null}
            <TierBadge variant={activeTier} size="sm" />
          </View>
          <Text style={[styles.heroPrice, { color: palette.subText }]}>{isAdmin ? 'Trọn đời · Mở khóa 100%' : spec.fullPrice}</Text>
        </View>
        <Pressable onPress={onToggle} style={({ pressed }) => [styles.toggleBtn, { backgroundColor: palette.bgGradient[1], borderColor: palette.surfaceBorder, opacity: pressed ? 0.82 : 1 }]}>
          <Text numberOfLines={1} style={[styles.toggleText, { color: palette.text }]}>{toggleLabel}</Text>
          <AppIcon name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={palette.text} />
        </Pressable>
      </View>
      <Text style={[styles.descText, { color: palette.subText }]}>
        {isAdmin ? 'Tài khoản quản trị sở hữu toàn bộ đặc quyền Expedition MAX, đồng bộ không giới hạn và công cụ vận hành hệ thống.' : spec.heroDesc}
      </Text>
      {isAdmin ? <AdminCapabilityPills palette={palette} /> : null}
    </LinearGradient>
  );
}

function TierCardFooter({ tier, plan, currentRank, isAdmin, userEmail, authBusy, palette, onSelectPlan }: {
  tier: PlanSpec; plan: PlanTier; currentRank: number; isAdmin: boolean; userEmail?: string; authBusy: boolean; palette: TierBadgePalette; onSelectPlan: (tier: PlanTier) => void;
}) {
  const { colors } = useTheme();
  const isCurrent = tier.id === plan || (isAdmin && tier.id === 'expedition');
  if (isCurrent) {
    const label = isAdmin && tier.id === 'expedition' && plan !== 'expedition' ? 'Mở khóa sẵn qua quyền Admin' : 'Đang sử dụng gói này';
    return (
      <View style={[styles.ctaBase, { backgroundColor: colors.accentEmeraldBg, borderColor: colors.accentEmeraldBorder }]}>
        <AppIcon name="check" size={14} color={colors.accentEmerald} strokeWidth={2.2} />
        <Text style={[styles.ctaTextBold, { color: colors.accentEmerald }]}>{label}</Text>
      </View>
    );
  }
  const isUpgrade = tier.rank > currentRank;
  const routeToTelegram = !isAdmin && isUpgrade;
  const label = routeToTelegram
    ? tier.id === 'pro' ? 'Mua StarWatch PRO qua Telegram' : 'Mua Expedition MAX qua Telegram'
    : isUpgrade
    ? tier.id === 'pro' ? 'Nâng cấp lên StarWatch PRO' : 'Nâng cấp lên Expedition MAX'
    : tier.id === 'free' ? 'Chuyển về Cơ Bản' : 'Chuyển về StarWatch PRO';

  return (
    <Pressable
      disabled={!routeToTelegram && authBusy}
      onPress={() => {
        if (routeToTelegram) {
          openTelegramPurchase(buildTelegramPurchaseUrl(tier.title, tier.fullPrice, userEmail));
          return;
        }
        onSelectPlan(tier.id);
      }}
      style={({ pressed }) => [styles.ctaBase, {
        backgroundColor: isUpgrade ? colors.buttonPrimaryBg : 'transparent',
        borderColor: isUpgrade ? colors.buttonPrimaryBg : palette.surfaceBorder,
        opacity: (!routeToTelegram && authBusy) ? 0.45 : pressed ? 0.84 : 1,
      }]}
    >
      {routeToTelegram ? <AppIcon name="send" size={13} color={colors.buttonPrimaryText} /> : null}
      <Text style={[isUpgrade ? styles.ctaTextBold : styles.ctaTextGhost, { color: isUpgrade ? colors.buttonPrimaryText : palette.text }]}>{label}</Text>
    </Pressable>
  );
}

function TierComparisonCard({ tier, plan, currentRank, isAdmin, userEmail, authBusy, onSelectPlan }: {
  tier: PlanSpec; plan: PlanTier; currentRank: number; isAdmin: boolean; userEmail?: string; authBusy: boolean; onSelectPlan: (tier: PlanTier) => void;
}) {
  const { mode } = useTheme();
  const palette = getTierBadgePalette(tier.id, mode);
  const isExpedition = tier.id === 'expedition';

  return (
    <LinearGradient colors={palette.surfaceGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, isExpedition ? getExpeditionGlow(palette) : undefined, { borderWidth: isExpedition ? 1.5 : 1, borderColor: palette.surfaceBorder }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={[styles.tierTitle, { color: palette.text }]}>{tier.title}</Text>
          <View style={styles.badgeWrapRow}>
            <TierBadge variant={tier.id} size="sm" />
            {tier.tag ? (
              <View style={[styles.tagPill, { backgroundColor: palette.bgGradient[1], borderColor: palette.surfaceBorder }]}>
                <Text style={[styles.tagText, { color: palette.subText }]}>{tier.tag}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.priceBox}>
          <Text style={[styles.priceMain, { color: palette.text }]}>{tier.priceMain}</Text>
          {tier.priceUnit ? <Text style={[styles.priceUnit, { color: palette.subText }]}>{tier.priceUnit}</Text> : null}
        </View>
      </View>
      <View style={styles.featureList}>
        {tier.features.map((feat) => (
          <View key={feat} style={styles.featureRow}>
            <View style={styles.checkWrap}><AppIcon name="check" size={13} color={palette.iconPrimary} strokeWidth={2.2} /></View>
            <Text style={[styles.featureText, { color: palette.subText }]}>{feat}</Text>
          </View>
        ))}
      </View>
      <TierCardFooter tier={tier} plan={plan} currentRank={currentRank} isAdmin={isAdmin} userEmail={userEmail} authBusy={authBusy} palette={palette} onSelectPlan={onSelectPlan} />
    </LinearGradient>
  );
}

export function AccountPlansSection({ plan, effectivePlan, isAdmin, entitlementSource: _entitlementSource, userEmail, authBusy, onSelectPlan }: AccountPlansSectionProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const currentRank = PLAN_SPECS.find((p) => p.id === plan)?.rank ?? 0;

  return (
    <View style={styles.root}>
      <ActivePlanHeroCard activeTier={effectivePlan} isAdmin={isAdmin} expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
      {expanded ? (
        <View style={styles.listWrap}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Chọn gói dịch vụ</Text>
            <Text style={[styles.sectionCaption, { color: colors.textMuted }]}>{isAdmin ? 'Admin đã mở khóa toàn quyền' : 'Mua qua Telegram @kingescaped'}</Text>
          </View>
          {PLAN_SPECS.map((tier) => (
            <TierComparisonCard key={tier.id} tier={tier} plan={plan} currentRank={currentRank} isAdmin={isAdmin} userEmail={userEmail} authBusy={authBusy} onSelectPlan={onSelectPlan} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 }, listWrap: { gap: 10 }, checkWrap: { marginTop: 2 }, featureList: { gap: 6 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 2 },
  sectionTitle: { fontSize: 13, fontFamily: FONT_FAMILIES.sansBold }, sectionCaption: { fontSize: 11, fontFamily: FONT_FAMILIES.sansMedium },
  card: { borderRadius: 16, padding: 14, gap: 10 }, headerLeft: { flex: 1, minWidth: 0, gap: 6 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  heroTitle: { fontSize: 16, lineHeight: 22, fontFamily: FONT_FAMILIES.sansBold },
  heroPrice: { fontSize: 12, fontFamily: FONT_FAMILIES.monoMedium, fontVariant: ['tabular-nums'] },
  toggleBtn: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  toggleText: { fontSize: 12, fontFamily: FONT_FAMILIES.sansSemiBold }, descText: { fontSize: 12, lineHeight: 18, fontFamily: FONT_FAMILIES.sansRegular },
  badgeWrapRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  adminPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  adminPillText: { fontSize: 11, fontFamily: FONT_FAMILIES.sansMedium }, tierTitle: { fontSize: 14.5, lineHeight: 20, fontFamily: FONT_FAMILIES.sansBold },
  tagPill: { paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 999, borderWidth: 1 },
  tagText: { fontSize: 10, fontFamily: FONT_FAMILIES.sansBold, letterSpacing: 0.4 }, priceBox: { alignItems: 'flex-end', flexShrink: 0 },
  priceMain: { fontSize: 15, fontFamily: FONT_FAMILIES.monoBold, fontVariant: ['tabular-nums'] }, priceUnit: { fontSize: 10.5, fontFamily: FONT_FAMILIES.sansRegular },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, featureText: { flex: 1, fontSize: 12, lineHeight: 17, fontFamily: FONT_FAMILIES.sansRegular },
  ctaBase: { minHeight: 38, borderRadius: 11, paddingHorizontal: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  ctaTextBold: { fontSize: 12.5, fontFamily: FONT_FAMILIES.sansBold }, ctaTextGhost: { fontSize: 12.5, fontFamily: FONT_FAMILIES.sansMedium },
});
