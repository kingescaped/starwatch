import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const envVal = process.env.EXPO_WEB_BASE_URL;
const rawBase = (envVal === undefined ? '/starwatch' : envVal).trim();
const cleaned = rawBase.replace(/^\/+|\/+$/g, '');
const baseUrl = cleaned ? `/${cleaned}` : '';

const expoCli = require.resolve('expo/bin/cli');
const result = spawnSync(process.execPath, [expoCli, 'export', '--platform', 'web'], {
  stdio: 'inherit',
  env: { ...process.env, EXPO_WEB_BASE_URL: baseUrl },
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
if ((result.status ?? 1) !== 0) {
  process.exit(result.status ?? 1);
}

const distDir = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error(`Missing exported index.html at ${indexPath}`);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');
if (baseUrl) {
  for (const asset of ['favicon.svg', 'favicon-32x32.png', 'apple-touch-icon.png', 'manifest.webmanifest']) {
    html = html.replaceAll(`./${asset}`, `${baseUrl}/${asset}`);
  }
  fs.writeFileSync(indexPath, html, 'utf8');

  const manifestPath = path.join(distDir, 'manifest.webmanifest');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.start_url = `${baseUrl}/`;
    manifest.scope = `${baseUrl}/`;
    if (Array.isArray(manifest.icons)) {
      manifest.icons = manifest.icons.map((item) => ({
        ...item,
        src: String(item.src || '').replace(/^\.\//, `${baseUrl}/`),
      }));
    }
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }
}

fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
fs.copyFileSync(indexPath, path.join(distDir, '404.html'));

const requiredSnippets = [
  `${baseUrl}/_expo/`,
  `${baseUrl}/favicon.svg`,
  `${baseUrl}/apple-touch-icon.png`,
  'viewport-fit=cover',
  'maximum-scale=1',
];

for (const snippet of requiredSnippets) {
  if (!html.includes(snippet)) {
    console.error(`Expected "${snippet}" inside ${indexPath}`);
    process.exit(1);
  }
}

console.log(`PAGES_EXPORT_READY baseUrl=${baseUrl || '/'} path=${distDir}`);
