import { CdkDrag, CdkDropList, moveItemInArray, type CdkDragDrop } from '@angular/cdk/drag-drop';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideCheck, LucidePlus } from '@lucide/angular';
import { SocLabsChartTypeChip } from '../chart-type-chip/chart-type-chip';
import { SocLabsIconButton } from '../icon-button/icon-button';
import { labsBanner } from '../stories/labs-story';
import { SocLabsListRow, SocLabsListRowAction, SocLabsListRowLeading } from './list-row';

const meta: Meta<SocLabsListRow> = {
  title: 'Labs (expérimental)/List Row',
  component: SocLabsListRow,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [SocLabsListRow, SocLabsListRowLeading, SocLabsListRowAction, SocLabsChartTypeChip, SocLabsIconButton, LucidePlus, LucideCheck, CdkDropList, CdkDrag],
    }),
    labsBanner,
  ],
  args: { title: 'Effectif total', subtitle: 'Nombre de salariés actifs à fin de mois', selected: false, locked: false, lockedReason: 'Indisponible pour cette population', draggable: true },
  render: (args) => ({
    props: args,
    template: `
      <div role="list" class="w-[240px] bg-[var(--bridges-color-surface-neutral-white)] p-[var(--bridges-position-padding-3xs)]">
        <soc-labs-list-row [title]="title" [subtitle]="subtitle" [selected]="selected" [locked]="locked" [lockedReason]="lockedReason" [draggable]="draggable">
          <soc-labs-chart-type-chip socLabsListRowLeading type="courbe" decorative />
          <soc-labs-icon-button socLabsListRowAction [ariaLabel]="'Ajouter ' + title" tooltip="Ajouter" size="xs" variant="primary-subtle" shape="round">
            <svg lucidePlus class="size-full" [strokeWidth]="2"></svg>
          </soc-labs-icon-button>
        </soc-labs-list-row>
      </div>
    `,
  }),
};
export default meta;
type Story = StoryObj<SocLabsListRow>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
export const Locked: Story = { args: { locked: true } };
export const LongTextTruncated: Story = {
  args: { title: 'Taux d’absentéisme pour maladie de courte durée, hors accidents du travail', subtitle: 'Moyenne glissante sur douze mois, tous établissements confondus' },
};

/** Catalogue réordonnable au glisser (CDK), avec les quatre états : normal, survol (poignée), ajouté, verrouillé. */
export const Catalogue: Story = {
  render: () => {
    const items = [
      { id: 1, titre: 'Effectif total', sous: 'Salariés actifs à fin de mois', type: 'kpi', ajoute: true },
      { id: 2, titre: 'Entrées et sorties', sous: 'Mouvements du personnel', type: 'histogramme', ajoute: false },
      { id: 3, titre: 'Pyramide des âges', sous: 'Répartition par tranche', type: 'barres-horizontales', ajoute: false },
      { id: 4, titre: 'Masse salariale', sous: 'Réservé à la paie', type: 'courbe', ajoute: false, verrou: 'Indisponible pour cette population' },
      { id: 5, titre: 'Répartition par contrat', sous: 'CDI, CDD, alternance', type: 'camembert', ajoute: false },
    ];
    return {
      props: {
        items,
        drop: (e: CdkDragDrop<unknown>) => moveItemInArray(items, e.previousIndex, e.currentIndex),
      },
      template: `
        <div role="list" cdkDropList (cdkDropListDropped)="drop($event)" class="flex w-[240px] flex-col gap-[var(--bridges-position-gap-xs)] border border-[var(--bridges-color-border-subtle)] bg-[var(--bridges-color-surface-neutral-white)] p-[var(--bridges-position-padding-3xs)]">
          @for (it of items; track it.id) {
            <soc-labs-list-row cdkDrag [cdkDragDisabled]="!!it.verrou" [title]="it.titre" [subtitle]="it.sous" [selected]="it.ajoute" [locked]="!!it.verrou" [lockedReason]="it.verrou" draggable>
              <soc-labs-chart-type-chip socLabsListRowLeading [type]="$any(it.type)" decorative />
              <soc-labs-icon-button socLabsListRowAction [ariaLabel]="(it.ajoute ? 'Retirer ' : 'Ajouter ') + it.titre" [tooltip]="it.ajoute ? 'Ajouté' : 'Ajouter'" size="xs" shape="round" [variant]="it.ajoute ? 'primary-subtle' : 'ghost'" (click)="it.ajoute = !it.ajoute">
                @if (it.ajoute) { <svg lucideCheck class="size-full" [strokeWidth]="2"></svg> } @else { <svg lucidePlus class="size-full" [strokeWidth]="2"></svg> }
              </soc-labs-icon-button>
            </soc-labs-list-row>
          }
        </div>
      `,
    };
  },
};
