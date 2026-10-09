import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input } from '@angular/core';
import {
  LucideChartArea,
  LucideChartBar,
  LucideChartColumn,
  LucideChartColumnStacked,
  LucideChartLine,
  LucideChartPie,
  LucideDonut,
  LucideGauge,
  LucideHash,
} from '@lucide/angular';

/** Identifiants alignés sur le `TypeGraphique` du prototype SIRH (et étendus aux 9 types). */
export type LabsChartType = 'courbe' | 'aire' | 'histogramme' | 'barres-horizontales' | 'barres-empilees' | 'camembert' | 'anneau' | 'jauge' | 'kpi';
export type LabsChartTypeChipSize = 20 | 28;

/** Libellé (nom accessible par défaut) de chaque type. */
export const LABS_CHART_TYPE_LABELS: Record<LabsChartType, string> = {
  courbe: 'Courbe',
  aire: 'Aire',
  histogramme: 'Histogramme',
  'barres-horizontales': 'Barres horizontales',
  'barres-empilees': 'Barres empilées',
  camembert: 'Camembert',
  anneau: 'Anneau',
  jauge: 'Jauge',
  kpi: 'KPI',
};

/**
 * One kit accent per type (`--bridges-color-accent-*-bg` + its text token). Two exceptions, for
 * contrast: amber and lime use the kit's `text-warning` / `text-success` instead of their own accent
 * text token (accent-amber-text / accent-lime-text are under 3:1 on their background). KPI is neutral.
 */
const toneClasses: Record<LabsChartType, string> = {
  courbe: 'bg-[var(--bridges-color-accent-blue-bg)] text-[var(--bridges-color-accent-blue-text)]',
  aire: 'bg-[var(--bridges-color-accent-indigo-bg)] text-[var(--bridges-color-accent-indigo-text)]',
  histogramme: 'bg-[var(--bridges-color-accent-purple-bg)] text-[var(--bridges-color-accent-purple-text)]',
  'barres-horizontales': 'bg-[var(--bridges-color-accent-orange-bg)] text-[var(--bridges-color-accent-orange-text)]',
  'barres-empilees': 'bg-[var(--bridges-color-accent-red-bg)] text-[var(--bridges-color-accent-red-text)]',
  camembert: 'bg-[var(--bridges-color-accent-green-bg)] text-[var(--bridges-color-accent-green-text)]',
  anneau: 'bg-[var(--bridges-color-accent-amber-bg)] text-[var(--bridges-color-text-warning)]',
  jauge: 'bg-[var(--bridges-color-accent-lime-bg)] text-[var(--bridges-color-text-success)]',
  kpi: 'bg-[var(--bridges-color-surface-neutral-default)] text-[var(--bridges-color-text-primary)]',
};

const sizeClasses: Record<LabsChartTypeChipSize, string> = {
  20: 'size-[var(--bridges-size-icon-md)] rounded-[var(--bridges-shape-figure-radius-sm)]',
  28: 'size-[calc(var(--bridges-size-icon-lg)+var(--bridges-position-gap-2xs))] rounded-[var(--bridges-shape-figure-radius-md)]',
};
const iconSizeClasses: Record<LabsChartTypeChipSize, string> = {
  20: 'size-[var(--bridges-size-icon-xs)]',
  28: 'size-[var(--bridges-size-icon-sm)]',
};

/**
 * ## Rôle
 * Pastille identifiant un **type de graphique** (catalogue d'indicateurs, cartes de composition) :
 * icône Lucide sur un fond teinté propre au type, tailles 20 et 28 px.
 *
 * ## Accessibilité
 * `role="img"` nommé par le libellé du type (`label` pour le remplacer). À côté d'un texte qui dit
 * déjà le type, passer `decorative` : la pastille est alors masquée aux technologies d'assistance.
 */
@Component({
  selector: 'soc-labs-chart-type-chip',
  standalone: true,
  imports: [
    LucideChartLine,
    LucideChartArea,
    LucideChartColumn,
    LucideChartBar,
    LucideChartColumnStacked,
    LucideChartPie,
    LucideDonut,
    LucideGauge,
    LucideHash,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClasses()',
    '[attr.role]': 'decorative() ? null : "img"',
    '[attr.aria-label]': 'decorative() ? null : accessibleName()',
    '[attr.aria-hidden]': 'decorative() ? "true" : null',
    '[attr.data-type]': 'type()',
  },
  template: `
    <span [class]="iconClass()">
      @switch (type()) {
        @case ('courbe') { <svg lucideChartLine class="size-full" [strokeWidth]="2"></svg> }
        @case ('aire') { <svg lucideChartArea class="size-full" [strokeWidth]="2"></svg> }
        @case ('histogramme') { <svg lucideChartColumn class="size-full" [strokeWidth]="2"></svg> }
        @case ('barres-horizontales') { <svg lucideChartBar class="size-full" [strokeWidth]="2"></svg> }
        @case ('barres-empilees') { <svg lucideChartColumnStacked class="size-full" [strokeWidth]="2"></svg> }
        @case ('camembert') { <svg lucideChartPie class="size-full" [strokeWidth]="2"></svg> }
        @case ('anneau') { <svg lucideDonut class="size-full" [strokeWidth]="2"></svg> }
        @case ('jauge') { <svg lucideGauge class="size-full" [strokeWidth]="2"></svg> }
        @default { <svg lucideHash class="size-full" [strokeWidth]="2"></svg> }
      }
    </span>
  `,
})
export class SocLabsChartTypeChip {
  readonly type = input.required<LabsChartType>();
  readonly size = input<LabsChartTypeChipSize>(20);
  /** Nom accessible ; défaut : libellé du type (`LABS_CHART_TYPE_LABELS`). */
  readonly label = input<string>();
  readonly decorative = input(false, { transform: booleanAttribute });

  protected readonly accessibleName = computed(() => this.label() ?? LABS_CHART_TYPE_LABELS[this.type()]);
  protected readonly hostClasses = computed(
    () => `inline-flex shrink-0 items-center justify-center ${sizeClasses[this.size()]} ${toneClasses[this.type()]}`,
  );
  protected readonly iconClass = computed(() => `inline-flex ${iconSizeClasses[this.size()]}`);
}
