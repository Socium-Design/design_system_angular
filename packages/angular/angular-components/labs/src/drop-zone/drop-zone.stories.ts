import { CdkDrag, CdkDropList, CdkDropListGroup, type CdkDragDrop } from '@angular/cdk/drag-drop';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocLabsChartTypeChip } from '../chart-type-chip/chart-type-chip';
import { SocLabsListRow, SocLabsListRowLeading } from '../list-row/list-row';
import { labsBanner } from '../stories/labs-story';
import { SocLabsDropZone } from './drop-zone';

const meta: Meta<SocLabsDropZone> = {
  title: 'Labs (expérimental)/Drop Zone',
  component: SocLabsDropZone,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocLabsDropZone, SocLabsListRow, SocLabsListRowLeading, SocLabsChartTypeChip, CdkDropList, CdkDropListGroup, CdkDrag] }), labsBanner],
  argTypes: { variant: { control: 'inline-radio', options: ['empty', 'slot'] } },
  args: { variant: 'empty', label: undefined, hint: 'Les graphes de la bibliothèque apparaîtront ici', active: false, disabled: false },
  render: (args) => ({
    props: args,
    template: `<div class="w-[480px]"><soc-labs-drop-zone [variant]="variant" [label]="label" [hint]="hint" [active]="active" [disabled]="disabled" /></div>`,
  }),
};
export default meta;
type Story = StoryObj<SocLabsDropZone>;

export const Empty: Story = {};
export const EmptyDropHover: Story = { args: { active: true } };
export const Slot: Story = { args: { variant: 'slot', hint: undefined } };
export const SlotDropHover: Story = { args: { variant: 'slot', hint: undefined, active: true } };
export const Disabled: Story = { args: { disabled: true } };

/** Vraie interaction CDK : glisser une ligne du catalogue sur l'une des deux zones (ou cliquer). */
export const WithCdkDragDrop: Story = {
  render: () => {
    const state = { catalogue: ['Effectif total', 'Entrées et sorties', 'Pyramide des âges'], section: [] as string[], clics: 0 };
    return {
      props: {
        state,
        drop: (e: CdkDragDrop<unknown>) => {
          state.section.push(e.item.data);
        },
      },
      template: `
        <div cdkDropListGroup class="flex gap-6">
          <div role="list" cdkDropList [cdkDropListSortingDisabled]="true" class="flex w-[240px] flex-col gap-[var(--bridges-position-gap-xs)] border border-[var(--bridges-color-border-subtle)] bg-[var(--bridges-color-surface-neutral-white)] p-[var(--bridges-position-padding-3xs)]">
            @for (t of state.catalogue; track t) {
              <soc-labs-list-row cdkDrag [cdkDragData]="t" [title]="t" draggable [selected]="state.section.includes(t)">
                <soc-labs-chart-type-chip socLabsListRowLeading type="histogramme" decorative />
              </soc-labs-list-row>
            }
          </div>
          <div class="flex w-[420px] flex-col gap-[var(--bridges-position-gap-sm)]">
            @if (!state.section.length) {
              <soc-labs-drop-zone cdkDropList [cdkDropListSortingDisabled]="true" (cdkDropListDropped)="drop($event)" (activate)="state.clics = state.clics + 1" hint="Glissez un indicateur depuis le catalogue" />
            } @else {
              <ul class="flex flex-col gap-[var(--bridges-position-gap-xs)] text-sm text-[var(--bridges-color-text-primary)]">
                @for (s of state.section; track $index) { <li class="rounded-[var(--bridges-shape-figure-radius-md)] bg-[var(--bridges-color-background-layer-1)] px-3 py-2">{{ s }}</li> }
              </ul>
              <soc-labs-drop-zone variant="slot" label="Ajouter un graphe…" cdkDropList [cdkDropListSortingDisabled]="true" (cdkDropListDropped)="drop($event)" (activate)="state.clics = state.clics + 1" />
            }
            <p class="text-xs text-[var(--bridges-color-text-secondary)]">Clics sur une zone : {{ state.clics }}</p>
          </div>
        </div>
      `,
    };
  },
};
