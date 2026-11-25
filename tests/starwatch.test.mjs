import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { INITIAL_SPOTS, filterSpots } from '../src/data/spots.ts';
import { computeAstroSetup } from '../src/data/advisor.ts';
import { HOURLY_FORECAST, countDewAlertHours } from '../src/data/forecast.ts';
import { NOV_2026_CALENDAR } from '../src/data/calendar.ts';
import { loadServerEnv } from '../server/src/env.ts';
import { resolveUserCapabilities } from '../server/src/domain/accessPolicy.ts';
import { buildFirestorePatchUrl, decodeFields } from '../server/src/integrations/firestore.ts';
import { createLocalToken, hashPassword } from '../server/src/integrations/firebaseAuth.ts';
import { upsertLocalUser } from '../server/src/integrations/localStore.ts';
import {
  handleAdminOverview,
  handleChangePlan,
  handleGoogleAuth,
  handleRegister,
  handleUpdateMe,
  resolvePlanExpiresAt,
} from '../server/src/routes/accountRoutes.ts';
import { handleCreateSpot, handleDeleteSpot } from '../server/src/routes/observationRoutes.ts';
import { handleWorkerFetch } from '../server/src/worker/index.ts';
import { THEMES, getTierBadgePalette } from '../src/design-system/tokens/colors.ts';
import {
  canAccessTier,
  formatPlanExpiryLabel,
  getEffectivePlan,
  getUserCapabilities,
  hasUnlimitedAccess,
  isAdminUser,
} from '../src/utils/accessPolicy.ts';
import { buildSmoothPath, mapXToHourIndex } from '../src/features/observation/altitudeChartMath.ts';
import { projectSpotToMap } from '../src/features/observation/gisMapHelpers.ts';
import { buildDynamicSpot, parseCoordinateQuery } from '../src/services/locationClient.ts';
import { mergeFetchedSpots } from '../src/services/localPrefsStorage.ts';
import { isSoundEnabled, playUiSound, setSoundEnabled } from '../src/utils/soundEngine.ts';
import { previewCameraGearLocally } from '../src/data/cameraCatalog.ts';
import { estimateBortleAtCoords } from '../server/src/domain/bortle.ts';
import { computeAstroAdvisor } from '../server/src/domain/scoring.ts';
import { buildSkyScene } from '../server/src/domain/ephemeris.ts';
import { buildMonthlyCalendar } from '../server/src/domain/calendar.ts';

const root = process.cwd();

function readSrc(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('THEMES defines complete palettes for dark, light, and red modes', () => {
  assert.equal(THEMES.dark.bg, '#05070D');
  assert.equal(THEMES.dark.accentCyan, '#38BDF8');
  assert.equal(THEMES.light.bg, '#F1F5F9');
  assert.equal(THEMES.light.accentCyan, '#0284C7');
  assert.equal(THEMES.red.bg, '#050000');
  assert.equal(THEMES.red.textPrimary, '#FF6B6B');
});

test('filterSpots filters 15 curated spots by query, saved, and favorite flags', () => {
  assert.equal(INITIAL_SPOTS.length, 15);
  assert.equal(filterSpots(INITIAL_SPOTS, '', 'all').length, 15);
  assert.equal(filterSpots(INITIAL_SPOTS, '', 'saved').length, 5);
  assert.equal(filterSpots(INITIAL_SPOTS, '', 'favorite').length, 12);
  const taXua = filterSpots(INITIAL_SPOTS, 'Tà Xùa', 'all');
  assert.equal(taXua.length, 1);
  assert.equal(taXua[0].bortle, 3.5);
});

test('computeAstroSetup returns exact Figma NPF defaults and updates by focal length/device', () => {
  const defaultSpec = computeAstroSetup('milkyWay', 'camera', '14mm', 3.5);
  assert.equal(defaultSpec.shutterValue, '13s · Quy tắc NPF/500');
  assert.equal(defaultSpec.apertureValue, 'f/1.8');
  assert.equal(defaultSpec.isoValue, 'ISO 3200');
  assert.equal(defaultSpec.wbValue, '3900K');

  const phoneSpec = computeAstroSetup('milkyWay', 'phone', '14mm', 3.5);
  assert.equal(phoneSpec.shutterValue, '25s · Night/Astro Mode');
});

test('countDewAlertHours detects 00:00..06:00 when threshold is 2.5C', () => {
  assert.equal(HOURLY_FORECAST.length, 13);
  const stats = countDewAlertHours(HOURLY_FORECAST, 2.5);
  assert.equal(stats.hours.length, 7);
  assert.equal(stats.minDelta, 1.4);
  assert.equal(stats.minHour, '04:00');
});

test('calendar covers November 2026 days 2..29 including Leonids meteor peak on 18/11', () => {
  assert.equal(NOV_2026_CALENDAR.length, 28);
  const peak = NOV_2026_CALENDAR.find((d) => d.day === 18);
  assert.ok(peak);
  assert.equal(peak.eventTitle, 'CỰC ĐẠI SAO BĂNG LEONIDS');
});

test('all 10 overlays and 5 mobile tabs are wired in DesktopShell and MobileShell', () => {
  const desktopShell = readSrc('src/features/shells/DesktopShell.tsx');
  const mobileShell = readSrc('src/features/shells/MobileShell.tsx');

  for (const overlayName of [
    'SpotsOverlay',
    'ContributeOverlay',
    'CalendarOverlay',
    'GuideOverlay',
    'SettingsOverlay',
    'AboutOverlay',
    'TargetPickerOverlay',
    'InspectCoordsOverlay',
    'GoldenWindowOverlay',
    'FullscreenSkyOverlay',
  ]) {
    assert.ok(desktopShell.includes(overlayName), `DesktopShell missing ${overlayName}`);
    assert.ok(mobileShell.includes(overlayName), `MobileShell missing ${overlayName}`);
  }
});

test('altitude chart math builds smooth Bezier paths and clamps drag X to 0..12 hour index', () => {
  const pathStr = buildSmoothPath([
    { x: 0, y: 10 },
    { x: 50, y: 40 },
    { x: 100, y: 20 },
  ]);
  assert.ok(pathStr.startsWith('M0.0 10.0 C'));
  assert.equal(mapXToHourIndex(-10, 400, 0.1, 0.9, 13), 0);
  assert.equal(mapXToHourIndex(200, 400, 0.1, 0.9, 13), 6);
  assert.equal(mapXToHourIndex(500, 400, 0.1, 0.9, 13), 12);
});

test('projectSpotToMap maps northern spots above southern spots inside Vietnam map bounds', () => {
  const taXua = projectSpotToMap(21.2981, 104.4652);
  const kheSanh = projectSpotToMap(16.6542, 106.7185);
  const bauTrang = projectSpotToMap(11.0694, 108.4267);
  assert.ok(taXua.y < kheSanh.y && kheSanh.y < bauTrang.y);
  assert.ok(taXua.x >= 165 && bauTrang.x <= 350);
});

test('soundEngine toggles state and executes safely without Web Audio in Node', () => {
  setSoundEnabled(false);
  assert.equal(isSoundEnabled(), false);
  assert.doesNotThrow(() => {
    playUiSound('tap');
    playUiSound('tick');
    playUiSound('theme');
  });
  setSoundEnabled(true);
  assert.equal(isSoundEnabled(), true);
});

test('Mobile CloudDewMatrix pins label column and MobileBottomTabBar uses Liquid Glass animations', () => {
  const matrixSrc = readSrc('src/features/observation/CloudDewMatrixCard.tsx');
  const scrollIdx = matrixSrc.indexOf('<ScrollView');
  assert.ok(scrollIdx > 0, 'CloudDewMatrixCard must use ScrollView for hourly columns');
  assert.ok(matrixSrc.includes('borderRightWidth'), 'CloudDewMatrixCard must separate pinned label column');
  assert.ok(matrixSrc.indexOf('Giờ địa phương') < scrollIdx, 'Label column must stay outside horizontal ScrollView');

  const tabBarSrc = readSrc('src/features/navigation/MobileBottomTabBar.tsx');
  assert.ok(tabBarSrc.includes('Animated.View'), 'MobileBottomTabBar must animate active indicator');
  assert.ok(tabBarSrc.includes('backdropFilter'), 'MobileBottomTabBar must apply Liquid Glass blur on Web');
});

test('SkyDomeCard enforces single-line telemetry boxes without height jumping', () => {
  const skySrc = readSrc('src/features/observation/SkyDomeCard.tsx');
  assert.ok(skySrc.includes('minWidth: 0'), 'SkyDomeCard telemetry boxes must allow flex shrinking');
  assert.ok(skySrc.includes('numberOfLines={1}'), 'SkyDomeCard telemetry values must stay single-line');
  assert.ok(skySrc.length > 0 && skySrc.split('\n').length <= 300, 'SkyDomeCard should remain <= 300 lines');
});

test('LocationScoreCard renders Mobile 2x2 rounded chips with map-pin and stays <= 300 lines', () => {
  const locSrc = readSrc('src/features/observation/LocationScoreCard.tsx');
  assert.ok(locSrc.includes('MobileInfoChip'), 'LocationScoreCard must define MobileInfoChip');
  assert.ok(locSrc.includes('map-pin'), 'LocationScoreCard Mobile coords chip must use map-pin icon');
  assert.ok(locSrc.includes('borderRadius: 10'), 'MobileInfoChip must use borderRadius 10');
  assert.ok(locSrc.split('\n').length <= 300, 'LocationScoreCard should remain <= 300 lines');
});

test('HomeScreen does not render floating ToastBanner notifications', () => {
  const homeSrc = readSrc('app/index.tsx');
  assert.ok(!homeSrc.includes('<ToastBanner'), 'HomeScreen must hide all ToastBanner notifications');
});

test('Backend astronomy, Bortle estimation, NPF advisor, and calendar engines compute valid data', () => {
  const hanoi = estimateBortleAtCoords(21.0285, 105.8542);
  const taXua = estimateBortleAtCoords(21.2981, 104.4652);
  assert.ok(hanoi.bortle > taXua.bortle && hanoi.sqm < taXua.sqm);

  const scene = buildSkyScene('2026-11-18', 21 * 60, 21.2981, 104.4652, 'galactic_center');
  assert.ok(scene.sunAlt < 0, 'Sun should be below horizon at 21:00');
  assert.ok(scene.moonIllum >= 0 && scene.moonIllum <= 100);

  const adv = computeAstroAdvisor({
    mode: 'milkyWay',
    device: 'camera',
    focalLengthMm: 14,
    bortle: 3.5,
    dewRisk: true,
    gear: { cameraName: 'Sony A7 IV', sensorType: 'fullFrame', megapixels: 33, lensName: 'FE 14mm f/1.8 GM', focalLengthMm: 14, aperture: 1.8 },
  });
  assert.ok(adv.shutterValue.includes('NPF') && adv.checklist.some((c) => c.includes('Dew Heater')));

  const preview = previewCameraGearLocally({
    cameraName: 'Canon EOS R5',
    sensorType: 'fullFrame',
    megapixels: 45,
    dualIso: 'ISO 3200',
    lensName: 'RF 15-35mm f/2.8L',
    focalLengthMm: 15,
    aperture: 2.8,
  });
  assert.ok(preview.npfSeconds > 0 && preview.summaryTitle.includes('Canon EOS R5'));

  const cal = buildMonthlyCalendar(2026, 11, 21.2981, 104.4652, 3.5);
  assert.equal(cal.length, 30);
  assert.equal(cal.find((d) => d.day === 18)?.isMeteorPeak, true);

  const augCal = buildMonthlyCalendar(2026, 8, 21.2981, 104.4652, 3.5);
  assert.equal(augCal.length, 31);
  assert.equal(augCal.find((d) => d.day === 12)?.isMeteorPeak, true);

  const febCal = buildMonthlyCalendar(2026, 2, 21.2981, 104.4652, 3.5);
  assert.equal(febCal.length, 28);
});

test('Full-bleed Logo, Leaflet Map, Three.js 3D, and Account/Camera overlays are wired on Desktop and Mobile', () => {
  const logoSrc = readSrc('src/design-system/icons/StarWatchLogo.tsx');
  assert.ok(logoSrc.includes('x={0} y={0} width={64} height={64}'), 'StarWatchLogo must be full-bleed');

  assert.ok(fs.existsSync(path.join(root, 'src/features/observation/GisMapCanvas.web.tsx')));
  assert.ok(fs.existsSync(path.join(root, 'src/features/observation/SkyThreeCanvas.web.tsx')));

  const desktopSrc = readSrc('src/features/shells/DesktopShell.tsx');
  const mobileSrc = readSrc('src/features/shells/MobileShell.tsx');
  for (const overlay of ['AccountOverlay', 'CameraProfileOverlay']) {
    assert.ok(desktopSrc.includes(overlay), `DesktopShell missing ${overlay}`);
    assert.ok(mobileSrc.includes(overlay), `MobileShell missing ${overlay}`);
  }
});

test('Mobile headers are pinned outside ScrollView and CalendarOverlay supports month/year selection', () => {
  const modalSrc = readSrc('src/features/overlays/ModalShell.tsx');
  const modalMobileIdx = modalSrc.indexOf('if (isMobileView)');
  const modalTitleIdx = modalSrc.indexOf('{title}', modalMobileIdx);
  const modalScrollIdx = modalSrc.indexOf('<ScrollView', modalMobileIdx);
  assert.ok(modalTitleIdx > modalMobileIdx && modalTitleIdx < modalScrollIdx, 'ModalShell header must be pinned above ScrollView');

  const mobileShellSrc = readSrc('src/features/shells/MobileShell.tsx');
  const obsIdx = mobileShellSrc.indexOf('selectedSpot.name');
  const obsScrollIdx = mobileShellSrc.indexOf('<ScrollView', mobileShellSrc.indexOf('renderMainBody'));
  assert.ok(obsIdx > 0 && obsScrollIdx > 0 && obsIdx < obsScrollIdx, 'MobileShell observe header must stay outside ScrollView');

  const calSrc = readSrc('src/features/overlays/CalendarOverlay.tsx');
  assert.ok(calSrc.includes('Tháng trước') && calSrc.includes('Tháng sau') && calSrc.includes('Chọn nhanh tháng'));
  assert.ok(calSrc.split('\n').length <= 300, 'CalendarOverlay must stay <= 300 lines');
});

test('Upgraded NPF advisor accounts for declination, Moon altitude/illumination, wind speed, meteor mode, and custom focal lengths', () => {
  const baseGear = {
    cameraName: 'Sony A7 IV',
    sensorType: 'fullFrame',
    megapixels: 33,
    lensName: 'FE 14mm f/1.8 GM',
    focalLengthMm: 14,
    aperture: 1.8,
  };

  const eq = computeAstroAdvisor({ mode: 'milkyWay', device: 'camera', focalLengthMm: 14, bortle: 3.5, dewRisk: false, gear: baseGear, targetDecDeg: 0, windKmh: 6 });
  const m31 = computeAstroAdvisor({ mode: 'milkyWay', device: 'camera', focalLengthMm: 14, bortle: 3.5, dewRisk: false, gear: baseGear, targetDecDeg: 41.27, windKmh: 6 });
  assert.ok(m31.metrics.npfSeconds > eq.metrics.npfSeconds, 'Higher declination should yield longer NPF shutter time');

  const moonUp = computeAstroAdvisor({ mode: 'milkyWay', device: 'camera', focalLengthMm: 14, bortle: 3.5, dewRisk: false, gear: baseGear, moonIllum: 95, moonAlt: 45, windKmh: 6 });
  const moonDown = computeAstroAdvisor({ mode: 'milkyWay', device: 'camera', focalLengthMm: 14, bortle: 3.5, dewRisk: false, gear: baseGear, moonIllum: 95, moonAlt: -20, windKmh: 6 });
  assert.ok(moonUp.metrics.effectiveBortle > moonDown.metrics.effectiveBortle, 'Moon above horizon should increase effective Bortle');
  assert.notEqual(moonUp.isoValue, moonDown.isoValue, 'Bright Moon above horizon should lower recommended Milky Way ISO');

  const windy = computeAstroAdvisor({ mode: 'milkyWay', device: 'camera', focalLengthMm: 14, bortle: 3.5, dewRisk: false, gear: baseGear, targetDecDeg: 0, windKmh: 28 });
  assert.equal(windy.metrics.windPenaltyPct, 25);
  assert.ok(windy.metrics.adjustedShutterSeconds < eq.metrics.adjustedShutterSeconds, 'Strong wind should reduce shutter duration');

  const meteor = computeAstroAdvisor({ mode: 'meteor', device: 'camera', focalLengthMm: 14, bortle: 3.5, dewRisk: false, gear: baseGear });
  assert.ok(meteor.shutterValue.includes('Interval 1s') && meteor.checklist.some((c) => c.includes('Radiant')));

  const fullMoon = computeAstroAdvisor({ mode: 'moon', device: 'camera', focalLengthMm: 200, bortle: 4, dewRisk: false, moonIllum: 95 });
  const crescentMoon = computeAstroAdvisor({ mode: 'moon', device: 'camera', focalLengthMm: 200, bortle: 4, dewRisk: false, moonIllum: 20 });
  assert.notEqual(fullMoon.shutterValue, crescentMoon.shutterValue);

  const lens50 = computeAstroAdvisor({ mode: 'milkyWay', device: 'camera', focalLengthMm: 50, bortle: 3.5, dewRisk: false, gear: { ...baseGear, focalLengthMm: 50, lensName: 'FE 50mm f/1.4 GM', aperture: 1.4 } });
  assert.ok(lens50.metrics.npfSeconds < eq.metrics.npfSeconds, '50mm lens must have shorter NPF than 14mm');

  const advisorCardSrc = readSrc('src/features/observation/AstroSetupCard.tsx');
  const advisorEngineSrc = readSrc('server/src/domain/astroAdvisor.ts');
  assert.ok(advisorCardSrc.split('\n').length <= 300, 'AstroSetupCard.tsx must stay <= 300 lines');
  assert.ok(advisorEngineSrc.split('\n').length <= 300, 'astroAdvisor.ts must stay <= 300 lines');
});

function makeMockReq(body, token) {
  const payload = body === undefined ? [] : [JSON.stringify(body)];
  const req = Readable.from(payload);
  req.headers = token ? { authorization: `Bearer ${token}` } : {};
  return req;
}

test('Firestore helpers attach updateMask.fieldPaths and decode timestampValue', () => {
  const profileUrl = buildFirestorePatchUrl('starwatch-fa50a', 'users/u1', ['displayName', 'bio', 'updatedAt']);
  assert.ok(profileUrl.includes('updateMask.fieldPaths=displayName'));
  assert.ok(profileUrl.includes('updateMask.fieldPaths=bio'));
  assert.ok(profileUrl.includes('updateMask.fieldPaths=updatedAt'));

  const planUrl = buildFirestorePatchUrl('starwatch-fa50a', 'entitlements/u1', ['plan', 'status', 'updatedAt']);
  assert.ok(planUrl.includes('updateMask.fieldPaths=plan'));
  assert.ok(planUrl.includes('updateMask.fieldPaths=status'));

  const decoded = decodeFields({
    role: { stringValue: 'admin' },
    plan: { stringValue: 'pro' },
    updatedAt: { timestampValue: '2026-11-13T07:55:32.700Z' },
    count: { integerValue: '7' },
    active: { booleanValue: true },
  });
  assert.equal(decoded.role, 'admin');
  assert.equal(decoded.plan, 'pro');
  assert.equal(decoded.updatedAt, '2026-11-13T07:55:32.700Z');
  assert.equal(decoded.count, 7);
  assert.equal(decoded.active, true);
});

test('Admin role unlocks unlimited capabilities across backend and frontend', () => {
  const adminFromPro = resolveUserCapabilities('admin', 'pro');
  assert.equal(adminFromPro.isAdmin, true);
  assert.equal(adminFromPro.unlimited, true);
  assert.equal(adminFromPro.effectivePlan, 'expedition');
  assert.equal(adminFromPro.hasProFeatures, true);
  assert.equal(adminFromPro.hasExpeditionFeatures, true);
  assert.equal(adminFromPro.canManageSystem, true);
  assert.equal(adminFromPro.canDeleteSpots, true);
  assert.equal(adminFromPro.canViewAdminPanel, true);
  assert.deepEqual(adminFromPro.quotas, {
    dailyPhotoPlans: null,
    dailyTargetSearches: null,
    dailyTripPlans: null,
    maxTripLocations: null,
    offlineMaps: null,
    cameraProfiles: null,
  });

  const freeCaps = resolveUserCapabilities('user', 'free', { freeDailyPhotoPlans: 3, freeDailyTargetSearches: 10, freeDailyTripPlans: 1, freeMaxTripLocations: 3 });
  assert.equal(freeCaps.unlimited, false);
  assert.equal(freeCaps.effectivePlan, 'free');
  assert.equal(freeCaps.quotas.dailyPhotoPlans, 3);
  assert.equal(freeCaps.quotas.maxTripLocations, 3);

  const proCaps = resolveUserCapabilities('user', 'pro', { proMaxTripLocations: 10 });
  assert.equal(proCaps.effectivePlan, 'pro');
  assert.equal(proCaps.hasProFeatures, true);
  assert.equal(proCaps.hasExpeditionFeatures, false);
  assert.equal(proCaps.quotas.maxTripLocations, 10);

  const staleAdminAccount = {
    uid: 'admin-1', email: 'admin@gmail.com', displayName: 'Admin', bio: '', plan: 'free',
    role: 'admin', cameraProfile: 'Sony A7 IV', cameraSpecs: 'Full-Frame', updatedAt: '2026-11-25T00:00:00Z',
  };
  assert.equal(isAdminUser(staleAdminAccount), true);
  assert.equal(getEffectivePlan(staleAdminAccount), 'expedition');
  assert.equal(hasUnlimitedAccess(staleAdminAccount), true);
  assert.equal(canAccessTier(staleAdminAccount, 'expedition'), true);
  assert.equal(getUserCapabilities(staleAdminAccount).canManageSystem, true);
});

test('Account routes block privilege escalation, preserve admin role, and guard admin endpoints', async () => {
  const storePath = path.join(root, 'server', 'data', 'store.json');
  const hadStore = fs.existsSync(storePath);
  const originalStore = hadStore ? fs.readFileSync(storePath, 'utf8') : null;
  const localEnv = {
    ...loadServerEnv(),
    firebaseApiKey: '',
    firebaseProjectId: '',
    googleServiceAccountEmail: '',
    googleServiceAccountPrivateKey: '',
  };

  try {
    const reg = await handleRegister(
      makeMockReq({ email: 'member-test@example.com', password: 'secret123', displayName: 'Member', role: 'admin' }),
      localEnv
    );
    assert.equal(reg.user.role, 'user');
    assert.equal(reg.user.effectivePlan, 'free');

    const updatedUser = await handleUpdateMe(
      makeMockReq({ displayName: 'Member Updated', role: 'admin' }, reg.token),
      localEnv
    );
    assert.equal(updatedUser.user.role, 'user');
    assert.equal(updatedUser.user.displayName, 'Member Updated');

    await assert.rejects(
      () => handleAdminOverview(makeMockReq(undefined, reg.token), localEnv),
      (err) => err?.status === 403 && err?.code === 'forbidden'
    );

    const adminUid = 'admin-local-test-uid';
    upsertLocalUser({
      uid: adminUid,
      email: 'admin-local@example.com',
      displayName: 'Admin Test',
      bio: 'Admin',
      plan: 'pro',
      role: 'admin',
      entitlementSource: 'lifetime_admin',
      cameraProfile: 'Sony A7 IV',
      cameraSpecs: 'Full-Frame',
      updatedAt: new Date().toISOString(),
      passwordHash: hashPassword('secret123'),
    });
    const adminToken = createLocalToken(adminUid, 'admin-local@example.com');

    const overview = await handleAdminOverview(makeMockReq(undefined, adminToken), localEnv);
    assert.equal(overview.role, 'admin');
    assert.equal(overview.unlimited, true);
    assert.equal(overview.effectivePlan, 'expedition');

    const planChanged = await handleChangePlan(makeMockReq({ plan: 'free' }, adminToken), localEnv);
    assert.equal(planChanged.user.role, 'admin');
    assert.equal(planChanged.user.effectivePlan, 'expedition');
    assert.equal(planChanged.user.unlimited, true);

    const createdSpot = await handleCreateSpot(
      makeMockReq({ name: 'Test Peak', province: 'Lào Cai', lat: 22.3, lng: 103.8, elevation: 1600 })
    );
    await assert.rejects(
      () => handleDeleteSpot(makeMockReq(undefined, reg.token), localEnv, createdSpot.spot.id),
      (err) => err?.status === 403
    );
    const deleted = await handleDeleteSpot(makeMockReq(undefined, adminToken), localEnv, createdSpot.spot.id);
    assert.equal(deleted.ok, true);
    assert.equal(deleted.deletedId, createdSpot.spot.id);
  } finally {
    if (hadStore && originalStore !== null) fs.writeFileSync(storePath, originalStore, 'utf8');
    else if (!hadStore && fs.existsSync(storePath)) fs.unlinkSync(storePath);
  }
});

test('TierBadge palettes cover all 4 tiers across 3 themes and UI files stay modular without hardcoded hex', () => {
  for (const mode of ['dark', 'light', 'red']) {
    for (const variant of ['free', 'pro', 'expedition', 'admin']) {
      const p = getTierBadgePalette(variant, mode);
      assert.equal(p.borderGradient.length, 3);
      assert.equal(p.bgGradient.length, 3);
      assert.ok(p.text && p.shimmerBeam && p.webGlow);
    }
    const proP = getTierBadgePalette('pro', mode);
    const expP = getTierBadgePalette('expedition', mode);
    assert.notEqual(proP.bgGradient[0], expP.bgGradient[0], `Expedition must differ from Pro in ${mode}`);
  }

  for (const relPath of [
    'src/design-system/primitives/TierBadge.tsx',
    'src/design-system/icons/TierEmblem.tsx',
    'src/features/overlays/AccountPlansSection.tsx',
    'src/features/overlays/AccountOverlay.tsx',
    'src/features/overlays/SettingsOverlay.tsx',
    'src/features/navigation/DesktopHeader.tsx',
    'src/features/overlays/FullscreenSkyOverlay.tsx',
  ]) {
    const src = readSrc(relPath);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(src), `${relPath} must not hardcode hex colors`);
    assert.ok(src.split('\n').length <= 300, `${relPath} must stay <= 300 lines`);
  }
  assert.ok(readSrc('server/src/routes/accountRoutes.ts').split('\n').length <= 300);
  assert.ok(readSrc('server/src/integrations/firestore.ts').split('\n').length <= 300);
});

test('CloudDewMatrixCard renders unified sliding column frame and animated SegmentedControl', () => {
  const matrixSrc = readSrc('src/features/observation/CloudDewMatrixCard.tsx');
  assert.ok(matrixSrc.includes('Animated.View'), 'CloudDewMatrixCard must animate selected column frame');
  assert.ok(matrixSrc.includes('Animated.spring'), 'CloudDewMatrixCard must spring-animate frame position');
  assert.ok(matrixSrc.includes('HourColumn'), 'CloudDewMatrixCard must use column-per-hour layout');
  assert.ok(matrixSrc.split('\n').length <= 300);

  const segSrc = readSrc('src/design-system/primitives/SegmentedControl.tsx');
  assert.ok(segSrc.includes('Animated.View') && segSrc.includes('Animated.spring'));
  assert.ok(segSrc.split('\n').length <= 200);

  for (const relPath of [
    'src/design-system/primitives/SegmentedControl.tsx',
    'src/design-system/primitives/StatusPill.tsx',
    'src/features/observation/CloudDewMatrixCard.tsx',
    'src/features/observation/GisMapCard.tsx',
    'src/features/observation/SkyDomeCard.tsx',
    'src/features/observation/TimeControlBar.tsx',
  ]) {
    const src = readSrc(relPath);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(src), `${relPath} must not hardcode hex colors`);
    assert.ok(src.split('\n').length <= 300, `${relPath} must stay <= 300 lines`);
  }
});

test('Plan expiry formats cleanly for admin/free/paid users and SettingsOverlay keeps account banner concise', async () => {
  assert.equal(formatPlanExpiryLabel(null), '');
  assert.equal(
    formatPlanExpiryLabel({
      uid: 'a1', email: 'admin@lvq.std', displayName: 'Quang Vo', bio: '', plan: 'pro',
      role: 'admin', cameraProfile: '', cameraSpecs: '', updatedAt: '2026-11-25T00:00:00.000Z',
    }),
    'Đặc quyền vĩnh viễn'
  );
  assert.equal(
    formatPlanExpiryLabel({
      uid: 'u1', email: 'free@example.com', displayName: 'Free User', bio: '', plan: 'free',
      role: 'user', cameraProfile: '', cameraSpecs: '', updatedAt: '2026-11-25T00:00:00.000Z',
    }),
    'Gói miễn phí'
  );
  assert.equal(
    formatPlanExpiryLabel({
      uid: 'u2', email: 'pro@example.com', displayName: 'Pro User', bio: '', plan: 'pro',
      role: 'user', planExpiresAt: '2026-12-25T10:00:00.000Z', cameraProfile: '', cameraSpecs: '', updatedAt: '2026-11-25T10:00:00.000Z',
    }),
    'Hết hạn: 25/12/2026'
  );

  assert.equal(resolvePlanExpiresAt('admin', 'pro', '2026-12-25T00:00:00.000Z', null), null);
  assert.equal(resolvePlanExpiresAt('user', 'free', '2026-12-25T00:00:00.000Z', null), null);
  const derived = resolvePlanExpiresAt('user', 'pro', null, null, '2026-11-25T00:00:00.000Z');
  assert.ok(typeof derived === 'string' && derived.startsWith('2026-12-25'));

  const storePath = path.join(root, 'server', 'data', 'store.json');
  const hadStore = fs.existsSync(storePath);
  const originalStore = hadStore ? fs.readFileSync(storePath, 'utf8') : null;
  const localEnv = {
    ...loadServerEnv(),
    firebaseApiKey: '', firebaseProjectId: '', googleServiceAccountEmail: '', googleServiceAccountPrivateKey: '',
  };
  try {
    const reg = await handleRegister(
      makeMockReq({ email: 'expiry-test@example.com', password: 'secret123', displayName: 'Expiry' }),
      localEnv
    );
    assert.equal(reg.user.planExpiresAt, null);
    const upgraded = await handleChangePlan(makeMockReq({ plan: 'pro' }, reg.token), localEnv);
    assert.ok(typeof upgraded.user.planExpiresAt === 'string' && Date.parse(upgraded.user.planExpiresAt) > Date.now());
    const downgraded = await handleChangePlan(makeMockReq({ plan: 'free' }, reg.token), localEnv);
    assert.equal(downgraded.user.planExpiresAt, null);
  } finally {
    if (hadStore && originalStore !== null) fs.writeFileSync(storePath, originalStore, 'utf8');
    else if (!hadStore && fs.existsSync(storePath)) fs.unlinkSync(storePath);
  }

  const settingsSrc = readSrc('src/features/overlays/SettingsOverlay.tsx');
  assert.ok(settingsSrc.includes('formatPlanExpiryLabel(user)'));
  assert.ok(!settingsSrc.includes("settings.cameraProfile.split(' · ')"));
  assert.ok(settingsSrc.split('\n').length <= 300);
});

test('Google auth endpoint validates tokens and UI wires header displayName and Google sign-in button', async () => {
  const localEnv = {
    ...loadServerEnv(),
    firebaseApiKey: '', firebaseProjectId: '', googleServiceAccountEmail: '', googleServiceAccountPrivateKey: '',
  };
  await assert.rejects(
    () => handleGoogleAuth(makeMockReq({}), localEnv),
    (err) => err?.status === 400 && err?.code === 'missing_token'
  );
  await assert.rejects(
    () => handleGoogleAuth(makeMockReq({ idToken: 'invalid-google-jwt' }), localEnv),
    (err) => err?.status === 401 && err?.code === 'invalid_google_token'
  );

  const headerSrc = readSrc('src/features/navigation/DesktopHeader.tsx');
  assert.ok(headerSrc.includes("user?.displayName?.trim() || 'Tài khoản'"));
  assert.ok(headerSrc.split('\n').length <= 300);

  const accountSrc = readSrc('src/features/overlays/AccountOverlay.tsx');
  assert.ok(accountSrc.includes('GoogleSignInWidget'));
  assert.ok(accountSrc.includes('loginWithGoogleCredential'));
  assert.ok(accountSrc.split('\n').length <= 300);

  const widgetSrc = readSrc('src/features/overlays/GoogleSignInWidget.tsx');
  assert.ok(widgetSrc.includes('use_fedcm_for_prompt: true'));
  assert.ok(widgetSrc.includes('renderButton'));
  assert.ok(widgetSrc.includes('gsi.prompt()'));
  assert.ok(widgetSrc.includes('GoogleGIcon'));
  assert.ok(widgetSrc.includes('Đăng nhập bằng Google'));
  assert.ok(widgetSrc.includes('Đăng ký bằng Google'));
  assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(widgetSrc));
  assert.ok(widgetSrc.split('\n').length <= 300);

  const googleClientSrc = readSrc('src/services/googleAuthClient.ts');
  assert.ok(googleClientSrc.includes('signInWithCredential'));
  assert.ok(googleClientSrc.includes('accounts.google.com/gsi/client'));
  assert.ok(googleClientSrc.split('\n').length <= 300);

  const googleIconSrc = readSrc('src/design-system/icons/GoogleGIcon.tsx');
  assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(googleIconSrc));
  assert.ok(googleIconSrc.split('\n').length <= 300);
  assert.ok(readSrc('src/design-system/tokens/colors.ts').split('\n').length <= 300);
});

test('Cloudflare Worker router handles health, GitHub Pages CORS, spots, calendar, advisor, and auth guards', async () => {
  const healthRes = await handleWorkerFetch(new Request('https://api.example/v1/health'), {
    FIREBASE_API_KEY: 'k',
    FIREBASE_PROJECT_ID: 'p',
  });
  assert.equal(healthRes.status, 200);
  const health = await healthRes.json();
  assert.equal(health.ok, true);
  assert.equal(health.runtime, 'cloudflare-workers');
  assert.equal(health.firebaseAuth, true);

  const preflight = await handleWorkerFetch(
    new Request('https://api.example/v1/health', {
      method: 'OPTIONS',
      headers: { Origin: 'https://demo.github.io' },
    })
  );
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'https://demo.github.io');

  const spotsRes = await handleWorkerFetch(new Request('https://api.example/v1/spots'));
  assert.equal(spotsRes.status, 200);
  const spotsBody = await spotsRes.json();
  assert.ok(Array.isArray(spotsBody.spots) && spotsBody.spots.length >= 15);

  const calRes = await handleWorkerFetch(new Request('https://api.example/v1/calendar?year=2026&month=11'));
  assert.equal(calRes.status, 200);
  const calBody = await calRes.json();
  assert.equal(calBody.days.length, 30);

  const advRes = await handleWorkerFetch(
    new Request('https://api.example/v1/advisor/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'milkyWay', device: 'camera', focalLengthMm: 14, bortle: 3.5 }),
    })
  );
  assert.equal(advRes.status, 200);
  const advBody = await advRes.json();
  assert.ok(advBody.spec?.shutterValue);

  const googleInvalid = await handleWorkerFetch(
    new Request('https://api.example/v1/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'bad-token' }),
    })
  );
  assert.equal(googleInvalid.status, 401);

  const adminUnauth = await handleWorkerFetch(new Request('https://api.example/v1/admin/overview'));
  assert.equal(adminUnauth.status, 401);

  for (const relPath of [
    'server/src/integrations/firebaseRest.ts',
    'server/src/integrations/firestoreSpots.ts',
    'server/src/worker/workerEnv.ts',
    'server/src/worker/workerAccountRoutes.ts',
    'server/src/worker/workerObservationRoutes.ts',
    'server/src/worker/index.ts',
    'server/scripts/buildWorker.mjs',
  ]) {
    assert.ok(readSrc(relPath).split('\n').length <= 300, `${relPath} must stay <= 300 lines`);
  }
});

test('GitHub Pages config sets optional baseUrl cleanly and workflow has no hardcoded secrets', async () => {
  const { default: wrapConfig } = await import('../app.config.js');
  const baseAppJson = JSON.parse(readSrc('app.json')).expo;
  const prevBase = process.env.EXPO_WEB_BASE_URL;

  try {
    process.env.EXPO_WEB_BASE_URL = '';
    const rootCfg = wrapConfig({ config: baseAppJson });
    assert.equal(rootCfg.experiments?.baseUrl, undefined);

    process.env.EXPO_WEB_BASE_URL = '/starwatch';
    const pagesCfg = wrapConfig({ config: baseAppJson });
    assert.equal(pagesCfg.experiments?.baseUrl, '/starwatch');
  } finally {
    if (prevBase === undefined) delete process.env.EXPO_WEB_BASE_URL;
    else process.env.EXPO_WEB_BASE_URL = prevBase;
  }

  assert.ok(fs.existsSync(path.join(root, 'public', '.nojekyll')));
  assert.ok(readSrc('app.config.js').split('\n').length <= 100);
  assert.ok(readSrc('scripts/preparePages.mjs').split('\n').length <= 100);

  const workflow = readSrc('.github/workflows/deploy-pages.yml');
  assert.ok(workflow.includes('npm run export:pages'));
  assert.ok(workflow.includes('${{ secrets.EXPO_PUBLIC_FIREBASE_API_KEY }}'));
  assert.ok(!/AIzaSy|PRIVATE KEY-----/.test(workflow));
});

test('GPS coordinate parser, dynamic spot merge, mobile blur/zoom fixes, and web icons are valid', () => {
  assert.deepEqual(parseCoordinateQuery('21.0285, 105.8542'), { lat: 21.0285, lng: 105.8542 });
  assert.deepEqual(parseCoordinateQuery('21.2981°N 104.4652°E'), { lat: 21.2981, lng: 104.4652 });
  assert.deepEqual(parseCoordinateQuery('33.8688°S, 151.2093°W'), { lat: -33.8688, lng: -151.2093 });
  assert.deepEqual(parseCoordinateQuery('-33.8688, 151.2093'), { lat: -33.8688, lng: 151.2093 });
  assert.equal(parseCoordinateQuery('95.0, 105.8'), null);
  assert.equal(parseCoordinateQuery('Đà Nẵng'), null);

  const gpsSpot = buildDynamicSpot({
    id: 'gps-current',
    name: 'Hà Nội',
    subtitle: '(GPS)',
    region: 'Việt Nam',
    province: 'Hà Nội',
    lat: 21.0285,
    lng: 105.8542,
    elevation: 15,
    bortle: 8.5,
    sqm: 18.2,
    tags: ['Vị trí GPS'],
    statusText: 'GPS Live',
  });
  const merged = mergeFetchedSpots(INITIAL_SPOTS, [gpsSpot], { 'ta-xua': false, 'gps-current': true });
  assert.equal(merged[0].id, 'gps-current');
  assert.equal(merged[0].isFavorite, true);
  assert.equal(merged.find((s) => s.id === 'ta-xua')?.isFavorite, false);

  const mobileShell = readSrc('src/features/shells/MobileShell.tsx');
  assert.ok(!mobileShell.includes('backdropFilter'), 'MobileShell top header must not use blur backdropFilter');
  assert.ok(mobileShell.includes('locateCurrentPosition'), 'MobileShell must wire GPS locate button');
  assert.ok(readSrc('src/features/navigation/DesktopHeader.tsx').includes('locateCurrentPosition'));

  const modalShell = readSrc('src/features/overlays/ModalShell.tsx');
  const modalMobileSlice = modalShell.slice(modalShell.indexOf('if (isMobileView)'), modalShell.indexOf('return (\n    <Modal'));
  assert.ok(!modalMobileSlice.includes('backdropFilter'), 'ModalShell mobile header must not use blur backdropFilter');
  const full3dSrc = readSrc('src/features/overlays/FullscreenSkyOverlay.tsx');
  assert.ok(!full3dSrc.slice(0, full3dSrc.indexOf('const mobileHeader') + 500).includes('backdropFilter'), 'FullscreenSkyOverlay mobile header must not use blur backdropFilter');

  const css = readSrc('global.css');
  assert.ok(css.includes('font-size: 16px !important'), 'global.css must prevent iOS Safari input auto-zoom');
  assert.ok(css.includes('outline: none !important'), 'global.css must remove white focus outline on inputs');

  const indexHtml = readSrc('public/index.html');
  for (const snippet of ['viewport-fit=cover', 'maximum-scale=1', 'favicon.svg', 'favicon-32x32.png', 'apple-touch-icon.png', 'manifest.webmanifest']) {
    assert.ok(indexHtml.includes(snippet), `public/index.html missing ${snippet}`);
  }

  for (const pngRel of [
    'public/favicon-32x32.png',
    'public/apple-touch-icon.png',
    'public/icon-192.png',
    'public/icon-512.png',
    'assets/favicon.png',
  ]) {
    const bytes = fs.readFileSync(path.join(root, pngRel));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${pngRel} must have PNG header`);
  }

  for (const relPath of [
    'src/services/localPrefsStorage.ts',
    'src/services/locationClient.ts',
    'src/state/useLocationSearchController.ts',
    'src/features/overlays/SpotSearchResults.tsx',
    'src/features/overlays/SpotsOverlay.tsx',
    'src/features/shells/MobileShell.tsx',
    'src/features/shells/DesktopShell.tsx',
    'src/features/navigation/DesktopHeader.tsx',
  ]) {
    const src = readSrc(relPath);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(src), `${relPath} must not hardcode hex colors`);
    assert.ok(src.split('\n').length <= 300, `${relPath} must stay <= 300 lines`);
  }
});
