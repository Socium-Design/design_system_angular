import type { Meta, StoryObj } from '@storybook/angular';
import { SocPassword } from './password';

const meta: Meta<SocPassword> = {
  title: 'Components/Input/Password',
  component: SocPassword,
  tags: ['autodocs'],
  args: {
    label: 'Mot de passe',
    helperText: '8 caractères minimum',
    required: false,
    error: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<soc-password [label]="label" [helperText]="helperText" [required]="required" [error]="error" [disabled]="disabled" />`,
  }),
};
export default meta;
type Story = StoryObj<SocPassword>;

export const Default: Story = {};

export const Filled: Story = { args: { value: 'motdepasse123' } };

export const Error: Story = { args: { error: true, helperText: 'Mot de passe trop court' } };

export const Disabled: Story = { args: { disabled: true, value: 'motdepasse123' } };
