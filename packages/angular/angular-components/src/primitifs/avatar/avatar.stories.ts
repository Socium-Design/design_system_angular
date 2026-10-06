import type { Meta, StoryObj } from '@storybook/angular';
import { SocAvatar, type AvatarColor } from './avatar';

const COLORS: AvatarColor[] = ['blue', 'green', 'purple', 'orange'];

const meta: Meta<SocAvatar> = {
  title: 'Components/Social/Avatar',
  component: SocAvatar,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: COLORS },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    mode: { control: 'select', options: ['soft', 'solid'] },
    namePosition: { control: 'select', options: ['left', 'right'] },
  },
  // Every input bound by the stories' templates needs a default here: an arg left `undefined` is
  // passed through as `[color]="undefined"` and overrides the component's own default.
  args: {
    label: 'DM',
    color: 'blue',
    size: 'md',
    mode: 'soft',
    namePosition: 'right',
  },
  render: (args) => ({
    props: args,
    template: `<soc-avatar [label]="label" [color]="color" [size]="size" [mode]="mode" [name]="name" [subtitle]="subtitle" [namePosition]="namePosition" />`,
  }),
};
export default meta;
type Story = StoryObj<SocAvatar>;

export const Default: Story = {};

export const AllColors: Story = {
  render: (args) => ({
    props: { ...args, colors: COLORS },
    template: `
      <div class="flex gap-4">
        @for (color of colors; track color) {
          <soc-avatar [label]="label" [color]="color" [size]="size" [mode]="mode" />
        }
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex items-center gap-4">
        <soc-avatar [label]="label" [color]="color" [mode]="mode" size="xs" />
        <soc-avatar [label]="label" [color]="color" [mode]="mode" size="sm" />
        <soc-avatar [label]="label" [color]="color" [mode]="mode" size="md" />
        <soc-avatar [label]="label" [color]="color" [mode]="mode" size="lg" />
      </div>
    `,
  }),
};

export const SoftVsSolid: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex items-center gap-4">
        <soc-avatar [label]="label" [color]="color" [size]="size" mode="soft" />
        <soc-avatar [label]="label" [color]="color" [size]="size" mode="solid" />
      </div>
    `,
  }),
};

export const WithNameAndSubtitle: Story = {
  args: { name: 'Nom Prénom', subtitle: 'Sous-titre', size: 'lg' },
};

export const NameOnLeft: Story = {
  args: { name: 'Nom Prénom', namePosition: 'left', size: 'md' },
};
