import type { Meta, StoryObj } from '@storybook/angular';
import { SocInputArea } from './input-area';

const meta: Meta<SocInputArea> = {
  title: 'Components/Input/Input Area',
  component: SocInputArea,
  tags: ['autodocs'],
  args: {
    label: 'Description',
    placeholder: 'Tapez ici',
    helperText: "Texte d'aide optionnel",
    required: false,
    error: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<soc-input-area [label]="label" [placeholder]="placeholder" [helperText]="helperText" [required]="required" [error]="error" [disabled]="disabled" />`,
  }),
};
export default meta;
type Story = StoryObj<SocInputArea>;

export const Default: Story = {};

export const Filled: Story = {
  args: { value: "Un paragraphe de texte saisi par l'utilisateur." },
};

export const AutoGrow: Story = {
  args: {
    value:
      'Ce texte est volontairement long pour montrer que le champ grandit automatiquement avec son contenu, sans faire apparaître de barre de défilement interne.',
  },
};

export const Error: Story = { args: { error: true, helperText: 'Ce champ est requis' } };

export const Disabled: Story = { args: { disabled: true, value: 'Non modifiable' } };
