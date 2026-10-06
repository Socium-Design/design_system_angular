import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideUsers } from '@lucide/angular';
import { SocCardGrid } from '../../composes/card-grid/card-grid';
import { SocCard, SocCardIcon, SocCardFooter } from './card';

const meta: Meta<SocCard> = {
  title: 'Components/Container/Card',
  component: SocCard,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocCard, SocCardIcon, SocCardFooter, SocCardGrid, LucideUsers] })],
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

/** Several `soc-card`s side by side always go through `soc-card-grid` — see its own stories for the
 * column/gap/`colSpan`/`rowSpan` contract — never a one-off `<div class="grid ...">`. */
export const Grid: Story = {
  render: (args) => ({
    props: { ...args, titles: ['Card Title', 'Deuxième carte', 'Troisième carte'] },
    template: `
      <soc-card-grid mode="fixed" gap="md">
        @for (cardTitle of titles; track cardTitle) {
          <soc-card [title]="cardTitle" [subtitle]="subtitle" type="selectable">
            <svg lucideUsers socCardIcon class="size-full" [strokeWidth]="1.5"></svg>
            <div class="flex size-full min-h-[100px] items-center justify-center rounded bg-[var(--bridges-color-surface-neutral-first)] text-sm text-[var(--bridges-color-text-secondary)]">
              Content
            </div>
          </soc-card>
        }
      </soc-card-grid>
    `,
  }),
};
