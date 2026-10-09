import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideArrowLeft, LucideEye, LucidePlus, LucideSave } from '@lucide/angular';
import { SocBadge, SocButton, SocButtonLeftIcon, SocTag } from '@socium-design/angular-components';
import { SocLabsChartTypeChip } from '../chart-type-chip/chart-type-chip';
import { SocLabsCompactField } from '../compact-field/compact-field';
import { SocLabsDropZone } from '../drop-zone/drop-zone';
import { SocLabsIconButton } from '../icon-button/icon-button';
import { SocLabsInlineEdit } from '../inline-edit/inline-edit';
import { SocLabsListRow, SocLabsListRowAction, SocLabsListRowLeading } from '../list-row/list-row';
import { SocLabsPillToggle } from '../pill-toggle/pill-toggle';
import { labsBanner } from '../stories/labs-story';
import {
  SocLabsWorkspaceActions,
  SocLabsWorkspaceBack,
  SocLabsWorkspaceHint,
  SocLabsWorkspaceLayout,
  SocLabsWorkspaceLeft,
  SocLabsWorkspaceRight,
  SocLabsWorkspaceTitle,
} from './workspace-layout';

const meta: Meta<SocLabsWorkspaceLayout> = {
  title: 'Labs (expérimental)/Workspace Layout',
  component: SocLabsWorkspaceLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    moduleMetadata({
      imports: [
        SocLabsWorkspaceLayout, SocLabsWorkspaceBack, SocLabsWorkspaceTitle, SocLabsWorkspaceHint, SocLabsWorkspaceActions, SocLabsWorkspaceLeft, SocLabsWorkspaceRight,
        SocLabsIconButton, SocLabsInlineEdit, SocLabsCompactField, SocLabsPillToggle, SocLabsListRow, SocLabsListRowLeading, SocLabsListRowAction, SocLabsChartTypeChip, SocLabsDropZone,
        SocButton, SocButtonLeftIcon, SocBadge, SocTag, LucideArrowLeft, LucideEye, LucideSave, LucidePlus,
      ],
    }),
    labsBanner,
  ],
  args: { leftWidth: '220px', rightWidth: '240px', leftLabel: 'Informations', rightLabel: 'Bibliothèque', centerLabel: 'Composition du tableau de bord' },
};
export default meta;
type Story = StoryObj<SocLabsWorkspaceLayout>;

const placeholder = (label: string) =>
  `<div class="flex h-[1200px] items-start justify-center rounded-[var(--bridges-shape-figure-radius-md)] border border-dashed border-[var(--bridges-color-border-tertiary)] p-4 text-sm text-[var(--bridges-color-text-secondary)]">${label} (défile seul)</div>`;

/** Squelette : toutes les régions, chaque colonne défile indépendamment. */
export const Skeleton: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="h-[600px]">
        <soc-labs-workspace-layout [leftWidth]="leftWidth" [rightWidth]="rightWidth" [leftLabel]="leftLabel" [rightLabel]="rightLabel" [centerLabel]="centerLabel">
          <soc-labs-icon-button socLabsWorkspaceBack ariaLabel="Retour" tooltip="Retour" size="md"><svg lucideArrowLeft class="size-full" [strokeWidth]="2"></svg></soc-labs-icon-button>
          <span socLabsWorkspaceTitle>Titre</span>
          <soc-badge socLabsWorkspaceHint color="primary">Badge</soc-badge>
          <button socButton socLabsWorkspaceActions variant="tertiary">Action</button>
          <div socLabsWorkspaceLeft>${placeholder('Panneau gauche')}</div>
          <div socLabsWorkspaceRight>${placeholder('Panneau droit')}</div>
          ${placeholder('Zone centrale')}
        </soc-labs-workspace-layout>
      </div>
    `,
  }),
};

export const WithoutPanels: Story = {
  render: () => ({
    template: `
      <div class="h-[400px]">
        <soc-labs-workspace-layout>
          <span socLabsWorkspaceTitle>Sans panneaux</span>
          ${placeholder('Zone centrale seule')}
        </soc-labs-workspace-layout>
      </div>
    `,
  }),
};

export const LeftPanelOnly: Story = {
  render: () => ({
    template: `
      <div class="h-[400px]">
        <soc-labs-workspace-layout>
          <span socLabsWorkspaceTitle>Détail (lecture seule)</span>
          <soc-tag socLabsWorkspaceHint color="information">Lecture seule</soc-tag>
          <div socLabsWorkspaceLeft>${placeholder('Informations')}</div>
          ${placeholder('Zone centrale')}
        </soc-labs-workspace-layout>
      </div>
    `,
  }),
};

/** La page de composition (GabaritComposerPage) assemblée avec les composants Labs. */
export const ComposerPage: Story = {
  render: () => {
    const state = {
      libelle: 'Tableau de bord RH',
      section: 'Effectifs',
      description: 'Suivi mensuel des effectifs et des absences.',
      population: 'siege',
      statut: 'actif',
      catalogue: [
        { titre: 'Effectif total', sous: 'Salariés actifs', type: 'kpi', ajoute: true },
        { titre: 'Entrées et sorties', sous: 'Mouvements du personnel', type: 'histogramme', ajoute: true },
        { titre: 'Pyramide des âges', sous: 'Par tranche', type: 'barres-horizontales', ajoute: false },
        { titre: 'Répartition par contrat', sous: 'CDI, CDD, alternance', type: 'camembert', ajoute: false },
        { titre: 'Masse salariale', sous: 'Réservé à la paie', type: 'courbe', ajoute: false, verrou: 'Indisponible pour cette population' },
      ],
    };
    return {
      props: {
        state,
        populations: [{ value: 'siege', label: 'Siège — tous' }, { value: 'managers', label: 'Managers' }],
        statuts: [{ value: 'actif', label: 'Actif', color: 'green' }, { value: 'inactif', label: 'Inactif', color: 'gray' }],
      },
      template: `
        <div class="h-[680px]">
          <soc-labs-workspace-layout centerLabel="Composition du tableau de bord">
            <soc-labs-icon-button socLabsWorkspaceBack ariaLabel="Retour à la liste" tooltip="Retour" size="md"><svg lucideArrowLeft class="size-full" [strokeWidth]="2"></svg></soc-labs-icon-button>
            <soc-labs-inline-edit socLabsWorkspaceTitle [(value)]="state.libelle" defaultValue="Nouveau tableau" ariaLabel="le nom du tableau" />
            <span socLabsWorkspaceHint>Ajoutez des graphes depuis la bibliothèque →</span>
            <span socLabsWorkspaceActions class="flex gap-2">
              <button socButton variant="tertiary"><svg lucideEye socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>Prévisualiser</button>
              <button socButton><svg lucideSave socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>Enregistrer</button>
            </span>

            <div socLabsWorkspaceLeft class="flex flex-col gap-[var(--bridges-position-gap-md)]">
              <soc-labs-compact-field label="Libellé" mode="edit" [(value)]="state.libelle" />
              <soc-labs-compact-field label="Description" mode="edit" control="textarea" [(value)]="state.description" />
              <soc-labs-compact-field label="Population" mode="edit" control="select" [options]="populations" [(value)]="state.population" />
              <div class="flex flex-col gap-1">
                <span class="text-[length:var(--bridges-size-text-text-size-tiny)] uppercase tracking-wider text-[var(--bridges-color-text-secondary)]">Statut</span>
                <soc-labs-pill-toggle ariaLabel="Statut" size="sm" [options]="statuts" [(value)]="state.statut" />
              </div>
            </div>

            <div class="flex items-center gap-2 text-[length:var(--bridges-size-text-text-size-md)] [font-weight:var(--bridges-shape-text-label-weight)] text-[var(--bridges-color-text-primary)]">
              <soc-labs-inline-edit [(value)]="state.section" defaultValue="Section 1" ariaLabel="le nom de la section" />
              <soc-badge color="primary">2 KPI</soc-badge>
            </div>
            <div class="grid grid-cols-2 gap-[var(--bridges-position-gap-lg)]">
              @for (c of state.catalogue; track c.titre) {
                @if (c.ajoute) {
                  <div class="flex h-32 items-start gap-2 rounded-[var(--bridges-shape-figure-radius-lg)] border border-[var(--bridges-color-border-subtle)] bg-[var(--bridges-color-surface-neutral-white)] p-[var(--bridges-position-padding-md)] text-sm text-[var(--bridges-color-text-primary)]">
                    <soc-labs-chart-type-chip [type]="$any(c.type)" [size]="28" decorative /> {{ c.titre }}
                  </div>
                }
              }
            </div>
            <soc-labs-drop-zone variant="slot" label="Ajouter un graphe…" />
            <soc-labs-drop-zone hint="Glissez un indicateur ici pour créer une section" />

            <div socLabsWorkspaceRight role="list" class="flex flex-col gap-[var(--bridges-position-gap-xs)]">
              @for (c of state.catalogue; track c.titre) {
                <soc-labs-list-row [title]="c.titre" [subtitle]="c.sous" [selected]="c.ajoute" [locked]="!!c.verrou" [lockedReason]="c.verrou" draggable>
                  <soc-labs-chart-type-chip socLabsListRowLeading [type]="$any(c.type)" decorative />
                  <soc-labs-icon-button socLabsListRowAction [ariaLabel]="'Ajouter ' + c.titre" size="xs" shape="round" [variant]="c.ajoute ? 'primary-subtle' : 'ghost'" (click)="c.ajoute = !c.ajoute">
                    <svg lucidePlus class="size-full" [strokeWidth]="2"></svg>
                  </soc-labs-icon-button>
                </soc-labs-list-row>
              }
            </div>
          </soc-labs-workspace-layout>
        </div>
      `,
    };
  },
};
