import { Directive, ElementRef, afterRenderEffect, inject } from '@angular/core';
import { SocDataTable, type DataTableColumn } from '@socium-design/angular-components';

/**
 * `DataTableColumn` + per-column sizing, read by `socLabsFitWidth`. Structurally a
 * `DataTableColumn`: pass it straight to `soc-data-table`'s `[columns]`.
 */
export interface LabsDataTableColumn<T> extends DataTableColumn<T> {
  /** CSS width of the column (`'30%'`, `'12rem'`, `'var(--…)'`). In an auto-layout table it is the
   * width the column gets when there is room, and the width it keeps longest when there isn't. */
  width?: string;
  /** CSS minimum width: the column never gets narrower (its text wraps first). */
  minWidth?: string;
  /** `false` keeps the column on one line (actions, dates, short codes). Default `true`: the text
   * wraps between words when the table runs out of room. */
  wrap?: boolean;
}

/**
 * ## Rôle
 * Fait tenir un `soc-data-table` (`mode="table"`) dans la largeur disponible : le `<table>` du kit
 * porte `min-w-max`, il prend toujours la largeur de son contenu et déborde (dernières colonnes,
 * dont les actions, coupées). Avec `socLabsFitWidth`, la table ne dépasse plus son conteneur : le
 * texte des cellules passe à la ligne, et chaque colonne peut recevoir une largeur, une largeur
 * minimale ou rester sur une ligne (`LabsDataTableColumn`).
 *
 * ```html
 * <soc-data-table socLabsFitWidth [columns]="columns" [rows]="rows" [rowKey]="rowKey" />
 * ```
 * ```ts
 * columns: LabsDataTableColumn<Tableau>[] = [
 *   { key: 'libelle', header: 'Libellé', render: libelleCell, minWidth: '12rem' },
 *   { key: 'actions', header: '', render: actionsCell, wrap: false },
 * ];
 * ```
 *
 * ## Fonctionnement (GAP-DECISION)
 * Directive posée sur le composant du kit, sans le modifier ni le copier : elle lit ses `columns`
 * / `rows` / `selectable` et pose, après chaque rendu, des styles en ligne sur le `<table>`
 * (`min-width: 0`, qui l'emporte sur `min-w-max`) et sur les cellules de chaque colonne. Sans
 * l'attribut, le tableau garde exactement son comportement actuel. Une table qui ne peut vraiment
 * pas tenir (somme des `minWidth` et des colonnes `wrap: false` plus large que le conteneur)
 * défile horizontalement, comme aujourd'hui.
 *
 * Sans effet sur `mode="detail"` et `mode="card"` (pas de `<table>`).
 */
@Directive({
  selector: 'soc-data-table[socLabsFitWidth]',
  standalone: true,
  host: { 'data-labs-fit-width': '' },
})
export class SocLabsDataTableFit {
  private readonly table = inject<SocDataTable<unknown>>(SocDataTable);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    afterRenderEffect(() => {
      const columns = this.table.columns() as LabsDataTableColumn<unknown>[];
      // Read so the effect re-runs once new rows / the checkbox column are in the DOM.
      this.table.rows();
      this.table.mode();
      const offset = this.table.selectable() ? 1 : 0;
      this.apply(columns, offset);
    });
  }

  private apply(columns: LabsDataTableColumn<unknown>[], offset: number): void {
    const table = this.host.querySelector('table');
    if (!table) return;
    table.style.minWidth = '0';
    const headRow = table.tHead?.rows[0];
    const bodyRows = Array.from(table.tBodies[0]?.rows ?? []);
    columns.forEach((column, index) => {
      const whiteSpace = column.wrap === false ? 'nowrap' : '';
      const th = headRow?.cells[index + offset];
      if (th) {
        th.style.width = column.width ?? '';
        th.style.minWidth = column.minWidth ?? '';
        th.style.whiteSpace = whiteSpace;
      }
      for (const row of bodyRows) {
        const td = row.cells[index + offset];
        if (td) td.style.whiteSpace = whiteSpace;
      }
    });
  }
}
