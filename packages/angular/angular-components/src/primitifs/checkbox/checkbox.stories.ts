import type { Meta, StoryObj } from '@storybook/angular';
import { SocCheckbox } from './checkbox';

const meta: Meta<SocCheckbox> = {
  title: 'Components/Control/Checkbox',
  component: SocCheckbox,
  tags: ['autodocs'],
  args: {
    label: "J'accepte les conditions",
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<soc-checkbox [label]="label" [disabled]="disabled" />`,
  }),
};
export default meta;
type Story = StoryObj<SocCheckbox>;

export const Default: Story = {};

export const Checked: Story = { args: { checked: true } };

export const Disabled: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-3">
        <soc-checkbox [label]="label" [disabled]="true" />
        <soc-checkbox [label]="label" [disabled]="true" [checked]="true" />
      </div>
    `,
  }),
};

export const WithoutLabel: Story = { args: { label: undefined } };
