import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import type { SelectOption } from '../select/select';
import { SocTableFilterSelect } from './table-filter-select';

const OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Tous' },
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Éditeur' },
  { value: 'reader', label: 'Lecteur' },
];

const meta: Meta<SocTableFilterSelect> = {
  title: 'Components/Selection/Table Filter Select',
  component: SocTableFilterSelect,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocTableFilterSelect] })],
  args: { label: 'Rôle', options: OPTIONS, defaultValue: 'all' },
};
export default meta;
type Story = StoryObj<SocTableFilterSelect>;

/** Always renders `soc-select` in its "labelHeader" mode — there's no `mode` input to set or forget. */
export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<div class="w-[160px]"><soc-table-filter-select [label]="label" [options]="options" [defaultValue]="defaultValue" /></div>`,
  }),
};

/** A realistic filter row above a `DataTable`, the intended usage. */
export const FilterRow: Story = {
  render: () => ({
    props: {
      roles: OPTIONS,
      statuses: [
        { value: 'all', label: 'Tous' },
        { value: 'active', label: 'Actif' },
        { value: 'inactive', label: 'Inactif' },
      ] as SelectOption[],
    },
    template: `
      <div class="flex items-center gap-3">
        <div class="w-[140px]"><soc-table-filter-select label="Rôle" [options]="roles" defaultValue="all" /></div>
        <div class="w-[140px]"><soc-table-filter-select label="Statut" [options]="statuses" defaultValue="all" /></div>
      </div>
    `,
  }),
};
