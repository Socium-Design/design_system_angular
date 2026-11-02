import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import type { ProgressBarStatus } from '@socium-design/angular-components';

export type LabsProgressRingSize = 'sm' | 'md';

/** Same fill tokens as `soc-progress-bar`, applied to the SVG stroke. */
const strokeClasses: Record<ProgressBarStatus, string> = {
  information: 'stroke-[var(--index-feedback-progressbar-fill-information)]',
  success: 'stroke-[var(--index-feedback-progressbar-fill-success)]',
  warning: 'stroke-[var(--index-feedback-progressbar-fill-warning)]',
  error: 'stroke-[var(--index-feedback-progressbar-fill-error)]',
};

/** sm = kit icon xl (32px), md = icon 2xl. */
const sizeClasses: Record<LabsProgressRingSize, string> = {
  sm: 'size-[var(--bridges-size-icon-xl)]',
  md: 'size-[var(--bridges-size-icon-2xl)]',
};

/** Rayon du cercle dans un viewBox de 36 × 36 (trait de 4) : circonférence ≈ 100. */
const RADIUS = 15.9155;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * ## Rôle
 * Jauge de progression circulaire : anneau + pourcentage affiché à côté. Pour une colonne
 * « Progression » de tableau, où une barre linéaire prendrait trop de place. Une progression peut
 * dépasser 100 % (objectif quantitatif dépassé) : le texte garde la valeur réelle, l'anneau est plein.
 *
 * Le pourcentage est écrit **à côté** de l'anneau (et non dedans) pour rester lisible à la taille du
 * texte courant, en couleur de texte principale (contraste ≥ 4,5:1).
 *
 * ## Accessibilité
 * `role="progressbar"` avec `aria-valuenow` (borné 0–100) et `aria-valuetext` (valeur réelle,
 * formatée en français). `label` donne le nom accessible (« Progression de Test bouton »).
 */
@Component({
  selector: 'soc-labs-progress-ring',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'inline-flex items-center gap-[var(--bridges-position-gap-sm)]',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'clamped()',
    '[attr.aria-valuetext]': 'text()',
    '[attr.aria-label]': 'label() ?? null',
    '[attr.data-status]': 'status()',
  },
  template: `
    <svg viewBox="0 0 36 36" aria-hidden="true" [class]="svgClass()">
      <circle cx="18" cy="18" [attr.r]="radius" fill="none" stroke-width="4" class="stroke-[var(--index-feedback-progressbar-track-bg)]" />
      <circle
        cx="18"
        cy="18"
        [attr.r]="radius"
        fill="none"
        stroke-width="4"
        stroke-linecap="round"
        transform="rotate(-90 18 18)"
        [attr.stroke-dasharray]="dashArray()"
        [class]="strokeClass()"
      />
    </svg>
    @if (!hideValue()) {
      <span
        aria-hidden="true"
        class="whitespace-nowrap text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-primary)] [font-family:var(--bridges-shape-text-body-font)] [font-weight:var(--bridges-shape-text-label-weight)] tabular-nums"
        >{{ text() }}</span
      >
    }
  `,
})
export class SocLabsProgressRing {
  /** Progression en pour cent. Peut dépasser 100. */
  readonly value = input(0);
  readonly status = input<ProgressBarStatus>('success');
  readonly size = input<LabsProgressRingSize>('sm');
  /** Nom accessible de la jauge. */
  readonly label = input<string>();
  /** Masque le pourcentage visible (il reste lu par `aria-valuetext`). */
  readonly hideValue = input(false);

  protected readonly radius = RADIUS;
  protected readonly clamped = computed(() => Math.max(0, Math.min(100, this.value() || 0)));
  protected readonly text = computed(
    () => `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(this.value() || 0)} %`,
  );
  protected readonly dashArray = computed(() => {
    const filled = (this.clamped() / 100) * CIRCUMFERENCE;
    return `${filled} ${CIRCUMFERENCE}`;
  });
  protected readonly svgClass = computed(() => `shrink-0 ${sizeClasses[this.size()]}`);
  protected readonly strokeClass = computed(() => (this.clamped() === 0 ? 'stroke-transparent' : strokeClasses[this.status()]));
}
