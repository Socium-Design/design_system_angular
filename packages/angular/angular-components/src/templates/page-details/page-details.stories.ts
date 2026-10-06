import { Component, TemplateRef, computed, signal, viewChild } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideDownload, LucidePencil, LucidePlus, LucidePrinter } from '@lucide/angular';
import { SocBadge } from '../../primitifs/badge/badge';
import { SocBreadcrumb } from '../../primitifs/breadcrumb/breadcrumb';
import { SocButton, SocButtonLeftIcon } from '../../primitifs/button/button';
import { SocMessage, SocMessageContent } from '../../primitifs/message/message';
import { SocTabs } from '../../primitifs/tabs/tabs';
import { SocTag } from '../../primitifs/tag/tag';
import { SocTooltip, SocTooltipLabel } from '../../primitifs/tooltip/tooltip';
import { SocDataTable, type DataTableCellContext, type DataTableColumn } from '../../composes/data-table/data-table';
import { SocPageActions, SocPageBadge, SocPageBreadcrumb, SocPageTabs, SocPageTag } from '../page-slots';
import { PERSONS, StoryShell, personColumns, personRowKey, type Person } from '../stories-shared';
import { SocPageDetails } from './page-details';

const DETAIL = { id: '1', firstName: 'Jean-Pierre', name: 'Dupont', email: 'jean-pierre.dupont@email.com', phone: '+33 6 12 34 56 78', address: '12 rue de la Paix, 75002 Paris', seniority: '3 ans', role: 'Administrateur', status: 'Actif' };

@Component({
  selector: 'story-pagedetails-example',
  standalone: true,
  imports: [
    SocPageDetails, SocPageBreadcrumb, SocPageBadge, SocPageTag, SocPageActions, SocPageTabs, SocBreadcrumb, SocBadge, SocTag, SocTabs, SocButton, SocButtonLeftIcon,
    SocTooltip, SocTooltipLabel, SocMessage, SocMessageContent, SocDataTable, LucidePencil, LucideDownload, LucidePrinter, LucidePlus,
  ],
  template: `
    <ng-template #roleCell let-row><soc-tag color="purple">{{ row.role }}</soc-tag></ng-template>
    <ng-template #activeCell><soc-tag color="success">Actif</soc-tag></ng-template>
    <ng-template #statusCell let-row><soc-tag [color]="row.status === 'Actif' ? 'success' : 'information'">{{ row.status }}</soc-tag></ng-template>
    <soc-page-details
      [showBack]="true"
      (back)="log.set('back')"
      topStatusLabel="Text"
      title="Titre de la page"
      statusLabel="Text"
      description="Créez des sessions à partir des formations du plan, définissez leurs modalités et organisez les participants selon vos impératifs opérationnels."
    >
      <soc-breadcrumb socPageBreadcrumb [items]="[{ label: 'Parent' }, { label: 'Page actuelle' }]" />
      <soc-badge socPageBadge color="success">12</soc-badge>
      <soc-tag socPageTag color="purple">Tag</soc-tag>
      <div socPageActions class="contents">
        <soc-tooltip>
          <button socButton variant="tertiary" size="lg" aria-label="Modifier"><svg lucidePencil socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg></button>
          <span socTooltipLabel>Modifier</span>
        </soc-tooltip>
        <soc-tooltip>
          <button socButton variant="tertiary" size="lg" aria-label="Exporter"><svg lucideDownload socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg></button>
          <span socTooltipLabel>Exporter</span>
        </soc-tooltip>
        <soc-tooltip>
          <button socButton variant="tertiary" size="lg" aria-label="Imprimer"><svg lucidePrinter socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg></button>
          <span socTooltipLabel>Imprimer</span>
        </soc-tooltip>
        <soc-tooltip>
          <button socButton variant="tertiary" size="lg" aria-label="Ajouter"><svg lucidePlus socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg></button>
          <span socTooltipLabel>Ajouter</span>
        </soc-tooltip>
      </div>
      <soc-tabs socPageTabs variant="underline" [value]="tab()" (change)="tab.set($event)" [items]="[{ id: 'onglet-1', label: 'Onglet 1' }, { id: 'onglet-2', label: 'Onglet 2' }, { id: 'onglet-3', label: 'Onglet 3' }]" />
      <soc-data-table mode="detail" title="Titre du tableau" subtitle="Sous-titre descriptif du tableau" [columns]="detailColumns()" [rows]="detailRows" [rowKey]="rowKey" />
      <soc-message variant="banner" status="success"><span socMessageContent>Description text</span></soc-message>
      <soc-data-table title="Titre du tableau" subtitle="Sous-titre descriptif du tableau" [columns]="listColumns()" [rows]="rows" [rowKey]="rowKey" [searchable]="true" />
    </soc-page-details>
  `,
})
class PageDetailsExample {
  rows = PERSONS;
  detailRows = [DETAIL as unknown as Person];
  rowKey = personRowKey;
  tab = signal('onglet-1');
  log = signal('');
  private readonly roleCell = viewChild.required<TemplateRef<DataTableCellContext<Person>>>('roleCell');
  private readonly activeCell = viewChild.required<TemplateRef<DataTableCellContext<Person>>>('activeCell');
  private readonly statusCell = viewChild.required<TemplateRef<DataTableCellContext<Person>>>('statusCell');
  detailColumns = computed<DataTableColumn<Person>[]>(() => [
    { key: 'firstName', header: 'Prénom', render: (r) => r.firstName },
    { key: 'name', header: 'Nom', render: (r) => r.name },
    { key: 'email', header: 'Email', render: (r) => r.email },
    { key: 'phone', header: 'Téléphone', render: () => DETAIL.phone },
    { key: 'address', header: 'Adresse', render: () => DETAIL.address },
    { key: 'seniority', header: 'Ancienneté', render: () => DETAIL.seniority },
    { key: 'role', header: 'Rôle', render: this.roleCell() },
    { key: 'status', header: 'Statut', render: this.activeCell() },
  ]);
  listColumns = computed(() => personColumns(this.statusCell()));
}

const meta: Meta = {
  title: 'Templates/Page Details',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [PageDetailsExample, StoryShell] })],
};
export default meta;
type Story = StoryObj;

/** PageDetails fills its container's full height (`size-full`) — outside Storybook that container is
 * always AppShell's Content Zone. The `h-screen` wrapper stands in for that height. */
export const Default: Story = { render: () => ({ template: `<div class="h-screen"><story-pagedetails-example /></div>` }) };

export const FullPage: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({ template: `<story-shell><story-pagedetails-example /></story-shell>` }),
};
