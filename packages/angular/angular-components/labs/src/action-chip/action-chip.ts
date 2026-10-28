import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from '@angular/core';
import { labsFocusRing } from '../internal/classes';

/**
 * ## Rôle
 * Puce **avec une action textuelle** : un élément acquis (option payante souscrite) et le bouton qui le retire
 * (« Désactiver »). Diffère de `soc-chips removable` du kit, dont l'action est une croix « Retirer » : ici l'action est
 * nommée, visible, et ne supprime rien (elle change un état).
 *
 * ## Accessibilité
 * Le bouton est nommé avec le libellé de la puce (« Désactiver Intranet ») : il reste compréhensible hors contexte
 * (liste des boutons d'un lecteur d'écran). Libellé `text-primary` (9,4:1), action `text-action` (6,2:1) sur
 * `background-layer-1`. Placer les puces dans une liste (`<ul>` / `<li>`).
 */
@Component({
  selector: 'soc-labs-action-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class:
      'inline-flex max-w-full items-center gap-[var(--bridges-position-gap-sm)] rounded-full border-[length:var(--bridges-shape-figure-border-stroke-default)] border-[var(--bridges-color-border-subtle)] bg-[var(--bridges-color-background-layer-1)] py-[var(--bridges-position-padding-xs)] pl-[var(--bridges-position-padding-md)] pr-[var(--bridges-position-padding-xs)] text-[length:var(--bridges-size-text-text-size-sm)] [font-family:var(--bridges-shape-text-body-font)]',
  },
  template: `
    <span class="min-w-0 truncate text-[var(--bridges-color-text-primary)] [font-weight:var(--bridges-shape-text-label-weight)]" data-part="label">{{ label() }}</span>
    <button
      type="button"
      [class]="buttonClass"
      [attr.aria-label]="actionLabel() + ' ' + label()"
      (click)="action.emit()"
      data-part="action"
    >
      {{ actionLabel() }}
    </button>
  `,
})
export class SocLabsActionChip {
  readonly label = input.required<string>();
  readonly actionLabel = input('Désactiver');
  readonly action = output<void>();

  protected readonly buttonClass = `shrink-0 rounded-full px-[var(--bridges-position-padding-sm)] py-[var(--bridges-position-gap-2xs)] text-[var(--bridges-color-text-action)] [font-weight:var(--bridges-shape-text-label-weight)] hover:bg-[var(--bridges-color-surface-selected)] ${labsFocusRing}`;
}
