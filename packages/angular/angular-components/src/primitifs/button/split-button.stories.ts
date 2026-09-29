import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucidePlus } from '@lucide/angular';
import { SocSplitButton } from './split-button';
import { SocButtonLeftIcon } from './button';
import type { ButtonSize, ButtonVariant } from './button';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'tertiary', 'danger', 'ghost'];
const SIZES: ButtonSize[] = ['sm', 'lg'];

/** See React `SplitButton.stories.tsx` for the variant set this mirrors. */
const meta: Meta<SocSplitButton> = {
  title: 'Components/Button/Split Button',
  component: SocSplitButton,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocSplitButton, SocButtonLeftIcon, LucidePlus] })],
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
    template: `
      <soc-split-button [variant]="variant" [size]="size">
        <svg lucidePlus socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
        Button
      </soc-split-button>
    `,
  }),
};
export default meta;
type Story = StoryObj<SocSplitButton>;

export const Primary: Story = {};

export const AllVariants: Story = {
  render: () => ({
    props: { variants: VARIANTS },
    template: `
      <div class="flex flex-col gap-4">
        @for (variant of variants; track variant) {
          <div class="flex items-center gap-3">
            <span class="w-20 text-sm text-gray-500">{{ variant }}</span>
            <soc-split-button [variant]="variant">
              <svg lucidePlus socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
              Button
            </soc-split-button>
            <soc-split-button [variant]="variant" [disabled]="true">
              <svg lucidePlus socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
              Button
            </soc-split-button>
          </div>
        }
      </div>
    `,
  }),
};

export const Large: Story = { args: { size: 'lg' } };

export const Disabled: Story = {
  render: (args) => ({
    props: args,
    template: `
      <soc-split-button [variant]="variant" [size]="size" [disabled]="true">
        <svg lucidePlus socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
        Button
      </soc-split-button>
    `,
  }),
};
