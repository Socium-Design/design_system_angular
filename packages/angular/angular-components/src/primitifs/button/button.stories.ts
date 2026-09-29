import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucidePlus } from '@lucide/angular';
import { SocButton, SocButtonLeftIcon, SocButtonRightIcon, type ButtonSize, type ButtonVariant } from './button';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'tertiary', 'danger', 'ghost'];
const SIZES: ButtonSize[] = ['sm', 'lg'];

/**
 * `SocButton` is an attribute selector (`button[socButton]`), not an element tag — every story
 * below supplies its own `render` with a literal `<button socButton ...>`, mirroring how a real
 * consumer writes it, rather than relying on Storybook's auto-render (which only works for
 * element-selector components). See React `Button.stories.tsx` for the variant set this mirrors.
 */
const meta: Meta<SocButton> = {
  title: 'Components/Button/Button',
  component: SocButton,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocButton, SocButtonLeftIcon, SocButtonRightIcon, LucidePlus] })],
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'select', options: SIZES },
  },
  args: {
    variant: 'primary',
    size: 'sm',
  },
  render: (args) => ({
    props: args,
    template: `<button socButton [variant]="variant" [size]="size">Button</button>`,
  }),
};
export default meta;
type Story = StoryObj<SocButton>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Tertiary: Story = { args: { variant: 'tertiary' } };

export const Danger: Story = { args: { variant: 'danger' } };

export const Ghost: Story = { args: { variant: 'ghost' } };

export const Large: Story = { args: { size: 'lg' } };

export const Disabled: Story = {
  render: (args) => ({
    props: args,
    template: `<button socButton [variant]="variant" [size]="size" disabled>Button</button>`,
  }),
};

export const WithLeftIcon: Story = {
  render: (args) => ({
    props: args,
    template: `
      <button socButton [variant]="variant" [size]="size">
        <svg lucidePlus socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
        Button
      </button>
    `,
  }),
};

export const IconOnly: Story = {
  render: (args) => ({
    props: args,
    template: `
      <button socButton [variant]="variant" [size]="size" aria-label="Ajouter">
        <svg lucidePlus socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
      </button>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    props: { variants: VARIANTS },
    template: `
      <div class="flex flex-col gap-4">
        @for (variant of variants; track variant) {
          <div class="flex items-center gap-3">
            <span class="w-20 text-sm text-gray-500">{{ variant }}</span>
            <button socButton [variant]="variant">Button</button>
            <button socButton [variant]="variant" disabled>Disabled</button>
            <button socButton [variant]="variant">
              <svg lucidePlus socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
              Icon
            </button>
          </div>
        }
      </div>
    `,
  }),
};
