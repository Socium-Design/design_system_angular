import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input } from '@angular/core';
import { SocTooltip, SocTooltipLabel, type TooltipPosition } from '@socium-design/angular-components';
import { labsFocusRing } from '../internal/classes';

export type LabsIconButtonSize = 'xs' | 'sm' | 'md';
export type LabsIconButtonVariant = 'ghost' | 'primary-subtle';
export type LabsIconButtonShape = 'square' | 'round';

/** xs 20px / sm 24px / md 28px — the first two are the kit's icon sizes, md has no token of its own
 * (kit icon `lg` + `gap-2xs`). */
const sizeClasses: Record<LabsIconButtonSize, string> = {
  xs: 'size-[var(--bridges-size-icon-md)]',
  sm: 'size-[var(--bridges-size-icon-lg)]',
  md: 'size-[calc(var(--bridges-size-icon-lg)+var(--bridges-position-gap-2xs))]',
};

const iconSizeClasses: Record<LabsIconButtonSize, string> = {
  xs: 'size-[var(--bridges-size-icon-xs)]',
  sm: 'size-[var(--bridges-size-icon-sm)]',
  md: 'size-[var(--bridges-size-icon-2sm)]',
};

const variantClasses: Record<LabsIconButtonVariant, string> = {
  ghost:
    'bg-transparent text-[var(--bridges-color-icon-secondary)] hover:bg-[var(--bridges-color-background-layer-1)] hover:text-[var(--bridges-color-icon-primary)] active:bg-[var(--bridges-color-background-layer-2)] disabled:bg-transparent',
  'primary-subtle':
    'bg-[var(--bridges-color-accent-blue-bg)] text-[var(--bridges-color-text-action)] hover:bg-[var(--bridges-color-surface-primary-default)] hover:text-[var(--bridges-color-text-on-primary)] active:bg-[var(--bridges-color-surface-primary-pressed)] disabled:bg-[var(--bridges-color-surface-neutral-disabled)]',
};

const shapeClasses: Record<LabsIconButtonShape, string> = {
  square: 'rounded-[var(--bridges-shape-figure-radius-sm)]',
  round: 'rounded-[var(--bridges-shape-figure-radius-full)]',
};

/**
 * ## Rôle
 * Bouton icône compact pour les barres d'outils denses (lignes de liste, en-têtes de panneau,
 * cartes en composition) — là où `button[socButton]` (32px minimum) est trop haut.
 *
 * ## Accessibilité
 * - `ariaLabel` est **obligatoire** (input requis : le build échoue sans lui) — un bouton sans texte
 *   visible n'a pas d'autre nom accessible.
 * - `tooltip` (optionnel) affiche une info-bulle du kit (`soc-tooltip`) au survol et au focus.
 *
 * ## Écart avec la convention du kit (GAP-DECISION)
 * Composant élément (`soc-labs-icon-button`) qui contient le `<button>`, et non un sélecteur
 * d'attribut : c'est ce qui permet de rendre `ariaLabel` obligatoire et d'envelopper le bouton dans
 * l'info-bulle. Le `(click)` natif du bouton remonte jusqu'à l'hôte : `(click)` s'écoute directement
 * sur `<soc-labs-icon-button>` (un bouton désactivé n'émet pas de clic).
 *
 * L'icône est projetée (contenu par défaut) : `<svg lucidePlus class="size-full">`.
 */
@Component({
  selector: 'soc-labs-icon-button',
  standalone: true,
  imports: [NgTemplateOutlet, SocTooltip, SocTooltipLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'inline-flex' },
  template: `
    <ng-template #button>
      <button
        [attr.type]="type()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-pressed]="pressed() ?? null"
        [disabled]="disabled()"
        [class]="buttonClasses()"
      >
        <span aria-hidden="true" [class]="iconClasses()"><ng-content /></span>
      </button>
    </ng-template>
    @if (tooltip()) {
      <soc-tooltip [position]="tooltipPosition()">
        <ng-container [ngTemplateOutlet]="button" />
        <span socTooltipLabel>{{ tooltip() }}</span>
      </soc-tooltip>
    } @else {
      <ng-container [ngTemplateOutlet]="button" />
    }
  `,
})
export class SocLabsIconButton {
  /** Nom accessible du bouton (obligatoire). */
  readonly ariaLabel = input.required<string>();
  readonly size = input<LabsIconButtonSize>('sm');
  readonly variant = input<LabsIconButtonVariant>('ghost');
  readonly shape = input<LabsIconButtonShape>('square');
  /** Texte de l'info-bulle ; absent = pas d'info-bulle. */
  readonly tooltip = input<string>();
  readonly tooltipPosition = input<TooltipPosition>('top');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  /** Bouton bascule : `true`/`false` posent `aria-pressed` ; absent = bouton simple. */
  readonly pressed = input<boolean | undefined>(undefined);

  protected readonly buttonClasses = computed(
    () =>
      `inline-flex shrink-0 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:text-[var(--bridges-color-icon-disabled)] ${labsFocusRing} ${sizeClasses[this.size()]} ${variantClasses[this.variant()]} ${shapeClasses[this.shape()]}`,
  );
  protected readonly iconClasses = computed(() => `inline-flex shrink-0 ${iconSizeClasses[this.size()]}`);
}
