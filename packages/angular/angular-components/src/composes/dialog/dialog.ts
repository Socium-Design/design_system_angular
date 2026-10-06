import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation, effect, inject, input, output, viewChild } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { SocButton } from '../../primitifs/button/button';

export interface DialogAction {
  label: string;
  onClick?: () => void;
}

/**
 * ## Rôle
 * Fenêtre modale bloquante, superposée au contenu de la page, pour une action ou une information
 * qui exige l'attention exclusive de l'utilisateur avant qu'il puisse continuer.
 *
 * ## Quand l'utiliser
 * - Toute action nécessitant une confirmation explicite avant exécution (suppression, annulation
 *   d'un processus en cours, désactivation, etc.).
 * - Saisie ou consultation ponctuelle qui ne justifie pas une page dédiée.
 *
 * ## Contraintes de composition
 * - Toute action nécessitant une confirmation de l'utilisateur (suppression, annulation, etc.) doit
 *   systématiquement passer par une instance de `soc-dialog` avec `[open]="true"` — jamais une
 *   confirmation inline (`window.confirm`, un simple changement d'état de bouton, une modification
 *   silencieuse sans dialogue) ne remplace ce composant.
 * - Un seul `soc-dialog` ouvert à la fois — ne jamais en empiler plusieurs.
 *
 * Maps 1:1 to "Index/Conteneur/Dialog/*" tokens — see packages/tokens/tokens/components/conteneur.json
 * in design_system (React reference repo, read only). Plain wrapper (`soc-dialog`). `onClose` ->
 * `close` output; `open` stays purely controlled (React has no internal fallback): plain `input()`.
 * `primaryAction`/`secondaryAction` keep React's `{ label, onClick? }` data shape (per-item
 * callbacks, like `Breadcrumb`'s items) — their *presence* decides whether the footer renders.
 *
 * Portaled to `document.body` via a direct `appendChild` while open, same technique as `Popover`/
 * `Tooltip` (React: `createPortal`). Unlike React, projected content is created once with the parent
 * (Angular content projection can't be unmounted/remounted by the child) — only its placement
 * follows `open`.
 */
@Component({
  selector: 'soc-dialog',
  standalone: true,
  imports: [SocButton, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (open()) {
      <div #overlay class="fixed inset-0 z-50 flex items-center justify-center bg-[var(--index-conteneur-dialog-overlay-color)]" (click)="close.emit()">
        <div
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
          class="flex w-[560px] max-w-[90vw] flex-col items-start rounded-[var(--index-conteneur-dialog-radius)] border-[length:var(--index-conteneur-dialog-border-width)] border-[var(--index-conteneur-dialog-border)] bg-[var(--index-conteneur-dialog-bg)]"
        >
          <div class="flex w-full items-center py-[var(--index-conteneur-dialog-header-pad-v)] px-[var(--index-conteneur-dialog-header-pad-h-right)]">
            <p class="flex-1 text-[length:var(--index-conteneur-dialog-title-size)] text-[var(--index-conteneur-dialog-title-color)] [font-family:var(--index-conteneur-dialog-title-font)] [font-weight:var(--index-conteneur-dialog-title-weight)]">
              {{ title() }}
            </p>
            <button
              type="button"
              (click)="close.emit()"
              aria-label="Fermer"
              class="size-[var(--index-conteneur-dialog-close-icon-size)] shrink-0 text-[var(--index-conteneur-dialog-close-icon-color)]"
            >
              <svg lucideX class="size-full" [strokeWidth]="closeIconThickness"></svg>
            </button>
          </div>
          <div class="h-[length:var(--index-conteneur-dialog-separator-height)] w-full bg-[var(--index-conteneur-dialog-separator-color)]"></div>
          <!-- No items-start: direct children default to 100% width (flex's stretch is the default
               align-items) — a child that wants its own width sets self-start/an explicit width
               itself, which still overrides this via align-self. -->
          <div
            class="flex w-full flex-col px-[var(--index-conteneur-dialog-content-pad-h)] py-[var(--index-conteneur-dialog-content-pad-v)]"
            style="min-height: var(--index-conteneur-dialog-slot-min-height)"
          >
            <ng-content />
          </div>
          @if (primaryAction() || secondaryAction()) {
            <div class="h-[length:var(--index-conteneur-dialog-separator-height)] w-full bg-[var(--index-conteneur-dialog-separator-color)]"></div>
            <div class="flex w-full items-center justify-end gap-[var(--index-conteneur-dialog-button-gap)] px-[var(--index-conteneur-dialog-footer-pad-h)] py-[var(--index-conteneur-dialog-footer-pad-v)]">
              @if (secondaryAction(); as secondary) {
                <button socButton variant="secondary" (click)="secondary.onClick?.()">{{ secondary.label }}</button>
              }
              @if (primaryAction(); as primary) {
                <button socButton variant="primary" (click)="primary.onClick?.()">{{ primary.label }}</button>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class SocDialog {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly primaryAction = input<DialogAction>();
  readonly secondaryAction = input<DialogAction>();
  readonly close = output<void>();

  protected readonly closeIconThickness = 'var(--index-conteneur-dialog-close-icon-thickness)';

  private readonly overlayRef = viewChild<ElementRef<HTMLElement>>('overlay');

  constructor() {
    effect(() => {
      const el = this.overlayRef()?.nativeElement;
      if (el && el.parentElement !== document.body) document.body.appendChild(el);
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (this.open() && e.key === 'Escape') this.close.emit();
    };
    document.addEventListener('keydown', onKeyDown);
    inject(DestroyRef).onDestroy(() => {
      document.removeEventListener('keydown', onKeyDown);
      this.overlayRef()?.nativeElement.remove();
    });
  }
}
