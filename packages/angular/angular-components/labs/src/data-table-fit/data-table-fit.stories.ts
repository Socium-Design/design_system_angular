import { Component, TemplateRef, computed, input, viewChild } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideEye, LucideLayoutGrid } from '@lucide/angular';
import { SocButton, SocButtonLeftIcon, SocDataTable, SocTag, type DataTableCellContext } from '@socium-design/angular-components';
import { labsBanner } from '../stories/labs-story';
import { SocLabsDataTableFit, type LabsDataTableColumn } from './data-table-fit';

interface Tableau {
  id: string;
  libelle: string;
  modele: string;
  produit: string;
  population: string;
  statut: 'Actif' | 'Brouillon';
  creation: string;
}

const ROWS: Tableau[] = [
  { id: '1', libelle: 'Direction générale — vue consolidée', modele: 'Effectifs et mouvements', produit: 'Workspace, Perf', population: 'Tous les collaborateurs du groupe et de ses filiales', statut: 'Actif', creation: '21/10/2026' },
  { id: '2', libelle: 'Mon équipe', modele: 'Tableau vierge', produit: 'Workspace', population: 'Équipe directe du manager', statut: 'Brouillon', creation: '02/09/2026' },
  { id: '3', libelle: 'Campagne d’entretiens annuels 2026', modele: 'Suivi de campagne', produit: 'Perf', population: 'Cadres et agents de maîtrise, hors période d’essai', statut: 'Actif', creation: '15/06/2026' },
];

/** Liste « Gestion des tableaux de bord » du prototype SIRH : 6 colonnes + 2 boutons par ligne. */
@Component({
  selector: 'story-labs-data-table-fit',
  standalone: true,
  imports: [SocDataTable, SocLabsDataTableFit, SocTag, SocButton, SocButtonLeftIcon, LucideEye, LucideLayoutGrid],
  template: `
    <ng-template #statut let-row><soc-tag [color]="row.statut === 'Actif' ? 'success' : 'information'">{{ row.statut }}</soc-tag></ng-template>
    <ng-template #actions>
      <span class="inline-flex gap-[var(--bridges-position-gap-sm)]">
        <button socButton variant="secondary"><svg lucideEye socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>Détail</button>
        <button socButton variant="secondary"><svg lucideLayoutGrid socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>Visualiser</button>
      </span>
    </ng-template>
    <div [style.width]="containerWidth()" class="flex flex-col gap-[var(--bridges-position-gap-sm)] border border-dashed border-[var(--bridges-color-border-secondary)]">
      @if (fit()) {
        <soc-data-table socLabsFitWidth title="Tableaux de bord" [columns]="columns()" [rows]="rows" [rowKey]="rowKey" [selectable]="selectable()" />
      } @else {
        <soc-data-table title="Tableaux de bord (sans socLabsFitWidth)" [columns]="columns()" [rows]="rows" [rowKey]="rowKey" [selectable]="selectable()" />
      }
    </div>
  `,
})
class FitDemo {
  readonly fit = input(true);
  readonly containerWidth = input('1084px');
  readonly selectable = input(false);
  readonly withColumnSettings = input(true);
  rows = ROWS;
  rowKey = (row: Tableau) => row.id;
  private readonly statut = viewChild.required<TemplateRef<DataTableCellContext<Tableau>>>('statut');
  private readonly actions = viewChild.required<TemplateRef<DataTableCellContext<Tableau>>>('actions');
  columns = computed<LabsDataTableColumn<Tableau>[]>(() => {
    const settings = this.withColumnSettings();
    return [
      { key: 'libelle', header: 'Libellé', render: (row) => row.libelle, minWidth: settings ? '10rem' : undefined },
      { key: 'modele', header: 'Modèle de base', render: (row) => row.modele },
      { key: 'produit', header: 'Produit', render: (row) => row.produit },
      { key: 'population', header: 'Population adressée', render: (row) => row.population },
      { key: 'statut', header: 'Statut', render: this.statut(), wrap: settings ? false : undefined },
      { key: 'creation', header: 'Date de création', render: (row) => row.creation, wrap: settings ? false : undefined },
      { key: 'actions', header: '', render: this.actions(), wrap: settings ? false : undefined },
    ];
  });
}

type Args = { fit: boolean; containerWidth: string; selectable: boolean; withColumnSettings: boolean };

const meta: Meta<Args> = {
  title: 'Labs (expérimental)/Data Table Fit',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [FitDemo] }), labsBanner],
  args: { fit: true, containerWidth: '1084px', selectable: false, withColumnSettings: true },
  argTypes: { containerWidth: { control: 'select', options: ['600px', '900px', '1084px', '100%'] } },
  render: (args) => ({
    props: args,
    template: `<story-labs-data-table-fit [fit]="fit" [containerWidth]="containerWidth" [selectable]="selectable" [withColumnSettings]="withColumnSettings" />`,
  }),
};
export default meta;
type Story = StoryObj<Args>;

/** Colonnes longues dans le conteneur de la page du prototype à 1440 px (1084 px) : tout tient, le texte passe à la ligne, les boutons restent visibles. */
export const Default: Story = {};

/** Le même tableau sans l'attribut : comportement actuel du kit (table de 1243 px dans le prototype), les boutons sortent du cadre. */
export const WithoutFit: Story = { args: { fit: false } };

/** 900 px : la somme des `minWidth` et des colonnes `wrap: false` ne tient plus, la table défile horizontalement (repli du kit). */
export const Narrow: Story = { args: { containerWidth: '900px' } };

/** Sans réglage de colonne, à 900 px : passage à la ligne seul, les colonnes se partagent la place librement (sans largeur minimale, le libellé peut devenir étroit). */
export const WrapOnly: Story = { args: { withColumnSettings: false, containerWidth: '900px' } };

/** Avec la colonne de cases à cocher : les réglages suivent leur colonne. */
export const Selectable: Story = { args: { selectable: true } };
