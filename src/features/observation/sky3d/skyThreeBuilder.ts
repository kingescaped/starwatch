import * as THREE from 'three';
import type { SkySceneData } from '../../../state/types';
import {
  CONSTELLATION_PAIRS,
  createStarShaderMaterial,
  equatorialToHorizontal,
  generateBackgroundStars,
  polarToVector3,
  PROMINENT_STARS,
} from './astronomy3d';

export interface ProjectedAnchor {
  id: string;
  label: string;
  color: string;
  worldPos: THREE.Vector3;
}

function makeCircleRing(radius: number, color: number, opacity: number, plane: 'xz' | 'xy' | 'yz' = 'xz'): THREE.Line {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    if (plane === 'xz') pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    else if (plane === 'xy') pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
    else pts.push(new THREE.Vector3(0, Math.cos(a) * radius, Math.sin(a) * radius));
  }
  const geom = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.Line(geom, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}

function makeDot(pos: THREE.Vector3, radius: number, color: number): THREE.Mesh {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 16, 16),
    new THREE.MeshBasicMaterial({ color })
  );
  m.position.copy(pos);
  return m;
}

function buildStarsPoints(stars: { pos: THREE.Vector3; size: number; color: string; phase: number; spikes: number }[], mat: THREE.ShaderMaterial) {
  const n = stars.length;
  const posArr = new Float32Array(n * 3);
  const colArr = new Float32Array(n * 3);
  const sizeArr = new Float32Array(n);
  const phaseArr = new Float32Array(n);
  const spikeArr = new Float32Array(n);
  stars.forEach((s, i) => {
    posArr[i * 3] = s.pos.x; posArr[i * 3 + 1] = s.pos.y; posArr[i * 3 + 2] = s.pos.z;
    const c = new THREE.Color(s.color);
    colArr[i * 3] = c.r; colArr[i * 3 + 1] = c.g; colArr[i * 3 + 2] = c.b;
    sizeArr[i] = s.size; phaseArr[i] = s.phase; spikeArr[i] = s.spikes;
  });
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  geom.setAttribute('aColor', new THREE.BufferAttribute(colArr, 3));
  geom.setAttribute('aSize', new THREE.BufferAttribute(sizeArr, 1));
  geom.setAttribute('aPhase', new THREE.BufferAttribute(phaseArr, 1));
  geom.setAttribute('aSpikes', new THREE.BufferAttribute(spikeArr, 1));
  return new THREE.Points(geom, mat);
}

function buildMilkyWayBand(points: THREE.Vector3[], radius: number, colorHex: number, opacity: number): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points);
  const geom = new THREE.TubeGeometry(curve, 64, radius, 12, false);
  return new THREE.Mesh(
    geom,
    new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })
  );
}

function buildSaturnMesh(pos: THREE.Vector3): THREE.Group {
  const g = new THREE.Group();
  g.position.copy(pos);
  g.add(makeDot(new THREE.Vector3(0, 0, 0), 0.055, 0xfbbf24));
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.08, 0.135, 32),
    new THREE.MeshBasicMaterial({ color: 0xfde047, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
  );
  ring.rotation.x = Math.PI * 0.36;
  ring.rotation.y = 0.4;
  g.add(ring);
  return g;
}

function buildMoonMesh(pos: THREE.Vector3): THREE.Group {
  const g = new THREE.Group();
  g.position.copy(pos);
  g.add(makeDot(new THREE.Vector3(0, 0, 0), 0.06, 0xcbd5e1));
  const halo = makeCircleRing(0.11, 0x94a3b8, 0.38, 'xy');
  g.add(halo);
  return g;
}

export function buildSkySceneGroup(
  mode: 'ground3d' | 'sphere3d',
  skyScene: SkySceneData,
  targetShortName: string,
  isRedTheme: boolean
): { group: THREE.Group; starMat: THREE.ShaderMaterial; anchors: ProjectedAnchor[] } {
  const group = new THREE.Group();
  const starMat = createStarShaderMaterial();
  const anchors: ProjectedAnchor[] = [];
  const accentCyan = isRedTheme ? 0xef4444 : 0x38bdf8;
  const accentViolet = isRedTheme ? 0xf87171 : 0x818cf8;

  if (mode === 'ground3d') {
    // Horizon base concentric rings
    group.add(makeCircleRing(2.15, accentCyan, 0.85, 'xz'));
    group.add(makeCircleRing(1.5, accentCyan, 0.32, 'xz'));
    group.add(makeCircleRing(0.85, accentCyan, 0.22, 'xz'));
    group.add(makeCircleRing(2.15, accentViolet, 0.18, 'xy'));
    group.add(makeCircleRing(2.15, accentViolet, 0.16, 'yz'));
    group.add(makeDot(new THREE.Vector3(0, 0, 0), 0.045, accentCyan));

    const nPos = new THREE.Vector3(0, 0, -2.15);
    const sPos = new THREE.Vector3(0, 0, 2.15);
    const ePos = new THREE.Vector3(2.15, 0, 0);
    const wPos = new THREE.Vector3(-2.15, 0, 0);
    group.add(makeDot(nPos, 0.05, 0xef4444), makeDot(sPos, 0.05, 0xef4444), makeDot(ePos, 0.05, 0x10b981), makeDot(wPos, 0.05, 0xfbbf24));
    anchors.push(
      { id: 'north', label: 'BẮC 0°', color: '#F87171', worldPos: nPos.clone().add(new THREE.Vector3(0, 0.14, 0)) },
      { id: 'east', label: 'ĐÔNG', color: '#34D399', worldPos: ePos.clone().add(new THREE.Vector3(0, 0.14, 0)) },
      { id: 'west', label: 'TÂY', color: '#FBBF24', worldPos: wPos.clone().add(new THREE.Vector3(0, 0.14, 0)) }
    );

    // Milky Way ribbon arching across sky
    const mwPts = [
      new THREE.Vector3(-1.85, 0.18, -0.45),
      new THREE.Vector3(-0.75, 0.92, -1.25),
      new THREE.Vector3(0.42, 1.32, -1.45),
      new THREE.Vector3(1.55, 1.65, -0.85),
    ];
    group.add(buildMilkyWayBand(mwPts, 0.16, isRedTheme ? 0xb91c1c : 0x6366f1, 0.24));
    group.add(buildMilkyWayBand(mwPts, 0.08, accentCyan, 0.18));

    // Prominent stars & constellations
    const skyStars: { pos: THREE.Vector3; size: number; color: string; phase: number; spikes: number }[] = [];
    const posMap = new Map<string, THREE.Vector3>();
    for (const s of PROMINENT_STARS) {
      const horiz = equatorialToHorizontal(skyScene.latDeg, skyScene.lstDeg, s.raHours, s.decDeg);
      const v = polarToVector3(Math.max(4, Math.abs(horiz.altDeg) * 0.8 + 8), horiz.azDeg, 2.25);
      posMap.set(s.id, v);
      skyStars.push({ pos: v, size: s.size, color: s.color, phase: skyStars.length * 0.9, spikes: 1.0 });
      if (s.id === 'antares') {
        anchors.push({ id: 'antares', label: 'Antares', color: '#FBBF24', worldPos: v.clone().add(new THREE.Vector3(0.08, 0.08, 0)) });
      }
    }
    const bgStars = generateBackgroundStars(320, 2.2, 3.6).map((st) => ({ ...st, pos: st.pos.clone().setY(Math.abs(st.pos.y) + 0.1), spikes: 0 }));
    group.add(buildStarsPoints([...skyStars, ...bgStars], starMat));

    const edgePts: THREE.Vector3[] = [];
    for (const [a, b] of CONSTELLATION_PAIRS) {
      const p1 = posMap.get(a); const p2 = posMap.get(b);
      if (p1 && p2) edgePts.push(p1, p2);
    }
    if (edgePts.length) {
      group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(edgePts), new THREE.LineBasicMaterial({ color: accentViolet, transparent: true, opacity: 0.45 })));
    }

    // Active Target + dashed ray from center
    const targetPos = new THREE.Vector3(0.32, Math.max(0.95, Math.min(1.52, 0.92 + Math.max(0, skyScene.targetAlt) / 80)), -1.18);
    group.add(makeDot(targetPos, 0.06, 0xc4b5fd));
    group.add(makeCircleRing(0.14, 0xc084fc, 0.75, 'xy').translateX(targetPos.x).translateY(targetPos.y).translateZ(targetPos.z));
    const dashLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), targetPos]),
      new THREE.LineDashedMaterial({ color: accentViolet, dashSize: 0.08, gapSize: 0.06, transparent: true, opacity: 0.85 })
    );
    dashLine.computeLineDistances();
    group.add(dashLine);

    const saturnPos = new THREE.Vector3(1.22, 1.48, -0.95);
    const moonPos = new THREE.Vector3(-1.62, 0.92, -0.78);
    group.add(buildSaturnMesh(saturnPos), buildMoonMesh(moonPos));

    const shortLabel = targetShortName.includes('Ngân Hà') ? 'Sgr A*' : targetShortName;
    const targetAltStr = skyScene.targetAlt >= 0 ? `+${skyScene.targetAlt}°` : `${skyScene.targetAlt}°`;
    anchors.push(
      { id: 'target', label: `${shortLabel} ${targetAltStr}`, color: '#E2E8F0', worldPos: targetPos.clone().add(new THREE.Vector3(0.14, 0.08, 0)) },
      { id: 'saturn', label: 'Sao Thổ', color: '#FBBF24', worldPos: saturnPos.clone().add(new THREE.Vector3(0.14, 0.06, 0)) },
      { id: 'moon', label: `Trăng ${skyScene.moonIllum}%`, color: '#CBD5E1', worldPos: moonPos.clone().add(new THREE.Vector3(-0.08, -0.18, 0)) }
    );
  } else {
    // sphere3d: Celestial 360° Orbital Sphere
    const R = 1.25;
    group.add(makeCircleRing(R, accentCyan, 0.9, 'xz'));
    group.add(makeCircleRing(R, accentCyan, 0.28, 'xy'));
    group.add(makeCircleRing(R, accentCyan, 0.28, 'yz'));
    const latUpper = makeCircleRing(R * 0.72, accentCyan, 0.2, 'xz');
    latUpper.position.y = R * 0.68;
    const latLower = makeCircleRing(R * 0.72, accentCyan, 0.2, 'xz');
    latLower.position.y = -R * 0.68;
    group.add(latUpper, latLower);

    // Axis & Zenith / Nadir
    const zenith = new THREE.Vector3(0, R, 0);
    const nadir = new THREE.Vector3(0, -R, 0);
    const axis = new THREE.Line(new THREE.BufferGeometry().setFromPoints([nadir, zenith]), new THREE.LineDashedMaterial({ color: accentViolet, dashSize: 0.07, gapSize: 0.05, transparent: true, opacity: 0.6 }));
    axis.computeLineDistances();
    group.add(axis, makeDot(zenith, 0.045, 0xa855f7), makeDot(nadir, 0.045, 0xa855f7), makeDot(new THREE.Vector3(0, 0, 0), 0.045, accentCyan));
    group.add(
      makeDot(new THREE.Vector3(-R, 0, 0), 0.045, 0xfbbf24),
      makeDot(new THREE.Vector3(R, 0, 0), 0.045, 0x10b981),
      makeDot(new THREE.Vector3(0, 0, -R * 0.5), 0.04, 0xef4444),
      makeDot(new THREE.Vector3(0, 0, R * 0.5), 0.04, 0xef4444)
    );

    const mwOrb = buildMilkyWayBand([
      new THREE.Vector3(-0.98, 0.28, 0.22),
      new THREE.Vector3(-0.25, 0.68, -0.35),
      new THREE.Vector3(0.65, 0.45, -0.55),
      new THREE.Vector3(1.02, -0.18, 0.2),
    ], 0.11, accentCyan, 0.22);
    group.add(mwOrb);

    const tPos = new THREE.Vector3(0.62, 0.56, 0.22);
    group.add(makeDot(tPos, 0.055, 0xf8fafc));
    group.add(makeCircleRing(0.14, 0xc084fc, 0.85, 'xy').translateX(tPos.x).translateY(tPos.y).translateZ(tPos.z));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), tPos]), new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.9 })));

    // Sun exterior bottom-left + Moon exterior right
    const sunPos = new THREE.Vector3(-2.1, -0.45, 0.1);
    const sunGroup = new THREE.Group();
    sunGroup.position.copy(sunPos);
    sunGroup.add(makeDot(new THREE.Vector3(0, 0, 0), 0.13, 0xfef08a));
    sunGroup.add(makeDot(new THREE.Vector3(0, 0, 0), 0.22, 0xf59e0b));
    (sunGroup.children[1] as THREE.Mesh).material = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.3 });
    const sunRing = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.2, 32), new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: 0.55 }));
    sunRing.rotation.x = Math.PI * 0.4;
    sunGroup.add(sunRing);
    const moonPos = new THREE.Vector3(2.05, 0.35, -0.1);
    group.add(sunGroup, buildMoonMesh(moonPos));

    const bgStars = generateBackgroundStars(360, 2.4, 5.2).map((st) => ({ ...st, spikes: 0.12 }));
    group.add(buildStarsPoints(bgStars, starMat));

    const shortLabel = targetShortName.includes('Ngân Hà') ? 'Sgr A*' : targetShortName;
    anchors.push(
      { id: 'zenith', label: '+90° Thiên đỉnh', color: '#A5B4FC', worldPos: zenith.clone().add(new THREE.Vector3(0.06, 0.14, 0)) },
      { id: 'nadir', label: '-90° Thiên đế', color: '#A5B4FC', worldPos: nadir.clone().add(new THREE.Vector3(0.06, -0.16, 0)) },
      { id: 'target', label: shortLabel, color: '#F8FAFC', worldPos: tPos.clone().add(new THREE.Vector3(0.16, 0.08, 0)) },
      { id: 'sun', label: 'Mặt Trời', color: '#FBBF24', worldPos: sunPos.clone().add(new THREE.Vector3(0, -0.34, 0)) },
      { id: 'moon', label: `Trăng ${skyScene.moonIllum}%`, color: '#CBD5E1', worldPos: moonPos.clone().add(new THREE.Vector3(0, 0.22, 0)) }
    );
  }

  return { group, starMat, anchors };
}
