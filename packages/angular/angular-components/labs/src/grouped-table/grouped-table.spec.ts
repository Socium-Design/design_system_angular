import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, qa } from '../../../src/testing/helpers';
import { SocLabsGroupedTable, type LabsGroupedTableColumn, type LabsGroupedTableGroup } from './grouped-table';

interface Row {
  id: string;
  title: string;
  children?: Row[];
}
interface Person {
  name: string;
}

@Component({
  standalone: true,
  imports: [SocLabsGroupedTable],
  template: `
    <soc-labs-grouped-table
      caption="Objectifs"
      [columns]="columns"
      [groups]="groups()"
      [rowKey]="rowKey"
      [childRows]="childRows"
      [groupHeader]="header"
      [groupLabel]="groupLabel"
      [rowLabel]="rowLabel"
      emptyText="Aucun résultat ne correspond à votre recherche."
      [(expandedGroups)]="expandedGroups"
      [(expandedRows)]="expandedRows"
    />
    <ng-template #header let-person let-rows="rows"><span class="hdr">{{ person.name }} — {{ rows.length }}</span></ng-template>
    <ng-template #title let-row let-depth="depth"><b>{{ row.title }}</b><i>{{ depth }}</i></ng-template>
  `,
})
class Host {
  columns: LabsGroupedTableColumn<Row>[] = [
    { key: 'title', header: 'Objectif', render: (r) => r.title },
    { key: 'id', header: 'Id', render: (r) => r.id },
  ];
  groups = signal<LabsGroupedTableGroup<Person, Row>[]>([
    { key: 'a', data: { name: 'Thierno Adam' }, rows: [{ id: 'o1', title: 'Objectif 1', children: [{ id: 's1', title: 'Sous 1' }] }, { id: 'o2', title: 'Objectif 2' }] },
    { key: 'b', data: { name: 'Awa Diop' }, rows: [{ id: 'o3', title: 'Objectif 3' }] },
  ]);
  expandedGroups = new Set(['a']);
  expandedRows = new Set<string>();
  rowKey = (r: Row) => r.id;
  childRows = (r: Row) => r.children ?? [];
  groupLabel = (p: Person) => `les objectifs de ${p.name}`;
  rowLabel = (r: Row) => r.title;
}

describe('Labs / GroupedTable', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const rows = () => qa(fixture, 'tr[data-row]').map((tr) => tr.getAttribute('data-row'));
    return { fixture, host: fixture.componentInstance, rows };
  }

  it('renders a real table, one tbody per group with a rowgroup header from the template', () => {
    const { fixture } = setup();
    expect(q(fixture, 'caption').textContent!.trim()).toBe('Objectifs');
    expect(qa(fixture, 'tbody[data-group]').length).toBe(2);
    const headers = qa(fixture, 'th[scope="rowgroup"]');
    expect(headers[0].getAttribute('colspan')).toBe('2');
    expect(headers[0].querySelector('.hdr')!.textContent).toBe('Thierno Adam — 2');
  });

  it('shows rows of expanded groups only, and toggles a group with its button', () => {
    const { fixture, host, rows } = setup();
    expect(rows()).toEqual(['o1', 'o2']);
    const toggle = qa<HTMLButtonElement>(fixture, 'button[data-toggle="group"]')[1];
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBe('Déplier les objectifs de Awa Diop');
    toggle.click();
    fixture.detectChanges();
    expect(rows()).toEqual(['o1', 'o2', 'o3']);
    expect(host.expandedGroups.has('b')).toBeTrue();
  });

  it('expands sub-rows under their parent, indented by depth', () => {
    const { fixture, host, rows } = setup();
    const toggles = qa<HTMLButtonElement>(fixture, 'button[data-toggle="row"]');
    expect(toggles.length).toBe(1);
    expect(toggles[0].getAttribute('aria-label')).toBe('Déplier les sous-lignes de Objectif 1');
    toggles[0].click();
    fixture.detectChanges();
    expect(rows()).toEqual(['o1', 's1', 'o2']);
    expect(q(fixture, 'tr[data-row="s1"]').getAttribute('data-depth')).toBe('1');
    expect(host.expandedRows.has('o1')).toBeTrue();
  });

  it('is driven from outside (expand all) and shows the empty text without groups', () => {
    const { fixture, host, rows } = setup();
    host.expandedGroups = new Set(['a', 'b']);
    host.expandedRows = new Set(['o1']);
    fixture.detectChanges();
    expect(rows()).toEqual(['o1', 's1', 'o2', 'o3']);
    host.groups.set([]);
    fixture.detectChanges();
    expect(q(fixture, 'tbody td').textContent!.trim()).toBe('Aucun résultat ne correspond à votre recherche.');
  });

  it('renders TemplateRef cells with row and depth', () => {
    @Component({
      standalone: true,
      imports: [SocLabsGroupedTable],
      template: `
        <soc-labs-grouped-table [columns]="[{ key: 't', header: 'T', render: tpl }]" [groups]="groups" [rowKey]="key" [expandedGroups]="open" />
        <ng-template #tpl let-row let-depth="depth"><b>{{ row.title }}:{{ depth }}</b></ng-template>
      `,
    })
    class TplHost {
      groups = [{ key: 'g', data: {}, rows: [{ id: 'x', title: 'X' }] }];
      key = (r: Row) => r.id;
      open = new Set(['g']);
    }
    const fixture = TestBed.createComponent(TplHost);
    fixture.detectChanges();
    expect(q(fixture, 'td b').textContent).toBe('X:0');
  });
});
