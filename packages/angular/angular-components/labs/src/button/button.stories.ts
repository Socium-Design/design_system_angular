import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideChevronRight, LucideEye, LucideLayoutGrid } from '@lucide/angular';
import { SocButton, SocButtonLeftIcon, SocButtonRightIcon } from '@socium-design/angular-components';
import { labsBanner } from '../stories/labs-story';
import { SocLabsButton } from './button';

const meta: Meta<SocLabsButton & { label: string; disabled: boolean }> = {
  title: 'Labs (expérimental)/Button',
  component: SocLabsButton,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [SocLabsButton, SocButton, SocButtonLeftIcon, SocButtonRightIcon, LucideLayoutGrid, LucideEye, LucideChevronRight] }),
    labsBanner,
  ],
  argTypes: {
    variant: { control: 'select', options: ['primary-subtle'] },
    size: { control: 'select', options: ['sm', 'lg'] },
  },
  args: { variant: 'primary-subtle', size: 'sm', label: 'Visualiser', disabled: false },
  render: (args) => ({
    props: args,
    template: `
      <button socLabsButton [variant]="variant" [size]="size" [disabled]="disabled">
        <svg lucideLayoutGrid socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
        {{ label }}
      </button>
    `,
  }),
};
export default meta;
type Story = StoryObj<SocLabsButton & { label: string; disabled: boolean }>;

export const Default: Story = {};

export const Large: Story = { args: { size: 'lg' } };

export const Disabled: Story = { args: { disabled: true } };

/** Sans icône, icône à gauche, icône à droite — en sm et lg, puis désactivés. */
export const AllVariants: Story = {
  render: () => ({
    props: { sizes: ['sm', 'lg'] },
    template: `
      <div class="flex flex-col gap-4">
        @for (size of sizes; track size) {
          <div class="flex items-center gap-3">
            <button socLabsButton [size]="size">Visualiser</button>
            <button socLabsButton [size]="size"><svg lucideLayoutGrid socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>Visualiser</button>
            <button socLabsButton [size]="size">Suivant<svg lucideChevronRight socButtonRightIcon class="size-full" [strokeWidth]="1.5"></svg></button>
            <button socLabsButton [size]="size" disabled><svg lucideLayoutGrid socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>Visualiser</button>
          </div>
        }
      </div>
    `,
  }),
};

/** Usage cible : à côté d'un bouton `secondary` du kit, sur une ligne de liste (même hauteur). */
export const NextToKitButtons: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-[var(--bridges-position-gap-sm)]">
        <button socButton variant="secondary"><svg lucideEye socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>Détail</button>
        <button socLabsButton><svg lucideLayoutGrid socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>Visualiser</button>
      </div>
    `,
  }),
};
