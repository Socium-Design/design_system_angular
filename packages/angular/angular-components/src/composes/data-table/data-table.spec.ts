import { Component, TemplateRef, computed, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, qa, visiblePanels } from '../../testing/helpers';
import {
  SocDataTable,
  SocDataTableActions,
  SocDataTableBadge,
  type DataTableCardContent,
  type DataTableCellContext,
  type DataTableColumn,
  type DataTableRowActionsContext,
} from './data-table';

interface Row {
  id: string;
  name: string;
  role: string;
}
const ROWS: Row[] = [
  { id: '1', name: 'Dupont', role: 'Admin' },
  { id: '2', name: 'Martin', role: 'Lecteur' },
  { id: '3', name: 'Bernard', role: 'Admin' },
];

@Component({
  selector: 'test-table-host',
  standalone: true,
  imports: [SocDataTable, SocDataTableBadge, SocDataTableActions],
  template: `
    <ng-template #roleCell let-row>[<b>{{ row.role }}</b>]</ng-template>
    <ng-template #menu let-row let-close="close">
      <button class="menu-item" (click)="log.push('menu:' + row.name); close()">Voir {{ row.name }}</button>
    </ng-template>
    <ng-template #body let-row><span class="card-body">body-{{ row.name }}</span></ng-template>
    <soc-data-table
      [mode]="mode()"
      title="Équipe"
      subtitle="Sous-titre"
      [columns]="columns()"
      [rows]="rows"
      [rowKey]="rowKey"
      [selectable]="selectable()"
      [selectedKeys]="selected()"
      (selectedKeysChange)="selected.set($event)"
      [searchable]="searchable()"
      (search)="log.push('search:' + $event)"
      [rowClickable]="rowClickable()"
      (rowClick)="log.push('click:' + $event.name)"
      [rowActions]="rowActions()"
      (rowAction)="log.push('action:' + $event.name)"
      [rowActionsMenu]="withMenu() ? menuTpl() : undefined"
      [cardContent]="cardContent()"
      [pagination]="{ currentPage: 2, totalPages: 9, totalEntries: 90, pageSize: 10 }"
      (pageChange)="log.push('page:' + $event)"
    >
      @if (withSlots()) {
        <span socDataTableBadge class="badge">3</span>
      }
      @if (withSlots()) {
        <button socDataTableActions class="add">Ajouter</button>
      }
    </soc-data-table>
  `,
})
class TableHost {
  rows = ROWS;
  rowKey = (r: Row) => r.id;
  log: string[] = [];
  mode = signal<'table' | 'detail' | 'card'>('table');
  selectable = signal(false);
  selected = signal<Set<string> | undefined>(undefined);
  searchable = signal(false);
  rowClickable = signal(false);
  rowActions = signal(false);
  withMenu = signal(false);
  withSlots = signal(false);
  private readonly roleCell = viewChild.required<TemplateRef<DataTableCellContext<Row>>>('roleCell');
  protected readonly menuTpl = viewChild.required<TemplateRef<DataTableRowActionsContext<Row>>>('menu');
  private readonly body = viewChild.required<TemplateRef<DataTableCellContext<Row>>>('body');
  columns = computed<DataTableColumn<Row>[]>(() => [
    { key: 'name', header: 'Nom', render: (r) => r.name },
    { key: 'role', header: 'Rôle', render: this.roleCell() },
  ]);
  cardContent = computed(() => (r: Row): DataTableCardContent<Row> => ({ title: r.name, subtitle: r.role, body: this.body() }));
}

describe('DataTable', () => {
  function setup(patch: (h: TableHost) => void = () => {}) {
    const fixture = TestBed.createComponent(TableHost);
    patch(fixture.componentInstance);
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance };
  }
  const bodyRows = (f: { nativeElement: Element }) => qa(f.nativeElement, 'tbody tr');

  it('renders title, headers and one row per record, with string and TemplateRef cells', () => {
    const { fixture } = setup();
    expect(q(fixture, 'soc-data-table').textContent).toContain('Équipe');
    expect(qa(fixture, 'th').map((h) => h.textContent!.trim())).toEqual(['Nom', 'Rôle']);
    const rows = bodyRows(fixture);
    expect(rows.length).toBe(3);
    expect(rows[0].querySelectorAll('td')[0].textContent!.trim()).toBe('Dupont');
    expect(rows[0].querySelector('td b')!.textContent).toBe('Admin'); // TemplateRef cell
  });

  it('only renders the search bar / checkbox column / actions column when asked to', () => {
    const { fixture } = setup();
    expect(qa(fixture, 'soc-search-bar').length).toBe(0);
    expect(qa(fixture, 'soc-checkbox').length).toBe(0);
    expect(qa(fixture, 'button[aria-label=Actions]').length).toBe(0);
  });

  it('emits `search` with the raw query on every keystroke', () => {
    const { fixture, host } = setup((h) => h.searchable.set(true));
    const input = q<HTMLInputElement>(fixture, 'soc-search-bar input');
    input.value = 'mar';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(host.log).toEqual(['search:mar']);
  });

  it('projects badge/actions slots, and hides the actions wrapper when nothing is projected', () => {
    const without = setup().fixture;
    expect(qa(without, '.add').length).toBe(0);
    const { fixture } = setup((h) => h.withSlots.set(true));
    expect(q(fixture, '.badge').textContent).toBe('3');
    expect(q(fixture, '.add').textContent).toBe('Ajouter');
  });

  describe('selection', () => {
    it('toggles a row, then everything, then nothing', () => {
      const { fixture, host } = setup((h) => h.selectable.set(true));
      const boxes = () => qa(fixture, 'tbody soc-checkbox [role=checkbox]');
      boxes()[1].click();
      fixture.detectChanges();
      expect([...host.selected()!]).toEqual(['2']);

      q(fixture, 'thead [role=checkbox]').click();
      fixture.detectChanges();
      expect([...host.selected()!].sort()).toEqual(['1', '2', '3']);
      expect(q(fixture, 'thead [role=checkbox]').getAttribute('aria-checked')).toBe('true');

      q(fixture, 'thead [role=checkbox]').click();
      fixture.detectChanges();
      expect(host.selected()!.size).toBe(0);
    });

    it('clicking a checkbox never triggers rowClick', () => {
      const { fixture, host } = setup((h) => {
        h.selectable.set(true);
        h.rowClickable.set(true);
      });
      qa(fixture, 'tbody soc-checkbox [role=checkbox]')[0].click();
      expect(host.log).toEqual([]);
    });
  });

  describe('row interactions', () => {
    it('rowClick fires on the row, rowAction on "•••" alone (never both)', () => {
      const { fixture, host } = setup((h) => {
        h.rowClickable.set(true);
        h.rowActions.set(true);
      });
      bodyRows(fixture)[1].querySelector('td')!.click();
      expect(host.log).toEqual(['click:Martin']);
      host.log.length = 0;
      bodyRows(fixture)[2].querySelector<HTMLButtonElement>('button[aria-label=Actions]')!.click();
      expect(host.log).toEqual(['action:Bernard']);
    });

    it('rows are not clickable unless rowClickable is set', () => {
      const { fixture, host } = setup();
      bodyRows(fixture)[0].querySelector('td')!.click();
      expect(host.log).toEqual([]);
    });

    it('rowActionsMenu opens a per-row popover whose template gets the row and a close()', () => {
      const { fixture, host } = setup((h) => {
        h.withMenu.set(true);
        h.rowClickable.set(true);
      });
      bodyRows(fixture)[1].querySelector<HTMLButtonElement>('button[aria-label=Actions]')!.click();
      fixture.detectChanges();
      const panel = visiblePanels()[0];
      expect(panel.textContent).toContain('Voir Martin');
      panel.querySelector<HTMLButtonElement>('.menu-item')!.click();
      fixture.detectChanges();
      expect(host.log).toEqual(['menu:Martin']); // not also click:Martin
      expect(visiblePanels().length).toBe(0); // close() ran
    });
  });

  it('forwards pagination data and emits pageChange', () => {
    const { fixture, host } = setup();
    expect(q(fixture, 'soc-pagination').textContent).toContain('Affichage de 11 à 20 sur 90');
    qa<HTMLButtonElement>(fixture, 'soc-pagination button').find((b) => b.textContent!.trim() === '3')!.click();
    expect(host.log).toEqual(['page:3']);
  });

  it('detail mode shows the first record as label/value rows, without a table', () => {
    const { fixture } = setup((h) => h.mode.set('detail'));
    expect(qa(fixture, 'table').length).toBe(0);
    const text = q(fixture, 'soc-data-table').textContent!;
    expect(text).toContain('Nom');
    expect(text).toContain('Dupont');
    expect(text).not.toContain('Martin');
  });

  describe('card mode', () => {
    it('renders one card per row from cardContent (title, subtitle, TemplateRef body), no table', () => {
      const { fixture } = setup((h) => h.mode.set('card'));
      expect(qa(fixture, 'table').length).toBe(0);
      const cards = qa(fixture, 'soc-card');
      expect(cards.length).toBe(3);
      expect(cards[0].textContent).toContain('Dupont');
      expect(cards[0].querySelector('.card-body')!.textContent).toBe('body-Dupont');
    });

    it('cards are selectable/clickable only with rowClickable, and rowAction fires from their "•••"', () => {
      const { fixture, host } = setup((h) => {
        h.mode.set('card');
        h.rowClickable.set(true);
        h.rowActions.set(true);
      });
      const card = qa(fixture, 'soc-card')[1];
      card.click();
      expect(host.log).toEqual(['click:Martin']);
      host.log.length = 0;
      card.querySelector<HTMLButtonElement>('button[aria-label=Actions]')!.click();
      expect(host.log).toEqual(['action:Martin']);
    });
  });
});
