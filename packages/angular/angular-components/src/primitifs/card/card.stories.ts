import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideUsers } from '@lucide/angular';
import { SocCard, SocCardIcon, SocCardFooter } from './card';

// No "Grid" story here — soc-card-grid isn't migrated yet (a composed component, this batch is
// primitifs only). React's own Card.stories.tsx has one wrapping several Cards in a CardGrid —
// add it back once that component exists.
const meta: Meta<SocCard> = {
  title: 'Components/Container/Card',
  component: SocCard,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocCard, SocCardIcon, SocCardFooter, LucideUsers] })],
  args: {
    title: 'Card Title',
    subtitle: 'Subtitle',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[385px]">
        <soc-card [title]="title" [subtitle]="subtitle">
          <svg lucideUsers socCardIcon class="size-full" [strokeWidth]="1.5"></svg>
          <div class="flex size-full min-h-[100px] items-center justify-center rounded bg-[var(--bridges-color-surface-neutral-first)] text-sm text-[var(--bridges-color-text-secondary)]">
            Content
          </div>
        </soc-card>
      </div>
    `,
  }),
};
export default meta;
type Story = StoryObj<SocCard>;

export const Default: Story = {};

export const WithFooter: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[385px]">
        <soc-card [title]="title" [subtitle]="subtitle">
          <svg lucideUsers socCardIcon class="size-full" [strokeWidth]="1.5"></svg>
          <div class="flex size-full min-h-[100px] items-center justify-center rounded bg-[var(--bridges-color-surface-neutral-first)] text-sm text-[var(--bridges-color-text-secondary)]">
            Content
          </div>
          <div socCardFooter class="w-full text-[length:12px] text-[var(--bridges-color-text-secondary)]">Footer content</div>
        </soc-card>
      </div>
    `,
  }),
};

export const WithoutIcon: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[385px]">
        <soc-card [title]="title" [subtitle]="subtitle">
          <div class="flex size-full min-h-[100px] items-center justify-center rounded bg-[var(--bridges-color-surface-neutral-first)] text-sm text-[var(--bridges-color-text-secondary)]">
            Content
          </div>
        </soc-card>
      </div>
    `,
  }),
};

export const WithoutSubtitle: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[385px]">
        <soc-card [title]="title">
          <svg lucideUsers socCardIcon class="size-full" [strokeWidth]="1.5"></svg>
          <div class="flex size-full min-h-[100px] items-center justify-center rounded bg-[var(--bridges-color-surface-neutral-first)] text-sm text-[var(--bridges-color-text-secondary)]">
            Content
          </div>
        </soc-card>
      </div>
    `,
  }),
};

/** The whole card is clickable and shows a hover background — use for a selectable grid/list of
 * cards, not for a purely informational card. */
export const Selectable: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[385px]">
        <soc-card [title]="title" [subtitle]="subtitle" type="selectable">
          <svg lucideUsers socCardIcon class="size-full" [strokeWidth]="1.5"></svg>
          <div class="flex size-full min-h-[100px] items-center justify-center rounded bg-[var(--bridges-color-surface-neutral-first)] text-sm text-[var(--bridges-color-text-secondary)]">
            Content
          </div>
        </soc-card>
      </div>
    `,
  }),
};
