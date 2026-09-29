import type { Meta, StoryObj } from '@storybook/angular';
import { SocBadge, type BadgeColor } from './badge';

const COLORS: BadgeColor[] = ['primary', 'success', 'warning', 'danger'];

const meta: Meta<SocBadge> = {
  title: 'Components/Feedback/Badge',
  component: SocBadge,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: COLORS },
    size: { control: 'select', options: ['sm', 'lg'] },
  },
  args: {
    color: 'primary',
    size: 'sm',
  },
  render: (args) => ({
    props: args,
    template: `<soc-badge [color]="color" [size]="size">Badge</soc-badge>`,
  }),
};
export default meta;
type Story = StoryObj<SocBadge>;

export const Default: Story = {};

export const Large: Story = { args: { size: 'lg' } };

export const AllColors: Story = {
  render: (args) => ({
    props: { ...args, colors: COLORS },
    template: `
      <div class="flex gap-3">
        @for (color of colors; track color) {
          <soc-badge [color]="color" [size]="size">{{ color }}</soc-badge>
        }
      </div>
    `,
  }),
};
