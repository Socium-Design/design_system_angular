import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { labsBanner } from '../stories/labs-story';
import { SocLabsTimeline } from './timeline';

const meta: Meta<SocLabsTimeline> = {
  title: 'Labs (expérimental)/Timeline',
  component: SocLabsTimeline,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocLabsTimeline] }), labsBanner],
  args: {
    legend: [
      { tone: 'success', label: 'Modification', description: 'changement des informations' },
      { tone: 'information', label: 'Mise à jour', description: 'changement de la progression' },
    ],
    events: [
      { id: 'e1', label: 'Ajout soumis', tone: 'warning', date: '16/10/2026 · 10:37', author: 'Mayna Sow', role: 'Admin RH', reason: 'test' },
      {
        id: 'e2',
        label: 'Ajout validé',
        tone: 'success',
        date: '16/10/2026 · 10:38',
        author: 'Mayna Sow',
        role: 'Admin RH',
        details: [
          { label: 'Objectif créé', value: 'Test bouton' },
          { label: 'Personne assignée', value: 'Thierno Adam' },
        ],
      },
    ],
  },
};
export default meta;
type Story = StoryObj<SocLabsTimeline>;

/** Section « Historiques » du détail d'un objectif (Perfs). */
export const Default: Story = {};

export const Empty: Story = { args: { events: [], legend: [], emptyText: 'Aucun historique.' } };
