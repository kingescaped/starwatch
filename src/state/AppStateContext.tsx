import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { INITIAL_SPOTS } from '../data/spots';
import { CELESTIAL_TARGETS } from '../data/targets';
import { DAILY_ASTRO_EVENTS, GOLDEN_WINDOWS, HOURLY_FORECAST, TONIGHT_SLOTS } from '../data/forecast';
import { buildClientMonthFallback, NOV_2026_CALENDAR } from '../data/calendar';
import { computeAstroSetup, type AstroSetupSpec } from '../data/advisor';
import { DEFAULT_CAMERA_GEAR, previewCameraGearLocally, type CameraGearProfile } from '../data/cameraCatalog';
import { ToastType } from '../design-system/primitives/ToastBanner';
import { apiClient } from '../services/apiClient';
import type { GeocodedPlace } from '../services/locationClient';
import {
  buildFavoriteOverrides,
  isDynamicSpotId,
  mergeFetchedSpots,
  patchLocalPrefs,
  readLocalPrefs,
} from '../services/localPrefsStorage';
import { getEffectivePlan, hasUnlimitedAccess as checkUnlimitedAccess, isAdminUser } from '../utils/accessPolicy';
import { playUiSound, setSoundEnabled } from '../utils/soundEngine';
import { formatCurrentDateParts, resolveCurrentNightHourIndex } from '../utils/timeNowHelper';
import { useAuthStateController } from './useAuthStateController';
import { useLocationSearchController } from './useLocationSearchController';
import type {
  AppSettings,
  BasemapId,
  CalendarDay,
  CelestialTarget,
  DailyAstroEvent,
  DeviceType,
  FocalLength,
  GoldenWindowItem,
  GuideTab,
  HourlyForecast,
  LightDomeItem,
  MapCloudSystem,
  MobileSubScreen,
  MobileTab,
  OverlayId,
  PlanTier,
  ShootingMode,
  SkyDragTool,
  SkySceneData,
  SkyViewMode,
  Spot,
  SpotFilter,
  TonightSlot,
  UserAccount,
} from './types';

interface AppStateContextValue {
  spots: Spot[];
  selectedSpot: Spot;
  selectSpot: (spotId: string) => void;
  toggleFavoriteSpot: (spotId: string) => void;
  addSpot: (input: { name: string; lat: number; lng: number; elevation: number; tags: string[]; safetyNote: string }) => void;
  locatingGps: boolean;
  gpsError: string | null;
  clearGpsError: () => void;
  locateCurrentPosition: () => Promise<boolean>;
  selectGeocodedPlace: (place: GeocodedPlace) => Promise<void>;
  spotSearch: string;
  setSpotSearch: (q: string) => void;
  spotFilter: SpotFilter;
  setSpotFilter: (filter: SpotFilter) => void;
  targets: CelestialTarget[];
  selectedTarget: CelestialTarget;
  selectTarget: (targetId: string) => void;
  hourIndex: number;
  setHourIndex: (idx: number) => void;
  hourlyForecast: HourlyForecast[];
  currentForecast: HourlyForecast;
  dailyEvents: DailyAstroEvent[];
  goldenWindows: GoldenWindowItem[];
  tonightSlots: TonightSlot[];
  calendarDays: CalendarDay[];
  advisorSpec: AstroSetupSpec;
  skyScene: SkySceneData;
  lightDomes: LightDomeItem[];
  cloudSystems: MapCloudSystem[];
  observationSource: string;
  isPlayingTime: boolean;
  togglePlayTime: () => void;
  playbackSpeed: '10m' | '60m';
  setPlaybackSpeed: (speed: '10m' | '60m') => void;
  resetToCurrentTime: () => void;
  basemap: BasemapId;
  setBasemap: (bm: BasemapId) => void;
  showLightPollution: boolean;
  toggleLightPollution: () => void;
  showCloudLayer: boolean;
  toggleCloudLayer: () => void;
  showAzimuthRays: boolean;
  toggleAzimuthRays: () => void;
  mapZoom: number;
  zoomMap: (delta: number) => void;
  resetMap: () => void;
  inspectedCoords: { lat: number; lng: number; bortle: number; sqm: number; cloud: number; name: string };
  inspectMapPoint: (coords: { lat: number; lng: number }) => void;
  skyViewMode: SkyViewMode;
  setSkyViewMode: (mode: SkyViewMode) => void;
  skyZoom: number;
  zoomSky: (delta: number) => void;
  skyAutoRotate: boolean;
  toggleSkyAutoRotate: () => void;
  skyDragTool: SkyDragTool;
  setSkyDragTool: (tool: SkyDragTool) => void;
  skyRotationOffset: number;
  setSkyRotationOffset: React.Dispatch<React.SetStateAction<number>>;
  resetSkyView: () => void;
  shootingMode: ShootingMode;
  setShootingMode: (mode: ShootingMode) => void;
  deviceType: DeviceType;
  setDeviceType: (device: DeviceType) => void;
  focalLength: FocalLength;
  setFocalLength: (focal: FocalLength) => void;
  cameraGear: CameraGearProfile;
  saveCameraGear: (gear: CameraGearProfile) => Promise<void>;
  calendarYear: number;
  calendarMonth: number;
  setCalendarMonthYear: (year: number, month: number) => void;
  stepCalendarMonth: (delta: -1 | 1) => void;
  selectedCalendarDay: number;
  setSelectedCalendarDay: (day: number) => void;
  appliedDateLabel: string;
  applyCalendarDay: (day: number) => void;
  guideTab: GuideTab;
  setGuideTab: (tab: GuideTab) => void;
  activeOverlay: OverlayId;
  openOverlay: (id: OverlayId) => void;
  closeOverlay: () => void;
  mobileTab: MobileTab;
  setMobileTab: (tab: MobileTab) => void;
  mobileSubScreen: MobileSubScreen;
  openMobileSubScreen: (screen: MobileSubScreen) => void;
  closeMobileSubScreen: () => void;
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  user: UserAccount | null;
  isAdmin: boolean;
  effectivePlan: PlanTier;
  hasUnlimitedAccess: boolean;
  authBusy: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithGoogleCredential: (googleIdToken: string) => Promise<boolean>;
  register: (email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<UserAccount, 'displayName' | 'bio' | 'cameraProfile' | 'cameraSpecs'>>) => Promise<boolean>;
  changePlan: (plan: PlanTier) => Promise<boolean>;
  clearAuthError: () => void;
  toast: null;
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: () => void;
}

const DEFAULT_SKY_SCENE: SkySceneData = {
  latDeg: 21.2981, lstDeg: 285.4, sunAlt: -42.5, sunAz: 294, sunAzLabel: '294° WNW',
  moonAlt: 14.6, moonAz: 246, moonAzLabel: '246° WSW', moonIllum: 18, moonPhase: 'Lưỡi liềm đầu tháng',
  saturnAlt: 42.0, saturnAz: 215, targetAlt: 34.8, targetAz: 148, targetAzLabel: '148° SE',
  targetRaHours: 17.76, targetDecDeg: -29.01,
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [initialPrefs] = useState(() => readLocalPrefs());
  const [spots, setSpots] = useState<Spot[]>(() =>
    mergeFetchedSpots(INITIAL_SPOTS, initialPrefs.recentSpots ?? [], initialPrefs.favoriteOverrides ?? {})
  );
  const [selectedSpotId, setSelectedSpotId] = useState(() => initialPrefs.selectedSpotId || 'ta-xua');
  const [spotSearch, setSpotSearch] = useState('');
  const [spotFilter, setSpotFilter] = useState<SpotFilter>('all');
  const [selectedTargetId, setSelectedTargetId] = useState('sgr-a');
  const [hourIndex, setHourIndex] = useState(3);
  const [isPlayingTime, setIsPlayingTime] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'10m' | '60m'>('10m');
  const [basemap, setBasemap] = useState<BasemapId>(() => initialPrefs.basemap ?? 'satellite');
  const [showLightPollution, setShowLightPollution] = useState(true);
  const [showCloudLayer, setShowCloudLayer] = useState(true);
  const [showAzimuthRays, setShowAzimuthRays] = useState(true);
  const [mapZoom, setMapZoom] = useState(1.0);
  const [skyViewMode, setSkyViewMode] = useState<SkyViewMode>('ground3d');
  const [skyZoom, setSkyZoom] = useState(1.0);
  const [skyAutoRotate, setSkyAutoRotate] = useState(false);
  const [skyDragTool, setSkyDragTool] = useState<SkyDragTool>('rotate');
  const [skyRotationOffset, setSkyRotationOffset] = useState(0);
  const [shootingMode, setShootingMode] = useState<ShootingMode>('milkyWay');
  const [deviceType, setDeviceType] = useState<DeviceType>(() =>
    initialPrefs.cameraGear?.sensorType === 'phone' ? 'phone' : 'camera'
  );
  const [focalLength, setFocalLength] = useState<FocalLength>(() =>
    initialPrefs.cameraGear?.focalLengthMm ? `${Math.round(initialPrefs.cameraGear.focalLengthMm)}mm` : '14mm'
  );
  const [cameraGear, setCameraGear] = useState<CameraGearProfile>(() => ({
    ...DEFAULT_CAMERA_GEAR,
    ...(initialPrefs.cameraGear ?? {}),
  }));
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(11);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(18);
  const [appliedDateLabel, setAppliedDateLabel] = useState('18/11/2026');
  const [guideTab, setGuideTab] = useState<GuideTab>('formulas');
  const [activeOverlay, setActiveOverlay] = useState<OverlayId>(null);
  const [mobileTab, setMobileTabState] = useState<MobileTab>('observe');
  const [mobileSubScreen, setMobileSubScreen] = useState<MobileSubScreen>(null);

  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>(HOURLY_FORECAST);
  const [dailyEvents, setDailyEvents] = useState<DailyAstroEvent[]>(DAILY_ASTRO_EVENTS);
  const [goldenWindows, setGoldenWindows] = useState<GoldenWindowItem[]>(GOLDEN_WINDOWS);
  const [tonightSlots, setTonightSlots] = useState<TonightSlot[]>(TONIGHT_SLOTS);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>(NOV_2026_CALENDAR);
  const [skyScene, setSkyScene] = useState<SkySceneData>(DEFAULT_SKY_SCENE);
  const [lightDomes, setLightDomes] = useState<LightDomeItem[]>([]);
  const [cloudSystems, setCloudSystems] = useState<MapCloudSystem[]>([]);
  const [observationSource, setObservationSource] = useState('Open-Meteo + StarWatch Ephemeris');
  const [advisorSpec, setAdvisorSpec] = useState<AstroSetupSpec>(() => computeAstroSetup('milkyWay', 'camera', '14mm', 3.5));

  const [inspectedCoords, setInspectedCoords] = useState({
    lat: 21.2981, lng: 104.4652, bortle: 3.5, sqm: 21.48, cloud: 12, name: 'Đỉnh Tà Xùa · Sơn La',
  });

  const [settings, setSettings] = useState<AppSettings>(() => ({
    unitSystem: 'metric',
    defaultMapLayer: 'bortle',
    cameraProfile: 'Sony A7 IV · FE 14mm f/1.8 GM',
    cameraSpecs: 'Full-Frame · NPF 13.0s · Dual ISO 3200',
    dewThreshold: 2.5,
    offlineCacheEnabled: true,
    startupLocation: 'gps',
    compassReference: 'trueNorth',
    clearSkyAlertsEnabled: true,
    dailyAlertTime: '16:00',
    soundEnabled: true,
    ...(initialPrefs.settings ?? {}),
  }));

  const handleSyncUserProfile = useCallback((u: UserAccount) => {
    setSettings((prev) => ({
      ...prev,
      cameraProfile: u.cameraProfile || prev.cameraProfile,
      cameraSpecs: u.cameraSpecs || prev.cameraSpecs,
    }));
  }, []);

  const auth = useAuthStateController(handleSyncUserProfile);
  const locationCtrl = useLocationSearchController({ setSpots, setSelectedSpotId, setInspectedCoords });
  useEffect(() => { setSoundEnabled(settings.soundEnabled); }, [settings.soundEnabled]);
  useEffect(() => {
    patchLocalPrefs({
      selectedSpotId,
      basemap,
      settings,
      cameraGear,
      favoriteOverrides: buildFavoriteOverrides(spots),
      recentSpots: spots.filter((s) => isDynamicSpotId(s.id)),
    });
  }, [selectedSpotId, basemap, settings, cameraGear, spots]);

  const showToast = useCallback((_message: string, _type: ToastType = 'info') => {}, []);
  const dismissToast = useCallback(() => {}, []);

  const selectedSpot = useMemo(() => spots.find((s) => s.id === selectedSpotId) ?? spots[0], [spots, selectedSpotId]);
  const selectedTarget = useMemo(() => CELESTIAL_TARGETS.find((t) => t.id === selectedTargetId) ?? CELESTIAL_TARGETS[0], [selectedTargetId]);
  const currentForecast = hourlyForecast[hourIndex] ?? hourlyForecast[3] ?? HOURLY_FORECAST[3];
  const dateIso = useMemo(() => {
    const [d, m, y] = appliedDateLabel.split('/');
    return `${y || '2026'}-${(m || '11').padStart(2, '0')}-${(d || '18').padStart(2, '0')}`;
  }, [appliedDateLabel]);

  useEffect(() => {
    apiClient
      .fetchSpots()
      .then((res) => {
        if (!res.spots?.length) return;
        const latestPrefs = readLocalPrefs();
        setSpots((prev) => mergeFetchedSpots(res.spots, prev, latestPrefs.favoriteOverrides ?? {}));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    apiClient
      .fetchObservation({ spotId: selectedSpot.id, lat: selectedSpot.lat, lng: selectedSpot.lng, bortle: selectedSpot.bortle, elevation: selectedSpot.elevation, targetId: selectedTarget.id, date: dateIso, hourIndex })
      .then((res) => {
        if (!active) return;
        setHourlyForecast(res.forecast);
        setDailyEvents(res.dailyEvents);
        setGoldenWindows(res.goldenWindows);
        setTonightSlots(res.tonightSlots);
        setSkyScene(res.skyScene);
        setLightDomes(res.lightDomes);
        setCloudSystems(res.cloudSystems);
        setObservationSource(res.source);
        setSpots((prev) => prev.map((s) => (s.id === selectedSpot.id ? { ...s, ...res.scores } : s)));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [selectedSpot.id, selectedSpot.lat, selectedSpot.lng, selectedSpot.bortle, selectedSpot.elevation, selectedTarget.id, dateIso, hourIndex]);

  useEffect(() => {
    let active = true;
    const focalMm = parseInt(focalLength, 10) || cameraGear.focalLengthMm || 14;
    apiClient
      .fetchAdvisorSetup({
        mode: shootingMode,
        device: deviceType,
        focalLengthMm: focalMm,
        bortle: selectedSpot.bortle,
        dewRisk: currentForecast.deltaT <= settings.dewThreshold,
        gear: { ...cameraGear, focalLengthMm: focalMm },
        targetDecDeg: skyScene.targetDecDeg,
        targetName: selectedTarget.shortName,
        moonIllum: skyScene.moonIllum,
        moonAlt: skyScene.moonAlt,
        windKmh: currentForecast.windKmh ?? 8,
        cloudPct: Math.round((currentForecast.highCloud + currentForecast.midCloud) / 2),
      })
      .then((res) => { if (active && res.spec) setAdvisorSpec(res.spec); })
      .catch(() => { setAdvisorSpec(computeAstroSetup(shootingMode, deviceType, focalLength, selectedSpot.bortle)); });
    return () => { active = false; };
  }, [
    shootingMode,
    deviceType,
    focalLength,
    selectedSpot.bortle,
    currentForecast.deltaT,
    currentForecast.windKmh,
    currentForecast.highCloud,
    currentForecast.midCloud,
    settings.dewThreshold,
    cameraGear,
    skyScene.targetDecDeg,
    skyScene.moonIllum,
    skyScene.moonAlt,
    selectedTarget.shortName,
  ]);

  useEffect(() => {
    setCalendarDays(buildClientMonthFallback(calendarYear, calendarMonth));
    let active = true;
    apiClient.fetchCalendar(calendarYear, calendarMonth, selectedSpot.lat, selectedSpot.lng, selectedSpot.bortle)
      .then((res) => { if (active && res.days?.length) setCalendarDays(res.days); })
      .catch(() => {});
    return () => { active = false; };
  }, [calendarYear, calendarMonth, selectedSpot.lat, selectedSpot.lng, selectedSpot.bortle]);

  const setCalendarMonthYear = useCallback((year: number, month: number) => {
    const safeYear = Math.max(2020, Math.min(2035, year));
    const safeMonth = Math.max(1, Math.min(12, month));
    const maxDay = new Date(Date.UTC(safeYear, safeMonth, 0)).getUTCDate();
    setCalendarYear(safeYear);
    setCalendarMonth(safeMonth);
    setSelectedCalendarDay((d) => Math.min(d, maxDay));
    playUiSound('tap');
  }, []);

  const stepCalendarMonth = useCallback((delta: -1 | 1) => {
    setCalendarMonth((prevM) => {
      const nextRaw = prevM + delta;
      if (nextRaw < 1) {
        setCalendarYear((y) => Math.max(2020, y - 1));
        return 12;
      }
      if (nextRaw > 12) {
        setCalendarYear((y) => Math.min(2035, y + 1));
        return 1;
      }
      return nextRaw;
    });
    playUiSound('tap');
  }, []);

  useEffect(() => {
    if (!isPlayingTime) return;
    const timer = setInterval(() => setHourIndex((prev) => (prev + 1) % 13), playbackSpeed === '60m' ? 650 : 1200);
    return () => clearInterval(timer);
  }, [isPlayingTime, playbackSpeed]);

  useEffect(() => {
    if (!skyAutoRotate) return;
    const timer = setInterval(() => setSkyRotationOffset((prev) => (prev + 2) % 360), 60);
    return () => clearInterval(timer);
  }, [skyAutoRotate]);

  const saveCameraGear = useCallback(async (nextGear: CameraGearProfile) => {
    setCameraGear(nextGear);
    const preview = previewCameraGearLocally(nextGear);
    setDeviceType(nextGear.sensorType === 'phone' ? 'phone' : 'camera');
    setFocalLength(`${Math.round(nextGear.focalLengthMm)}mm`);
    setSettings((prev) => ({ ...prev, cameraProfile: preview.summaryTitle, cameraSpecs: preview.summaryLine }));
    await auth.updateProfile({ cameraProfile: preview.summaryTitle, cameraSpecs: preview.summaryLine });
    playUiSound('success');
  }, [auth]);

  const inspectMapPoint = useCallback((coords: { lat: number; lng: number }) => {
    setInspectedCoords((prev) => ({ ...prev, lat: Number(coords.lat.toFixed(4)), lng: Number(coords.lng.toFixed(4)) }));
    apiClient.inspectCoords(coords.lat, coords.lng).then((res) => setInspectedCoords(res)).catch(() => {});
  }, []);

  const addSpot = useCallback((input: { name: string; lat: number; lng: number; elevation: number; tags: string[]; safetyNote: string }) => {
    apiClient.createSpot({ ...input, province: 'Cộng đồng đóng góp' })
      .then((res) => { setSpots((prev) => [res.spot, ...prev]); setSelectedSpotId(res.spot.id); })
      .catch(() => {
        const localSpot: Spot = { id: `custom-${Date.now()}`, name: input.name, subtitle: '(Điểm cộng đồng)', region: 'Việt Nam', province: 'Cộng đồng đóng góp', lat: input.lat, lng: input.lng, elevation: input.elevation, bortle: 3.2, sqm: 21.52, milkyWayScore: 89, twilightScore: 80, cloudSeaScore: 87, overallScore: 90, savedSizeMb: 2.4, isFavorite: true, tags: input.tags.length ? input.tags : ['Ngân Hà'], statusText: 'Địa điểm mới đóng góp', safetyNote: input.safetyNote };
        setSpots((prev) => [localSpot, ...prev]);
        setSelectedSpotId(localSpot.id);
      });
    playUiSound('success');
  }, []);

  const value: AppStateContextValue = {
    spots, selectedSpot,
    selectSpot: (id) => { const f = spots.find((s) => s.id === id); if (!f) return; setSelectedSpotId(id); setInspectedCoords({ lat: f.lat, lng: f.lng, bortle: f.bortle, sqm: f.sqm, cloud: 12, name: `${f.name} · ${f.province}` }); playUiSound('select'); },
    toggleFavoriteSpot: (id) => setSpots((prev) => prev.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))),
    addSpot, spotSearch, setSpotSearch, spotFilter, setSpotFilter,
    ...locationCtrl,
    targets: CELESTIAL_TARGETS, selectedTarget, selectTarget: (id) => { setSelectedTargetId(id); playUiSound('select'); },
    hourIndex, setHourIndex: (idx) => { setHourIndex(idx); playUiSound('tick'); },
    hourlyForecast, currentForecast, dailyEvents, goldenWindows, tonightSlots, calendarDays, advisorSpec, skyScene, lightDomes, cloudSystems, observationSource,
    isPlayingTime, togglePlayTime: () => setIsPlayingTime((v) => !v), playbackSpeed, setPlaybackSpeed,
    resetToCurrentTime: () => {
      const now = new Date();
      const today = formatCurrentDateParts(now);
      setIsPlayingTime(false);
      setCalendarYear(today.year);
      setCalendarMonth(today.month);
      setSelectedCalendarDay(today.day);
      setAppliedDateLabel(today.dateLabel);
      setHourIndex(resolveCurrentNightHourIndex(now, hourlyForecast.map((item) => item.hour)));
      playUiSound('select');
    },
    basemap, setBasemap, showLightPollution, toggleLightPollution: () => setShowLightPollution((v) => !v),
    showCloudLayer, toggleCloudLayer: () => setShowCloudLayer((v) => !v), showAzimuthRays, toggleAzimuthRays: () => setShowAzimuthRays((v) => !v),
    mapZoom, zoomMap: (d) => setMapZoom((z) => Math.max(0.8, Math.min(2.0, Number((z + d).toFixed(1))))), resetMap: () => setMapZoom(1),
    inspectedCoords, inspectMapPoint, skyViewMode, setSkyViewMode,
    skyZoom, zoomSky: (d) => setSkyZoom((z) => Math.max(0.5, Math.min(4.0, Number((z + d).toFixed(1))))),
    skyAutoRotate, toggleSkyAutoRotate: () => setSkyAutoRotate((v) => !v), skyDragTool, setSkyDragTool,
    skyRotationOffset, setSkyRotationOffset,
    resetSkyView: () => { setSkyZoom(1.0); setSkyRotationOffset(0); setSkyAutoRotate(false); setSkyDragTool('rotate'); },
    shootingMode, setShootingMode, deviceType, setDeviceType, focalLength, setFocalLength, cameraGear, saveCameraGear,
    calendarYear, calendarMonth, setCalendarMonthYear, stepCalendarMonth,
    selectedCalendarDay, setSelectedCalendarDay, appliedDateLabel,
    applyCalendarDay: (day) => { const f = calendarDays.find((d) => d.day === day); if (!f) return; setSelectedCalendarDay(day); setAppliedDateLabel(f.dateLabel); playUiSound('success'); },
    guideTab, setGuideTab, activeOverlay,
    openOverlay: (id) => { setActiveOverlay(id); playUiSound('tap'); },
    closeOverlay: () => { setActiveOverlay(null); playUiSound('tap'); },
    mobileTab, setMobileTab: (tab) => { setMobileTabState(tab); setMobileSubScreen(null); playUiSound('tab'); },
    mobileSubScreen,
    openMobileSubScreen: (screen) => { setMobileSubScreen(screen); playUiSound('tap'); },
    closeMobileSubScreen: () => { setMobileSubScreen(null); playUiSound('tap'); },
    settings, updateSettings: (patch) => setSettings((prev) => ({ ...prev, ...patch })),
    ...auth,
    isAdmin: isAdminUser(auth.user),
    effectivePlan: getEffectivePlan(auth.user),
    hasUnlimitedAccess: checkUnlimitedAccess(auth.user),
    toast: null, showToast, dismissToast,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
