import type { Meta, StoryObj } from '@storybook/angular';
import { ICON_COLORS, ICON_SIZES, SocIconGallery } from './icon-gallery';

const meta: Meta<SocIconGallery> = {
  title: 'Fondations/Icônes',
  component: SocIconGallery,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Icônes Lucide (`@lucide/angular`) : celles que les composants du kit importent réellement (liste générée depuis le code par `scripts/generate-icons.mjs`) et la bibliothèque complète du paquet installé, chargée seulement à l'ouverture de son onglet. Un clic copie le code à coller dans un composant Angular.",
      },
    },
  },
  argTypes: {
    tab: { name: 'Onglet', control: 'inline-radio', options: ['kit', 'library'] },
    query: { name: 'Recherche', control: 'text' },
    size: { name: 'Taille (px)', control: 'inline-radio', options: ICON_SIZES },
    color: {
      name: 'Couleur',
      control: { type: 'inline-radio', labels: Object.fromEntries(ICON_COLORS.map((c) => [c.id, c.label])) },
      options: ICON_COLORS.map((c) => c.id),
    },
  },
  args: { tab: 'kit', query: '', size: 20, color: 'primary' },
  render: (args) => ({
    props: args,
    template: `<story-icon-gallery [tab]="tab" [query]="query" [size]="size" [color]="color" />`,
  }),
};
export default meta;

type Story = StoryObj<SocIconGallery>;

export const Icones: Story = { name: 'Icônes' };
