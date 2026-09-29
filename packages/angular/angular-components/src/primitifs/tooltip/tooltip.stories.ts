import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocTooltip, SocTooltipLabel, SocTooltipContent, type TooltipMessageStatus } from './tooltip';
import { SocButton } from '../button/button';

const meta: Meta<SocTooltip> = {
  title: 'Components/Feedback/Tooltip',
  component: SocTooltip,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocTooltip, SocTooltipLabel, SocTooltipContent, SocButton] })],
  args: {
    position: 'top',
  },
};
export default meta;
type Story = StoryObj<SocTooltip>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="p-16">
        <soc-tooltip [position]="position">
          <button socButton>Survolez-moi</button>
          <span socTooltipLabel>Enter your username</span>
        </soc-tooltip>
      </div>
    `,
  }),
};

export const AllPositions: Story = {
  render: () => ({
    props: { positions: ['top', 'bottom', 'left', 'right'] },
    template: `
      <div class="flex flex-wrap gap-16 p-16">
        @for (position of positions; track position) {
          <soc-tooltip [position]="position">
            <button socButton>{{ position }}</button>
            <span socTooltipLabel>Enter your username</span>
          </soc-tooltip>
        }
      </div>
    `,
  }),
};

export const Extend: Story = {
  render: () => ({
    template: `
      <div class="p-16">
        <soc-tooltip variant="extend" title="Tooltip title" position="bottom">
          <button socButton>Survolez-moi</button>
          <span socTooltipContent>Content goes here</span>
        </soc-tooltip>
      </div>
    `,
  }),
};

/** Both triggers request position="top"/position="left" but sit flush against the top-left corner
 * of the viewport, so neither has room to open that way — collision detection should flip them to
 * bottom/right instead, and they should still be fully visible. */
export const CollisionFlip: Story = {
  render: () => ({
    template: `
      <div class="relative h-[300px] w-full">
        <div class="absolute left-0 top-0 p-2">
          <soc-tooltip position="top">
            <button socButton>Coin haut-gauche</button>
            <span socTooltipLabel>Devrait s'ouvrir vers le bas</span>
          </soc-tooltip>
        </div>
        <div class="absolute left-0 top-0 ml-40 p-2">
          <soc-tooltip position="left">
            <button socButton>Aussi coincé à gauche</button>
            <span socTooltipLabel>Devrait s'ouvrir vers la droite</span>
          </soc-tooltip>
        </div>
      </div>
    `,
  }),
};

export const AllMessageStatuses: Story = {
  render: () => ({
    props: { statuses: ['success', 'error', 'warning', 'info'] as TooltipMessageStatus[] },
    template: `
      <div class="flex flex-wrap gap-16 p-16">
        @for (status of statuses; track status) {
          <soc-tooltip variant="message" [status]="status" position="bottom">
            <button socButton>{{ status }}</button>
            <span socTooltipLabel>Enter your username</span>
          </soc-tooltip>
        }
      </div>
    `,
  }),
};
