// Preview only (branch feature/palette-mobile): regenerates src/styles/tokens.generated.css with the
// mobile app's palette. The token source is design_system (React)'s packages/tokens (read-only from
// here), so this copies it to a temp dir, overrides the tokens below in its JSON sources, and runs
// its own style-dictionary build.
//
//   node scripts/palette-mobile.mjs <path to design_system/packages/tokens>
//
// The tokens package must have its dependencies installed (npm install there).
import { cp, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Keys are full token paths: bridges (semantic layer, component tokens alias them and follow) or
// index.* component tokens, for the few components whose token doesn't go through the bridge we change.
// ADDED tokens don't exist in the source yet; they're created next to their siblings.
const PALETTE = {
  'bridges.color.background.canvas': '#162D65',
  'bridges.color.surface.nav-bg': '#162D65',
  'bridges.color.surface.primary-default': '#166DFF',
  'bridges.color.surface.primary-hover': '#0058EC',
  'bridges.color.surface.primary-pressed': '#003DA5',
  'bridges.color.surface.success-default': '#038670',
  'bridges.color.surface.success-hover': '#026D5B',
  'bridges.color.surface.success-pressed': '#025446',
  'bridges.color.surface.danger-default': '#D24351',
  'bridges.color.surface.danger-hover': '#CB3140',
  'bridges.color.surface.danger-pressed': '#B62C39',
  'bridges.color.surface.warning-default': '#FF7300',
  'bridges.color.surface.warning-hover': '#E06500',
  'bridges.color.surface.warning-pressed': '#C75A00',
  'bridges.color.surface.selected': '#CCE1FF',
  'bridges.color.text.primary': '#1F2937',
  'bridges.color.text.secondary': '#6B7280',
  'bridges.color.text.action': '#166DFF',
  'bridges.color.text.on-primary': '#FFFFFF',
  'bridges.color.text.on-success': '#FFFFFF',
  'bridges.color.text.on-danger': '#FFFFFF',
  'bridges.color.text.on-warning': '#FFFFFF',
  'bridges.color.text.on-info': '#FFFFFF',
  'bridges.color.icon.on-primary': '#FFFFFF',
  'bridges.color.text.success': '#026F5D',
  'bridges.color.text.danger': '#AD3743',
  'bridges.color.text.warning': '#A64B00',
  'bridges.color.icon.action': '#166DFF',
  'bridges.color.icon.success': '#038D76',
  'bridges.color.icon.danger': '#ED4C5C',
  'bridges.color.icon.warning': '#FF7300',
  'bridges.color.border.focus': '#166DFF',
  'bridges.color.border.danger': '#ED4C5C',
  'bridges.color.border.tertiary': '#D1D5DB',
  'bridges.color.accent.green-bg': '#038D763D',
  'bridges.color.accent.green-text': '#026F5D',
  'bridges.color.accent.amber-bg': '#FF73003D',
  'bridges.color.accent.amber-text': '#A64B00',
  'bridges.color.accent.red-bg': '#ED4C5C3D',
  'bridges.color.accent.red-text': '#AD3743',
  'bridges.color.accent.blue-bg': '#166DFF3D',
  'bridges.color.accent.blue-text': '#0052DD',
  'bridges.color.accent.indigo-bg': '#7C4DFF3D',
  'bridges.color.accent.indigo-text': '#6841D6',
  'bridges.color.accent.lime-bg': '#E8FF8C',
  'bridges.color.accent.lime-text': '#537800',

  // SideNavigation (aliases surface.neutral-inverse-dark), selected item: white 12 %, lime icon.
  'index.navigation.sidenavigation.nav-bg': '#162D65',
  'index.navigation.sidenavigation.item-bg-hover': '#FFFFFF0F',
  'index.navigation.sidenavigation.item-bg-selected': '#FFFFFF1F',
  'index.navigation.sidenavigation.item-text-selected': '#FFFFFF',
  'index.navigation.sidenavigation.item-icon-selected': '#E8FF8C',
  // Enterprise selector in the header: white 12 % fill, white 24 % outline (token added below).
  'index.selection.select.enterprise-bg': '#FFFFFF1F',
  'index.selection.select.enterprise-border': '#FFFFFF3D',
  'index.selection.select.enterprise-meta-color': '#B2B9C4',
  // Dark text on the lime and warning fills (white is under 3:1 there).
  'index.feedback.badge.text-primary': '#1F2937',
  'index.feedback.badge.text-warning': '#1F2937',
  'index.feedback.message.text-on-warning': '#1F2937',
  'index.feedback.progressbar.fill-text-on-warning': '#1F2937',
  // Avatar solid uses the soft background as its text color: make it opaque (same render on white).
  'index.social.avatar.blue-bg': '#C7DCFF',
  'index.social.avatar.green-bg': '#C3E4DE',
  // Badge success: tinted like the tags instead of lime.
  'index.feedback.badge.bg-2': '#038D763D',
  'index.feedback.badge.text-success': '#026F5D',
  // Tooltip message: opaque equivalent of the 24 % tint over white.
  'index.feedback.tooltip.msg-bg-success': '#C3E4DE',
  'index.feedback.tooltip.msg-bg-error': '#FBD4D8',
  'index.feedback.tooltip.msg-bg-warning': '#FFDEC2',
  'index.feedback.tooltip.msg-bg-info': '#C7DCFF',
  // Backgrounds and borders that alias accent.*-text: keep them on the mobile color, only text darkens.
  'index.feedback.badge.bg-1': '#7FB800',
  'index.feedback.badge.bg-3': '#FF7300',
  'index.feedback.badge.bg-4': '#D24351',
  'index.input.uploadfile.zone-border-warning': '#FF7300',
  'index.conteneur.accordion.header-stroke-warning': '#FF7300',
  'index.selection.select.field-stroke-warning': '#FF7300',
};
const ADDED = new Set(['index.selection.select.enterprise-border', 'index.feedback.message.text-on-warning', 'index.feedback.progressbar.fill-text-on-warning']);

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
  const files = [join(work, 'tokens/bridges.json'), ...(await readdir(join(work, 'tokens/components'))).map((f) => join(work, 'tokens/components', f))];
  const trees = await Promise.all(files.map(async (f) => JSON.parse(await readFile(f, 'utf8'))));
  for (const [path, value] of Object.entries(PALETTE)) {
    const keys = path.split('.');
    if (ADDED.has(path)) {
      const parent = trees.map((tree) => keys.slice(0, -1).reduce((node, key) => node?.[key], tree)).find(Boolean);
      parent[keys.at(-1)] = { value, type: 'COLOR' };
      continue;
    }
    const token = trees.map((tree) => keys.reduce((node, key) => node?.[key], tree)).find((t) => t?.value);
    if (!token) throw new Error(`Unknown token: ${path}`);
    token.value = value;
  }
  await Promise.all(files.map((f, i) => writeFile(f, JSON.stringify(trees[i], null, 2))));
  execFileSync('npx', ['style-dictionary', 'build', '--config', 'style-dictionary.config.js'], { cwd: work, stdio: 'inherit' });
  await cp(join(work, 'dist/css/variables.css'), output);
  console.log(`tokens.generated.css regenerated with ${Object.keys(PALETTE).length} mobile palette overrides`);
} finally {
  await rm(work, { recursive: true, force: true });
}
