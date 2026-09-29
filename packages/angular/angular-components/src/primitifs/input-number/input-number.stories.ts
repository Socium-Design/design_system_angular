import type { Meta, StoryObj } from '@storybook/angular';
import { SocInputNumber } from './input-number';

const meta: Meta<SocInputNumber> = {
  title: 'Components/Input/Input Number',
  component: SocInputNumber,
  tags: ['autodocs'],
  args: {
    label: 'Quantité',
    helperText: 'Min: 0, Max: 100',
    min: 0,
    max: 100,
    value: 0,
    required: false,
    error: false,
    disabled: false,
    showSteppers: true,
  },
  render: (args) => ({
    props: args,
    template: `<soc-input-number [label]="label" [helperText]="helperText" [min]="min" [max]="max" [value]="value" [required]="required" [error]="error" [disabled]="disabled" [showSteppers]="showSteppers" />`,
  }),
};
export default meta;
type Story = StoryObj<SocInputNumber>;

export const Default: Story = {};

export const WithoutSteppers: Story = { args: { showSteppers: false } };

export const AtMinBoundary: Story = { args: { value: 0 } };

export const AtMaxBoundary: Story = { args: { value: 100 } };

export const Error: Story = { args: { error: true, helperText: 'Valeur invalide' } };

export const Disabled: Story = { args: { disabled: true, value: 42 } };
