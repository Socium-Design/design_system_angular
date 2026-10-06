import { Component, TemplateRef, computed, signal, viewChild } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideEye, LucidePencil, LucidePlus, LucideTrash2 } from '@lucide/angular';
import { SocBadge } from '../../primitifs/badge/badge';
import { SocButton, SocButtonLeftIcon } from '../../primitifs/button/button';
import { SocSwitch } from '../../primitifs/switch/switch';
import { SocTag } from '../../primitifs/tag/tag';
import { SocMenu, SocMenuItem, SocMenuItemIcon } from '../menu/menu';
import {
  SocDataTable,
  SocDataTableActions,
  SocDataTableBadge,
  type DataTableCardContent,
  type DataTableCellContext,
  type DataTableColumn,
  type DataTableRowActionsContext,
} from './data-table';

interface Person {
  id: string;
  name: string;
  firstName: string;
  email: string;
  role: string;
  status: 'Actif' | 'Inactif';
}

const ROWS: Person[] = [
  { id: '1', name: 'Dupont', firstName: 'Jean-Pierre', email: 'jean-pierre@email.com', role: 'Admin', status: 'Actif' },
  { id: '2', name: 'Martin', firstName: 'Sophie', email: 'sophie.martin@email.com', role: 'Éditeur', status: 'Actif' },
  { id: '3', name: 'Bernard', firstName: 'Lucas', email: 'lucas.b@email.com', role: 'Lecteur', status: 'Inactif' },
  { id: '4', name: 'Petit', firstName: 'Marie', email: 'marie.petit@email.com', role: 'Admin', status: 'Actif' },
];

const rowKey = (row: Person) => row.id;

function baseColumns(statusCell: TemplateRef<DataTableCellContext<Person>>): DataTableColumn<Person>[] {
  return [
    { key: 'name', header: 'Nom', render: (row) => row.name },
    { key: 'firstName', header: 'Prénom', render: (row) => row.firstName },
    { key: 'email', header: 'Email', render: (row) => row.email },
    { key: 'role', header: 'Rôle', render: (row) => row.role },
    { key: 'status', header: 'Statut', render: statusCell },
  ];
}

// Every demo below declares its own `<ng-template>` cells (a `TemplateRef` can only come from the
// template that owns the components it renders) and builds `columns` from them with a `computed`,
// the same pattern the Tabs stories use for `TabItem.icon`.
const STATUS_CELL = `
  <ng-template #statusCell let-row>
    <soc-tag [color]="row.status === 'Actif' ? 'success' : 'information'">{{ row.status }}</soc-tag>
  </ng-template>
`;

@Component({
  selector: 'story-datatable-detail',
  standalone: true,
  imports: [SocDataTable, SocTag],
  template: `
    ${STATUS_CELL}
    <ng-template #roleCell let-row><soc-tag color="purple">{{ row.role }}</soc-tag></ng-template>
    <soc-data-table mode="detail" title="Titre du tableau" subtitle="Sous-titre descriptif du tableau" [columns]="columns()" [rows]="rows" [rowKey]="rowKey" />
  `,
})
class DetailDemo {
  rows = [ROWS[0]];
  rowKey = rowKey;
  private readonly statusCell = viewChild.required<TemplateRef<DataTableCellContext<Person>>>('statusCell');
  private readonly roleCell = viewChild.required<TemplateRef<DataTableCellContext<Person>>>('roleCell');
  columns = computed<DataTableColumn<Person>[]>(() => [
    { key: 'firstName', header: 'Prénom', render: (row) => row.firstName },
    { key: 'name', header: 'Nom', render: (row) => row.name },
    { key: 'email', header: 'Email', render: (row) => row.email },
    { key: 'role', header: 'Rôle', render: this.roleCell() },
    { key: 'status', header: 'Statut', render: this.statusCell() },
  ]);
}

@Component({
  selector: 'story-datatable-default',
  standalone: true,
  imports: [SocDataTable, SocDataTableBadge, SocDataTableActions, SocBadge, SocButton, SocButtonLeftIcon, SocTag, LucidePlus],
  template: `
    ${STATUS_CELL}
    <soc-data-table
      title="Titre du tableau"
      subtitle="Sous-titre descriptif du tableau"
      [columns]="columns()"
      [rows]="rows"
      [rowKey]="rowKey"
      [selectable]="true"
      [(selectedKeys)]="selected"
      [searchable]="true"
      [rowActions]="true"
      [pagination]="{ currentPage: page(), totalPages: 5, totalEntries: 200, pageSize: 10 }"
      (pageChange)="page.set($event)"
    >
      <soc-badge socDataTableBadge color="primary">{{ rows.length }}</soc-badge>
      <button socButton socDataTableActions>
        <svg lucidePlus socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
        Ajouter
      </button>
    </soc-data-table>
  `,
})
class DefaultDemo {
  rows = ROWS;
  rowKey = rowKey;
  selected = new Set<string>();
  page = signal(1);
  private readonly statusCell = viewChild.required<TemplateRef<DataTableCellContext<Person>>>('statusCell');
  columns = computed(() => baseColumns(this.statusCell()));
}

@Component({
  selector: 'story-datatable-no-checkbox',
  standalone: true,
  imports: [SocDataTable, SocTag],
  template: `
    ${STATUS_CELL}
    <soc-data-table title="Titre du tableau" [columns]="columns()" [rows]="rows" [rowKey]="rowKey" [searchable]="true" />
  `,
})
class NoCheckboxDemo {
  rows = ROWS;
  rowKey = rowKey;
  private readonly statusCell = viewChild.required<TemplateRef<DataTableCellContext<Person>>>('statusCell');
  columns = computed(() => baseColumns(this.statusCell()));
}

@Component({
  selector: 'story-datatable-click-vs-action',
  standalone: true,
  imports: [SocDataTable, SocTag],
  template: `
    ${STATUS_CELL}
    <div class="flex flex-col gap-3">
      <p class="text-sm text-[var(--bridges-color-text-secondary)]">Dernier événement : {{ log() }}</p>
      <soc-data-table
        title="Titre du tableau"
        [columns]="columns()"
        [rows]="rows"
        [rowKey]="rowKey"
        [rowClickable]="true"
        [rowActions]="true"
        (rowClick)="log.set('rowClick(' + $event.name + ')')"
        (rowAction)="log.set('rowAction(' + $event.name + ')')"
      />
    </div>
  `,
})
class ClickVsActionDemo {
  rows = ROWS;
  rowKey = rowKey;
  log = signal('—');
  private readonly statusCell = viewChild.required<TemplateRef<DataTableCellContext<Person>>>('statusCell');
  columns = computed(() => baseColumns(this.statusCell()));
}

@Component({
  selector: 'story-datatable-row-actions-menu',
  standalone: true,
  imports: [SocDataTable, SocTag, SocMenu, SocMenuItem, SocMenuItemIcon, LucideEye, LucidePencil, LucideTrash2],
  template: `
    ${STATUS_CELL}
    <ng-template #menu let-row let-close="close">
      <soc-menu>
        <button socMenuItem label="Voir le détail" (click)="log.set('Voir(' + row.name + ')'); close()">
          <svg lucideEye socMenuItemIcon class="size-full" [strokeWidth]="1.5"></svg>
        </button>
        @if (row.role !== 'Lecteur') {
          <button socMenuItem label="Modifier" (click)="log.set('Modifier(' + row.name + ')'); close()">
            <svg lucidePencil socMenuItemIcon class="size-full" [strokeWidth]="1.5"></svg>
          </button>
        }
        <button socMenuItem label="Supprimer" (click)="log.set('Supprimer(' + row.name + ')'); close()">
          <svg lucideTrash2 socMenuItemIcon class="size-full" [strokeWidth]="1.5"></svg>
        </button>
      </soc-menu>
    </ng-template>
    <div class="flex flex-col gap-3">
      <p class="text-sm text-[var(--bridges-color-text-secondary)]">Dernier événement : {{ log() }}</p>
      <soc-data-table
        title="Titre du tableau"
        [columns]="columns()"
        [rows]="rows"
        [rowKey]="rowKey"
        [rowClickable]="true"
        (rowClick)="log.set('rowClick(' + $event.name + ')')"
        [rowActionsMenu]="menuTpl()"
      />
    </div>
  `,
})
class RowActionsMenuDemo {
  rows = ROWS;
  rowKey = rowKey;
  log = signal('—');
  private readonly statusCell = viewChild.required<TemplateRef<DataTableCellContext<Person>>>('statusCell');
  protected readonly menuTpl = viewChild.required<TemplateRef<DataTableRowActionsContext<Person>>>('menu');
  columns = computed(() => baseColumns(this.statusCell()));
}

@Component({
  selector: 'story-datatable-card-mode',
  standalone: true,
  imports: [SocDataTable, SocDataTableBadge, SocBadge, SocTag, SocSwitch, SocMenu, SocMenuItem, SocMenuItemIcon, LucideEye, LucideTrash2],
  template: `
    ${STATUS_CELL}
    <ng-template #cardBody let-row>
      <div class="flex w-full items-center justify-between">
        <soc-tag [color]="row.status === 'Actif' ? 'success' : 'information'">{{ row.status }}</soc-tag>
        <soc-switch [checked]="row.status === 'Actif'" (checkedChange)="log.set('Switch(' + row.name + ')')" />
      </div>
    </ng-template>
    <ng-template #cardFooter let-row><span class="text-[length:12px] text-[var(--bridges-color-text-secondary)]">{{ row.role }}</span></ng-template>
    <ng-template #menu let-row let-close="close">
      <soc-menu>
        <button socMenuItem label="Voir le détail" (click)="log.set('Voir(' + row.name + ')'); close()">
          <svg lucideEye socMenuItemIcon class="size-full" [strokeWidth]="1.5"></svg>
        </button>
        <button socMenuItem label="Supprimer" (click)="log.set('Supprimer(' + row.name + ')'); close()">
          <svg lucideTrash2 socMenuItemIcon class="size-full" [strokeWidth]="1.5"></svg>
        </button>
      </soc-menu>
    </ng-template>
    <div class="flex flex-col gap-3">
      <p class="text-sm text-[var(--bridges-color-text-secondary)]">Dernier événement : {{ log() }}</p>
      <soc-data-table
        mode="card"
        title="Titre du tableau"
        subtitle="Sous-titre descriptif du tableau"
        [columns]="columns()"
        [rows]="rows"
        [rowKey]="rowKey"
        [searchable]="true"
        [rowClickable]="true"
        (rowClick)="log.set('rowClick(' + $event.name + ')')"
        [cardContent]="cardContent()"
        [rowActionsMenu]="menuTpl()"
        [pagination]="{ currentPage: 1, totalPages: 5, totalEntries: 200, pageSize: 10 }"
      >
        <soc-badge socDataTableBadge color="primary">{{ rows.length }}</soc-badge>
      </soc-data-table>
    </div>
  `,
})
class CardModeDemo {
  rows = ROWS;
  rowKey = rowKey;
  log = signal('—');
  private readonly statusCell = viewChild.required<TemplateRef<DataTableCellContext<Person>>>('statusCell');
  private readonly cardBody = viewChild.required<TemplateRef<DataTableCellContext<Person>>>('cardBody');
  private readonly cardFooter = viewChild.required<TemplateRef<DataTableCellContext<Person>>>('cardFooter');
  protected readonly menuTpl = viewChild.required<TemplateRef<DataTableRowActionsContext<Person>>>('menu');
  columns = computed(() => baseColumns(this.statusCell()));
  cardContent = computed(
    () =>
      (row: Person): DataTableCardContent<Person> => ({
        title: `${row.firstName} ${row.name}`,
        subtitle: row.email,
        body: this.cardBody(),
        footer: this.cardFooter(),
      }),
  );
}

const meta: Meta = {
  title: 'Components/Data/Data Table',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DetailDemo, DefaultDemo, NoCheckboxDemo, ClickVsActionDemo, RowActionsMenuDemo, CardModeDemo] })],
};
export default meta;
type Story = StoryObj;

export const Detail: Story = { render: () => ({ template: `<story-datatable-detail />` }) };

/** `rowActions` renders the "•••" button at the end of each row — a real integration would open a
 * Menu/Popover anchored on the clicked row from here (`rowActionsMenu`), rather than adding a
 * second, custom action button inside a column. */
export const Default: Story = { render: () => ({ template: `<story-datatable-default />` }) };

/**
 * Without `selectable`, the first column takes over the table's left inset (`title-zone-pad-h`)
 * instead of the checkbox — the header/cell text still lines up with the search bar above,
 * whether or not a checkbox column is present.
 */
export const WithoutCheckboxColumn: Story = { render: () => ({ template: `<story-datatable-no-checkbox />` }) };

/**
 * `rowClick` (primary navigation to the record's detail) and `rowAction` (secondary actions via
 * "•••") are independent and never fire together — clicking "•••" stops propagation before it
 * reaches the row.
 */
export const RowClickVsRowAction: Story = { render: () => ({ template: `<story-datatable-click-vs-action />` }) };

/**
 * `rowActionsMenu` — for more than one conditional action per row — renders a real Popover+Menu
 * anchored to "•••", never a `Dialog`. "Éditeur"/"Lecteur" show different actions to prove the
 * content is genuinely per-row, and clicking inside the menu never also triggers `rowClick`.
 */
export const RowActionsMenu: Story = { render: () => ({ template: `<story-datatable-row-actions-menu />` }) };

/**
 * `mode="card"` — the title/subtitle/search/filters/actions zone above is the same as
 * `mode="table"`; only the row grid switches from a `<table>` to a responsive grid of `soc-card`s.
 * `cardContent` builds each card the same way `columns` builds each table cell — one function,
 * called per row. `rowActionsMenu` and `rowClick` are the exact same inputs/outputs as
 * `mode="table"`, just wired to each card's own "•••" button and click/hover state.
 */
export const CardMode: Story = { render: () => ({ template: `<story-datatable-card-mode />` }) };
