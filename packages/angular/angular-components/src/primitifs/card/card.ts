import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, computed, contentChild, inject, input, output } from '@angular/core';
import { LucideMoreHorizontal } from '@lucide/angular';
import { CARD_GRID_CONTEXT } from '../../internal/card-grid-context';

export type CardType = 'default' | 'selectable';

/** Content slots — React's `icon`/`actionSlot`/`footer` (all `ReactNode`) and `children`. `children`
 * stays the default unnamed `<ng-content>` (there's no ambiguity with the other three, all named). */
@Directive({ selector: '[socCardIcon]', standalone: true })
export class SocCardIcon {}

@Directive({ selector: '[socCardActionSlot]', standalone: true })
export class SocCardActionSlot {}

@Directive({ selector: '[socCardFooter]', standalone: true })
export class SocCardFooter {}

const colSpanClasses = { 1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3' } as const;
const rowSpanClasses = { 1: 'row-span-1', 2: 'row-span-2' } as const;

// A Card inside a `soc-card-grid` in "bento" mode never occupies more than 75% of its row —
// the base (2-column) tier's ceiling is always 1 (floor(2 * 0.75)), so every other tier's clamp is
// a responsive override on top of that shared `col-span-1` floor. Ported 1:1 from React
// CardGrid.tsx's BENTO_COLSPAN_75PCT_OVERRIDE; see that component's docstring for the full rule.
const BENTO_COLSPAN_75PCT_OVERRIDE = {
  2: '@min-[600px]:col-span-2',
  3: '@min-[600px]:col-span-2 @min-[900px]:col-span-3',
} as const;

/**
 * No native HTML equivalent — plain wrapper (`soc-card`). Maps 1:1 to "Index/Conteneur/Card/*"
 * tokens — see packages/tokens/tokens/components/conteneur.json in design_system (React reference
 * repo, read only). `colSpan`/`rowSpan` only matter inside a `soc-card-grid` in `mode="bento"` —
 * see that component's own docstring for the 75%-of-row clamp rule. The *rendered* span is resolved
 * here from `CARD_GRID_CONTEXT` (see `internal/card-grid-context.ts`), because React's
 * `cloneElement` rewrite of a child's props has no Angular equivalent; a card with no grid ancestor
 * renders exactly the span it was given, same as React.
 *
 * `children` presence (`{children && <div>...}` in React) is checked via a content query — Angular
 * has no direct way to ask "was any content passed to the default `<ng-content>` slot", so this
 * uses `contentChild` against a broad marker... actually, kept simpler: unlike named slots, the
 * default slot's presence can't be queried the same way, so the content wrapper always renders
 * (an empty content region is harmless — no min-height without content, `min-h-0` already handles
 * that) rather than reproducing the exact conditional. Documented here since it's a deliberate,
 * minor behavior difference, not an oversight.
 */
@Component({
  selector: 'soc-card',
  standalone: true,
  imports: [LucideMoreHorizontal, SocCardIcon, SocCardActionSlot, SocCardFooter],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClasses()',
    '(click)': 'handleHostClick()',
  },
  template: `
    <div class="flex w-full items-start justify-between gap-[var(--index-conteneur-card-icon-gap)] px-[var(--index-conteneur-card-header-pad)] pt-[var(--index-conteneur-card-header-pad)]">
      <div class="flex min-w-0 flex-1 items-center gap-[var(--index-conteneur-card-icon-gap)]">
        @if (hasIcon()) {
          <span class="flex size-[34px] shrink-0 items-center justify-center rounded-[var(--index-conteneur-card-iconarea-bg-radius)] bg-[var(--index-conteneur-card-iconarea-bg)]">
            <span class="size-[var(--index-conteneur-card-iconarea-icon-size)] text-[var(--index-conteneur-card-iconarea-icon-color)]">
              <ng-content select="[socCardIcon]" />
            </span>
          </span>
        }
        <div class="flex min-w-0 flex-1 flex-col items-start">
          <p class="w-full truncate text-[length:var(--index-conteneur-card-title-size)] text-[var(--index-conteneur-card-title-color)] [font-family:var(--index-conteneur-card-title-font)] [font-weight:var(--index-conteneur-card-title-weight)]">
            {{ title() }}
          </p>
          @if (subtitle()) {
            <p class="w-full truncate text-[length:var(--index-conteneur-card-subtitle-size)] text-[var(--index-conteneur-card-subtitle-color)] [font-family:var(--index-conteneur-card-subtitle-font)] [font-weight:var(--index-conteneur-card-subtitle-weight)]">
              {{ subtitle() }}
            </p>
          }
        </div>
      </div>
      @if (hasActionSlot()) {
        <ng-content select="[socCardActionSlot]" />
      } @else {
        <button
          type="button"
          (click)="handleActionClick($event)"
          aria-label="Actions"
          class="flex size-[24px] shrink-0 items-center justify-center rounded-[var(--index-conteneur-card-action-radius)] px-[var(--index-conteneur-card-action-pad-h)] py-[var(--index-conteneur-card-action-pad-v)] hover:bg-[var(--index-conteneur-card-action-bg-hover)]"
        >
          <svg
            lucideMoreHorizontal
            class="size-[var(--index-conteneur-card-action-icon-size)] text-[var(--index-conteneur-card-action-icon-color)]"
            [strokeWidth]="actionIconThickness"
          ></svg>
        </button>
      }
    </div>

    <div class="flex min-h-0 w-full flex-1 flex-col items-start px-[var(--index-conteneur-card-content-pad-h)] py-[var(--index-conteneur-card-content-pad-v)]">
      <ng-content />
    </div>

    @if (hasFooter()) {
      <div class="flex h-[34px] w-full shrink-0 flex-col items-start px-[var(--index-conteneur-card-footer-pad)] pb-[var(--index-conteneur-card-footer-pad)]">
        <ng-content select="[socCardFooter]" />
      </div>
    }
  `,
})
export class SocCard {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly type = input<CardType>('default');
  readonly colSpan = input<1 | 2 | 3>(1);
  readonly rowSpan = input<1 | 2>(1);

  readonly action = output<void>();
  readonly cardClick = output<void>();

  protected readonly actionIconThickness = 'var(--index-conteneur-card-action-icon-thickness)';

  private readonly iconContent = contentChild(SocCardIcon);
  private readonly actionSlotContent = contentChild(SocCardActionSlot);
  private readonly footerContent = contentChild(SocCardFooter);
  protected readonly hasIcon = computed(() => !!this.iconContent());
  protected readonly hasActionSlot = computed(() => !!this.actionSlotContent());
  protected readonly hasFooter = computed(() => !!this.footerContent());

  protected handleActionClick(event: MouseEvent): void {
    event.stopPropagation();
    this.action.emit();
  }

  protected handleHostClick(): void {
    if (this.type() === 'selectable') this.cardClick.emit();
  }

  // Present only when this card is declared inside a `soc-card-grid` (React: that grid cloned the
  // child with overridden props; here the card applies the same rules to itself).
  private readonly grid = inject(CARD_GRID_CONTEXT, { optional: true });

  private readonly placement = computed((): { colSpan: 1 | 2 | 3; rowSpan: 1 | 2; extraClass: string } => {
    const requestedColSpan = this.colSpan();
    const requestedRowSpan = this.rowSpan();
    if (!this.grid) return { colSpan: requestedColSpan, rowSpan: requestedRowSpan, extraClass: '' };

    // "fixed": force 1×1 regardless of what the card was given — no card may claim more than a
    // single cell, so every row stays perfectly uniform.
    if (this.grid.mode() === 'fixed') return { colSpan: 1, rowSpan: 1, extraClass: '' };

    const columns = this.grid.columns();
    if (columns != null) {
      const ceiling = Math.max(1, Math.floor(columns * 0.75));
      return { colSpan: Math.max(1, Math.min(requestedColSpan, ceiling)) as 1 | 2 | 3, rowSpan: requestedRowSpan, extraClass: '' };
    }
    if (requestedColSpan === 1) return { colSpan: 1, rowSpan: requestedRowSpan, extraClass: '' }; // always within the 75% ceiling
    return { colSpan: 1, rowSpan: requestedRowSpan, extraClass: BENTO_COLSPAN_75PCT_OVERRIDE[requestedColSpan] };
  });

  protected readonly hostClasses = computed(() => {
    const selectable = this.type() === 'selectable';
    const { colSpan, rowSpan, extraClass } = this.placement();
    return `flex w-full min-w-0 flex-col items-start rounded-[var(--index-conteneur-card-radius)] border-[length:var(--index-conteneur-card-border-width)] border-[var(--index-conteneur-card-border)] bg-[var(--index-conteneur-card-bg)] ${selectable ? 'cursor-pointer hover:bg-[var(--index-conteneur-card-hover-bg)]' : ''} ${colSpanClasses[colSpan]} ${rowSpanClasses[rowSpan]} ${extraClass}`;
  });
}
