import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocCard } from '../../primitifs/card/card';
import { SocCardGrid } from './card-grid';

const FILLER = `<div class="flex size-full min-h-[80px] items-center justify-center text-sm text-[var(--bridges-color-text-secondary)]">{{ label }}</div>`;

const meta: Meta<SocCardGrid> = {
  title: 'Components/Container/Card Grid',
  component: SocCardGrid,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocCardGrid, SocCard] })],
};
export default meta;
type Story = StoryObj<SocCardGrid>;

/**
 * `mode="fixed"` ignores any `colSpan`/`rowSpan` passed on a child `soc-card` — every card here is
 * given `colSpan=2`/`rowSpan=2` deliberately, and every one still renders as a single 1×1 cell,
 * proving the override actually happens rather than just defaulting when nothing was passed.
 */
export const Fixed: Story = {
  render: () => ({
    props: { cards: Array.from({ length: 8 }, (_, i) => `Carte ${i + 1}`) },
    template: `
      <soc-card-grid mode="fixed" gap="md">
        @for (label of cards; track label) {
          <soc-card [title]="label" [colSpan]="2" [rowSpan]="2">${FILLER}</soc-card>
        }
      </soc-card-grid>
    `,
  }),
};

/**
 * `mode="bento"` respects `colSpan`/`rowSpan` and backfills gaps with `grid-auto-flow: dense` — no
 * manual placement. "Carte 1" and "Carte 4" ask for `colSpan=2`; resize the canvas below ~600px
 * (2-column tier, 75% ceiling = 1 column) and both render as `col-span-1` instead. They only reach
 * their full 2-column width once the 3-column tier (`@min-[600px]`, ceiling 2) has room.
 */
export const Bento: Story = {
  render: () => ({
    template: `
      <soc-card-grid mode="bento" gap="md">
        <soc-card title="Carte 1" [colSpan]="2" [rowSpan]="2"><div class="flex size-full min-h-[80px] items-center justify-center text-sm text-[var(--bridges-color-text-secondary)]">Carte 1</div></soc-card>
        <soc-card title="Carte 2"><div class="flex size-full min-h-[80px] items-center justify-center text-sm text-[var(--bridges-color-text-secondary)]">Carte 2</div></soc-card>
        <soc-card title="Carte 3"><div class="flex size-full min-h-[80px] items-center justify-center text-sm text-[var(--bridges-color-text-secondary)]">Carte 3</div></soc-card>
        <soc-card title="Carte 4" [colSpan]="2"><div class="flex size-full min-h-[80px] items-center justify-center text-sm text-[var(--bridges-color-text-secondary)]">Carte 4</div></soc-card>
        <soc-card title="Carte 5"><div class="flex size-full min-h-[80px] items-center justify-center text-sm text-[var(--bridges-color-text-secondary)]">Carte 5</div></soc-card>
        <soc-card title="Carte 6"><div class="flex size-full min-h-[80px] items-center justify-center text-sm text-[var(--bridges-color-text-secondary)]">Carte 6</div></soc-card>
        <soc-card title="Carte 7" [rowSpan]="2"><div class="flex size-full min-h-[80px] items-center justify-center text-sm text-[var(--bridges-color-text-secondary)]">Carte 7</div></soc-card>
        <soc-card title="Carte 8"><div class="flex size-full min-h-[80px] items-center justify-center text-sm text-[var(--bridges-color-text-secondary)]">Carte 8</div></soc-card>
      </soc-card-grid>
    `,
  }),
};

/**
 * `rowHeight` forces every row to the same height regardless of content — "Carte 2" has a much
 * taller body than its neighbors, but every row still measures exactly 160px (the `rowSpan=2` card
 * gets exactly 2×160 + gap, not "whatever its content needed").
 */
export const FixedRowHeight: Story = {
  render: () => ({
    template: `
      <soc-card-grid mode="bento" gap="md" [rowHeight]="160">
        <soc-card title="Carte 1" [rowSpan]="2"><div class="flex size-full min-h-[80px] items-center justify-center text-sm text-[var(--bridges-color-text-secondary)]">Carte 1</div></soc-card>
        <soc-card title="Carte 2"><div class="flex size-full items-center justify-center text-sm text-[var(--bridges-color-text-secondary)]">Contenu un peu plus haut</div></soc-card>
        <soc-card title="Carte 3"><div class="flex size-full min-h-[80px] items-center justify-center text-sm text-[var(--bridges-color-text-secondary)]">Carte 3</div></soc-card>
        <soc-card title="Carte 4"><div class="flex size-full min-h-[80px] items-center justify-center text-sm text-[var(--bridges-color-text-secondary)]">Carte 4</div></soc-card>
      </soc-card-grid>
    `,
  }),
};

/**
 * `colSpan=3` ("Carte 1") is clamped to never exceed 75% of the row's active column count,
 * recalculated at every tier: `col-span-1` below 600px (2 active columns), `col-span-2` from 600px
 * (3 active), full `col-span-3` from 900px (4 active). No card here ever reaches a full-width row.
 */
export const BentoColSpan3: Story = {
  render: () => ({
    props: { others: ['Carte 2', 'Carte 3', 'Carte 4', 'Carte 5'] },
    template: `
      <soc-card-grid mode="bento" gap="md">
        <soc-card title="Carte 1" [colSpan]="3"><div class="flex size-full min-h-[80px] items-center justify-center text-sm text-[var(--bridges-color-text-secondary)]">Carte 1</div></soc-card>
        @for (label of others; track label) {
          <soc-card [title]="label">${FILLER}</soc-card>
        }
      </soc-card-grid>
    `,
  }),
};

/**
 * `columns` forces an exact column count, bypassing the container query — the same 75% ceiling
 * still applies, computed once against that fixed number. "Carte 1" asks for `colSpan=3` in both
 * grids: `columns=2` → ceiling 1 → `col-span-1`; `columns=4` → ceiling 3 → granted in full.
 */
export const FixedColumns: Story = {
  render: () => ({
    props: { others: ['Carte 2', 'Carte 3', 'Carte 4'] },
    template: `
      <div class="flex w-full flex-col gap-8">
        <div class="flex flex-col gap-2">
          <p class="text-sm text-[var(--bridges-color-text-secondary)]">columns=2 — ceiling 1</p>
          <soc-card-grid mode="bento" gap="md" [columns]="2">
            <soc-card title="Carte 1" [colSpan]="3"><div class="flex size-full min-h-[80px] items-center justify-center text-sm text-[var(--bridges-color-text-secondary)]">Carte 1</div></soc-card>
            @for (label of others; track label) {
              <soc-card [title]="label">${FILLER}</soc-card>
            }
          </soc-card-grid>
        </div>
        <div class="flex flex-col gap-2">
          <p class="text-sm text-[var(--bridges-color-text-secondary)]">columns=4 — ceiling 3</p>
          <soc-card-grid mode="bento" gap="md" [columns]="4">
            <soc-card title="Carte 1" [colSpan]="3"><div class="flex size-full min-h-[80px] items-center justify-center text-sm text-[var(--bridges-color-text-secondary)]">Carte 1</div></soc-card>
            @for (label of others; track label) {
              <soc-card [title]="label">${FILLER}</soc-card>
            }
          </soc-card-grid>
        </div>
      </div>
    `,
  }),
};

/** Gap options side by side — same fixed value in both modes, never recalculated. */
export const GapSizes: Story = {
  render: () => ({
    props: { gaps: ['sm', 'md', 'lg'], cards: ['Carte 1', 'Carte 2', 'Carte 3', 'Carte 4'] },
    template: `
      <div class="flex w-full flex-col gap-8">
        @for (gap of gaps; track gap) {
          <div class="flex flex-col gap-2">
            <p class="text-sm text-[var(--bridges-color-text-secondary)]">gap="{{ gap }}"</p>
            <soc-card-grid mode="fixed" [gap]="$any(gap)">
              @for (label of cards; track label) {
                <soc-card [title]="label">${FILLER}</soc-card>
              }
            </soc-card-grid>
          </div>
        }
      </div>
    `,
  }),
};
