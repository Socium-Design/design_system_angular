import type { Meta, StoryObj } from '@storybook/angular';
import { SocSwitch, type SwitchSize } from './switch';

const SIZES: SwitchSize[] = ['sm', 'md', 'lg'];

const meta: Meta<SocSwitch> = {
  title: 'Components/Control/Switch',
  component: SocSwitch,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
  },
  args: {
    label: 'Notifications',
    size: 'sm',
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<soc-switch [label]="label" [size]="size" [disabled]="disabled" />`,
  }),
};
export default meta;
type Story = StoryObj<SocSwitch>;

export const Default: Story = { args: { checked: true } };

export const Sizes: Story = {
  render: (args) => ({
    props: { ...args, sizes: SIZES },
    template: `
      <div class="flex items-center gap-6">
        @for (size of sizes; track size) {
          <soc-switch [label]="label" [size]="size" [disabled]="disabled" [checked]="true" />
        }
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-3">
        <soc-switch [label]="label" [size]="size" [disabled]="true" />
        <soc-switch [label]="label" [size]="size" [disabled]="true" [checked]="true" />
      </div>
    `,
  }),
};
