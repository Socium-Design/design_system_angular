import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { labsBanner } from '../stories/labs-story';
import { SocLabsInlineEdit } from './inline-edit';

const meta: Meta<SocLabsInlineEdit> = {
  title: 'Labs (expérimental)/Inline Edit',
  component: SocLabsInlineEdit,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocLabsInlineEdit] }), labsBanner],
  args: { value: 'Effectifs', defaultValue: 'Section 1', ariaLabel: 'le nom de la section', placeholder: 'Sans titre', disabled: false },
  render: (args) => ({
    props: args,
    template: `
      <p class="text-[length:var(--bridges-size-text-text-size-lg)] [font-weight:var(--bridges-shape-text-label-weight)] text-[var(--bridges-color-text-primary)]">
        <soc-labs-inline-edit [(value)]="value" [defaultValue]="defaultValue" [ariaLabel]="ariaLabel" [placeholder]="placeholder" [disabled]="disabled" />
      </p>
      <p class="mt-2 text-xs text-[var(--bridges-color-text-secondary)]">Valeur : « {{ value }} » — clic pour modifier, Entrée/perte du focus valide, Échap annule, vide → « {{ defaultValue }} ».</p>
    `,
  }),
};
export default meta;
type Story = StoryObj<SocLabsInlineEdit>;

export const Default: Story = {};

export const EmptyFallsBackToDefault: Story = { args: { value: '' } };

export const Disabled: Story = { args: { disabled: true } };

/** Hérite de la typographie du parent : titre de page, titre de section, texte courant. */
export const Typography: Story = {
  render: () => ({
    props: { a: 'Tableau de bord RH', b: 'Effectifs', c: 'Note libre' },
    template: `
      <div class="flex flex-col gap-3 text-[var(--bridges-color-text-primary)]">
        <h2 class="text-[length:var(--bridges-size-text-text-size-2xl)] [font-family:var(--bridges-shape-text-label-font)]"><soc-labs-inline-edit [(value)]="a" ariaLabel="le nom du tableau" /></h2>
        <h3 class="text-[length:var(--bridges-size-text-text-size-md)] [font-weight:var(--bridges-shape-text-label-weight)]"><soc-labs-inline-edit [(value)]="b" defaultValue="Section 1" ariaLabel="le nom de la section" /></h3>
        <p class="text-[length:var(--bridges-size-text-text-size-sm)]"><soc-labs-inline-edit [(value)]="c" ariaLabel="la note" /></p>
        <p class="text-[length:var(--bridges-size-text-text-size-sm)]"><soc-labs-inline-edit value="" ariaLabel="la note" placeholder="Ajouter une note" /></p>
      </div>
    `,
  }),
};
