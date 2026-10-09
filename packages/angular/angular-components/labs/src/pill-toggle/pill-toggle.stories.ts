import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { labsBanner } from '../stories/labs-story';
import { SocLabsPillToggle, type LabsPillOption } from './pill-toggle';

const STATUTS: LabsPillOption[] = [
  { value: 'actif', label: 'Actif', color: 'green' },
  { value: 'inactif', label: 'Inactif', color: 'gray' },
  { value: 'archive', label: 'Archivé', color: 'amber' },
];
const OPERATEURS: LabsPillOption[] = [
  { value: 'ET', label: 'ET' },
  { value: 'OU', label: 'OU' },
];

const meta: Meta<SocLabsPillToggle> = {
  title: 'Labs (expérimental)/Pill Toggle',
  component: SocLabsPillToggle,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocLabsPillToggle] }), labsBanner],
  argTypes: { size: { control: 'select', options: ['sm', 'md'] } },
  args: { options: STATUTS, value: 'actif', size: 'md', ariaLabel: 'Statut', disabled: false },
  render: (args) => ({
    props: args,
    template: `<soc-labs-pill-toggle [options]="options" [(value)]="value" [size]="size" [ariaLabel]="ariaLabel" [disabled]="disabled" />`,
  }),
};
export default meta;
type Story = StoryObj<SocLabsPillToggle>;

export const Statut: Story = {};

export const EtOu: Story = { args: { options: OPERATEURS, value: 'ET', ariaLabel: 'Opérateur', size: 'sm' } };

export const Disabled: Story = { args: { disabled: true } };

/** Tailles sm / md, chaque option sélectionnée, sans sélection, option désactivée, groupe désactivé. */
export const AllStates: Story = {
  render: () => ({
    props: {
      statuts: STATUTS,
      operateurs: OPERATEURS,
      couleurs: (['blue', 'green', 'gray', 'amber', 'red', 'indigo', 'purple', 'orange'] as const).map((c) => ({ value: c, label: c, color: c })),
      avecDesactivee: [STATUTS[0], { ...STATUTS[1], disabled: true }, STATUTS[2]],
    },
    template: `
      <div class="flex flex-col gap-4 text-sm text-[var(--bridges-color-text-secondary)]">
        @for (size of ['sm', 'md']; track size) {
          <div class="flex items-center gap-4">
            <span class="w-32">{{ size }}</span>
            <soc-labs-pill-toggle ariaLabel="Statut" [options]="statuts" value="actif" [size]="$any(size)" />
            <soc-labs-pill-toggle ariaLabel="Statut" [options]="statuts" value="inactif" [size]="$any(size)" />
            <soc-labs-pill-toggle ariaLabel="Statut" [options]="statuts" value="archive" [size]="$any(size)" />
            <soc-labs-pill-toggle ariaLabel="Opérateur" [options]="operateurs" value="OU" [size]="$any(size)" />
          </div>
        }
        <div class="flex items-center gap-4"><span class="w-32">sans sélection</span><soc-labs-pill-toggle ariaLabel="Statut" [options]="statuts" /></div>
        <div class="flex items-center gap-4"><span class="w-32">option désactivée</span><soc-labs-pill-toggle ariaLabel="Statut" [options]="avecDesactivee" value="actif" /></div>
        <div class="flex items-center gap-4"><span class="w-32">désactivé</span><soc-labs-pill-toggle ariaLabel="Statut" [options]="statuts" value="actif" disabled /></div>
        <div class="flex flex-wrap items-center gap-2"><span class="w-32">couleurs</span>
          @for (c of couleurs; track c.value) {
            <soc-labs-pill-toggle size="sm" [ariaLabel]="c.label" [options]="[c]" [value]="c.value" />
          }
        </div>
      </div>
    `,
  }),
};
