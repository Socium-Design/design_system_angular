import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocAvatar, SocTag } from '@socium-design/angular-components';
import { labsBanner } from '../stories/labs-story';
import { SocLabsGroupedTable } from './grouped-table';

interface Row {
  id: string;
  title: string;
  status: string;
  children?: Row[];
}

const meta: Meta<SocLabsGroupedTable<unknown, Row>> = {
  title: 'Labs (expérimental)/Grouped Table',
  component: SocLabsGroupedTable,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocLabsGroupedTable, SocAvatar, SocTag] }), labsBanner],
};
export default meta;
type Story = StoryObj<SocLabsGroupedTable<unknown, Row>>;

/** Objectifs groupés par collaborateur ; « Objectif B1 » a un sous-objectif. */
export const ObjectifsParCollaborateur: Story = {
  render: () => ({
    props: {
      groups: [
        {
          key: 'ta',
          data: { initials: 'TA', name: 'Thierno Adam', matricule: '22' },
          rows: [
            { id: 'o1', title: 'Test bouton', status: 'En cours' },
            { id: 'o2', title: 'Objectif B1', status: 'Passé', children: [{ id: 's1', title: 'Sous-objectif B1.1', status: 'En cours' }] },
          ],
        },
        { key: 'ad', data: { initials: 'AD', name: 'Awa Diop', matricule: '1' }, rows: [{ id: 'o3', title: 'Recrutements Q4', status: 'En cours' }] },
      ],
      expanded: new Set(['ta']),
      rowKey: (r: Row) => r.id,
      childRows: (r: Row) => r.children ?? [],
      groupLabel: (g: { name: string }) => `les objectifs de ${g.name}`,
      rowLabel: (r: Row) => r.title,
    },
    template: `
      <soc-labs-grouped-table
        caption="Objectifs"
        [columns]="[{ key: 'title', header: 'Objectif', render: title, width: '50%' }, { key: 'status', header: 'Statut', render: status }]"
        [groups]="groups"
        [rowKey]="rowKey"
        [childRows]="childRows"
        [groupLabel]="groupLabel"
        [rowLabel]="rowLabel"
        [groupHeader]="header"
        [(expandedGroups)]="expanded"
      />
      <ng-template #header let-g let-rows="rows">
        <div class="flex items-center justify-between gap-4">
          <soc-avatar size="sm" [label]="g.initials" [name]="g.name" [subtitle]="g.matricule" />
          <span class="text-sm">{{ rows.length }} objectif(s) au total</span>
        </div>
      </ng-template>
      <ng-template #title let-row>{{ row.title }}</ng-template>
      <ng-template #status let-row><soc-tag [color]="row.status === 'En cours' ? 'success' : 'information'">{{ row.status }}</soc-tag></ng-template>
    `,
  }),
};

export const Empty: Story = {
  render: () => ({
    props: { rowKey: (r: Row) => r.id },
    template: `<soc-labs-grouped-table [columns]="[{ key: 'title', header: 'Objectif', render: rowKey }]" [groups]="[]" [rowKey]="rowKey" emptyText="Aucun résultat ne correspond à votre recherche." />`,
  }),
};
