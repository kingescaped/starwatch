import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';

const root = process.cwd();
const outfile = path.join(root, 'dist-worker', 'worker.mjs');

await build({
  entryPoints: [path.join(root, 'server', 'src', 'worker', 'index.ts')],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  conditions: ['worker', 'browser', 'import'],
  target: 'es2022',
  minify: true,
  outfile,
});

const bundled = fs.readFileSync(outfile, 'utf8');
if (bundled.includes('node:fs') || bundled.includes('node:http')) {
  throw new Error('Worker bundle must not reference node:fs or node:http');
}
console.log(`WORKER_BUNDLE_READY ${outfile} (${Buffer.byteLength(bundled, 'utf8')} bytes)`);
