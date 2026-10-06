import { Component, TemplateRef, computed, signal, viewChild } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucidePlus } from '@lucide/angular';
import { SocBadge } from '../../primitifs/badge/badge';
import { SocBreadcrumb } from '../../primitifs/breadcrumb/breadcrumb';
import { SocButton, SocButtonLeftIcon } from '../../primitifs/button/button';
import { SocTabs } from '../../primitifs/tabs/tabs';
import { SocTag } from '../../primitifs/tag/tag';
import { SocDataTable, type DataTableCellContext } from '../../composes/data-table/data-table';
import { SocPageActions, SocPageBadge, SocPageBreadcrumb, SocPageSecondaryTabs, SocPageTabs } from '../page-slots';
import { PERSONS, StoryShell, personColumns, personRowKey } from '../stories-shared';
import { SocPageList } from './page-list';

const IMPORTS = [SocPageList, SocPageBreadcrumb, SocPageSecondaryTabs, SocPageBadge, SocPageActions, SocPageTabs, SocBreadcrumb, SocTabs, SocBadge, SocButton, SocButtonLeftIcon, SocTag, SocDataTable, LucidePlus];

@Component({
  selector: 'story-pagelist-example',
  standalone: true,
  imports: IMPORTS,
  template: `
    <ng-template #statusCell let-row><soc-tag [color]="row.status === 'Actif' ? 'success' : 'information'">{{ row.status }}</soc-tag></ng-template>
    <soc-page-list
      title="Titre de la page"
      statusLabel="Text"
      description="Créez des sessions à partir des formations du plan, définissez leurs modalités et organisez les participants selon vos impératifs opérationnels."
    >
      <soc-breadcrumb socPageBreadcrumb [items]="[{ label: 'Parent' }, { label: 'Page actuelle' }]" />
      <soc-tabs
        socPageSecondaryTabs
        variant="pill"
        [value]="secondaryTab()"
        (change)="secondaryTab.set($event)"
        [items]="[{ id: 'formations', label: 'Formations' }, { id: 'plan', label: 'Plan de formation' }, { id: 'sessions', label: 'Sessions de formation' }]"
      />
      <soc-badge socPageBadge color="success">12</soc-badge>
      <div socPageActions class="contents">
        <button socButton variant="secondary" size="lg">Button</button>
        <button socButton size="lg">
          <svg lucidePlus socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
          Button
        </button>
      </div>
      <soc-tabs
        socPageTabs
        variant="underline"
        [value]="tab()"
        (change)="tab.set($event)"
        [items]="[{ id: 'onglet-1', label: 'Onglet 1' }, { id: 'onglet-2', label: 'Onglet 2' }, { id: 'onglet-3', label: 'Onglet 3' }]"
      />
      <soc-data-table
        title="Titre du tableau"
        subtitle="Sous-titre descriptif du tableau"
        [columns]="columns()"
        [rows]="rows"
        [rowKey]="rowKey"
        [searchable]="true"
        [pagination]="{ currentPage: 1, totalPages: 4, totalEntries: 200, pageSize: 10 }"
      />
    </soc-page-list>
  `,
})
class PageListExample {
  rows = PERSONS;
  rowKey = personRowKey;
  secondaryTab = signal('formations');
  tab = signal('onglet-1');
  private readonly statusCell = viewChild.required<TemplateRef<DataTableCellContext<(typeof PERSONS)[number]>>>('statusCell');
  columns = computed(() => personColumns(this.statusCell()));
}

/** Matches the real shape of a typical list screen (e.g. offboarding/onboarding lists): no secondary
 * tabs, no badge/status label, and no title/subtitle on the table. Every gap (breadcrumb→title,
 * title→tabs, tabs→table) is exactly one `content-gap` (24px). */
@Component({
  selector: 'story-pagelist-realistic',
  standalone: true,
  imports: IMPORTS,
  template: `
    <ng-template #statusCell let-row><soc-tag [color]="row.status === 'Actif' ? 'success' : 'information'">{{ row.status }}</soc-tag></ng-template>
    <soc-page-list title="On / Offboarding" description="Gérez les sorties et absences de vos collaborateurs.">
      <soc-breadcrumb socPageBreadcrumb [items]="[{ label: 'On/Offboarding' }]" />
      <button socButton socPageActions>
        <svg lucidePlus socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
        Déclencher un offboarding
      </button>
      <soc-tabs socPageTabs variant="underline" [value]="tab()" (change)="tab.set($event)" [items]="[{ id: 'tous', label: 'Tous (24)' }, { id: 'en-cours', label: 'En cours (5)' }]" />
      <soc-data-table [columns]="columns()" [rows]="rows" [rowKey]="rowKey" [searchable]="true" [pagination]="{ currentPage: 1, totalPages: 4, totalEntries: 200, pageSize: 10 }" />
    </soc-page-list>
  `,
})
class RealisticExample {
  rows = PERSONS;
  rowKey = personRowKey;
  tab = signal('tous');
  private readonly statusCell = viewChild.required<TemplateRef<DataTableCellContext<(typeof PERSONS)[number]>>>('statusCell');
  columns = computed(() => personColumns(this.statusCell()));
}

const meta: Meta = {
  title: 'Templates/Page List',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [PageListExample, RealisticExample, StoryShell] })],
};
export default meta;
type Story = StoryObj;

/** PageList fills its container's full height (`size-full`) — outside Storybook that container is
 * always AppShell's Content Zone. The `h-screen` wrapper stands in for that height. */
export const Default: Story = { render: () => ({ template: `<div class="h-screen"><story-pagelist-example /></div>` }) };

export const RealisticListScreen: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({ template: `<story-shell><story-pagelist-realistic /></story-shell>` }),
};

/** PageList is only the Content Zone's child — AppSwitch, HeaderApp and SideNavigation live in
 * `soc-app-shell`. This shows it assembled the way it actually ships. */
export const FullPage: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({ template: `<story-shell><story-pagelist-example /></story-shell>` }),
};
