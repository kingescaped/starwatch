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

fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
fs.copyFileSync(indexPath, path.join(distDir, '404.html'));

const html = fs.readFileSync(indexPath, 'utf8');
const expectedPrefix = `${baseUrl}/_expo/`;
if (!html.includes(expectedPrefix)) {
  console.error(`Expected "${expectedPrefix}" asset paths inside ${indexPath}`);
  process.exit(1);
}

console.log(`PAGES_EXPORT_READY baseUrl=${baseUrl || '/'} path=${distDir}`);
