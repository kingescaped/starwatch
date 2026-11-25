import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { MODAL_WIDTHS } from '../../design-system/tokens/spacing';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { ActionButton } from '../../design-system/primitives/ActionButton';
import { CALENDAR_WEEKDAYS, MONTH_HIGHLIGHTS } from '../../data/calendar';
import { useAppState } from '../../state/AppStateContext';
import type { CalendarDay } from '../../state/types';
import { ModalShell } from './ModalShell';

interface CalendarOverlayProps {
  isMobileView?: boolean;
}

export function CalendarOverlay({ isMobileView = false }: CalendarOverlayProps) {
  const { colors } = useTheme();
  const {
    calendarYear,
    calendarMonth,
    setCalendarMonthYear,
    stepCalendarMonth,
    calendarDays,
    selectedCalendarDay,
    setSelectedCalendarDay,
    applyCalendarDay,
    closeOverlay,
    setMobileTab,
  } = useAppState();
  const [showMonthGrid, setShowMonthGrid] = useState(false);

  const activeDay =
    calendarDays.find((d) => d.day === selectedCalendarDay) ??
    calendarDays[Math.min(17, calendarDays.length - 1)] ??
    calendarDays[0];

  const weekRows = useMemo(() => {
    const firstUtcDay = new Date(Date.UTC(calendarYear, calendarMonth - 1, 1)).getUTCDay();
    const leading = (firstUtcDay + 6) % 7;
    const cells: Array<CalendarDay | null> = [...Array<null>(leading).fill(null), ...calendarDays];
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: Array<Array<CalendarDay | null>> = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [calendarYear, calendarMonth, calendarDays]);

  const handleApply = () => {
    if (activeDay) applyCalendarDay(activeDay.day);
    if (isMobileView) setMobileTab('observe');
    else closeOverlay();
  };

  return (
    <ModalShell
      title={isMobileView ? 'Lịch Thiên Văn' : `Lịch Thiên Văn Tháng ${calendarMonth} / ${calendarYear}`}
      subtitle={
        isMobileView
          ? 'Chọn tháng và ngày để đồng bộ dự báo bầu trời'
          : 'Pha Trăng, thanh hiển thị Ngân Hà & cực đại mưa sao băng theo tháng'
      }
      width={MODAL_WIDTHS.calendar}
      onClose={closeOverlay}
      isMobileView={isMobileView}
    >
      <View style={{ flexDirection: isMobileView ? 'column' : 'row', gap: 16 }}>
        <View style={{ flex: isMobileView ? undefined : 1.3, gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary, flexShrink: 1 }}>
              Tháng {calendarMonth} / {calendarYear} · {MONTH_HIGHLIGHTS[calendarMonth] ?? ''}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 999,
                backgroundColor: colors.cardInner,
                borderWidth: 1,
                borderColor: showMonthGrid ? colors.accentCyanBorder : colors.borderSubtle,
                overflow: 'hidden',
              }}
            >
              <Pressable accessibilityLabel="Tháng trước" onPress={() => stepCalendarMonth(-1)} style={{ paddingHorizontal: 9, paddingVertical: 5 }}>
                <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.monoBold, color: colors.textPrimary }}>‹</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Chọn nhanh tháng"
                onPress={() => setShowMonthGrid((v) => !v)}
                style={{ paddingHorizontal: 6, paddingVertical: 5 }}
              >
                <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.monoBold, color: colors.accentCyan }}>
                  T{calendarMonth}/{calendarYear} ▾
                </Text>
              </Pressable>
              <Pressable accessibilityLabel="Tháng sau" onPress={() => stepCalendarMonth(1)} style={{ paddingHorizontal: 9, paddingVertical: 5 }}>
                <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.monoBold, color: colors.textPrimary }}>›</Text>
              </Pressable>
            </View>
          </View>

          {showMonthGrid ? (
            <View style={{ padding: 10, borderRadius: 12, backgroundColor: colors.cardInner, borderWidth: 1, borderColor: colors.borderStrong, gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textSecondary }}>
                  Chọn nhanh Tháng & Năm
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Pressable accessibilityLabel="Năm trước" onPress={() => setCalendarMonthYear(calendarYear - 1, calendarMonth)} style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: colors.borderSubtle }}>
                    <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.monoBold, color: colors.textPrimary }}>‹</Text>
                  </Pressable>
                  <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.monoBold, color: colors.accentCyan }}>{calendarYear}</Text>
                  <Pressable accessibilityLabel="Năm sau" onPress={() => setCalendarMonthYear(calendarYear + 1, calendarMonth)} style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: colors.borderSubtle }}>
                    <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.monoBold, color: colors.textPrimary }}>›</Text>
                  </Pressable>
                </View>
              </View>
              <View style={{ gap: 6 }}>
                {[0, 1, 2].map((rIdx) => (
                  <View key={rIdx} style={{ flexDirection: 'row', gap: 6 }}>
                    {[1, 2, 3, 4].map((cIdx) => {
                      const m = rIdx * 4 + cIdx;
                      const active = m === calendarMonth;
                      return (
                        <Pressable
                          key={m}
                          onPress={() => { setCalendarMonthYear(calendarYear, m); setShowMonthGrid(false); }}
                          style={{
                            flex: 1,
                            paddingVertical: 7,
                            borderRadius: 8,
                            alignItems: 'center',
                            backgroundColor: active ? colors.accentCyanBg : colors.card,
                            borderWidth: 1,
                            borderColor: active ? colors.accentCyan : colors.borderSubtle,
                          }}
                        >
                          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.monoBold, color: active ? colors.accentCyan : colors.textPrimary }}>
                            Tháng {m}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 5 }}>
            {CALENDAR_WEEKDAYS.map((wd) => (
              <Text key={wd} style={{ flex: 1, textAlign: 'center', fontSize: 11, fontFamily: FONT_FAMILIES.monoMedium, color: colors.textMuted }}>
                {wd}
              </Text>
            ))}
          </View>

          <View style={{ gap: 6 }}>
            {weekRows.map((row, weekIdx) => (
              <View key={weekIdx} style={{ flexDirection: 'row', gap: 5 }}>
                {row.map((item, cellIdx) => {
                  if (!item) return <View key={`empty-${weekIdx}-${cellIdx}`} style={{ flex: 1 }} />;
                  const selected = item.day === activeDay?.day;
                  const barColor = item.milkyWayScore >= 85 ? colors.accentCyan : item.milkyWayScore >= 65 ? colors.accentViolet : colors.textMuted;
                  return (
                    <Pressable
                      key={item.day}
                      onPress={() => setSelectedCalendarDay(item.day)}
                      style={{
                        flex: 1,
                        padding: isMobileView ? 5 : 7,
                        borderRadius: 10,
                        backgroundColor: selected ? colors.accentCyanBg : colors.cardInner,
                        borderWidth: 1,
                        borderColor: selected ? colors.accentCyan : colors.borderSubtle,
                        gap: 5,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.monoBold, color: selected ? colors.accentCyan : colors.textPrimary }}>
                          {item.day}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 2 }}>
                          {item.isMeteorPeak ? <View style={{ width: 4, height: 4, borderRadius: 999, backgroundColor: colors.accentAmber }} /> : null}
                          <View style={{ width: 4, height: 4, borderRadius: 999, backgroundColor: item.moonPercent <= 25 ? colors.accentViolet : colors.textSecondary }} />
                        </View>
                      </View>
                      <View style={{ height: 3, borderRadius: 999, backgroundColor: colors.ringTrack, overflow: 'hidden' }}>
                        <View style={{ width: `${item.milkyWayScore}%`, height: '100%', backgroundColor: barColor }} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {activeDay ? (
          <View
            style={{
              flex: isMobileView ? undefined : 1,
              padding: 16,
              borderRadius: 16,
              backgroundColor: colors.cardInner,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
              justifyContent: 'space-between',
              gap: 14,
            }}
          >
            <View style={{ gap: 12 }}>
              <View style={{ alignSelf: 'flex-start' }}>
                <StatusPill label={activeDay.eventTitle ?? 'DỰ BÁO ĐÊM QUAN SÁT'} tone={activeDay.isMeteorPeak ? 'amber' : 'cyan'} small mono />
              </View>
              <Text style={{ fontSize: 18, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
                {activeDay.weekday}, {activeDay.dateLabel}
              </Text>
              <View style={{ gap: 8 }}>
                <CalendarStatRow label="Cực đại / Điểm" value={activeDay.zhr ?? `${activeDay.milkyWayScore}/100 điểm`} valueColor={colors.accentAmber} />
                <CalendarStatRow label="Tâm điểm (Radiant)" value={activeDay.radiant ?? 'Tâm Ngân Hà · 148° SE'} valueColor={colors.accentCyan} />
                <CalendarStatRow label="Nhiễu ánh trăng" value={activeDay.moonDetail ?? `${activeDay.moonPercent}% pha Trăng`} valueColor={colors.accentViolet} />
                <CalendarStatRow label="Cửa sổ Ngân Hà" value={activeDay.milkyWayWindow ?? '20:30 - 03:00'} valueColor={colors.accentEmerald} />
              </View>
            </View>
            <ActionButton label="Áp dụng ngày này vào Dự báo" variant="primary" fullWidth onPress={handleApply} />
          </View>
        ) : null}
      </View>
    </ModalShell>
  );
}

function CalendarStatRow({ label, value, valueColor }: { label: string; value: string; valueColor: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, gap: 8 }}>
      <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.monoBold, color: valueColor }}>{value}</Text>
    </View>
  );
}
