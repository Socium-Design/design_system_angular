import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocButton } from '../../primitifs/button/button';
import { SocDialog } from './dialog';

const meta: Meta = {
  title: 'Components/Container/Dialog',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocDialog, SocButton] })],
};
export default meta;
type Story = StoryObj;

/** This is the required pattern for any destructive/confirming action (see "Contraintes de
 * composition" in `SocDialog`'s doc) — a real `soc-dialog` with `[open]="true"`, never an inline
 * `window.confirm` or a silent state change. */
export const Default: Story = {
  render: () => {
    const state = { open: false };
    return {
      props: {
        state,
        secondary: { label: 'Annuler', onClick: () => (state.open = false) },
        primary: { label: 'Confirmer', onClick: () => (state.open = false) },
      },
      template: `
        <button socButton (click)="state.open = true">Ouvrir le dialogue</button>
        <soc-dialog [open]="state.open" (close)="state.open = false" title="Confirmer la suppression" [secondaryAction]="secondary" [primaryAction]="primary">
          <p class="text-sm text-[var(--bridges-color-text-primary)]">Cette action est irréversible. Voulez-vous vraiment continuer ?</p>
        </soc-dialog>
      `,
    };
  },
};

export const WithoutFooter: Story = {
  render: () => ({
    props: { state: { open: false } },
    template: `
      <button socButton (click)="state.open = true">Ouvrir</button>
      <soc-dialog [open]="state.open" (close)="state.open = false" title="Informations">
        <p class="text-sm text-[var(--bridges-color-text-primary)]">Contenu libre, sans pied de page.</p>
      </soc-dialog>
    `,
  }),
};
