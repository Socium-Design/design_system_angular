import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocSelect, type SelectOption } from './select';

const OPTIONS: SelectOption[] = [
  { value: 'fr', label: 'France' },
  { value: 'be', label: 'Belgique' },
  { value: 'ch', label: 'Suisse' },
  { value: 'ca', label: 'Canada' },
];

const meta: Meta<SocSelect> = {
  title: 'Components/Selection/Select',
  component: SocSelect,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocSelect] })],
  args: {
    label: 'Pays',
    mode: 'formulaire',
    placeholder: 'Choisir un pays',
    options: OPTIONS,
    helperText: "Texte d'aide optionnel",
    required: false,
    error: false,
    warning: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<soc-select [label]="label" [mode]="mode" [placeholder]="placeholder" [options]="options" [helperText]="helperText" [required]="required" [error]="error" [warning]="warning" [disabled]="disabled" [defaultValue]="defaultValue" />`,
  }),
};
export default meta;
type Story = StoryObj<SocSelect>;

export const Default: Story = {};

export const Required: Story = { args: { required: true } };

export const Selected: Story = { args: { defaultValue: 'fr' } };

export const Error: Story = { args: { error: true, helperText: 'Ce champ est requis' } };

export const Warning: Story = { args: { warning: true, helperText: 'Vérifiez cette valeur' } };

export const Disabled: Story = { args: { disabled: true } };

/** "Label + Header" — for compact inline filters (toolbars, table headers): no separate label
 * row, the label renders as a small title stacked above the value inside the field itself, so the
 * field only needs to fit the value's own width instead of "label + value" concatenated. */
export const LabelHeader: Story = {
  args: { mode: 'labelHeader', label: 'Type', placeholder: 'Tous', defaultValue: undefined, helperText: undefined },
  decorators: [(storyFn) => ({ ...storyFn(), template: `<div class="w-[160px]">${storyFn().template}</div>` })],
};

export const LabelHeaderSelected: Story = {
  args: {
    mode: 'labelHeader',
    label: 'Type',
    options: [{ value: 'all', label: 'Tous' }, ...OPTIONS],
    defaultValue: 'all',
    helperText: undefined,
  },
  decorators: [(storyFn) => ({ ...storyFn(), template: `<div class="w-[160px]">${storyFn().template}</div>` })],
};
