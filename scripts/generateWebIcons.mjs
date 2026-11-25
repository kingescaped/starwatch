import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = process.cwd();
const SVG_VIEW = 64;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function cubicBezier(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return [
    mt2 * mt * p0[0] + 3 * mt2 * t * p1[0] + 3 * mt * t2 * p2[0] + t2 * t * p3[0],
    mt2 * mt * p0[1] + 3 * mt2 * t * p1[1] + 3 * mt * t2 * p2[1] + t2 * t * p3[1],
  ];
}

function buildSparklePolyline() {
  const segs = [
    [[32, 14.5], [34, 25.5], [38.5, 30], [49.5, 32]],
    [[49.5, 32], [38.5, 34], [34, 38.5], [32, 49.5]],
    [[32, 49.5], [30, 38.5], [25.5, 34], [14.5, 32]],
    [[14.5, 32], [25.5, 30], [30, 25.5], [32, 14.5]],
  ];
  const pts = [];
  const steps = 64;
  for (const [p0, p1, p2, p3] of segs) {
    for (let i = 0; i < steps; i += 1) pts.push(cubicBezier(p0, p1, p2, p3, i / steps));
  }
  return pts;
}

const SPARKLE_PTS = buildSparklePolyline();

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function minDistToSparkle(x, y) {
  let best = 999;
  for (let i = 0; i < SPARKLE_PTS.length; i += 1) {
    const a = SPARKLE_PTS[i];
    const b = SPARKLE_PTS[(i + 1) % SPARKLE_PTS.length];
    const d = distToSegment(x, y, a[0], a[1], b[0], b[1]);
    if (d < best) best = d;
  }
  return best;
}

function sampleGradient(u, v) {
  const t = Math.max(0, Math.min(1, (u + v) * 0.5));
  const c0 = [99, 102, 241];
  const c1 = [168, 85, 247];
  const c2 = [6, 182, 212];
  if (t <= 0.52) {
    const k = t / 0.52;
    return [c0[0] + (c1[0] - c0[0]) * k, c0[1] + (c1[1] - c0[1]) * k, c0[2] + (c1[2] - c0[2]) * k];
  }
  const k = (t - 0.52) / 0.48;
  return [c1[0] + (c2[0] - c1[0]) * k, c1[1] + (c2[1] - c1[1]) * k, c1[2] + (c2[2] - c1[2]) * k];
}

function roundedRectSdf(x, y, half, rx) {
  const qx = Math.abs(x - 32) - (half - rx);
  const qy = Math.abs(y - 32) - (half - rx);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - rx;
}

function renderIconRgba(size, { rounded }) {
  const rgba = Buffer.alloc(size * size * 4);
  const sub = 4;
  const invSub2 = 1 / (sub * sub);
  const aaWidth = SVG_VIEW / size / sub + 0.35;

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let accR = 0;
      let accG = 0;
      let accB = 0;
      let accA = 0;
      for (let sy = 0; sy < sub; sy += 1) {
        for (let sx = 0; sx < sub; sx += 1) {
          const x = ((px + (sx + 0.5) / sub) / size) * SVG_VIEW;
          const y = ((py + (sy + 0.5) / sub) / size) * SVG_VIEW;
          let bgA = 1;
          if (rounded) {
            const sd = roundedRectSdf(x, y, 32, 16);
            bgA = Math.max(0, Math.min(1, 0.5 - sd / aaWidth));
          }
          if (bgA <= 0) continue;

          const [gr, gg, gb] = sampleGradient(x / SVG_VIEW, y / SVG_VIEW);
          const strokeDist = minDistToSparkle(x, y) - 1.9;
          const dStar = 0.5 - strokeDist / aaWidth;
          const dDot1 = 0.5 - (Math.hypot(x - 48.5, y - 17.5) - 2.8) / aaWidth;
          const dDot2 = 0.5 - (Math.hypot(x - 16.5, y - 47.5) - 2.3) / aaWidth;
          const whiteMask = Math.max(0, Math.min(1, Math.max(dStar, dDot1, dDot2 * 0.92)));

          const r = gr + (255 - gr) * whiteMask;
          const g = gg + (255 - gg) * whiteMask;
          const b = gb + (255 - gb) * whiteMask;
          accR += r * bgA;
          accG += g * bgA;
          accB += b * bgA;
          accA += bgA;
        }
      }
      const idx = (py * size + px) * 4;
      const aNorm = accA * invSub2;
      if (aNorm > 0) {
        rgba[idx] = Math.round(accR / accA);
        rgba[idx + 1] = Math.round(accG / accA);
        rgba[idx + 2] = Math.round(accB / accA);
        rgba[idx + 3] = Math.round(aNorm * 255);
      }
    }
  }
  return rgba;
}

const TARGETS = [
  { outPath: 'public/favicon-32x32.png', size: 32, rounded: true },
  { outPath: 'public/apple-touch-icon.png', size: 180, rounded: false },
  { outPath: 'public/icon-192.png', size: 192, rounded: true },
  { outPath: 'public/icon-512.png', size: 512, rounded: true },
  { outPath: 'assets/favicon.png', size: 48, rounded: true },
];

for (const target of TARGETS) {
  const fullPath = path.join(ROOT, target.outPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  const rgba = renderIconRgba(target.size, { rounded: target.rounded });
  fs.writeFileSync(fullPath, encodePng(target.size, target.size, rgba));
  console.log(`Generated ${target.outPath} (${target.size}x${target.size})`);
}
