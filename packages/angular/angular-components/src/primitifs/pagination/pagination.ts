import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, output } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight, LucideChevronsLeft, LucideChevronsRight } from '@lucide/angular';

export type PaginationVariant = 'numbered' | 'dots';

/** Builds a windowed page list with ellipsis markers, e.g. [1, '…', 4, 5, 6, '…', 20]. Ported 1:1
 * from React Pagination.tsx's own `buildPageWindow`. */
function buildPageWindow(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | 'ellipsis')[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) result.push('ellipsis');
    result.push(page);
  });
  return result;
}

const navButtonClass =
  'flex size-[var(--index-navigation-pagination-item-size)] items-center justify-center rounded-[var(--index-navigation-pagination-item-radius)] text-[var(--index-navigation-pagination-icon-default)] hover:text-[var(--index-navigation-pagination-icon-hover)] disabled:cursor-not-allowed disabled:text-[var(--index-navigation-pagination-icon-disabled)]';

/**
 * No native HTML equivalent — plain wrapper (`soc-pagination`). Maps 1:1 to
 * "Index/Navigation/Pagination/*" tokens — see packages/tokens/tokens/components/navigation.json
 * in design_system (React reference repo, read only). `onPageChange`/`onPageSizeChange` are direct
 * component-level handlers (not per-item data), so both become `output()`s
 * (`pageChange`/`pageSizeChange`) rather than input callbacks.
 */
@Component({
  selector: 'soc-pagination',
  standalone: true,
  imports: [LucideChevronLeft, LucideChevronRight, LucideChevronsLeft, LucideChevronsRight],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'variant() === "dots" ? "flex items-center justify-center gap-[var(--index-navigation-pagination-dot-gap)]" : "flex items-center justify-between"',
    '[attr.aria-label]': 'variant() === "dots" ? "Pagination" : null',
  },
  template: `
    @if (variant() === 'dots') {
      @for (page of dotPages(); track page) {
        <button
          type="button"
          [attr.aria-label]="'Page ' + page"
          [attr.aria-current]="page === currentPage() ? 'page' : null"
          (click)="pageChange.emit(page)"
          [class]="dotClass(page)"
        ></button>
      }
    } @else {
      <nav aria-label="Pagination" class="flex items-center gap-[var(--index-navigation-pagination-item-gap)]">
        @if (hasFirstLast()) {
          <button type="button" [disabled]="currentPage() <= 1" (click)="pageChange.emit(1)" aria-label="Première page" [class]="navButtonClass">
            <span class="size-[var(--index-navigation-pagination-icon-size)]">
              <svg lucideChevronsLeft class="size-full" [strokeWidth]="iconThickness"></svg>
            </span>
          </button>
        }
        <button type="button" [disabled]="currentPage() <= 1" (click)="pageChange.emit(currentPage() - 1)" aria-label="Page précédente" [class]="navButtonClass">
          <span class="size-[var(--index-navigation-pagination-icon-size)]">
            <svg lucideChevronLeft class="size-full" [strokeWidth]="iconThickness"></svg>
          </span>
        </button>

        @for (page of pages(); track $index) {
          @if (page === 'ellipsis') {
            <span class="flex size-[var(--index-navigation-pagination-item-size)] items-center justify-center text-[var(--index-navigation-pagination-item-text-default)]"> … </span>
          } @else {
            <button
              type="button"
              [attr.aria-current]="page === currentPage() ? 'page' : null"
              (click)="pageChange.emit(page)"
              [class]="pageButtonClass(page)"
            >
              {{ page }}
            </button>
          }
        }

        <button type="button" [disabled]="currentPage() >= totalPages()" (click)="pageChange.emit(currentPage() + 1)" aria-label="Page suivante" [class]="navButtonClass">
          <span class="size-[var(--index-navigation-pagination-icon-size)]">
            <svg lucideChevronRight class="size-full" [strokeWidth]="iconThickness"></svg>
          </span>
        </button>
        @if (hasFirstLast()) {
          <button type="button" [disabled]="currentPage() >= totalPages()" (click)="pageChange.emit(totalPages())" aria-label="Dernière page" [class]="navButtonClass">
            <span class="size-[var(--index-navigation-pagination-icon-size)]">
              <svg lucideChevronsRight class="size-full" [strokeWidth]="iconThickness"></svg>
            </span>
          </button>
        }
      </nav>

      @if (totalEntries() !== undefined || showPageSize()) {
        <div class="flex items-center gap-[var(--index-navigation-pagination-section-gap)]">
          @if (totalEntries() !== undefined) {
            <p class="whitespace-nowrap text-[length:var(--index-navigation-pagination-font-size)] text-[var(--index-navigation-pagination-info-text)] [font-family:var(--index-navigation-pagination-font-family)]">
              Affichage de {{ fromEntry() }} à {{ toEntry() }} sur {{ totalEntries() }}
            </p>
          }
          @if (showPageSize()) {
            <select
              [value]="pageSize()"
              (change)="pageSizeChange.emit(+$any($event.target).value)"
              class="rounded-[var(--index-navigation-pagination-item-radius)] border-[length:var(--index-navigation-pagination-item-border-width)] border-[var(--index-navigation-pagination-item-border-default)] bg-[var(--index-navigation-pagination-item-bg-default)] px-2 py-1.5 text-[length:var(--index-navigation-pagination-font-size)] text-[var(--index-navigation-pagination-item-text-default)] [font-family:var(--index-navigation-pagination-font-family)]"
            >
              @for (size of pageSizeOptions(); track size) {
                <option [value]="size">{{ size }}</option>
              }
            </select>
          }
        </div>
      }
    }
  `,
})
export class SocPagination {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly variant = input<PaginationVariant>('numbered');
  readonly hasFirstLast = input(true);
  readonly totalEntries = input<number>();
  readonly pageSize = input<number>();
  readonly pageSizeOptions = input<number[]>([10, 20, 50, 100]);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  protected readonly navButtonClass = navButtonClass;
  protected readonly iconThickness = 'var(--index-navigation-pagination-icon-thickness)';

  protected readonly pages = computed(() => buildPageWindow(this.currentPage(), this.totalPages()));
  protected readonly dotPages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  protected readonly showPageSize = computed(() => this.pageSize() !== undefined);

  protected readonly fromEntry = computed(() => {
    const size = this.pageSize();
    return this.totalEntries() !== undefined && size ? (this.currentPage() - 1) * size + 1 : undefined;
  });
  protected readonly toEntry = computed(() => {
    const size = this.pageSize();
    const total = this.totalEntries();
    return total !== undefined && size ? Math.min(this.currentPage() * size, total) : undefined;
  });

  protected dotClass(page: number): string {
    const base =
      'size-[var(--index-navigation-pagination-dot-size)] shrink-0 rounded-full focus-visible:outline-none focus-visible:border-[length:var(--index-navigation-pagination-item-border-width)] focus-visible:border-[var(--index-navigation-pagination-dot-border-focus)]';
    return `${base} ${
      page === this.currentPage()
        ? 'bg-[var(--index-navigation-pagination-dot-bg-selected)]'
        : 'bg-[var(--index-navigation-pagination-dot-bg-default)] hover:bg-[var(--index-navigation-pagination-dot-bg-hover)] active:bg-[var(--index-navigation-pagination-dot-bg-pressed)]'
    }`;
  }

  protected pageButtonClass(page: number): string {
    const base = 'flex size-[var(--index-navigation-pagination-item-size)] items-center justify-center rounded-[var(--index-navigation-pagination-item-radius)] text-[length:var(--index-navigation-pagination-font-size)] [font-family:var(--index-navigation-pagination-font-family)]';
    return `${base} ${
      page === this.currentPage()
        ? 'bg-[var(--index-navigation-pagination-item-bg-selected)] text-[var(--index-navigation-pagination-item-text-selected)] [font-weight:var(--index-navigation-pagination-font-weight-selected)]'
        : 'border-[length:var(--index-navigation-pagination-item-border-width)] border-[var(--index-navigation-pagination-item-border-default)] bg-[var(--index-navigation-pagination-item-bg-default)] text-[var(--index-navigation-pagination-item-text-default)] [font-weight:var(--index-navigation-pagination-font-weight)] hover:border-[var(--index-navigation-pagination-item-border-hover)] hover:bg-[var(--index-navigation-pagination-item-bg-hover)] hover:text-[var(--index-navigation-pagination-item-text-hover)]'
    }`;
  }
}
