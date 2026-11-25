export type BasemapId = 'satellite' | 'astroDark' | 'esriDark' | 'topo';
export type SkyViewMode = 'dome2d' | 'ground3d' | 'sphere3d';
export type SkyDragTool = 'rotate' | 'pan';
export type ShootingMode = 'milkyWay' | 'nebula' | 'meteor' | 'moon' | 'cloudSea';
export type DeviceType = 'camera' | 'phone';
export type FocalLength = string;
export type SensorType = 'fullFrame' | 'apsc' | 'm43' | 'phone';
export type PlanTier = 'free' | 'pro' | 'expedition';
export type UserRole = 'user' | 'admin';
export type UnitSystem = 'metric' | 'imperial';
export type DefaultMapLayer = 'bortle' | 'cloud';
export type StartupLocation = 'gps' | 'nearestFavorite';
export type CompassReference = 'trueNorth' | 'magnetic';
export type GuideTab = 'formulas' | 'clouds' | 'dew' | 'bortle';
export type SpotFilter = 'all' | 'saved' | 'favorite';

export type OverlayId =
  | null
  | 'spots'
  | 'contribute'
  | 'calendar'
  | 'guide'
  | 'settings'
  | 'about'
  | 'account'
  | 'cameraProfile'
  | 'targetPicker'
  | 'inspectCoords'
  | 'goldenWindow'
  | 'fullscreen3d';

export type MobileTab = 'observe' | 'spots' | 'calendar' | 'guide' | 'account';
export type MobileSubScreen =
  | null
  | 'contribute'
  | 'about'
  | 'account'
  | 'cameraProfile'
  | 'targetPicker'
  | 'inspectCoords'
  | 'goldenWindow'
  | 'fullscreen3d';

export interface Spot {
  id: string;
  name: string;
  subtitle: string;
  region: string;
  province: string;
  lat: number;
  lng: number;
  elevation: number;
  bortle: number;
  sqm: number;
  milkyWayScore: number;
  twilightScore: number;
  cloudSeaScore: number;
  overallScore: number;
  savedSizeMb: number | null;
  isFavorite: boolean;
  tags: string[];
  statusText: string;
  safetyNote: string;
}

export interface CelestialTarget {
  id: string;
  name: string;
  shortName: string;
  altitude: number;
  azimuth: number;
  azimuthLabel: string;
  peakTime: string;
  rating: string;
  description: string;
  constellation: string;
}

export interface HourlyForecast {
  hour: string;
  highCloud: number;
  midCloud: number;
  lowCloud: number;
  tempC: number;
  dewC: number;
  deltaT: number;
  windKmh?: number;
  targetAlt: number;
  moonAlt: number;
  sunAlt: number;
  phaseLabel: string;
}

export interface DailyAstroEvent {
  id: string;
  label: string;
  subLabel: string;
  time: string;
  tone: 'violet' | 'amber' | 'cyan';
}

export interface GoldenWindowItem {
  id: string;
  title: string;
  subtitle: string;
  timeRange: string;
  score: number;
  tone: 'amber' | 'cyan' | 'violet' | 'emerald';
}

export interface TonightSlot {
  time: string;
  score: number;
  label: string;
  icon: 'sparkles' | 'cloud';
  tone: 'violet' | 'cyan' | 'amber';
  featured?: boolean;
}

export interface CalendarDay {
  day: number;
  weekday: string;
  dateLabel: string;
  moonPercent: number;
  milkyWayScore: number;
  isMeteorPeak?: boolean;
  eventTitle?: string;
  zhr?: string;
  radiant?: string;
  moonDetail?: string;
  milkyWayWindow?: string;
}

export interface AppSettings {
  unitSystem: UnitSystem;
  defaultMapLayer: DefaultMapLayer;
  cameraProfile: string;
  cameraSpecs: string;
  dewThreshold: number;
  offlineCacheEnabled: boolean;
  startupLocation: StartupLocation;
  compassReference: CompassReference;
  clearSkyAlertsEnabled: boolean;
  dailyAlertTime: string;
  soundEnabled: boolean;
}

export interface UserQuotas {
  dailyPhotoPlans: number | null;
  dailyTargetSearches: number | null;
  dailyTripPlans: number | null;
  maxTripLocations: number | null;
  offlineMaps: number | null;
  cameraProfiles: number | null;
}

export interface UserCapabilities {
  isAdmin: boolean;
  unlimited: boolean;
  effectivePlan: PlanTier;
  hasProFeatures: boolean;
  hasExpeditionFeatures: boolean;
  canManageSystem: boolean;
  canDeleteSpots: boolean;
  canViewAdminPanel: boolean;
  quotas: UserQuotas;
}

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  bio: string;
  plan: PlanTier;
  planExpiresAt?: string | null;
  role?: UserRole;
  effectivePlan?: PlanTier;
  entitlementSource?: string;
  unlimited?: boolean;
  capabilities?: UserCapabilities;
  cameraProfile: string;
  cameraSpecs: string;
  updatedAt: string;
}

export interface SkySceneData {
  latDeg: number;
  lstDeg: number;
  sunAlt: number;
  sunAz: number;
  sunAzLabel: string;
  moonAlt: number;
  moonAz: number;
  moonAzLabel: string;
  moonIllum: number;
  moonPhase: string;
  saturnAlt: number;
  saturnAz: number;
  targetAlt: number;
  targetAz: number;
  targetAzLabel: string;
  targetRaHours: number;
  targetDecDeg: number;
}

export interface LightDomeItem {
  name: string;
  lat: number;
  lng: number;
  maxBortle: number;
  radiusKm: number;
}

export interface MapCloudSystem {
  id: string;
  label: string;
  lat: number;
  lng: number;
  radiusKm: number;
  opacity: number;
}
