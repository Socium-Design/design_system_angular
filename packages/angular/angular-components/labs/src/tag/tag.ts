import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import type { TagColor, TagSize } from '@socium-design/angular-components';

/** Couleurs de `soc-tag` du kit, plus `neutral` (#68). */
export type LabsTagColor = TagColor | 'neutral';

const colorClasses: Record<LabsTagColor, string> = {
  success: 'bg-[var(--index-feedback-tag-bg-success)] text-[var(--index-feedback-tag-text-success)]',
  warning: 'bg-[var(--index-feedback-tag-bg-warning)] text-[var(--index-feedback-tag-text-warning)]',
  error: 'bg-[var(--index-feedback-tag-bg-error)] text-[var(--index-feedback-tag-text-error)]',
  information: 'bg-[var(--index-feedback-tag-bg-information)] text-[var(--index-feedback-tag-text-information)]',
  purple: 'bg-[var(--index-feedback-tag-bg-purple)] text-[var(--index-feedback-tag-text-purple)]',
  orange: 'bg-[var(--index-feedback-tag-bg-orange)] text-[var(--index-feedback-tag-text-orange)]',
  neutral: 'bg-[var(--bridges-color-background-layer-1)] text-[var(--bridges-color-text-primary)]',
};

const sizeClasses: Record<TagSize, string> = {
  sm: 'px-[var(--index-feedback-tag-padding-h-sm)] py-[var(--index-feedback-tag-padding-v-sm)] text-[length:var(--index-feedback-tag-font-size-sm)]',
  lg: 'px-[var(--index-feedback-tag-padding-h-lg)] py-[var(--index-feedback-tag-padding-v-lg)] text-[length:var(--index-feedback-tag-font-size-lg)]',
};

/**
 * ## Rôle
 * `soc-tag` du kit avec un ton **neutre** en plus (`color="neutral"`) : une étiquette qui ne doit ni attirer
 * l'attention ni passer pour un état (offre « Standard » à côté de « Payant » et « Customisation client »).
 * Même gabarit que `soc-tag` (tokens `--index-feedback-tag-*` : rayon, paddings, police) ; les autres couleurs
 * reprennent exactement celles du kit, pour aligner des tags neutres et colorés sans écart visuel.
 *
 * ## Contraste
 * Neutre : `text-primary` sur `background-layer-1` (9,4:1). Attention : `warning` du kit est à 2,9:1 (texte
 * `#e17100` sur `#fef3c6`) — préférer `orange` (6,3:1) pour un ton « attention » sur du texte.
 *
 * ## Accessibilité
 * Texte simple, sans rôle : la couleur ne porte jamais seule l'information, le libellé reste lisible.
 */
@Component({
  selector: 'soc-labs-tag',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { '[class]': 'hostClass()', '[attr.data-color]': 'color()' },
  template: `<ng-content />`,
})
export class SocLabsTag {
  readonly color = input<LabsTagColor>('neutral');
  readonly size = input<TagSize>('sm');

  protected readonly hostClass = computed(
    () =>
      `inline-flex items-center gap-1 whitespace-nowrap rounded-[var(--index-feedback-tag-radius)] text-center [font-family:var(--index-feedback-tag-font-family)] [font-weight:var(--index-feedback-tag-font-weight)] ${colorClasses[this.color()]} ${sizeClasses[this.size()]}`,
  );
}
