import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocPopover, SocPopoverTrigger, type PopoverPosition } from './popover';
import { SocButton } from '../button/button';

const meta: Meta<SocPopover> = {
  title: 'Components/Container/Popover',
  component: SocPopover,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocPopover, SocPopoverTrigger, SocButton] })],
};
export default meta;
type Story = StoryObj<SocPopover>;

export const Default: Story = {
  render: () => ({
    template: `
      <div class="p-16">
        <soc-popover>
          <button socButton socPopoverTrigger>Ouvrir</button>
          <div class="px-3 py-2 text-sm text-[var(--bridges-color-text-primary)]">Contenu du popover</div>
        </soc-popover>
      </div>
    `,
  }),
};

export const Positions: Story = {
  render: () => ({
    props: { positions: ['top', 'bottom', 'left', 'right', 'bottom-end'] as PopoverPosition[] },
    template: `
      <div class="flex flex-wrap gap-24 p-24">
        @for (position of positions; track position) {
          <soc-popover [position]="position">
            <button socButton socPopoverTrigger>{{ position }}</button>
            <div class="px-3 py-2 text-sm text-[var(--bridges-color-text-primary)]">Contenu ({{ position }})</div>
          </soc-popover>
        }
      </div>
    `,
  }),
};

/**
 * "bottom-end" is what DataTable's onRowAction guidance recommends for a "•••" button sitting at
 * the right edge of a row: the panel opens below and grows leftward (right-edge-aligned), so it's
 * never clipped by a horizontally-scrollable ancestor on the right. Reproduces that exact shape: a
 * "•••" trigger pinned to the far right of a narrow, horizontally-scrollable strip.
 */
export const BottomEndInScrollableRow: Story = {
  render: () => ({
    template: `
      <div class="w-[360px] overflow-x-auto border border-[var(--bridges-color-border-subtle)]">
        <div class="flex w-[600px] items-center justify-end p-4">
          <soc-popover position="bottom-end">
            <button socButton variant="secondary" socPopoverTrigger>•••</button>
            <div class="px-3 py-2 text-sm whitespace-nowrap text-[var(--bridges-color-text-primary)]">Modifier · Supprimer</div>
          </soc-popover>
        </div>
      </div>
    `,
  }),
};
