// Preview only (branch feature/palette-mobile): regenerates src/styles/tokens.generated.css with the
// mobile app's palette. The token source is design_system (React)'s packages/tokens (read-only from
// here), so this copies it to a temp dir, overrides a few bridge tokens in tokens/bridges.json, and
// runs its own style-dictionary build. Component tokens alias the bridges, so they follow.
//
//   node scripts/palette-mobile.mjs <path to design_system/packages/tokens>
//
// The tokens package must have its dependencies installed (npm install there).
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PALETTE = {
  'background.canvas': '#162D65',
  'surface.nav-bg': '#162D65',
  'surface.primary-default': '#166DFF',
  'surface.primary-pressed': '#003DA5',
  'surface.success-default': '#038D76',
  'surface.danger-default': '#ED4C5C',
  'surface.warning-default': '#FF7300',
  'surface.selected': '#CCE1FF',
  'text.primary': '#1F2937',
  'text.secondary': '#6B7280',
  'text.action': '#166DFF',
  'text.success': '#038D76',
  'text.danger': '#ED4C5C',
  'text.warning': '#FF7300',
  'icon.success': '#038D76',
  'icon.danger': '#ED4C5C',
  'icon.warning': '#FF7300',
  'border.focus': '#166DFF',
  'border.tertiary': '#D1D5DB',
  'accent.green-bg': '#038D763D',
  'accent.green-text': '#038D76',
  'accent.amber-bg': '#FF73003D',
  'accent.amber-text': '#FF7300',
  'accent.red-bg': '#ED4C5C3D',
  'accent.red-text': '#ED4C5C',
  'accent.blue-bg': '#166DFF3D',
  'accent.blue-text': '#166DFF',
  'accent.indigo-bg': '#7C4DFF3D',
  'accent.indigo-text': '#7C4DFF',
  'accent.lime-bg': '#E8FF8C',
};

const source = process.argv[2];
if (!source) {
  console.error('Usage: node scripts/palette-mobile.mjs <path to design_system/packages/tokens>');
  process.exit(1);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'angular-components/src/styles/tokens.generated.css');

const work = await mkdtemp(join(tmpdir(), 'tokens-'));
try {
  await cp(resolve(source), work, { recursive: true, filter: (p) => !p.includes(`${join(source, 'dist')}`) });
  const bridgesPath = join(work, 'tokens/bridges.json');
  const bridges = JSON.parse(await readFile(bridgesPath, 'utf8'));
  for (const [path, value] of Object.entries(PALETTE)) {
    const token = path.split('.').reduce((node, key) => node?.[key], bridges.bridges.color);
    if (!token?.value) throw new Error(`Unknown bridge token: color.${path}`);
    token.value = value;
  }
  await writeFile(bridgesPath, JSON.stringify(bridges, null, 2));
  execFileSync('npx', ['style-dictionary', 'build', '--config', 'style-dictionary.config.js'], { cwd: work, stdio: 'inherit' });
  await cp(join(work, 'dist/css/variables.css'), output);
  console.log(`tokens.generated.css regenerated with ${Object.keys(PALETTE).length} mobile palette overrides`);
} finally {
  await rm(work, { recursive: true, force: true });
}
