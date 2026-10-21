import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, contentChild, input } from '@angular/core';
import {
  SocButtonLeftIcon,
  SocButtonRightIcon,
  buttonIconSizeVar,
  buttonPaddingClasses,
  buttonRadiusClasses,
  buttonTypographyClass,
  type ButtonSize,
} from '@socium-design/angular-components';
import { labsFocusRing } from '../internal/classes';

/** Only the variant the kit's `ButtonVariant` lacks; the other five stay on `button[socButton]`. */
export type LabsButtonVariant = 'primary-subtle';

/** Same colours as `soc-labs-icon-button`'s `primary-subtle`, so text and icon-only buttons match. */
const variantClasses: Record<LabsButtonVariant, string> = {
  'primary-subtle':
    'bg-[var(--bridges-color-accent-blue-bg)] text-[var(--bridges-color-text-action)] hover:bg-[var(--bridges-color-surface-primary-default)] hover:text-[var(--bridges-color-text-on-primary)] active:bg-[var(--bridges-color-surface-primary-pressed)] disabled:bg-[var(--index-button-button-bg-primary-disabled)] disabled:text-[var(--index-button-button-text-disabled)]',
};

/**
 * ## Rôle
 * Bouton à texte **teinté** (fond bleu clair, texte et icône bleus) : action secondaire mise en
 * avant sans le poids d'un bouton `primary`, typiquement répétée sur chaque ligne d'une liste
 * (« Visualiser »). Aucune des 5 variantes de `button[socButton]` ne la couvre : `secondary` est
 * gris, `ghost` transparent, `primary` plein.
 *
 * Même gabarit que `button[socButton]` (paddings, rayon, typographie et taille d'icône du kit, tailles
 * `sm`/`lg`), mêmes emplacements d'icône (`socButtonLeftIcon` / `socButtonRightIcon` du kit) ; seule
 * la couleur change. Sélecteur d'attribut sur un vrai `<button>` (convention du kit) : `type`,
 * `[disabled]`, `(click)`, `aria-*` sont natifs.
 *
 * ```html
 * <button socLabsButton (click)="visualiser(row)">
 *   <svg lucideLayoutGrid socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
 *   Visualiser
 * </button>
 * ```
 *
 * ## Accessibilité
 * Anneau de focus visible au clavier (`focus-visible`, couleur de focus du kit). Contraste : texte
 * `text-action` sur `accent-blue-bg`.
 */
@Component({
  selector: 'button[socLabsButton]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { '[class]': 'hostClasses()' },
  template: `
    @if (hasLeftIcon()) {
      <span class="shrink-0 group-disabled:text-[var(--index-button-button-icon-disabled)]" [style.width]="iconSize" [style.height]="iconSize">
        <ng-content select="[socButtonLeftIcon]" />
      </span>
    }
    <ng-content />
    @if (hasRightIcon()) {
      <span class="shrink-0 group-disabled:text-[var(--index-button-button-icon-disabled)]" [style.width]="iconSize" [style.height]="iconSize">
        <ng-content select="[socButtonRightIcon]" />
      </span>
    }
  `,
})
export class SocLabsButton {
  readonly variant = input<LabsButtonVariant>('primary-subtle');
  readonly size = input<ButtonSize>('sm');

  protected readonly iconSize = buttonIconSizeVar;

  private readonly leftIconContent = contentChild(SocButtonLeftIcon);
  private readonly rightIconContent = contentChild(SocButtonRightIcon);
  protected readonly hasLeftIcon = computed(() => !!this.leftIconContent());
  protected readonly hasRightIcon = computed(() => !!this.rightIconContent());

  protected readonly hostClasses = computed(
    () =>
      `group inline-flex items-center justify-center whitespace-nowrap transition-colors disabled:cursor-not-allowed ${labsFocusRing} ${buttonTypographyClass} ${buttonPaddingClasses[this.size()]} ${buttonRadiusClasses[this.size()]} ${variantClasses[this.variant()]}`,
  );
}
