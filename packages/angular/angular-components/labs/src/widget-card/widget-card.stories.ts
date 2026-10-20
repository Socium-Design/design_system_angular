import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideChartColumn, LucideEllipsis, LucideUsers } from '@lucide/angular';
import { SocLabsCompactField } from '../compact-field/compact-field';
import { SocLabsIconButton } from '../icon-button/icon-button';
import { labsBanner } from '../stories/labs-story';
import {
  SocLabsWidgetCard,
  SocLabsWidgetCardActions,
  SocLabsWidgetCardFilters,
  SocLabsWidgetCardFooter,
  SocLabsWidgetCardIcon,
} from './widget-card';

const KPI = `<p class="text-[length:var(--bridges-size-text-text-size-3xl)] text-[var(--bridges-color-text-primary)] [font-weight:var(--bridges-shape-text-heading-2-weight)]">1 284</p>`;
const CHART = `<div class="flex min-h-[calc(var(--bridges-size-icon-2xl)*3)] w-full flex-1 items-center justify-center rounded-[var(--bridges-shape-figure-radius-sm)] border-[length:var(--bridges-shape-line-hairline)] border-dashed border-[var(--bridges-color-border-subtle)] bg-[var(--bridges-color-background-layer-1)] text-[length:var(--bridges-size-text-text-size-xs)] text-[var(--bridges-color-text-secondary)]">Graphique</div>`;
const MENU = `<soc-labs-icon-button socLabsWidgetCardActions ariaLabel="Options du widget" tooltip="Options" size="xs"><svg lucideEllipsis class="size-full" [strokeWidth]="2"></svg></soc-labs-icon-button>`;

const meta: Meta<SocLabsWidgetCard> = {
  title: 'Labs (expérimental)/Widget Card',
  component: SocLabsWidgetCard,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        SocLabsWidgetCard,
        SocLabsWidgetCardIcon,
        SocLabsWidgetCardActions,
        SocLabsWidgetCardFilters,
        SocLabsWidgetCardFooter,
        SocLabsIconButton,
        SocLabsCompactField,
        LucideEllipsis,
        LucideUsers,
        LucideChartColumn,
      ],
    }),
    labsBanner,
  ],
  args: { title: 'Effectif total', description: 'Salariés actifs à fin de mois', titleLines: 2, descriptionLines: 2 },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[260px]">
        <soc-labs-widget-card [title]="title" [description]="description" [titleLines]="titleLines" [descriptionLines]="descriptionLines">
          ${MENU}
          ${KPI}
        </soc-labs-widget-card>
      </div>
    `,
  }),
};
export default meta;
type Story = StoryObj<SocLabsWidgetCard>;

/** Indicateur (KPI) : valeur dans le corps, menu à droite du titre. */
export const Kpi: Story = { name: 'KPI' };

/** Graphique : le corps prend la hauteur disponible. */
export const Graphique: Story = {
  args: { title: 'Entrées et sorties', description: 'Mouvements du personnel sur douze mois' },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex h-[280px] w-[360px]">
        <soc-labs-widget-card class="w-full" [title]="title" [description]="description" [titleLines]="titleLines" [descriptionLines]="descriptionLines">
          ${MENU}
          ${CHART}
        </soc-labs-widget-card>
      </div>
    `,
  }),
};

/** Avec icône à gauche du titre (pastille du kit). */
export const AvecIcone: Story = {
  name: 'Avec icône',
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[260px]">
        <soc-labs-widget-card [title]="title" [description]="description" [titleLines]="titleLines" [descriptionLines]="descriptionLines">
          <svg lucideUsers socLabsWidgetCardIcon [strokeWidth]="1.5"></svg>
          ${MENU}
          ${KPI}
        </soc-labs-widget-card>
      </div>
    `,
  }),
};

/** Filtres : 4 contrôles compacts qui passent à la ligne dans une carte étroite, sans déborder. */
export const AvecFiltres: Story = {
  name: 'Avec filtres',
  args: { title: 'Taux d’absentéisme', description: 'Moyenne glissante' },
  render: (args) => ({
    props: {
      ...args,
      annees: [{ value: '2026', label: '2026' }, { value: '2025', label: '2025' }],
      sites: [{ value: 'tous', label: 'Tous les établissements' }, { value: 'siege', label: 'Siège' }],
      contrats: [{ value: 'tous', label: 'Tous contrats' }, { value: 'cdi', label: 'CDI' }],
      motifs: [{ value: 'maladie', label: 'Maladie' }, { value: 'at', label: 'Accident du travail' }],
      f: { annee: '2026', site: 'tous', contrat: 'tous', motif: 'maladie' },
    },
    template: `
      <div class="w-[280px]">
        <soc-labs-widget-card [title]="title" [description]="description" [titleLines]="titleLines" [descriptionLines]="descriptionLines">
          ${MENU}
          <soc-labs-compact-field socLabsWidgetCardFilters class="w-auto" label="Année" mode="edit" control="select" size="sm" [separator]="false" [options]="annees" [(value)]="f.annee" />
          <soc-labs-compact-field socLabsWidgetCardFilters class="w-auto" label="Établissement" mode="edit" control="select" size="sm" [separator]="false" [options]="sites" [(value)]="f.site" />
          <soc-labs-compact-field socLabsWidgetCardFilters class="w-auto" label="Contrat" mode="edit" control="select" size="sm" [separator]="false" [options]="contrats" [(value)]="f.contrat" />
          <soc-labs-compact-field socLabsWidgetCardFilters class="w-auto" label="Motif" mode="edit" control="select" size="sm" [separator]="false" [options]="motifs" [(value)]="f.motif" />
          ${CHART}
        </soc-labs-widget-card>
      </div>
    `,
  }),
};

/** Pied de carte, hauteur automatique (ici sur deux lignes). */
export const AvecPied: Story = {
  name: 'Avec pied',
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[260px]">
        <soc-labs-widget-card [title]="title" [description]="description" [titleLines]="titleLines" [descriptionLines]="descriptionLines">
          ${MENU}
          ${KPI}
          <p socLabsWidgetCardFooter class="text-[length:var(--bridges-size-text-text-size-xs)] text-[var(--bridges-color-text-secondary)]">+3,2 % par rapport à l’an dernier, à périmètre constant (hors filiales acquises en 2026)</p>
        </soc-labs-widget-card>
      </div>
    `,
  }),
};

/** Titre et description longs : tronqués à `titleLines` / `descriptionLines` lignes puis « … » (titre complet au survol). */
export const TitreLong: Story = {
  name: 'Titre long (tronqué)',
  args: {
    title: 'Taux d’absentéisme pour maladie de courte durée, hors accidents du travail et maladies professionnelles, tous établissements',
    description: 'Moyenne glissante sur douze mois, calculée sur les salariés présents au moins un jour dans la période, toutes catégories confondues',
  },
};

/** Grille de 3 cartes au contenu inégal : toutes les cartes d'une rangée ont la même hauteur. */
export const GrilleHauteursEgales: Story = {
  name: 'Grille (hauteurs égales)',
  render: () => ({
    template: `
      <div class="grid w-[720px] grid-cols-3 gap-[var(--bridges-position-gap-md)]">
        <soc-labs-widget-card title="Effectif total">
          ${MENU}
          ${KPI}
        </soc-labs-widget-card>
        <soc-labs-widget-card title="Entrées et sorties du personnel sur les douze derniers mois glissants" description="CDI, CDD et alternance">
          <svg lucideChartColumn socLabsWidgetCardIcon [strokeWidth]="1.5"></svg>
          ${MENU}
          ${CHART}
          <p socLabsWidgetCardFooter class="text-[length:var(--bridges-size-text-text-size-xs)] text-[var(--bridges-color-text-secondary)]">Source : paie</p>
        </soc-labs-widget-card>
        <soc-labs-widget-card title="Âge moyen" description="Tous établissements">
          ${KPI}
        </soc-labs-widget-card>
      </div>
    `,
  }),
};
