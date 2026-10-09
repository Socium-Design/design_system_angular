import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideGripVertical, LucidePencil, LucidePlus, LucideX } from '@lucide/angular';
import { labsBanner } from '../stories/labs-story';
import { SocLabsIconButton, type LabsIconButtonShape, type LabsIconButtonSize, type LabsIconButtonVariant } from './icon-button';

const SIZES: LabsIconButtonSize[] = ['xs', 'sm', 'md'];
const VARIANTS: LabsIconButtonVariant[] = ['ghost', 'primary-subtle'];
const SHAPES: LabsIconButtonShape[] = ['square', 'round'];

const meta: Meta<SocLabsIconButton> = {
  title: 'Labs (expérimental)/Icon Button',
  component: SocLabsIconButton,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocLabsIconButton, LucidePlus, LucidePencil, LucideX, LucideGripVertical] }), labsBanner],
  argTypes: {
    size: { control: 'select', options: SIZES },
    variant: { control: 'select', options: VARIANTS },
    shape: { control: 'select', options: SHAPES },
  },
  args: { ariaLabel: 'Ajouter', size: 'sm', variant: 'ghost', shape: 'square', tooltip: 'Ajouter', disabled: false },
  render: (args) => ({
    props: args,
    template: `
      <soc-labs-icon-button [ariaLabel]="ariaLabel" [size]="size" [variant]="variant" [shape]="shape" [tooltip]="tooltip" [disabled]="disabled">
        <svg lucidePlus class="size-full" [strokeWidth]="1.5"></svg>
      </soc-labs-icon-button>
    `,
  }),
};
export default meta;
type Story = StoryObj<SocLabsIconButton>;

export const Default: Story = {};

export const PrimarySubtleRound: Story = { args: { variant: 'primary-subtle', shape: 'round' } };

export const Disabled: Story = { args: { disabled: true } };

export const WithoutTooltip: Story = { args: { tooltip: undefined } };

/** Toutes les tailles × variantes × formes, puis les états désactivé et bascule (`aria-pressed`). */
export const AllVariants: Story = {
  render: () => ({
    props: { sizes: SIZES, variants: VARIANTS, shapes: SHAPES },
    template: `
      <div class="flex flex-col gap-4 text-sm text-[var(--bridges-color-text-secondary)]">
        @for (variant of variants; track variant) {
          @for (shape of shapes; track shape) {
            <div class="flex items-center gap-4">
              <span class="w-44">{{ variant }} · {{ shape }}</span>
              @for (size of sizes; track size) {
                <soc-labs-icon-button ariaLabel="Ajouter" [tooltip]="size + ' — ' + variant" [size]="size" [variant]="variant" [shape]="shape">
                  <svg lucidePlus class="size-full" [strokeWidth]="1.5"></svg>
                </soc-labs-icon-button>
              }
              @for (size of sizes; track size) {
                <soc-labs-icon-button ariaLabel="Ajouter (désactivé)" [size]="size" [variant]="variant" [shape]="shape" disabled>
                  <svg lucidePlus class="size-full" [strokeWidth]="1.5"></svg>
                </soc-labs-icon-button>
              }
            </div>
          }
        }
        <div class="flex items-center gap-4">
          <span class="w-44">bascule (pressed)</span>
          <soc-labs-icon-button ariaLabel="Modifier" [pressed]="true" variant="primary-subtle"><svg lucidePencil class="size-full" [strokeWidth]="1.5"></svg></soc-labs-icon-button>
          <soc-labs-icon-button ariaLabel="Modifier" [pressed]="false"><svg lucidePencil class="size-full" [strokeWidth]="1.5"></svg></soc-labs-icon-button>
          <soc-labs-icon-button ariaLabel="Retirer" size="xs" shape="round" tooltip="Retirer"><svg lucideX class="size-full" [strokeWidth]="1.5"></svg></soc-labs-icon-button>
        </div>
      </div>
    `,
  }),
};
