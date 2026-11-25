import * as THREE from 'three';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export function polarToVector3(altDeg: number, azDeg: number, radius: number): THREE.Vector3 {
  const alt = altDeg * DEG2RAD;
  const az = azDeg * DEG2RAD;
  return new THREE.Vector3(
    radius * Math.cos(alt) * Math.sin(az),
    radius * Math.sin(alt),
    -radius * Math.cos(alt) * Math.cos(az)
  );
}

export function equatorialToHorizontal(latDeg: number, lstDeg: number, raHours: number, decDeg: number) {
  const lat = latDeg * DEG2RAD;
  const dec = decDeg * DEG2RAD;
  const ha = (lstDeg - raHours * 15) * DEG2RAD;
  const sinAlt = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(ha);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const cosAz = (Math.sin(dec) - Math.sin(lat) * Math.sin(alt)) / Math.max(1e-5, Math.cos(lat) * Math.cos(alt));
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz)));
  if (Math.sin(ha) > 0) az = 2 * Math.PI - az;
  return { altDeg: alt * RAD2DEG, azDeg: az * RAD2DEG };
}

export interface ProminentStarDef {
  id: string;
  label: string;
  raHours: number;
  decDeg: number;
  color: string;
  size: number;
}

export const PROMINENT_STARS: ProminentStarDef[] = [
  { id: 'antares', label: 'Antares', raHours: 16.49, decDeg: -26.43, color: '#FB923C', size: 0.16 },
  { id: 'shaula', label: 'Shaula', raHours: 17.56, decDeg: -37.1, color: '#93C5FD', size: 0.1 },
  { id: 'graffias', label: 'Graffias', raHours: 16.09, decDeg: -19.8, color: '#BAE6FD', size: 0.09 },
  { id: 'vega', label: 'Vega', raHours: 18.62, decDeg: 38.78, color: '#FFFFFF', size: 0.15 },
  { id: 'altair', label: 'Altair', raHours: 19.85, decDeg: 8.87, color: '#F8FAFC', size: 0.13 },
  { id: 'deneb', label: 'Deneb', raHours: 20.69, decDeg: 45.28, color: '#BAE6FD', size: 0.12 },
  { id: 'sirius', label: 'Sirius', raHours: 6.75, decDeg: -16.72, color: '#FFFFFF', size: 0.16 },
  { id: 'rigel', label: 'Rigel', raHours: 5.24, decDeg: -8.2, color: '#93C5FD', size: 0.13 },
  { id: 'betelgeuse', label: 'Betelgeuse', raHours: 5.92, decDeg: 7.41, color: '#EF4444', size: 0.13 },
  { id: 'bellatrix', label: 'Bellatrix', raHours: 5.42, decDeg: 6.35, color: '#BAE6FD', size: 0.09 },
  { id: 'alnilam', label: 'Alnilam', raHours: 5.6, decDeg: -1.2, color: '#C7D2FE', size: 0.09 },
  { id: 'polaris', label: 'Polaris', raHours: 2.53, decDeg: 89.26, color: '#FEF08A', size: 0.11 },
  { id: 'canopus', label: 'Canopus', raHours: 6.4, decDeg: -52.7, color: '#FEF9C3', size: 0.14 },
  { id: 'arcturus', label: 'Arcturus', raHours: 14.26, decDeg: 19.18, color: '#FBBF24', size: 0.14 },
];

export const CONSTELLATION_PAIRS: [string, string][] = [
  ['graffias', 'antares'],
  ['antares', 'shaula'],
  ['vega', 'altair'],
  ['altair', 'deneb'],
  ['deneb', 'vega'],
  ['betelgeuse', 'bellatrix'],
  ['bellatrix', 'alnilam'],
  ['alnilam', 'rigel'],
  ['betelgeuse', 'alnilam'],
];

export function generateBackgroundStars(count: number, minR: number, maxR: number) {
  const palette = ['#FFFFFF', '#93C5FD', '#C7D2FE', '#FEF08A', '#FB923C'];
  const out: { pos: THREE.Vector3; size: number; color: string; phase: number }[] = [];
  for (let i = 0; i < count; i++) {
    const u = ((i * 0.61803398875) % 1) * 2 - 1;
    const theta = i * 2.399963229728653;
    const sinPhi = Math.sqrt(Math.max(0, 1 - u * u));
    const r = minR + ((i * 17) % 100) / 100 * (maxR - minR);
    out.push({
      pos: new THREE.Vector3(r * sinPhi * Math.cos(theta), r * u, r * sinPhi * Math.sin(theta)),
      size: 0.03 + ((i % 7) * 0.008),
      color: palette[i % palette.length],
      phase: (i * 1.13) % (Math.PI * 2),
    });
  }
  return out;
}

export function createStarShaderMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uZoom: { value: 1.0 } },
    vertexShader: `
      attribute float aSize;
      attribute vec3 aColor;
      attribute float aPhase;
      attribute float aSpikes;
      varying vec3 vColor;
      varying float vPhase;
      varying float vSpikes;
      uniform float uZoom;
      void main() {
        vColor = aColor; vPhase = aPhase; vSpikes = aSpikes;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(aSize * (250.0 / max(0.3, -mv.z)) * uZoom, 1.5, 42.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vColor;
      varying float vPhase;
      varying float vSpikes;
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float r = length(p);
        if (r > 1.0) discard;
        float core = exp(-r * r * 14.0);
        float halo = exp(-r * r * 4.0);
        float spikeH = exp(-abs(p.y) * 32.0) * exp(-abs(p.x) * 1.6);
        float spikeV = exp(-abs(p.x) * 32.0) * exp(-abs(p.y) * 1.6);
        float spikes = (spikeH + spikeV) * vSpikes * 0.9;
        float twinkle = 0.76 + 0.24 * sin(uTime * 3.4 + vPhase);
        vec3 col = mix(vColor, vec3(1.0), core * 0.92);
        gl_FragColor = vec4(col, clamp(core + halo * 0.72 + spikes, 0.0, 1.0) * twinkle);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}
