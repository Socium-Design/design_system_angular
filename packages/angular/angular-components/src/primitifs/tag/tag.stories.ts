import type { Meta, StoryObj } from '@storybook/angular';
import { SocTag, type TagColor } from './tag';

const COLORS: TagColor[] = ['success', 'warning', 'error', 'information', 'purple', 'orange'];

const meta: Meta<SocTag> = {
  title: 'Components/Feedback/Tag',
  component: SocTag,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: COLORS },
    size: { control: 'select', options: ['sm', 'lg'] },
  },
  args: {
    color: 'success',
    size: 'sm',
  },
  render: (args) => ({
    props: args,
    template: `<soc-tag [color]="color" [size]="size">Tag</soc-tag>`,
  }),
};
export default meta;
type Story = StoryObj<SocTag>;

export const Default: Story = {};

export const Removable: Story = {
  render: (args) => ({
    props: args,
    template: `<soc-tag [color]="color" [size]="size" [removable]="true">Tag</soc-tag>`,
  }),
};

export const AllColors: Story = {
  render: (args) => ({
    props: { ...args, colors: COLORS },
    template: `
      <div class="flex flex-wrap gap-3">
        @for (color of colors; track color) {
          <soc-tag [color]="color" [size]="size">{{ color }}</soc-tag>
        }
      </div>
    `,
  }),
};
