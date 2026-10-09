import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocButton, SocTag } from '@socium-design/angular-components';
import { labsBanner } from '../stories/labs-story';
import { SocLabsFullscreenOverlay, SocLabsOverlayBadge } from './fullscreen-overlay';

const meta: Meta<SocLabsFullscreenOverlay> = {
  title: 'Labs (expérimental)/Fullscreen Overlay',
  component: SocLabsFullscreenOverlay,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocLabsFullscreenOverlay, SocLabsOverlayBadge, SocButton, SocTag] }), labsBanner],
  args: { open: false, title: 'Tableau de bord RH', subtitle: 'Prévisualisation · Siège — tous les salariés · 6 KPIs', closeLabel: 'Fermer' },
  render: (args) => ({
    props: { ...args, cartes: Array.from({ length: 12 }, (_, i) => i + 1) },
    template: `
      <button socButton (click)="open = true">Prévisualiser</button>
      <soc-labs-fullscreen-overlay [(open)]="open" [title]="title" [subtitle]="subtitle" [closeLabel]="closeLabel">
        <soc-tag socLabsOverlayBadge color="information">Données simulées</soc-tag>
        <div class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[var(--bridges-position-gap-lg)]">
          @for (c of cartes; track c) {
            <div class="flex h-40 flex-col gap-2 rounded-[var(--bridges-shape-figure-radius-lg)] border border-[var(--bridges-color-border-subtle)] bg-[var(--bridges-color-surface-neutral-white)] p-[var(--bridges-position-padding-lg)] text-sm text-[var(--bridges-color-text-primary)]">
              KPI {{ c }}
              <button socButton variant="tertiary" class="self-start">Détail</button>
            </div>
          }
        </div>
      </soc-labs-fullscreen-overlay>
    `,
  }),
};
export default meta;
type Story = StoryObj<SocLabsFullscreenOverlay>;

/** Bouton « Prévisualiser » → calque ; Échap, Fermer, Tab qui boucle, focus rendu au bouton. */
export const Default: Story = {};

/** Ouvert d'emblée (pour la revue visuelle). */
export const Open: Story = { args: { open: true } };

export const WithoutSubtitleNorBadge: Story = {
  args: { open: true, subtitle: undefined },
  render: (args) => ({
    props: args,
    template: `
      <soc-labs-fullscreen-overlay [(open)]="open" [title]="title" [subtitle]="subtitle">
        <p class="text-sm text-[var(--bridges-color-text-primary)]">Contenu libre.</p>
      </soc-labs-fullscreen-overlay>
      <button socButton (click)="open = true">Rouvrir</button>
    `,
  }),
};
