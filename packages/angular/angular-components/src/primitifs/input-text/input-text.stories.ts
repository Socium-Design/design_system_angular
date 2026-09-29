import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideSearch } from '@lucide/angular';
import { SocInputText, SocInputTextLeftIcon } from './input-text';

const meta: Meta<SocInputText> = {
  title: 'Components/Input/Input Text',
  component: SocInputText,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocInputText, SocInputTextLeftIcon, LucideSearch] })],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
  },
  args: {
    label: 'Label',
    placeholder: 'Tapez ici',
    helperText: "Texte d'aide optionnel",
    required: false,
    error: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<soc-input-text [label]="label" [placeholder]="placeholder" [helperText]="helperText" [required]="required" [error]="error" [disabled]="disabled" />`,
  }),
};
export default meta;
type Story = StoryObj<SocInputText>;

export const Default: Story = {};

export const Required: Story = { args: { required: true } };

export const WithoutHelperText: Story = { args: { helperText: undefined } };

export const Error: Story = { args: { error: true, helperText: 'Ce champ est requis' } };

export const Disabled: Story = { args: { disabled: true } };

export const WithLeftIcon: Story = {
  args: { helperText: undefined },
  render: (args) => ({
    props: args,
    template: `
      <soc-input-text [label]="label" [placeholder]="placeholder">
        <svg lucideSearch socInputTextLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
      </soc-input-text>
    `,
  }),
};

export const AllStates: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex max-w-xs flex-col gap-6">
        <soc-input-text [placeholder]="placeholder" [helperText]="helperText" label="Default" />
        <soc-input-text [placeholder]="placeholder" [helperText]="helperText" label="Filled" value="Valeur saisie" />
        <soc-input-text [placeholder]="placeholder" [helperText]="'Ce champ est requis'" label="Error" [error]="true" />
        <soc-input-text [placeholder]="placeholder" [helperText]="helperText" label="Disabled" [disabled]="true" value="Non modifiable" />
      </div>
    `,
  }),
};
