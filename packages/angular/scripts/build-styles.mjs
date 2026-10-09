// Compiles src/styles/tailwind-entry.css (Tailwind v4 utilities for every component, design tokens,
// self-hosted fonts) into ONE stylesheet shipped next to the library: dist/angular-components/styles.css.
// Consumers import it once (like design_system React's dist/index.css) instead of every component
// carrying its own full copy of Tailwind through a per-component `styleUrl` (that made the published
// package ~35MB, with the base64 fonts duplicated 40+ times).
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { transform } from 'lightningcss';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const input = resolve(root, 'angular-components/src/styles/tailwind-entry.css');
const output = resolve(root, 'dist/angular-components/styles.css');

const css = await readFile(input, 'utf8');
const result = await postcss([tailwindcss()]).process(css, { from: input, to: output });
const { code } = transform({ filename: 'styles.css', code: Buffer.from(result.css), minify: true });

await mkdir(dirname(output), { recursive: true });
await writeFile(output, code);
console.log(`styles.css: ${(code.length / 1024).toFixed(0)} KiB -> ${output}`);

// Expose it as `@socium-design/angular-components/styles.css`. Added to the built package.json here
// rather than declared in the source one: an `exports` field in angular-components/package.json makes
// webpack resolve the package's own name through it (self-reference) in Karma/Storybook, which breaks
// the `labs` entry point's `import … from '@socium-design/angular-components'` (tsconfig `paths`
// never get a chance). ng-packagr already wrote the `.` and `./labs` entries.
const pkgPath = resolve(root, 'dist/angular-components/package.json');
const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
pkg.exports = { './styles.css': './styles.css', ...pkg.exports };
await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`exports: ${Object.keys(pkg.exports).join(', ')}`);
