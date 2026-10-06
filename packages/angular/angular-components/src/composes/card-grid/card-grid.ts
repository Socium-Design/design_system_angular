import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { CARD_GRID_CONTEXT } from '../../internal/card-grid-context';

export type CardGridMode = 'fixed' | 'bento';
export type CardGridGap = 'sm' | 'md' | 'lg';

const GAP_CLASSES: Record<CardGridGap, string> = {
  sm: 'gap-[var(--index-conteneur-cardgrid-gap-sm)]',
  md: 'gap-[var(--index-conteneur-cardgrid-gap-md)]',
  lg: 'gap-[var(--index-conteneur-cardgrid-gap-lg)]',
};

/**
 * Shared CSS Grid primitive behind both `DataTable`'s `mode="card"` and any bento-style card grid
 * (e.g. a `PageHome` content section) — the single place grid-column/breakpoint/gap logic lives.
 * No Figma source (code-only primitive), no masonry library — native CSS Grid only,
 * `grid-auto-flow: dense` does all the gap-backfilling in `mode="bento"`. Plain wrapper
 * (`soc-card-grid`); its children are `soc-card`s.
 *
 * - `mode` "fixed": every card is forced to span exactly 1 column × 1 row, regardless of any
 *   `colSpan`/`rowSpan` it was given. "bento": each card's own `colSpan` (1, 2 or 3) / `rowSpan` (1
 *   or 2) is respected — `colSpan` clamped to never exceed 75% of the row's active column count.
 * - `rowHeight`: fixed height (px) for every grid row (`grid-auto-rows`) — a `rowSpan={2}` card
 *   still gets exactly 2× this plus the gap. `'auto'` (default): rows size to their own content.
 * - `columns`: forces this exact column count, bypassing the container-query breakpoints below.
 *   The same 75% ceiling then runs once, against that fixed number.
 *
 * Columns respond to this grid's own rendered width via a CSS container query (`@container` on the
 * host, `@min-[…]:grid-cols-*` on the grid nested one level inside it — a container query element
 * can't measure itself, only an ancestor's container-type), deliberately not a viewport media
 * query. 2 columns below 600px, 3 from 600px, 4 from 900px — measured against *this component's own
 * box*, calibrated (see React `CardGrid.tsx`'s docstring for the measurements) so a ≥1280px desktop
 * window inside an `AppShell` reaches 4 columns. `class` on `<soc-card-grid>` lands on the outer
 * wrapper (React: `className`), so a consumer's padding/margin doesn't throw off the container
 * query's own width measurement of the grid inside it.
 *
 *   effectiveColSpan = max(1, min(requestedColSpan, floor(activeColumns * 0.75)))
 *
 * i.e. ceiling 1 column (2 active), 2 (3 active), 3 (4 active) — never a full-width row.
 *
 * React applies all of this by `cloneElement`-ing each child `Card` with overridden `colSpan` and
 * `className`. Angular can't rewrite another component's inputs, so this component only *exposes*
 * `mode`/`columns` through `CARD_GRID_CONTEXT` and each `soc-card` resolves its own effective span
 * from it (see `SocCard`'s `placement`). Same rules, same classes, applied on the receiving side.
 */
@Component({
  selector: 'soc-card-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: CARD_GRID_CONTEXT, useExisting: SocCardGrid }],
  host: { class: '@container block w-full' },
  template: `
    <div [class]="gridClass()" [style.grid-template-columns]="gridTemplateColumns()" [style.grid-auto-rows]="gridAutoRows()">
      <ng-content />
    </div>
  `,
  styleUrl: './card-grid.css',
})
export class SocCardGrid {
  readonly mode = input<CardGridMode>('fixed');
  readonly gap = input<CardGridGap>('md');
  /** A plain `number` (px), not a Tailwind class, because it's an arbitrary continuous value the
   * static class scanner can't pick up — applied as an inline style instead. */
  readonly rowHeight = input<number | 'auto'>('auto');
  readonly columns = input<number>();

  protected readonly gridTemplateColumns = computed(() => {
    const columns = this.columns();
    return columns != null ? `repeat(${columns}, minmax(0, 1fr))` : null;
  });

  protected readonly gridAutoRows = computed(() => {
    const rowHeight = this.rowHeight();
    return rowHeight !== 'auto' ? `${rowHeight}px` : null;
  });

  protected readonly gridClass = computed(
    () =>
      `grid ${this.columns() == null ? 'grid-cols-2 @min-[600px]:grid-cols-3 @min-[900px]:grid-cols-4' : ''} ${this.mode() === 'bento' ? 'grid-flow-dense' : ''} ${GAP_CLASSES[this.gap()]}`,
  );
}
