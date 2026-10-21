import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideFileText, LucideLayoutGrid, LucideUsers } from '@lucide/angular';
import { labsBanner } from '../stories/labs-story';
import { LABS_ICON_TILE_COLORS, SocLabsIconTile } from './icon-tile';

const meta: Meta<SocLabsIconTile> = {
  title: 'Labs (expérimental)/Icon Tile',
  component: SocLabsIconTile,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocLabsIconTile, LucideLayoutGrid, LucideUsers, LucideFileText] }), labsBanner],
  argTypes: {
    color: { control: 'select', options: LABS_ICON_TILE_COLORS },
    size: { control: 'select', options: [20, 28, 32] },
  },
  args: { color: 'blue', size: 32, label: 'Tableau de bord', decorative: false },
  render: (args) => ({
    props: args,
    template: `
      <soc-labs-icon-tile [color]="color" [size]="size" [label]="label" [decorative]="decorative">
        <svg lucideLayoutGrid class="size-full" [strokeWidth]="2"></svg>
      </soc-labs-icon-tile>
    `,
  }),
};
export default meta;
type Story = StoryObj<SocLabsIconTile>;

export const Default: Story = {};

export const Decorative: Story = { args: { decorative: true } };

/** Toutes les couleurs (accents du kit + neutre), en 20, 28 et 32 px. */
export const AllColorsAndSizes: Story = {
  render: () => ({
    props: { colors: LABS_ICON_TILE_COLORS },
    template: `
      <div class="grid grid-cols-[repeat(4,auto)] items-center gap-x-6 gap-y-3 text-sm text-[var(--bridges-color-text-primary)] w-max">
        @for (c of colors; track c) {
          <soc-labs-icon-tile [color]="c" [size]="20" decorative><svg lucideLayoutGrid class="size-full" [strokeWidth]="2"></svg></soc-labs-icon-tile>
          <soc-labs-icon-tile [color]="c" [size]="28" decorative><svg lucideLayoutGrid class="size-full" [strokeWidth]="2"></svg></soc-labs-icon-tile>
          <soc-labs-icon-tile [color]="c" [size]="32" decorative><svg lucideLayoutGrid class="size-full" [strokeWidth]="2"></svg></soc-labs-icon-tile>
          <span>{{ c }}</span>
        }
      </div>
    `,
  }),
};

/** Usage cible : devant le nom d'une ligne de liste (tuile décorative, le nom est lu juste après). */
export const BeforeALabel: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-3 text-sm text-[var(--bridges-color-text-primary)]">
        <span class="inline-flex items-center gap-[var(--bridges-position-gap-sm)]">
          <soc-labs-icon-tile decorative><svg lucideLayoutGrid class="size-full" [strokeWidth]="2"></svg></soc-labs-icon-tile>
          Direction générale
        </span>
        <span class="inline-flex items-center gap-[var(--bridges-position-gap-sm)]">
          <soc-labs-icon-tile color="green" decorative><svg lucideUsers class="size-full" [strokeWidth]="2"></svg></soc-labs-icon-tile>
          Mon équipe
        </span>
        <span class="inline-flex items-center gap-[var(--bridges-position-gap-sm)]">
          <soc-labs-icon-tile color="neutral" decorative><svg lucideFileText class="size-full" [strokeWidth]="2"></svg></soc-labs-icon-tile>
          Rapport mensuel
        </span>
      </div>
    `,
  }),
};
