import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { labsBanner } from '../stories/labs-story';
import { SocLabsCompactField } from './compact-field';

const POPULATIONS = [
  { value: 'siege', label: 'Siège — tous les salariés' },
  { value: 'managers', label: 'Managers' },
  { value: 'cdd', label: 'Contrats courts' },
];

const meta: Meta<SocLabsCompactField> = {
  title: 'Labs (expérimental)/Compact Field',
  component: SocLabsCompactField,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocLabsCompactField] }), labsBanner],
  argTypes: { mode: { control: 'inline-radio', options: ['read', 'edit'] }, control: { control: 'select', options: ['text', 'textarea', 'select'] } },
  args: { label: 'Libellé', mode: 'edit', control: 'text', value: 'Tableau de bord RH', placeholder: 'Saisir…', emptyText: '—', separator: true, disabled: false, options: POPULATIONS },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[220px] bg-[var(--bridges-color-surface-neutral-white)] p-[var(--bridges-position-padding-md)]">
        <soc-labs-compact-field [label]="label" [mode]="mode" [control]="control" [(value)]="value" [options]="options" [placeholder]="placeholder" [emptyText]="emptyText" [separator]="separator" [disabled]="disabled" />
      </div>
    `,
  }),
};
export default meta;
type Story = StoryObj<SocLabsCompactField>;

export const Text: Story = {};
export const Textarea: Story = { args: { label: 'Description', control: 'textarea', value: 'Suivi mensuel des effectifs\net des absences.' } };
export const Select: Story = { args: { label: 'Population', control: 'select', value: 'managers' } };
export const Read: Story = { args: { mode: 'read' } };
export const Disabled: Story = { args: { disabled: true } };

/** Le panneau « Informations » de 220 px, en lecture puis en édition, avec valeurs vides. */
export const SidePanel: Story = {
  render: () => ({
    props: { populations: POPULATIONS, statuts: [{ value: 'actif', label: 'Actif' }, { value: 'inactif', label: 'Inactif' }], d: { libelle: 'Tableau de bord RH', description: 'Suivi mensuel des effectifs et des absences, par établissement.', population: 'siege', statut: 'actif' } },
    template: `
      <div class="flex gap-6">
        @for (mode of ['read', 'edit']; track mode) {
          <div class="flex w-[220px] flex-col gap-[var(--bridges-position-gap-md)] border border-[var(--bridges-color-border-subtle)] bg-[var(--bridges-color-surface-neutral-white)] p-[var(--bridges-position-padding-md)]">
            <soc-labs-compact-field label="Libellé" [mode]="$any(mode)" [(value)]="d.libelle" />
            <soc-labs-compact-field label="Description" [mode]="$any(mode)" control="textarea" [(value)]="d.description" />
            <soc-labs-compact-field label="Population" [mode]="$any(mode)" control="select" [options]="populations" [(value)]="d.population" />
            <soc-labs-compact-field label="Statut" [mode]="$any(mode)" control="select" [options]="statuts" [(value)]="d.statut" />
            <soc-labs-compact-field label="Commentaire" [mode]="$any(mode)" value="" placeholder="Aucun" [separator]="false" />
          </div>
        }
      </div>
    `,
  }),
};
