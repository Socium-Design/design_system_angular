/**
 * Class strings shared by several Labs components. Literal strings only — Tailwind scans source text
 * statically (see the labs `@source` line in `src/styles/tailwind-entry.css`).
 */

/**
 * Visible keyboard focus ring, kit focus color. `focus-visible:outline-solid` is required: in Tailwind v4
 * `outline-none` sets `--tw-outline-style: none`, which the width/color utilities reuse — without it the
 * ring had a width and a color but `outline-style: none`, i.e. no ring at all.
 */
export const labsFocusRing =
  'outline-none focus-visible:outline-solid focus-visible:outline-[length:var(--bridges-shape-line-thick)] focus-visible:outline-offset-[length:var(--bridges-position-gap-xs)] focus-visible:outline-[var(--bridges-color-border-focus)]';

/** Small-caps section label used in side panels (compact field, panel titles). */
export const labsOverlineText =
  'uppercase tracking-wider [font-family:var(--bridges-shape-text-label-font)] [font-weight:var(--bridges-shape-text-label-weight)] text-[length:var(--bridges-size-text-text-size-tiny)] text-[var(--bridges-color-text-secondary)]';

/** Visually hidden but read by screen readers. */
export const labsSrOnly = 'sr-only';
