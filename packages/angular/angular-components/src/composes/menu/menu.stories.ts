import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideCopy, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { SocButton } from '../../primitifs/button/button';
import { SocPopover, SocPopoverTrigger } from '../../primitifs/popover/popover';
import { SocMenu, SocMenuItem, SocMenuItemIcon } from './menu';

const meta: Meta = {
  title: 'Components/Container/Menu',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [SocMenu, SocMenuItem, SocMenuItemIcon, SocPopover, SocPopoverTrigger, SocButton, LucidePencil, LucideCopy, LucideTrash2],
    }),
  ],
};
export default meta;
type Story = StoryObj;

export const IconItems: Story = {
  render: () => ({
    template: `
      <div class="p-16">
        <soc-popover>
          <button socButton socPopoverTrigger>Actions</button>
          <soc-menu>
            <button socMenuItem label="Modifier"><svg lucidePencil socMenuItemIcon class="size-full" [strokeWidth]="1.5"></svg></button>
            <button socMenuItem label="Dupliquer"><svg lucideCopy socMenuItemIcon class="size-full" [strokeWidth]="1.5"></svg></button>
            <button socMenuItem label="Supprimer"><svg lucideTrash2 socMenuItemIcon class="size-full" [strokeWidth]="1.5"></svg></button>
          </soc-menu>
        </soc-popover>
      </div>
    `,
  }),
};

export const CheckboxItems: Story = {
  render: () => ({
    props: {
      checked: { actives: true, archivees: false, brouillons: false } as Record<string, boolean>,
      items: [
        { key: 'actives', label: 'Actives' },
        { key: 'archivees', label: 'Archivées' },
        { key: 'brouillons', label: 'Brouillons' },
      ],
      toggle(this: { checked: Record<string, boolean> }, key: string) {
        this.checked = { ...this.checked, [key]: !this.checked[key] };
      },
    },
    template: `
      <div class="p-16">
        <soc-popover>
          <button socButton socPopoverTrigger>Filtres</button>
          <soc-menu>
            @for (item of items; track item.key) {
              <button socMenuItem [label]="item.label" mode="checkbox" [checked]="checked[item.key]" (click)="toggle(item.key)"></button>
            }
          </soc-menu>
        </soc-popover>
      </div>
    `,
  }),
};

export const RadioItems: Story = {
  render: () => ({
    props: {
      selected: 'mois',
      options: [
        { key: 'jour', label: 'Par jour' },
        { key: 'mois', label: 'Par mois' },
        { key: 'annee', label: 'Par année' },
      ],
      select(this: { selected: string }, key: string) {
        this.selected = key;
      },
    },
    template: `
      <div class="p-16">
        <soc-popover>
          <button socButton socPopoverTrigger>Période</button>
          <soc-menu>
            @for (option of options; track option.key) {
              <button socMenuItem [label]="option.label" mode="radio" [checked]="selected === option.key" (click)="select(option.key)"></button>
            }
          </soc-menu>
        </soc-popover>
      </div>
    `,
  }),
};

export const NestedLevels: Story = {
  render: () => ({
    template: `
      <div class="w-[220px] rounded-[var(--index-conteneur-menu-popover-radius)] bg-[var(--index-conteneur-menu-popover-bg)] py-[var(--index-conteneur-menu-popover-pad)] drop-shadow-md">
        <soc-menu>
          <button socMenuItem label="Paramètres" [level]="1"></button>
          <button socMenuItem label="Général" [level]="2"></button>
          <button socMenuItem label="Sécurité" [level]="2"></button>
          <button socMenuItem label="Authentification à deux facteurs" [level]="3"></button>
        </soc-menu>
      </div>
    `,
  }),
};
