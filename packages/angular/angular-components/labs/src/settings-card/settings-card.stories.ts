import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import {
  SocInputNumber,
  SocSelect,
  SocSelectableChips,
  SocSwitch,
} from '@socium-design/angular-components';
import { labsBanner } from '../stories/labs-story';
import {
  SocLabsSettingsCard,
  SocLabsSettingsCardAction,
  SocLabsSettingsCardFootnote,
} from './settings-card';

const DECIMALES = [
  { value: '0', label: '0 décimale (ex : 4/5)' },
  { value: '1', label: '1 décimale (ex : 3,7/5)' },
  { value: '2', label: '2 décimales (ex : 3,67/5)' },
];

/** Carte de barème (Perfs > Configurations > Notes d'évaluation) : la cible du composant. */
@Component({
  selector: 'story-labs-settings-card-bareme',
  standalone: true,
  imports: [
    SocLabsSettingsCard,
    SocLabsSettingsCardAction,
    SocLabsSettingsCardFootnote,
    SocSwitch,
    SocSelectableChips,
    SocInputNumber,
    SocSelect,
  ],
  template: `
    <soc-labs-settings-card
      overline="BARÈME"
      [title]="title"
      [disabled]="activable && !actif()"
      disabledNote="Barème désactivé : objectifs affichés sur 100"
      class="max-w-[720px]"
    >
      <soc-switch
        socLabsSettingsCardAction
        [label]="activable ? 'Activer le barème' : 'Visible sur l’évaluation'"
        [checked]="actif()"
        (checkedChange)="actif.set($event)"
      />
      <div class="flex flex-wrap gap-[var(--bridges-position-gap-sm)]">
        @for (n of choix; track n) {
          <soc-selectable-chips
            [label]="'' + n"
            [selected]="denominateur() === n"
            (click)="denominateur.set(n)"
          />
        }
      </div>
      <div class="grid grid-cols-2 gap-[var(--bridges-position-gap-lg)]">
        <soc-input-number
          label="Dénominateur de la note"
          required
          [min]="1"
          [max]="1000"
          [value]="denominateur()"
          (valueChange)="denominateur.set($event ?? 0)"
          helperText="Entier entre 1 et 1000."
        />
        <soc-select
          label="Décimales affichées"
          [options]="decimales"
          value="2"
        />
      </div>
      <p socLabsSettingsCardFootnote>
        <strong>Règle de calcul</strong> — Note de chaque objectif ramenée en
        pourcentage.
      </p>
    </soc-labs-settings-card>
  `,
})
class BaremeDemo {
  title = 'Note objectif';
  activable = true;
  actif = signal(true);
  denominateur = signal(20);
  choix = [5, 10, 20, 50, 100];
  decimales = DECIMALES;
}

const meta: Meta<SocLabsSettingsCard> = {
  title: 'Labs (expérimental)/Settings Card',
  component: SocLabsSettingsCard,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        SocLabsSettingsCard,
        SocLabsSettingsCardAction,
        SocLabsSettingsCardFootnote,
        SocSwitch,
        BaremeDemo,
      ],
    }),
    labsBanner,
  ],
  args: {
    title: 'Note finale',
    overline: 'BARÈME',
    disabled: false,
    disabledNote: 'Barème désactivé : objectifs affichés sur 100',
  },
  render: (args) => ({
    props: args,
    template: `
      <soc-labs-settings-card [title]="title" [overline]="overline" [disabled]="disabled" [disabledNote]="disabledNote" class="max-w-[720px]">
        <soc-switch socLabsSettingsCardAction label="Activer le barème" [checked]="!disabled" />
        <p class="text-sm text-[var(--bridges-color-text-primary)]">Contenu de la carte (champs du kit).</p>
        <p socLabsSettingsCardFootnote><strong>Règle de calcul</strong> — Moyenne pondérée des blocs notés.</p>
      </soc-labs-settings-card>
    `,
  }),
};
export default meta;
type Story = StoryObj<SocLabsSettingsCard>;

export const Default: Story = {};

/** Désactivée : corps et règle grisés et inertes, mention sous l'en-tête, interrupteur toujours actif. */
export const Disabled: Story = { args: { disabled: true } };

/** Sans sur-titre ni règle de calcul. */
export const Minimal: Story = {
  render: () => ({
    template: `
      <soc-labs-settings-card title="Réglage simple" class="max-w-[720px]">
        <p class="text-sm text-[var(--bridges-color-text-primary)]">Contenu.</p>
      </soc-labs-settings-card>
    `,
  }),
};

/** Carte de barème complète (choix rapide, dénominateur, décimales) : basculer « Activer le barème » grise et rend inerte le contenu. */
export const Bareme: Story = {
  render: () => ({ template: `<story-labs-settings-card-bareme />` }),
};

const COLLAPSIBLE = (attrs: string) => `
  <soc-labs-settings-card title="Note finale" overline="BARÈME" collapsible ${attrs} class="max-w-[720px]">
    <soc-switch socLabsSettingsCardAction label="Visible sur l’évaluation" [checked]="true" />
    <p class="text-sm text-[var(--bridges-color-text-primary)]">Contenu de la carte (champs du kit).</p>
    <p socLabsSettingsCardFootnote><strong>Règle de calcul</strong> — Moyenne pondérée des blocs notés.</p>
  </soc-labs-settings-card>
`;

/** Repliable, ouverte : chevron vers le haut, clic sur l'en-tête (hors interrupteur) pour fermer. */
export const CollapsibleOpen: Story = {
  render: () => ({
    template: COLLAPSIBLE(
      `[expanded]="true" summary="/20 · 2 décimales · appliqué aux nouvelles évaluations uniquement"`,
    ),
  }),
};

/** Repliable, fermée : résumé sous le titre ; l'interrupteur reste utilisable sans ouvrir la carte. */
export const CollapsibleClosed: Story = {
  render: () => ({
    template: COLLAPSIBLE(
      `[expanded]="false" summary="/20 · 2 décimales · appliqué aux nouvelles évaluations uniquement"`,
    ),
  }),
};

/** Repliable et désactivée : fermée, le résumé dit pourquoi ; ouverte, contenu grisé et inerte. */
export const CollapsibleDisabled: Story = {
  render: () => ({
    template: `
      <div class="flex max-w-[720px] flex-col gap-4">
        <soc-labs-settings-card title="Note objectif" overline="BARÈME" collapsible [expanded]="false" disabled summary="Barème désactivé : affichage sur 100" disabledNote="Barème désactivé : objectifs affichés sur 100">
          <soc-switch socLabsSettingsCardAction label="Activer le barème" [checked]="false" />
          <p class="text-sm">Contenu.</p>
        </soc-labs-settings-card>
        <soc-labs-settings-card title="Note objectif" overline="BARÈME" collapsible [expanded]="true" disabled summary="Barème désactivé : affichage sur 100" disabledNote="Barème désactivé : objectifs affichés sur 100">
          <soc-switch socLabsSettingsCardAction label="Activer le barème" [checked]="false" />
          <p class="text-sm">Contenu.</p>
        </soc-labs-settings-card>
      </div>
    `,
  }),
};

/** Badges « Modifié » (information) et « Erreur » (error, carte verrouillée ouverte : chevron inactif). */
export const WithBadge: Story = {
  render: () => ({
    template: `
      <div class="flex max-w-[720px] flex-col gap-4">
        ${COLLAPSIBLE(`[expanded]="false" summary="/10 · 2 décimales · appliqué aux évaluations finalisées" badge="Modifié"`)}
        ${COLLAPSIBLE(`[expanded]="true" lockExpanded badge="Erreur" badgeTone="error"`)}
      </div>
    `,
  }),
};

/** Accordéon : plusieurs cartes repliables, plusieurs ouvertes à la fois (état géré par le parent). */
export const Accordion: Story = {
  render: () => {
    const ouvertes = signal<Record<string, boolean>>({});
    const basculer = (note: string, ouverte: boolean) =>
      ouvertes.update((o) => ({ ...o, [note]: ouverte }));
    return {
      props: {
        ouvertes,
        basculer,
        notes: ['Note finale', 'Note Potentiel', 'Note Performance'],
      },
      template: `
      <div class="flex max-w-[720px] flex-col gap-4">
        @for (note of notes; track note) {
          <soc-labs-settings-card [title]="note" overline="BARÈME" collapsible summary="/20 · 2 décimales · appliqué aux nouvelles évaluations uniquement"
            [expanded]="!!ouvertes()[note]" (expandedChange)="basculer(note, $event)">
            <soc-switch socLabsSettingsCardAction label="Visible sur l’évaluation" [checked]="true" />
            <p class="text-sm text-[var(--bridges-color-text-primary)]">Contenu de « {{ note }} ».</p>
          </soc-labs-settings-card>
        }
      </div>
    `,
    };
  },
};
