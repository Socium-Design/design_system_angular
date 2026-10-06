import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, TemplateRef, ViewEncapsulation, computed, contentChild, input, output, signal } from '@angular/core';
import { LucideMoreHorizontal } from '@lucide/angular';
import { SocCard, SocCardActionSlot, SocCardFooter } from '../../primitifs/card/card';
import { SocCheckbox } from '../../primitifs/checkbox/checkbox';
import { SocPagination } from '../../primitifs/pagination/pagination';
import { SocPopover, SocPopoverTrigger } from '../../primitifs/popover/popover';
import { SocSearchBar } from '../../primitifs/search-bar/search-bar';
import { SocTooltip, SocTooltipLabel } from '../../primitifs/tooltip/tooltip';
import { SocCardGrid } from '../card-grid/card-grid';

/** What a cell/card template receives: `let-row` (the implicit value) or `let-row="row"`. */
export interface DataTableCellContext<T> {
  $implicit: T;
  row: T;
}

/** What a `rowActionsMenu` template receives — call `close()` from each menu item's `(click)` once
 * the action is handled (the popover is controlled internally; nothing closes it automatically just
 * because a child was clicked). */
export interface DataTableRowActionsContext<T> {
  $implicit: T;
  row: T;
  close: () => void;
}

export interface DataTableColumn<T> {
  key: string;
  header: string;
  /** React's `render: (row) => ReactNode` has no Angular equivalent for rich content: a function
   * returning a plain `string` covers text cells; a `TemplateRef` (an `<ng-template let-row>` the
   * consumer owns, since only the consumer's template can instantiate its own components) covers
   * anything richer — a `soc-tag`, a `soc-badge`, a link, etc. */
  render: ((row: T) => string) | TemplateRef<DataTableCellContext<T>>;
}

/** What a single card shows in `mode="card"` — the card-mode counterpart to a table row built from
 * `columns`, one of these per row instead of one cell per column. No `icon` field on purpose:
 * `DataTable`'s cards never show `Card`'s icon area, unlike standalone `Card` usage. */
export interface DataTableCardContent<T> {
  title: string;
  subtitle?: string;
  /** Free-form card body — a `TemplateRef` (see `DataTableColumn.render`), same free-form idea as
   * a table column's `render`. */
  body?: TemplateRef<DataTableCellContext<T>>;
  footer?: TemplateRef<DataTableCellContext<T>>;
}

/** Plain data only — React's `onPageChange`/`onPageSizeChange` live on this object there; here they
 * are the `pageChange`/`pageSizeChange` outputs of `soc-data-table` itself. */
export interface DataTablePagination {
  currentPage: number;
  totalPages: number;
  totalEntries?: number;
  pageSize?: number;
}

export type DataTableMode = 'table' | 'detail' | 'card';

/** React `badge` — consumer-supplied Badge next to `title` (`table`/`card` mode), typically an
 * instance count when several objects of the same type are listed on one page. */
@Directive({ selector: '[socDataTableBadge]', standalone: true })
export class SocDataTableBadge {}

/** React `filters` — extra controls rendered next to the search bar — Selects, filters, etc. */
@Directive({ selector: '[socDataTableFilters]', standalone: true })
export class SocDataTableFilters {}

/** React `actions` — buttons rendered on the right of the action line, typically Button (icon-only
 * + primary). The right-hand wrapper only renders when something is projected here. */
@Directive({ selector: '[socDataTableActions]', standalone: true })
export class SocDataTableActions {}

const ROW_ACTION_BUTTON_CLASS =
  'inline-flex size-[var(--index-données-datatable-action-icon-size)] cursor-pointer items-center justify-center text-[var(--index-données-datatable-action-icon-color)] hover:text-[var(--index-données-datatable-action-icon-hover)]';
const CARD_ACTION_BUTTON_CLASS =
  'flex size-[24px] shrink-0 items-center justify-center rounded-[var(--index-conteneur-card-action-radius)] px-[var(--index-conteneur-card-action-pad-h)] py-[var(--index-conteneur-card-action-pad-v)] hover:bg-[var(--index-conteneur-card-action-bg-hover)]';

/**
 * Maps 1:1 to "Index/Données/DataTable/*" tokens — see packages/tokens/tokens/components/données.json
 * in design_system (React reference repo, read only). Composes `soc-search-bar`, `soc-checkbox`,
 * `soc-pagination`, `soc-popover`/`soc-tooltip` and (card mode) `soc-card-grid`/`soc-card`, same as
 * React. Plain generic wrapper (`soc-data-table`, `<T>` = the row type).
 *
 * `mode`: "table" (Figma "Data Table 1", default) — full grid with search/actions/pagination.
 * "detail" ("Data Table 2") — a single record as a label/value list: columns become row labels,
 * `rows[0]` is the record. "card" (code-only mode) — the title/subtitle/search/filters/actions zone
 * is identical to "table"; only the row grid becomes a `soc-card-grid` of `soc-card`s, one per row
 * (`cardContent` builds each). Multi-select and sorting don't apply to card mode (see React's own
 * `DataTable.tsx` docstring for why; `DataTable` has never implemented sorting in any mode).
 *
 * ## Contraintes de composition (unchanged from React)
 * - `rowActions` (action unique, `(rowAction)`) ou `rowActionsMenu` (plusieurs actions
 *   conditionnelles) pour toute action de ligne — jamais de bouton d'action personnalisé en plus.
 * - `rowActionsMenu` pour toute liste d'actions conditionnelles par ligne — jamais une `Dialog`,
 *   toujours un menu contextuel (`soc-popover position="bottom-end"`, croît vers la gauche, jamais
 *   coupé par un tableau scrollable horizontalement).
 * - Le retrait gauche (première colonne — checkbox si `selectable`, sinon première colonne de
 *   données) est toujours `title-zone-pad-h`, jamais `header-pad-h`/`cell-pad-h`; l'écart checkbox →
 *   première colonne est le token dédié `checkbox-col-pad-right`.
 * - Le placeholder ("Rechercher ici...") et la largeur (260px) de la barre de recherche sont fixes
 *   au niveau du composant, jamais une prop.
 * - `mode="card"` réutilise `rowClick`/`rowAction`/`rowActionsMenu` tels quels; la grille est un
 *   `soc-card-grid` en `mode="fixed"`.
 *
 * ## GAP-DECISIONS (flagged, not decided silently) — React idioms with no Angular equivalent
 * 1. **Presence of a callback prop.** React turns features on by passing the handler: `onSearch`
 *    shows the search bar, `onRowClick` makes rows clickable/hoverable, `onRowAction` adds the
 *    "•••" column. An Angular `output()` can't be asked "does anyone listen?", so each is an
 *    explicit boolean input next to its output: `searchable`/`(search)`, `rowClickable`/
 *    `(rowClick)`, `rowActions`/`(rowAction)`. All default to false (= "handler omitted").
 *    `rowActionsMenu` is a template *input*, so its presence is directly detectable and also adds
 *    the "•••" column on its own, as in React.
 * 2. **`ReactNode`-returning functions.** `columns[].render`, `cardContent().body/footer` and
 *    `rowActionsMenu` return rich JSX in React; here they are `TemplateRef`s the consumer declares
 *    (`<ng-template let-row>`), with the row (and `close` for the menu) as context. `render` also
 *    accepts a plain `(row) => string` for text cells.
 * 3. **`ReactNode` slots** (`badge`, `filters`, `actions`) -> marker-directive content slots.
 * 4. **`selectedKeys`/`onSelectedKeysChange`** -> `selectedKeys` input + `selectedKeysChange`
 *    output (so `[(selectedKeys)]` works). **`pagination`'s callbacks** -> `pageChange`/
 *    `pageSizeChange` outputs on this component.
 */
@Component({
  selector: 'soc-data-table',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    SocCard,
    SocCardActionSlot,
    SocCardFooter,
    SocCardGrid,
    SocCheckbox,
    SocPagination,
    SocPopover,
    SocPopoverTrigger,
    SocSearchBar,
    SocTooltip,
    SocTooltipLabel,
    LucideMoreHorizontal,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'flex w-full flex-col items-start overflow-hidden rounded-[var(--index-données-datatable-radius)] bg-[var(--index-données-datatable-bg)]',
  },
  template: `
    @if (mode() === 'detail') {
      @if (title() || subtitle()) {
        <div class="flex w-full flex-col gap-[var(--index-données-datatable-title-zone-gap)] px-[var(--index-données-datatable-title-zone-pad-h)] py-[var(--index-données-datatable-title-zone-pad-v)]">
          @if (title()) {
            <p class="w-full text-[length:var(--index-données-datatable-title-size)] text-[var(--index-données-datatable-title-color)] [font-family:var(--index-données-datatable-title-font)] [font-weight:var(--index-données-datatable-title-weight)]">
              {{ title() }}
            </p>
          }
          @if (subtitle()) {
            <p class="w-full text-[length:var(--index-données-datatable-subtitle-size)] text-[var(--index-données-datatable-subtitle-color)] [font-family:var(--index-données-datatable-subtitle-font)] [font-weight:var(--index-données-datatable-subtitle-weight)]">
              {{ subtitle() }}
            </p>
          }
          <div class="h-px w-full bg-[var(--index-données-datatable-cell-border)]"></div>
        </div>
      }
      <div class="flex w-full flex-col items-start">
        @for (column of columns(); track column.key; let last = $last) {
          <div
            [class]="'flex w-full items-center gap-4 px-[var(--index-données-datatable-title-zone-pad-h)] py-[var(--index-données-datatable-cell-pad-v)] ' + (last ? '' : 'border-b-[length:var(--index-données-datatable-cell-border-width)] border-[var(--index-données-datatable-cell-border)]')"
          >
            <span class="w-[200px] shrink-0 text-[length:var(--index-données-datatable-cell-size)] text-[var(--bridges-color-text-secondary)] [font-family:var(--index-données-datatable-cell-font)]">
              {{ column.header }}
            </span>
            <span class="min-w-0 flex-1 text-[length:var(--index-données-datatable-cell-size)] text-[var(--bridges-color-text-primary)] [font-family:var(--index-données-datatable-cell-font)] [font-weight:var(--index-données-datatable-header-weight)]">
              @if (record(); as rec) {
                @if (templateOf(column); as tpl) {
                  <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: rec, row: rec }" />
                } @else {
                  {{ textOf(column, rec) }}
                }
              }
            </span>
          </div>
        }
      </div>
    } @else {
      @if (title() || subtitle()) {
        <div class="flex w-full flex-col gap-[var(--index-données-datatable-title-zone-gap)] bg-[var(--index-données-datatable-bg-title)] pr-[var(--index-données-datatable-title-zone-pad-h)] py-[var(--index-données-datatable-title-zone-pad-v)]">
          @if (title()) {
            <div class="flex w-full items-center gap-[var(--index-données-datatable-title-row-gap)]">
              <p class="text-[length:var(--index-données-datatable-title-size)] text-[var(--index-données-datatable-title-color)] [font-family:var(--index-données-datatable-title-font)] [font-weight:var(--index-données-datatable-title-weight)]">
                {{ title() }}
              </p>
              <ng-content select="[socDataTableBadge]" />
            </div>
          }
          @if (subtitle()) {
            <p class="w-full text-[length:var(--index-données-datatable-subtitle-size)] text-[var(--index-données-datatable-subtitle-color)] [font-family:var(--index-données-datatable-subtitle-font)] [font-weight:var(--index-données-datatable-subtitle-weight)]">
              {{ subtitle() }}
            </p>
          }
        </div>
      }
      <div class="flex w-full items-center justify-between gap-[var(--index-données-datatable-action-gap-zones)] bg-[var(--index-données-datatable-bg-action)] pr-[var(--index-données-datatable-action-pad-h)] py-[var(--index-données-datatable-action-pad-v)]">
        <div class="flex items-center gap-[var(--index-données-datatable-action-gap)]">
          @if (searchable()) {
            <soc-search-bar placeholder="Rechercher ici..." (valueChange)="search.emit($event)" class="w-[260px] h-[var(--index-input-searchbar-field-height)]" />
          }
          <ng-content select="[socDataTableFilters]" />
        </div>
        @if (hasActions()) {
          <div class="flex items-center gap-[var(--index-données-datatable-action-gap)]">
            <ng-content select="[socDataTableActions]" />
          </div>
        }
      </div>
      @if (mode() === 'table') {
        <div class="w-full overflow-x-auto">
          <table class="w-full min-w-max border-collapse">
            <thead>
              <tr>
                @if (selectable()) {
                  <th class="border-b-[length:var(--index-données-datatable-cell-border-width)] border-[var(--index-données-datatable-cell-border)] bg-[var(--index-données-datatable-header-bg)] py-[var(--index-données-datatable-header-pad-v)] pl-[var(--index-données-datatable-title-zone-pad-h)] pr-[var(--index-données-datatable-checkbox-col-pad-right)] text-left">
                    <soc-checkbox [checked]="allSelected()" (checkedChange)="toggleAll()" />
                  </th>
                }
                @for (column of columns(); track column.key; let index = $index) {
                  <th
                    [class]="'border-b-[length:var(--index-données-datatable-cell-border-width)] border-[var(--index-données-datatable-cell-border)] bg-[var(--index-données-datatable-header-bg)] py-[var(--index-données-datatable-header-pad-v)] pr-[var(--index-données-datatable-header-pad-h)] text-left text-[length:var(--index-données-datatable-header-size)] text-[var(--index-données-datatable-header-color)] [font-family:var(--index-données-datatable-header-font)] [font-weight:var(--index-données-datatable-header-weight)] ' + (index === 0 && !selectable() ? 'pl-[var(--index-données-datatable-title-zone-pad-h)]' : 'pl-[var(--index-données-datatable-header-pad-h)]')"
                  >
                    {{ column.header }}
                  </th>
                }
                @if (hasRowActions()) {
                  <th class="border-b-[length:var(--index-données-datatable-cell-border-width)] border-[var(--index-données-datatable-cell-border)] bg-[var(--index-données-datatable-header-bg)] w-[62px]"></th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track rowKey()(row)) {
                @let key = rowKey()(row);
                <tr (click)="onRowClick(row)" [class]="'group ' + (rowClickable() ? 'cursor-pointer' : '')">
                  @if (selectable()) {
                    <td
                      (click)="$event.stopPropagation()"
                      class="border-b-[length:var(--index-données-datatable-cell-border-width)] border-[var(--index-données-datatable-cell-border)] bg-[var(--index-données-datatable-cell-bg)] py-[var(--index-données-datatable-cell-pad-v)] pl-[var(--index-données-datatable-title-zone-pad-h)] pr-[var(--index-données-datatable-checkbox-col-pad-right)] group-hover:bg-[var(--index-données-datatable-cell-bg-hover)]"
                    >
                      <soc-checkbox [checked]="isSelected(key)" (checkedChange)="toggleRow(key)" />
                    </td>
                  }
                  @for (column of columns(); track column.key; let index = $index) {
                    <td
                      [class]="'border-b-[length:var(--index-données-datatable-cell-border-width)] border-[var(--index-données-datatable-cell-border)] bg-[var(--index-données-datatable-cell-bg)] py-[var(--index-données-datatable-cell-pad-v)] pr-[var(--index-données-datatable-cell-pad-h)] text-[length:var(--index-données-datatable-cell-size)] text-[var(--index-données-datatable-cell-color)] [font-family:var(--index-données-datatable-cell-font)] [font-weight:var(--index-données-datatable-cell-weight)] group-hover:bg-[var(--index-données-datatable-cell-bg-hover)] ' + (index === 0 && !selectable() ? 'pl-[var(--index-données-datatable-title-zone-pad-h)]' : 'pl-[var(--index-données-datatable-cell-pad-h)]')"
                    >
                      @if (templateOf(column); as tpl) {
                        <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{ $implicit: row, row: row }" />
                      } @else {
                        {{ textOf(column, row) }}
                      }
                    </td>
                  }
                  @if (hasRowActions()) {
                    <td
                      (click)="$event.stopPropagation()"
                      class="border-b-[length:var(--index-données-datatable-cell-border-width)] border-[var(--index-données-datatable-cell-border)] bg-[var(--index-données-datatable-cell-bg)] px-[var(--index-données-datatable-cell-pad-h)] py-[var(--index-données-datatable-cell-pad-v)] text-center group-hover:bg-[var(--index-données-datatable-cell-bg-hover)]"
                    >
                      @if (rowActionsMenu(); as menu) {
                        <soc-popover position="bottom-end" [open]="openActionsKey() === key" (openChange)="setActionsOpen(key, $event)">
                          <soc-tooltip socPopoverTrigger>
                            <button type="button" aria-label="Actions" [class]="rowActionButtonClass">
                              <svg lucideMoreHorizontal class="size-full" [strokeWidth]="1.5"></svg>
                            </button>
                            <span socTooltipLabel>Actions</span>
                          </soc-tooltip>
                          <ng-container [ngTemplateOutlet]="menu" [ngTemplateOutletContext]="{ $implicit: row, row: row, close: closeActions }" />
                        </soc-popover>
                      } @else {
                        <soc-tooltip>
                          <button type="button" (click)="rowAction.emit(row)" aria-label="Actions" [class]="rowActionButtonClass">
                            <svg lucideMoreHorizontal class="size-full" [strokeWidth]="1.5"></svg>
                          </button>
                          <span socTooltipLabel>Actions</span>
                        </soc-tooltip>
                      }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
      @if (mode() === 'card') {
        <soc-card-grid mode="fixed" gap="md" class="pr-[var(--index-données-datatable-title-zone-pad-h)] py-[var(--index-données-datatable-cell-pad-v)]">
          @for (row of rows(); track rowKey()(row)) {
            @let key = rowKey()(row);
            @let content = cardContent()?.(row);
            @if (content) {
              <soc-card
                [title]="content.title"
                [subtitle]="content.subtitle"
                [type]="rowClickable() ? 'selectable' : 'default'"
                (cardClick)="rowClick.emit(row)"
                (action)="onCardAction(row)"
              >
                @if (rowActionsMenu(); as menu) {
                  <!-- stopPropagation on this wrapper, not the trigger button: same reason as the
                       table-row version stopping propagation on the wrapping td. -->
                  <span socCardActionSlot (click)="$event.stopPropagation()">
                    <soc-popover position="bottom-end" [open]="openActionsKey() === key" (openChange)="setActionsOpen(key, $event)">
                      <soc-tooltip socPopoverTrigger>
                        <button type="button" aria-label="Actions" [class]="cardActionButtonClass">
                          <svg lucideMoreHorizontal class="size-[var(--index-conteneur-card-action-icon-size)] text-[var(--index-conteneur-card-action-icon-color)]" [strokeWidth]="cardActionIconThickness"></svg>
                        </button>
                        <span socTooltipLabel>Actions</span>
                      </soc-tooltip>
                      <ng-container [ngTemplateOutlet]="menu" [ngTemplateOutletContext]="{ $implicit: row, row: row, close: closeActions }" />
                    </soc-popover>
                  </span>
                }
                @if (content.body; as body) {
                  <ng-container [ngTemplateOutlet]="body" [ngTemplateOutletContext]="{ $implicit: row, row: row }" />
                }
                @if (content.footer; as footer) {
                  <div socCardFooter>
                    <ng-container [ngTemplateOutlet]="footer" [ngTemplateOutletContext]="{ $implicit: row, row: row }" />
                  </div>
                }
              </soc-card>
            }
          }
        </soc-card-grid>
      }
      @if (pagination(); as pager) {
        <div class="flex w-full items-center justify-center bg-[var(--index-données-datatable-bg-pagination)] px-[var(--index-données-datatable-pagination-pad-h)] py-[var(--index-données-datatable-pagination-pad-v)]">
          <soc-pagination
            class="w-full"
            [currentPage]="pager.currentPage"
            [totalPages]="pager.totalPages"
            [totalEntries]="pager.totalEntries"
            [pageSize]="pager.pageSize"
            (pageChange)="pageChange.emit($event)"
            (pageSizeChange)="pageSizeChange.emit($event)"
          />
        </div>
      }
    }
  `,
  styleUrl: './data-table.css',
})
export class SocDataTable<T> {
  readonly mode = input<DataTableMode>('table');
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly columns = input.required<DataTableColumn<T>[]>();
  readonly cardContent = input<(row: T) => DataTableCardContent<T>>();
  readonly rows = input.required<T[]>();
  readonly rowKey = input.required<(row: T) => string>();

  readonly selectable = input(false);
  readonly selectedKeys = input<Set<string>>();
  readonly selectedKeysChange = output<Set<string>>();

  readonly searchable = input(false);
  readonly search = output<string>();

  readonly rowClickable = input(false);
  readonly rowClick = output<T>();
  readonly rowActions = input(false);
  readonly rowAction = output<T>();
  readonly rowActionsMenu = input<TemplateRef<DataTableRowActionsContext<T>>>();

  readonly pagination = input<DataTablePagination>();
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  private readonly actionsContent = contentChild(SocDataTableActions);
  protected readonly hasActions = computed(() => !!this.actionsContent());
  protected readonly hasRowActions = computed(() => this.rowActions() || !!this.rowActionsMenu());

  protected readonly rowActionButtonClass = ROW_ACTION_BUTTON_CLASS;
  protected readonly cardActionButtonClass = CARD_ACTION_BUTTON_CLASS;
  protected readonly cardActionIconThickness = 'var(--index-conteneur-card-action-icon-thickness)';

  protected readonly record = computed(() => this.rows()[0]);

  protected readonly openActionsKey = signal<string | null>(null);
  protected setActionsOpen(key: string, open: boolean): void {
    this.openActionsKey.set(open ? key : null);
  }
  protected readonly closeActions = (): void => this.openActionsKey.set(null);

  protected templateOf(column: DataTableColumn<T>): TemplateRef<DataTableCellContext<T>> | null {
    return column.render instanceof TemplateRef ? column.render : null;
  }

  protected textOf(column: DataTableColumn<T>, row: T): string {
    return typeof column.render === 'function' ? column.render(row) : '';
  }

  protected readonly allKeys = computed(() => this.rows().map(this.rowKey()));
  protected readonly allSelected = computed(
    () => this.selectable() && this.allKeys().length > 0 && this.allKeys().every((key) => this.selectedKeys()?.has(key)),
  );

  protected isSelected(key: string): boolean {
    return this.selectedKeys()?.has(key) ?? false;
  }

  protected toggleAll(): void {
    this.selectedKeysChange.emit(this.allSelected() ? new Set() : new Set(this.allKeys()));
  }

  protected toggleRow(key: string): void {
    const next = new Set(this.selectedKeys());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.selectedKeysChange.emit(next);
  }

  protected onRowClick(row: T): void {
    if (this.rowClickable()) this.rowClick.emit(row);
  }

  // Card's own "•••" button: only wired to `rowAction` when no `rowActionsMenu` replaces it
  // (React: `onAction={!rowActionsMenu && onRowAction ? ... : undefined}`).
  protected onCardAction(row: T): void {
    if (!this.rowActionsMenu() && this.rowActions()) this.rowAction.emit(row);
  }
}
