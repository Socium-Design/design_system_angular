# design_system_angular

Angular 19 migration of the Socium design system. `design_system` (React, `Socium-Design/design_system`)
is the frozen reference — every component here is rebuilt from that repo's real source (actual props,
actual behavior, read directly, never guessed by analogy with a native HTML equivalent), read-only,
never modified from this repo.

Migration order: primitives first (28, zero dependency on another kit component), then composed
components (13), then templates (6) — see `packages/angular/angular-components/src/{primitifs,
composes,templates}/`, which mirrors `packages/react/src/{components,templates}/` in the React repo,
grouped by that same dependency level. Nothing is migrated ahead of an explicit request, one
component at a time.

## Conventions

### Attribute-selector components for anything wrapping a single native interactive element

A component that wraps exactly one native interactive element (`Button` → `<button>`, and — the
pattern to reuse going forward — `InputText`, `Checkbox`, `RadioButton`, `Switch`, …) is written as
an **attribute selector on that real element**, not a wrapper component:

```ts
@Component({ selector: 'button[socButton]', ... })
export class SocButton { ... }
```

```html
<button socButton variant="secondary" type="submit" [disabled]="isLoading" (click)="onSave()">
  Enregistrer
</button>
```

This makes every native attribute/event (`type`, `[disabled]`, `(click)`, `aria-label`, arbitrary
`data-*`, …) just work, because the consumer is writing a real `<button>` — no `output()`/`input()`
has to re-declare any of them one by one. This is the Angular equivalent of the React version
spreading `...props` onto its own native element (see `Button.tsx`). It also means a component
doesn't need a `className`-style input to accept and merge a consumer's own classes: a literal
`class="..."` the consumer adds on the same element composes automatically with this component's own
`[class]` host binding — Angular doesn't require picking one or the other.

Only use this when the component's host genuinely **is** a single native interactive element. A
component whose host isn't itself the thing being clicked/typed into (`SplitButton`, which renders
*two* internal `<button>`s) can't use this — see the next convention.

### Real wrapper components expose explicit `output()`s, matched to the source type's own prop shape

When a component can't be an attribute selector (its host isn't a single native interactive
element — internally it's composed of more than one, like `SplitButton`'s main action + dropdown
trigger), it's a normal standalone component that declares `input()`/`output()` explicitly for
whatever the native passthrough would have covered. Match the granularity the React source already
uses — `SplitButton`'s React props (`onClick` for the main action, `onTriggerClick` for the chevron)
are two distinct handlers because `SplitButtonProps` is already its own type, not an extension of
`ButtonProps`; the Angular version mirrors that with `click`/`triggerClick` outputs rather than
collapsing them into one.

### Icon/content slots use content projection with a marker directive, not an `Input()`

A React `ReactNode` prop for consumer-supplied content (`leftIcon`, `rightIcon`) becomes a named
`<ng-content select="...">` slot in Angular, not an `@Input()` — Angular has no `ReactNode`-shaped
value to hold, content projection is the direct equivalent. Route it with a tiny marker directive
(`SocButtonLeftIcon`, selector `[socButtonLeftIcon]`) that the consumer adds to whatever element they
project:

```html
<button socButton>
  <svg lucidePlus socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
  Ajouter
</button>
```

Presence (whether to render an icon wrapper `<span>` at all, matching React's `{leftIcon && <span>...}`)
is read with a signal content query — `contentChild(SocButtonLeftIcon)` — and a `computed()` checking
it's non-null, not a boolean `@Input()`.

### `ViewEncapsulation.None` on every component styled with Tailwind utility classes

Every component ported from the React kit is styled the same way the React source is: Tailwind
utility classes (including arbitrary-value ones bound to design tokens, e.g.
`bg-[var(--index-button-button-bg-primary-default)]`), global and reusable by design — the same
`.inline-flex` rule is meant to apply everywhere it's used, never scoped per component instance.

Angular's **default** emulated view encapsulation is actively incompatible with that: it rewrites
every selector in a component's `styleUrl` to only match elements carrying an auto-generated
`_ngcontent-*` attribute — which the component's own **host** element never has (the host gets
`_nghost-*` instead). Any component applying Tailwind classes to its own host via a `host: { '[class]':
... }` binding (which the attribute-selector convention above does by construction) would have every
one of those classes silently fail to match anything, with zero error — verified this empirically
while building `Button`: the classes were present, correct, and unescaped in the DOM the whole time,
the stylesheet was compiling and loading, and none of it took effect, until `encapsulation:
ViewEncapsulation.None` was added.

Every `@Component` in this library sets it:

```ts
@Component({
  ...
  encapsulation: ViewEncapsulation.None,
  ...
})
```

### Each component's own CSS file just imports the shared Tailwind entry point

`src/primitifs/button/button.css` (and equally for every future component) is just:

```css
@import '../../styles/tailwind-entry.css';
```

`src/styles/tailwind-entry.css` does `@import "tailwindcss";`, explicit `@source` directives (see
below for why explicit), then `@import "./tokens.generated.css";` — a copy of `design_system`
(React)'s own `packages/react/src/tokens.generated.css` (itself synced there from
`packages/tokens/dist/css/variables.css`, the actual source of truth). Re-copy that file by hand
from the React repo when tokens change there, until this repo has its own sync step — never hand-edit
`tokens.generated.css` directly, same rule as on the React side.

## Tooling gotchas already hit and fixed — don't re-debug these

All already fixed at the workspace level; a newly migrated component doesn't need to touch any of
this, just follow the conventions above. Documented here so nobody re-discovers them the hard way:

- **`npm install` at the actual repo root** (`~/…/design_system_angular`, not inside
  `packages/angular`) — this repo is **not** an npm workspace (see root `package.json`'s own
  `description` field for why: npm's hoisting split `@storybook/angular` from its own `storybook`
  core package across two different `node_modules` trees on a clean install, breaking ESM resolution
  between them). `packages/angular/` is a fully self-contained npm project; always `cd` there first.
- **`NODE_OPTIONS=--max-old-space-size=6144`** is baked into the `storybook`/`build-storybook` npm
  scripts (`packages/angular/package.json`) — `@lucide/angular`'s single-entry-point package (no
  per-icon subpath exports, ~2.8MB of type declarations covering every icon) reliably OOMs Node's
  default ~2.2GB heap limit during Angular's AOT compilation, even importing only 1–2 icons.
- **Angular CLI's own Tailwind auto-detection doesn't support Tailwind v4** (confirmed against this
  repo's installed `@angular-devkit/build-angular@19.2.27`: it does
  `require('tailwindcss')({ config: tailwindConfigPath })` — the v3 plugin API — the moment it finds
  a `tailwind.config.*` file, and v4 throws rather than silently no-op'ing when called that way).
  Angular's webpack config also hardcodes `postcss-loader`'s `postcssOptions` to `{ config: false }`
  everywhere, ignoring `.postcssrc.json` entirely for this build path. Fixed via
  `angular-components/.storybook/main.ts`'s `webpackFinal`, which finds the existing `.css` rule
  Angular already built and replaces its postcss-loader options with `@tailwindcss/postcss` directly
  — verified with `ng run angular-components:storybook --debug-webpack` before landing on this, don't
  add a `tailwind.config.js` file expecting it to work.
  - `ng build angular-components` (the ng-packagr/library builder, the actual published artifact)
    was **never** affected by this — it already correctly compiles Tailwind via
    `angular-components/.postcssrc.json` with zero extra wiring. This gotcha is Storybook/webpack
    "browser"-style build only.
- **Tailwind v4's automatic content detection doesn't reliably reach `.ts` component files** through
  Angular's build pipeline (confirmed: `ng build` produced the theme layer and design tokens
  correctly, but zero utility classes, until explicit `@source` directives were added to
  `tailwind-entry.css`). Every new component subfolder is covered already by the existing
  `@source "../primitifs/**/*.ts";` (and `composes`/`templates` equivalents) — no per-component
  `@source` needed.
