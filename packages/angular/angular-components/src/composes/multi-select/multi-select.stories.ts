import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocMultiSelect, type MultiSelectOption } from './multi-select';

const OPTIONS: MultiSelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
];

// `value` is purely controlled (React's `value` + `onChange` are both required), so each story
// owns its own state, exactly like React's `useState` per story.
const template = `<soc-multi-select [label]="label" [placeholder]="placeholder" [options]="options" [helperText]="helperText" [error]="error" [(value)]="value" />`;

const meta: Meta<SocMultiSelect> = {
  title: 'Components/Selection/Multi Select',
  component: SocMultiSelect,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocMultiSelect] })],
  args: {
    label: 'Technologies',
    placeholder: 'Choisir des technologies',
    options: OPTIONS,
    helperText: "Texte d'aide optionnel",
    error: false,
  },
};
export default meta;
type Story = StoryObj<SocMultiSelect>;

export const Default: Story = {
  render: (args) => ({ props: { ...args, value: ['react'] }, template }),
};

export const Empty: Story = {
  render: (args) => ({ props: { ...args, value: [] }, template }),
};

export const Error: Story = {
  render: (args) => ({
    props: { ...args, value: [], error: true, helperText: 'Sélectionnez au moins une option' },
    template,
  }),
};
