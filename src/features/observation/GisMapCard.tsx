import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { SurfaceCard } from '../../design-system/primitives/SurfaceCard';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { SegmentedControl } from '../../design-system/primitives/SegmentedControl';
import { useAppState } from '../../state/AppStateContext';
import { BasemapId } from '../../state/types';
import { useResponsive } from '../../hooks/useResponsive';
import { GisMapCanvas } from './GisMapCanvas';
import { getBortleMarkerColor } from './gisMapTileConfig';

const BASEMAPS: { id: BasemapId; label: string; source: string }[] = [
  { id: 'satellite', label: 'Vệ Tinh', source: 'Esri World Imagery + Nhãn địa danh' },
  { id: 'astroDark', label: 'Astro Dark', source: 'Carto Dark Matter · Chuẩn thiên văn' },
  { id: 'esriDark', label: 'Esri Dark', source: 'World Dark Gray Canvas' },
  { id: 'topo', label: 'Topo Độ Cao', source: 'OpenTopoMap · Đường đồng mức' },
];

const BORTLE_LEGEND = [
  { range: '1-2 Rất tối', color: getBortleMarkerColor(2) },
  { range: '3-4 Tối', color: getBortleMarkerColor(3.5) },
  { range: '5 Trung bình', color: getBortleMarkerColor(5) },
  { range: '6-7 Sáng', color: getBortleMarkerColor(6.5) },
  { range: '8-9 Nội đô', color: getBortleMarkerColor(8.5) },
];

export function GisMapCard() {
  const { mode, colors } = useTheme();
  const { isMobile } = useResponsive();
  const {
    basemap,
    setBasemap,
    showLightPollution,
    toggleLightPollution,
    showCloudLayer,
    toggleCloudLayer,
    showAzimuthRays,
    toggleAzimuthRays,
    selectedSpot,
    inspectMapPoint,
    openMobileSubScreen,
  } = useAppState();

  const activeSource =
    mode === 'red'
      ? 'Esri World Imagery · Thị giác Đỏ'
      : BASEMAPS.find((b) => b.id === basemap)?.source ?? '';

  return (
    <SurfaceCard radius={20} style={{ padding: isMobile ? 14 : 18, gap: 12, flex: isMobile ? undefined : 1 }}>
      <View
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: isMobile ? 'nowrap' : 'wrap',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <View style={{ flex: isMobile ? undefined : 1, minWidth: isMobile ? undefined : 210, gap: 2 }}>
          <Text style={{ fontSize: 16, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
            Bản Đồ GIS · Việt Nam
          </Text>
          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
            {isMobile
              ? 'Vệ Tinh · Astro Dark · Esri Dark · Topo Độ Cao'
              : 'Ô nhiễm sáng Bortle, mây mô phỏng & tia phương vị (4 nền bản đồ)'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, flexShrink: 0 }}>
          <StatusPill
            label={isMobile ? 'Ô nhiễm' : 'Ô nhiễm sáng'}
            tone={showLightPollution ? 'violet' : 'neutral'}
            dot
            small
            onPress={toggleLightPollution}
          />
          <StatusPill
            label={isMobile ? 'Mây' : 'Mây mô phỏng'}
            tone={showCloudLayer ? 'cyan' : 'neutral'}
            dot
            small
            onPress={toggleCloudLayer}
          />
          <StatusPill
            label={isMobile ? 'Phương vị' : 'Tia phương vị'}
            tone={showAzimuthRays ? 'amber' : 'neutral'}
            dot
            small
            onPress={toggleAzimuthRays}
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <SegmentedControl<BasemapId>
          fullWidth={isMobile}
          compact
          tone="violet"
          value={basemap}
          onChange={setBasemap}
          options={BASEMAPS.map((item) => ({ value: item.id, label: item.label }))}
        />

        {!isMobile ? (
          <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoRegular, color: colors.textMuted }}>
            {activeSource}
          </Text>
        ) : null}
      </View>

      <GisMapCanvas fill={!isMobile} height={260} compact={isMobile} />

      {isMobile ? (
        <Pressable
          onPress={() => {
            inspectMapPoint({ lat: selectedSpot.lat, lng: selectedSpot.lng });
            openMobileSubScreen('inspectCoords');
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 12,
            paddingVertical: 9,
            borderRadius: 12,
            backgroundColor: colors.cardInner,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
          }}
        >
          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.monoMedium, color: colors.textSecondary }}>
            Bortle {selectedSpot.bortle} · {selectedSpot.lat.toFixed(4)}°N, {selectedSpot.lng.toFixed(4)}°E
          </Text>
          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.accentCyan }}>
            Soi tọa độ →
          </Text>
        </Pressable>
      ) : (
        <View
          style={{
            borderRadius: 12,
            backgroundColor: colors.cardInner,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            paddingHorizontal: 12,
            paddingVertical: 10,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textSecondary }}>
              Bortle 1–9:
            </Text>
            {BORTLE_LEGEND.map((item) => (
              <View
                key={item.range}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.borderSubtle,
                  backgroundColor: colors.pillBg,
                }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: item.color }} />
                <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansMedium, color: item.color }}>
                  {item.range}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textMuted }}>
              ⊙ Nhấp vào bất kỳ điểm nào trên bản đồ để soi tọa độ & ước tính Bortle
            </Text>
            <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.monoMedium, color: colors.accentCyan }}>
              {selectedSpot.lat.toFixed(4)}°N · {selectedSpot.lng.toFixed(4)}°E
            </Text>
          </View>
        </View>
      )}
    </SurfaceCard>
  );
}
