import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SocDataTable } from '@socium-design/angular-components';
import { q, qa } from '../../../src/testing/helpers';
import { SocLabsDataTableFit, type LabsDataTableColumn } from './data-table-fit';

interface Row {
  id: string;
  name: string;
  description: string;
  product: string;
  date: string;
}

const LONG = 'Suivi des effectifs, des entrées et des sorties de la direction générale et de ses filiales';
const ROWS: Row[] = [
  { id: '1', name: 'Direction générale — vue consolidée des indicateurs RH', description: LONG, product: 'Workspace, Perf, Job', date: '21/10/2026' },
  { id: '2', name: 'Mon équipe', description: LONG, product: 'Workspace', date: '02/09/2026' },
];

const COLUMNS: LabsDataTableColumn<Row>[] = [
  { key: 'name', header: 'Libellé', render: (row) => row.name, minWidth: '140px' },
  { key: 'description', header: 'Description', render: (row) => row.description },
  { key: 'product', header: 'Produit', render: (row) => row.product, width: '20%' },
  { key: 'date', header: 'Date de création', render: (row) => row.date, wrap: false },
];

// Karma doesn't load the kit stylesheet: these are the three utility classes of the kit's table
// wrapper that matter here (`overflow-x-auto` div, `w-full min-w-max` table).
const KIT_TABLE_CSS = '.overflow-x-auto{overflow-x:auto}.w-full{width:100%}.min-w-max{min-width:max-content}';

@Component({
  standalone: true,
  imports: [SocDataTable, SocLabsDataTableFit],
  template: `
    <div style="width: 600px">
      @if (fit()) {
        <soc-data-table socLabsFitWidth [columns]="columns()" [rows]="rows()" [rowKey]="rowKey" [selectable]="selectable()" [rowActions]="true" />
      } @else {
        <soc-data-table [columns]="columns()" [rows]="rows()" [rowKey]="rowKey" [selectable]="selectable()" [rowActions]="true" />
      }
    </div>
  `,
})
class Host {
  fit = signal(true);
  columns = signal<LabsDataTableColumn<Row>[]>(COLUMNS);
  rows = signal<Row[]>(ROWS);
  selectable = signal(false);
  rowKey = (row: Row) => row.id;
}

/** Number of rendered text lines in a cell (distinct line boxes of its text). */
function lineCount(cell: HTMLElement): number {
  const range = document.createRange();
  range.selectNodeContents(cell);
  return new Set(Array.from(range.getClientRects()).map((rect) => Math.round(rect.top))).size;
}

describe('Labs / DataTableFit (socLabsFitWidth)', () => {
  let style: HTMLStyleElement;
  beforeEach(() => {
    style = document.createElement('style');
    style.textContent = KIT_TABLE_CSS;
    document.head.appendChild(style);
  });
  afterEach(() => style.remove());

  function setup(fit = true) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.fit.set(fit);
    fixture.detectChanges();
    const table = () => q<HTMLTableElement>(fixture, 'table');
    const headers = () => qa<HTMLTableCellElement>(fixture, 'thead th');
    const cells = (rowIndex: number) => Array.from(table().tBodies[0].rows[rowIndex].cells);
    return { fixture, host: fixture.componentInstance, table, headers, cells };
  }

  it('without the attribute, the kit table keeps its width (overflows a narrow container, no wrapping)', () => {
    const { table, cells } = setup(false);
    expect(table().style.minWidth).toBe('');
    expect(table().getBoundingClientRect().width).toBeGreaterThan(600);
    expect(lineCount(cells(0)[1])).toBe(1);
  });

  it('fits a narrow container: no horizontal overflow, the row actions column stays visible', () => {
    const { table, fixture } = setup();
    expect(table().style.minWidth).toBe('0px');
    expect(table().getBoundingClientRect().width).toBeLessThanOrEqual(600);
    const scroller = table().parentElement!;
    expect(scroller.scrollWidth).toBeLessThanOrEqual(scroller.clientWidth);
    const actions = q(fixture, 'tbody tr td:last-child button');
    expect(actions.getBoundingClientRect().right).toBeLessThanOrEqual(scroller.getBoundingClientRect().right);
  });

  it('wraps long text between words, except in wrap: false columns', () => {
    const { cells } = setup();
    const [name, description, , date] = cells(0);
    expect(lineCount(description)).toBeGreaterThan(1);
    expect(lineCount(date)).toBe(1);
    expect(name.style.whiteSpace).toBe('');
    expect(date.style.whiteSpace).toBe('nowrap');
    expect(date.scrollWidth).toBeLessThanOrEqual(date.clientWidth);
  });

  it('applies width and minWidth to the column header', () => {
    const { headers } = setup();
    expect(headers()[0].style.minWidth).toBe('140px');
    expect(headers()[0].getBoundingClientRect().width).toBeGreaterThanOrEqual(140);
    expect(headers()[2].style.width).toBe('20%');
    expect(headers()[3].style.whiteSpace).toBe('nowrap');
  });

  it('shifts by one column when selectable (checkbox column first)', () => {
    const { fixture, host, headers, cells } = setup();
    host.selectable.set(true);
    fixture.detectChanges();
    expect(headers()[0].style.minWidth).toBe('');
    expect(headers()[1].style.minWidth).toBe('140px');
    expect(cells(0)[4].style.whiteSpace).toBe('nowrap');
  });

  it('styles rows added later and clears a removed column setting', () => {
    const { fixture, host, cells, headers } = setup();
    host.rows.set([...ROWS, { id: '3', name: 'Nouveau', description: 'Court', product: 'Job', date: '01/01/2026' }]);
    fixture.detectChanges();
    expect(cells(2)[3].style.whiteSpace).toBe('nowrap');
    host.columns.set(COLUMNS.map((column) => ({ ...column, wrap: undefined, minWidth: undefined })));
    fixture.detectChanges();
    expect(cells(0)[3].style.whiteSpace).toBe('');
    expect(headers()[0].style.minWidth).toBe('');
  });
});
