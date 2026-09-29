let counter = 0;

/** Angular has no built-in equivalent of React's `useId()` — a plain incrementing counter is the
 * common substitute for generating a stable `id`/`for` pair per component instance (e.g. so a
 * `<label>` can target its `<input>` without the consumer having to supply an id themselves). Not
 * SSR-safe against hydration mismatches (React's `useId()` is), but this kit has no SSR consumer
 * today — revisit if one shows up. */
export function nextUniqueId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}
