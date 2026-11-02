import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { labsBanner } from '../stories/labs-story';
import { SocLabsPopulationPicker, type LabsPopulationMode, type LabsPopulationPerson } from './population-picker';

const MODES: LabsPopulationMode[] = [
  {
    id: 'personne',
    label: 'Personne nommée',
    fieldLabel: 'Employés',
    placeholder: 'Sélectionner des employés',
    options: [
      { value: 'e1', label: 'Awa Diop' },
      { value: 'e2', label: 'Moussa Ndiaye' },
    ],
  },
  { id: 'structure', label: 'Structure', fieldLabel: 'Structures', hint: 'Les sous-structures sont incluses.', options: [{ value: 'dsi', label: "Direction des systèmes d'information" }] },
  { id: 'poste', label: 'Poste', fieldLabel: 'Postes', options: [{ value: 'dev', label: 'Développeur Angular' }] },
];

const PEOPLE: LabsPopulationPerson[] = [
  { id: 'e1', initials: 'AD', name: 'Awa Diop', subtitle: "Direction des systèmes d'information" },
  { id: 'e2', initials: 'MN', name: 'Moussa Ndiaye', subtitle: 'Direction des ressources humaines' },
];

const meta: Meta<SocLabsPopulationPicker> = {
  title: 'Labs (expérimental)/Population Picker',
  component: SocLabsPopulationPicker,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocLabsPopulationPicker] }), labsBanner],
  args: {
    label: 'Population concernée',
    required: true,
    modes: MODES,
    mode: 'personne',
    value: ['e1', 'e2'],
    people: PEOPLE,
    warning: 'Cette liste affiche tous les employés de votre scope ainsi que ceux rattachés à votre ligne hiérarchique (N-1, N-2…).',
    emptyText: 'Aucun employé ne correspond à cette sélection.',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="max-w-[595px]">
        <soc-labs-population-picker [label]="label" [required]="required" [modes]="modes" [(mode)]="mode" [(value)]="value" [people]="people" [warning]="warning" [emptyText]="emptyText" />
      </div>
    `,
  }),
};
export default meta;
type Story = StoryObj<SocLabsPopulationPicker>;

export const PersonneNommee: Story = {};

export const AucuneSelection: Story = { args: { value: [], people: [] } };

/** Un poste vacant : la sélection ne donne personne. */
export const AucunEmploye: Story = { args: { mode: 'poste', value: ['dev'], people: [] } };
