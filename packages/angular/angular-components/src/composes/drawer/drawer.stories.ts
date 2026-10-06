import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocButton } from '../../primitifs/button/button';
import { SocDrawer, SocDrawerDetailItem } from './drawer';

const meta: Meta = {
  title: 'Components/Container/Drawer',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocDrawer, SocDrawerDetailItem, SocButton] })],
};
export default meta;
type Story = StoryObj;

export const Creation: Story = {
  render: () => {
    const state = { open: false };
    return {
      props: {
        state,
        secondary: { label: 'Annuler', onClick: () => (state.open = false) },
        primary: { label: 'Confirmer', onClick: () => (state.open = false) },
      },
      template: `
        <button socButton (click)="state.open = true">Nouvel employé</button>
        <soc-drawer
          [open]="state.open"
          (close)="state.open = false"
          title="Ajouter un employé"
          subtitle="Renseignez les informations ci-dessous"
          sectionTitle="Informations générales"
          sectionSubtitle="Nom, prénom et poste"
          [secondaryAction]="secondary"
          [primaryAction]="primary"
        >
          <div class="flex h-40 w-full items-center justify-center rounded border border-dashed border-gray-300 text-sm text-gray-400">Formulaire</div>
        </soc-drawer>
      `,
    };
  },
};

export const Detail: Story = {
  render: () => {
    const state = { open: false };
    return {
      props: { state, secondary: { label: 'Fermer la fenêtre', onClick: () => (state.open = false) } },
      template: `
        <button socButton (click)="state.open = true">Voir le détail</button>
        <soc-drawer [open]="state.open" (close)="state.open = false" topline="Employé" title="Awa Diop" subtitle="Chargée de recrutement" [secondaryAction]="secondary">
          <soc-drawer-detail-item label="Email" value="awa.diop@socium.link" />
          <soc-drawer-detail-item label="Département" value="RH" />
          <soc-drawer-detail-item label="Date d'entrée" value="12 mars 2023" />
        </soc-drawer>
      `,
    };
  },
};

export const AnchorLeft: Story = {
  render: () => ({
    props: { state: { open: false } },
    template: `
      <button socButton (click)="state.open = true">Ouvrir à gauche</button>
      <soc-drawer [open]="state.open" (close)="state.open = false" title="Menu" anchor="left">
        <p class="text-sm text-[var(--bridges-color-text-primary)]">Contenu ancré à gauche.</p>
      </soc-drawer>
    `,
  }),
};
