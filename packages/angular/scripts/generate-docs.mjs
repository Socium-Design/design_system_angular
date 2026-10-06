// Generates the component reference shipped with the package (docs/generated/components.md + components.json)
// by reading the real sources with the TypeScript compiler API — so it can never drift from the code.
// Consumers (and Claude Code in sirh_prototype) read node_modules/<package>/docs/generated/ instead of guessing
// prop names. Run automatically by `npm run build`; `npm run docs` runs it alone.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'angular-components/src');
const out = join(root, 'angular-components/docs/generated');
const pkg = JSON.parse(await readFile(join(root, 'angular-components/package.json'), 'utf8'));

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])));
  return files.flat();
}

const files = (await walk(src)).filter((f) => f.endsWith('.ts') && !/\.(spec|stories)\.ts$/.test(f) && !f.includes('/testing/') && !f.endsWith('public-api.ts'));

const classes = new Map(); // name -> info
const types = []; // exported types/interfaces

const jsdoc = (node) => {
  const docs = node.jsDoc;
  if (!docs?.length) return '';
  const d = docs[docs.length - 1];
  const text = typeof d.comment === 'string' ? d.comment : ts.getTextOfJSDocComment(d.comment) ?? '';
  return text.replace(/\s+/g, ' ').trim();
};
const clip = (s, n = 400) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
const unquote = (t) => t.replace(/^['"`]|['"`]$/g, '');

function callInfo(init) {
  // returns { kind, typeArg, defaultText, required } for input()/model()/output() initializers
  if (!init || !ts.isCallExpression(init)) return null;
  const callee = init.expression;
  let fn;
  let required = false;
  if (ts.isIdentifier(callee)) fn = callee.text;
  else if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) && callee.name.text === 'required') {
    fn = callee.expression.text;
    required = true;
  }
  if (!['input', 'model', 'output'].includes(fn)) return null;
  const typeArg = init.typeArguments?.[0]?.getText();
  const first = init.arguments[0];
  let defaultText;
  let inferred;
  if (!required && fn !== 'output' && first && !(ts.isObjectLiteralExpression(first) && init.arguments.length === 1 && fn === 'input' && false)) {
    defaultText = first.getText();
    if (first.kind === ts.SyntaxKind.TrueKeyword || first.kind === ts.SyntaxKind.FalseKeyword) inferred = 'boolean';
    else if (ts.isStringLiteralLike(first)) inferred = 'string';
    else if (ts.isNumericLiteral(first)) inferred = 'number';
    else if (ts.isArrayLiteralExpression(first)) inferred = first.elements.length ? undefined : 'unknown[]';
  }
  return { fn, required, typeArg: typeArg ?? inferred ?? 'unknown', defaultText, hasDefault: defaultText !== undefined };
}

function parseFile(path) {
  const text = ts.sys.readFile(path);
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.ES2022, true);
  const rel = relative(src, path);
  for (const stmt of sf.statements) {
    const exported = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if ((ts.isTypeAliasDeclaration(stmt) || ts.isInterfaceDeclaration(stmt)) && exported) {
      types.push({ name: stmt.name.text, file: rel, doc: jsdoc(stmt), text: clip(stmt.getText().replace(/\n\s*/g, ' '), 700) });
    }
    if (!ts.isClassDeclaration(stmt) || !stmt.name) continue;
    const dec = ts.getDecorators(stmt)?.find((d) => ts.isCallExpression(d.expression) && ['Component', 'Directive'].includes(d.expression.expression.getText()));
    const info = {
      name: stmt.name.text,
      file: rel,
      isComponent: dec?.expression.expression.getText() === 'Component',
      isDirective: dec?.expression.expression.getText() === 'Directive',
      abstract: !!stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.AbstractKeyword),
      exported: !!exported,
      doc: jsdoc(stmt),
      extends: stmt.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0]?.expression.getText(),
      selector: undefined,
      template: '',
      cva: false,
      inputs: [],
      outputs: [],
    };
    if (dec) {
      const arg = dec.expression.arguments[0];
      if (arg && ts.isObjectLiteralExpression(arg)) {
        for (const p of arg.properties) {
          if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) continue;
          if (p.name.text === 'selector') info.selector = unquote(p.initializer.getText());
          if (p.name.text === 'template') info.template = p.initializer.getText();
          if (p.name.text === 'providers' && /provideFormControl|NG_VALUE_ACCESSOR/.test(p.initializer.getText())) info.cva = true;
        }
      }
    }
    for (const member of stmt.members) {
      if (!ts.isPropertyDeclaration(member) || !member.name || !ts.isIdentifier(member.name)) continue;
      if (member.modifiers?.some((m) => [ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword].includes(m.kind))) continue;
      const c = callInfo(member.initializer);
      if (!c) continue;
      const entry = { name: member.name.text, type: c.typeArg, required: c.required, default: c.defaultText, twoWay: c.fn === 'model', doc: jsdoc(member) };
      (c.fn === 'output' ? info.outputs : info.inputs).push(entry);
    }
    classes.set(info.name, info);
  }
}
files.forEach(parseFile);

const resolveMembers = (info, key) => {
  const own = info[key];
  const parent = info.extends ? classes.get(info.extends) : undefined;
  const inherited = parent ? resolveMembers(parent, key) : [];
  const names = new Set(own.map((m) => m.name));
  return [...inherited.filter((m) => !names.has(m.name)), ...own];
};
const isCva = (info) => info.cva || (info.extends && classes.get(info.extends) ? isCva(classes.get(info.extends)) || /SocFormControl|SocTextFieldBase/.test(info.extends) : /SocFormControl|SocTextFieldBase/.test(info.extends ?? ''));

const level = (file) => (file.startsWith('primitifs') ? 'primitifs' : file.startsWith('composes') ? 'composes' : file.startsWith('templates') ? 'templates' : 'autres');
const levelLabel = { primitifs: 'Primitifs (niveau 0)', composes: 'Composés (niveau 1)', templates: 'Templates de page' };

const all = [...classes.values()].filter((c) => c.exported && c.selector);
const markers = all.filter((c) => c.isDirective && !c.template);
const markerBySelector = new Map(markers.map((m) => [m.selector, m]));
const components = all.filter((c) => c.isComponent && !c.name.startsWith('Story')).sort((a, b) => a.file.localeCompare(b.file));

function slotsOf(c) {
  const slots = [];
  for (const m of c.template.matchAll(/<ng-content([^>]*)>/g)) {
    const sel = /select="([^"]+)"/.exec(m[1])?.[1];
    const key = sel ?? 'default';
    if (!slots.some((s) => s.selector === key)) slots.push({ selector: key, marker: sel ? markerBySelector.get(sel) : undefined });
  }
  return slots;
}

function usage(c) {
  const sel = c.selector;
  const attr = /^([a-z-]+)\[([A-Za-z]+)\]$/.exec(sel);
  if (attr) return `<${attr[1]} ${attr[2]}>…</${attr[1]}>`;
  return `<${sel}>…</${sel}>`;
}

const json = components.map((c) => ({
  name: c.name,
  selector: c.selector,
  level: level(c.file),
  file: c.file,
  description: c.doc,
  formControl: isCva(c),
  inputs: resolveMembers(c, 'inputs'),
  outputs: resolveMembers(c, 'outputs'),
  slots: slotsOf(c).map((s) => ({ selector: s.selector, description: s.marker?.doc ?? '' })),
}));

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
let md = `# ${pkg.name} — référence des composants (générée)\n\n`;
md += `> Généré automatiquement depuis le code source (version ${pkg.version}). **Source de vérité pour les noms d'inputs/outputs/slots** : ne jamais deviner une prop par analogie avec le HTML natif.\n\n`;
md += `## Conventions de lecture\n\n`;
md += `- **Sélecteur d'attribut** (\`button[socButton]\`) : le composant se pose sur l'élément natif (\`<button socButton>\`).\n`;
md += `- **Slots** : le contenu projeté se range avec un attribut marqueur (ex. \`<svg socButtonLeftIcon>\`). Slot \`default\` = contenu sans marqueur.\n`;
md += `- **Formulaire** : « oui » = \`formControl\`, \`formControlName\` et \`ngModel\` fonctionnent dessus.\n`;
md += `- Les inputs booléens acceptent l'attribut nu (\`<soc-input-text required disabled>\`). Les inputs \`model\` (↔) se lient en \`[(x)]\`.\n\n`;
md += `## Index\n\n| Composant | Sélecteur | Niveau |\n|---|---|---|\n`;
for (const c of json) md += `| [${c.name}](#${c.name.toLowerCase()}) | \`${esc(c.selector)}\` | ${c.level} |\n`;
for (const lvl of ['primitifs', 'composes', 'templates']) {
  md += `\n---\n\n## ${levelLabel[lvl]}\n`;
  for (const c of json.filter((x) => x.level === lvl)) {
    md += `\n### ${c.name}\n\n`;
    md += `- **Sélecteur** : \`${esc(c.selector)}\` — \`${usage(components.find((k) => k.name === c.name))}\`\n`;
    md += `- **Formulaire (ControlValueAccessor)** : ${c.formControl ? 'oui' : 'non'}\n`;
    md += `- **Fichier** : \`${c.file}\`\n`;
    if (c.description) md += `\n${clip(c.description, 600)}\n`;
    if (c.inputs.length) {
      md += `\n**Inputs**\n\n| Nom | Type | Défaut | Requis | Description |\n|---|---|---|---|---|\n`;
      for (const i of c.inputs) md += `| \`${i.name}\`${i.twoWay ? ' ↔' : ''} | \`${esc(i.type)}\` | ${i.default !== undefined ? `\`${esc(i.default)}\`` : '—'} | ${i.required ? 'oui' : ''} | ${esc(clip(i.doc, 220))} |\n`;
    }
    if (c.outputs.length) {
      md += `\n**Outputs**\n\n| Nom | Payload | Description |\n|---|---|---|\n`;
      for (const o of c.outputs) md += `| \`(${o.name})\` | \`${esc(o.type)}\` | ${esc(clip(o.doc, 220))} |\n`;
    }
    if (c.slots.length) {
      md += `\n**Slots (contenu projeté)**\n\n| Marqueur | Rôle |\n|---|---|\n`;
      for (const s of c.slots) md += `| \`${s.selector === 'default' ? '(contenu par défaut)' : esc(s.selector)}\` | ${esc(clip(s.description, 220))} |\n`;
    }
  }
}
md += `\n---\n\n## Types exportés (valeurs possibles, formes de données)\n\n`;
for (const t of types.sort((a, b) => a.file.localeCompare(b.file) || a.name.localeCompare(b.name))) {
  md += `- \`${t.name}\` (\`${t.file}\`)${t.doc ? ` — ${esc(clip(t.doc, 160))}` : ''}\n  \`\`\`ts\n  ${t.text}\n  \`\`\`\n`;
}

await mkdir(out, { recursive: true });
await writeFile(join(out, 'components.md'), md);
await writeFile(join(out, 'components.json'), JSON.stringify({ package: pkg.name, version: pkg.version, components: json, types }, null, 2));
console.log(`docs: ${json.length} composants, ${types.length} types -> ${relative(root, out)}`);
