import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, ViewEncapsulation, input, model } from '@angular/core';
import { LucideChevronDown, LucideChevronRight } from '@lucide/angular';
import { labsFocusRing } from '../internal/classes';

/** Contexte d'une cellule riche : la ligne et sa profondeur (0 = ligne, 1 = sous-ligne…). */
export interface LabsGroupedTableCellContext<T> {
  $implicit: T;
  depth: number;
}

/** Même forme que `DataTableColumn` du kit, plus une largeur optionnelle. */
export interface LabsGroupedTableColumn<T> {
  key: string;
  header: string;
  render: ((row: T) => string) | TemplateRef<LabsGroupedTableCellContext<T>>;
  /** Largeur CSS de la colonne (`'30%'`, `'10rem'`…). */
  width?: string;
}

export interface LabsGroupedTableGroup<G, T> {
  key: string;
  data: G;
  rows: T[];
}

/** Contexte du template d'en-tête de groupe. */
export interface LabsGroupedTableGroupContext<G, T> {
  $implicit: G;
  rows: T[];
  expanded: boolean;
}

interface VisibleRow<T> {
  row: T;
  key: string;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
}

const textClass =
  'text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-primary)] [font-family:var(--bridges-shape-text-body-font)]';

const toggleBase = `${labsFocusRing} inline-flex shrink-0 items-center justify-center rounded-[var(--bridges-shape-figure-radius-sm)] text-[var(--bridges-color-icon-default)] hover:bg-[var(--bridges-color-background-layer-2-hover)]`;

/**
 * ## Rôle
 * Tableau dont les lignes sont regroupées (une ligne d'en-tête par groupe, repliable) et dont chaque
 * ligne peut porter des sous-lignes dépliables, indentées. Exemple : objectifs groupés par
 * collaborateur, un objectif dépliant ses sous-objectifs. `soc-data-table` reste le tableau par défaut
 * pour une liste plate.
 *
 * Présentationnel : la page fournit les groupes déjà filtrés et paginés, et pilote l'état replié via
 * `expandedGroups` / `expandedRows` (`model()`, pour un bouton « Tout déplier »). Un groupe ou une ligne
 * est déplié si sa clé est dans l'ensemble.
 *
 * ## Accessibilité
 * Vrai `<table>` : un `<tbody>` par groupe, en-tête de groupe en `<th scope="rowgroup">`. Les boutons
 * de repli sont de vrais `<button>` avec `aria-expanded` et un nom (« Déplier les lignes de … »),
 * construit avec `groupLabel` / `rowLabel`. `caption` (masquée) nomme le tableau.
 */
@Component({
  selector: 'soc-labs-grouped-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet, LucideChevronDown, LucideChevronRight],
  host: { class: 'block w-full overflow-x-auto' },
  template: `
    <table class="w-full border-collapse">
      @if (caption()) {
        <caption class="sr-only">{{ caption() }}</caption>
      }
      <thead>
        <tr class="border-b-[length:var(--bridges-shape-line-default)] border-[var(--bridges-color-border-subtle)]">
          @for (col of columns(); track col.key) {
            <th
              scope="col"
              [style.width]="col.width ?? null"
              class="px-[var(--bridges-position-padding-md)] py-[var(--bridges-position-padding-sm)] text-left whitespace-nowrap text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-primary)] [font-family:var(--bridges-shape-text-label-font)] [font-weight:var(--bridges-shape-text-label-weight)]"
            >
              {{ col.header }}
            </th>
          }
        </tr>
      </thead>
      @if (groups().length === 0) {
        <tbody>
          <tr>
            <td [attr.colspan]="columns().length" [class]="emptyCellClass">
              {{ emptyText() }}
            </td>
          </tr>
        </tbody>
      }
      @for (group of groups(); track group.key) {
        <tbody [attr.data-group]="group.key">
          <tr class="bg-[var(--bridges-color-background-layer-1)] border-b-[length:var(--bridges-shape-line-default)] border-[var(--bridges-color-border-subtle)]">
            <th scope="rowgroup" [attr.colspan]="columns().length" class="px-[var(--bridges-position-padding-md)] py-[var(--bridges-position-padding-sm)] text-left [font-weight:inherit]">
              <div class="flex items-center gap-[var(--bridges-position-gap-sm)]">
                <button
                  type="button"
                  data-toggle="group"
                  [attr.aria-expanded]="isGroupExpanded(group.key)"
                  [attr.aria-label]="(isGroupExpanded(group.key) ? 'Replier ' : 'Déplier ') + groupLabel()(group.data)"
                  (click)="toggleGroup(group.key)"
                  [class]="groupToggleClass"
                >
                  @if (isGroupExpanded(group.key)) {
                    <svg lucideChevronDown aria-hidden="true" class="size-[var(--bridges-size-icon-sm)]"></svg>
                  } @else {
                    <svg lucideChevronRight aria-hidden="true" class="size-[var(--bridges-size-icon-sm)]"></svg>
                  }
                </button>
                <div class="min-w-0 flex-1">
                  @if (groupHeader(); as tpl) {
                    <ng-container
                      [ngTemplateOutlet]="tpl"
                      [ngTemplateOutletContext]="{ $implicit: group.data, rows: group.rows, expanded: isGroupExpanded(group.key) }"
                    />
                  }
                </div>
              </div>
            </th>
          </tr>
          @if (isGroupExpanded(group.key)) {
            @for (item of visibleRows(group.rows); track item.key) {
              <tr [attr.data-row]="item.key" [attr.data-depth]="item.depth" class="border-b-[length:var(--bridges-shape-line-default)] border-[var(--bridges-color-border-subtle)]">
                @for (col of columns(); track col.key; let first = $first) {
                  <td [class]="cellClass">
                    @if (first) {
                      <div class="flex items-center gap-[var(--bridges-position-gap-xs)]" [style.padding-left]="'calc(' + item.depth + ' * var(--bridges-position-padding-xl))'">
                        @if (item.hasChildren) {
                          <button
                            type="button"
                            data-toggle="row"
                            [attr.aria-expanded]="item.expanded"
                            [attr.aria-label]="(item.expanded ? 'Replier les sous-lignes de ' : 'Déplier les sous-lignes de ') + rowLabel()(item.row)"
                            (click)="toggleRow(item.key)"
                            [class]="rowToggleClass"
                          >
                            @if (item.expanded) {
                              <svg lucideChevronDown aria-hidden="true" class="size-[var(--bridges-size-icon-sm)]"></svg>
                            } @else {
                              <svg lucideChevronRight aria-hidden="true" class="size-[var(--bridges-size-icon-sm)]"></svg>
                            }
                          </button>
                        } @else {
                          <span aria-hidden="true" class="inline-block shrink-0 size-[var(--bridges-size-icon-lg)]"></span>
                        }
                        <div class="min-w-0">
                          <ng-container [ngTemplateOutlet]="cell" [ngTemplateOutletContext]="{ col, item }" />
                        </div>
                      </div>
                    } @else {
                      <ng-container [ngTemplateOutlet]="cell" [ngTemplateOutletContext]="{ col, item }" />
                    }
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      }
    </table>

    <ng-template #cell let-col="col" let-item="item">
      @if (isTemplate(col.render)) {
        <ng-container [ngTemplateOutlet]="col.render" [ngTemplateOutletContext]="{ $implicit: item.row, depth: item.depth }" />
      } @else {
        {{ col.render(item.row) }}
      }
    </ng-template>
  `,
})
export class SocLabsGroupedTable<G, T> {
  readonly columns = input.required<LabsGroupedTableColumn<T>[]>();
  readonly groups = input.required<LabsGroupedTableGroup<G, T>[]>();
  readonly rowKey = input.required<(row: T) => string>();
  /** Sous-lignes d'une ligne (aucune par défaut). */
  readonly childRows = input<(row: T) => T[]>(() => []);
  /** Contenu de la ligne d'en-tête de groupe (à droite du bouton de repli). */
  readonly groupHeader = input<TemplateRef<LabsGroupedTableGroupContext<G, T>>>();
  /** Nom d'un groupe pour le bouton de repli (« Déplier {nom} »). */
  readonly groupLabel = input<(group: G) => string>(() => 'le groupe');
  /** Nom d'une ligne pour son bouton de repli. */
  readonly rowLabel = input<(row: T) => string>(() => 'la ligne');
  readonly caption = input<string>();
  readonly emptyText = input('Aucun résultat.');
  readonly expandedGroups = model<Set<string>>(new Set());
  readonly expandedRows = model<Set<string>>(new Set());

  protected readonly cellClass = `px-[var(--bridges-position-padding-md)] py-[var(--bridges-position-padding-sm)] align-middle ${textClass}`;
  protected readonly emptyCellClass = `px-[var(--bridges-position-padding-md)] py-[var(--bridges-position-padding-md)] ${textClass}`;
  protected readonly groupToggleClass = `${toggleBase} size-[var(--bridges-size-icon-xl)]`;
  protected readonly rowToggleClass = `${toggleBase} size-[var(--bridges-size-icon-lg)]`;

  protected isGroupExpanded(key: string): boolean {
    return this.expandedGroups().has(key);
  }

  protected toggleGroup(key: string): void {
    this.expandedGroups.set(toggled(this.expandedGroups(), key));
  }

  protected toggleRow(key: string): void {
    this.expandedRows.set(toggled(this.expandedRows(), key));
  }

  /** Lignes affichées d'un groupe, sous-lignes dépliées comprises, dans l'ordre. */
  protected visibleRows(rows: T[], depth = 0): VisibleRow<T>[] {
    const out: VisibleRow<T>[] = [];
    for (const row of rows) {
      const key = this.rowKey()(row);
      const children = this.childRows()(row);
      const expanded = children.length > 0 && this.expandedRows().has(key);
      out.push({ row, key, depth, hasChildren: children.length > 0, expanded });
      if (expanded) out.push(...this.visibleRows(children, depth + 1));
    }
    return out;
  }

  protected isTemplate(render: unknown): render is TemplateRef<LabsGroupedTableCellContext<T>> {
    return render instanceof TemplateRef;
  }
}

function toggled(set: Set<string>, key: string): Set<string> {
  const next = new Set(set);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}
