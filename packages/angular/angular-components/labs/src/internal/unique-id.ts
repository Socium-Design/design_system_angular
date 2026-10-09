let counter = 0;

/** Same helper as the kit's `src/internal/unique-id.ts` — a secondary entry point can't import the
 * primary entry's internals (ng-packagr only lets it reach the primary through its public API). */
export function nextLabsId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}
