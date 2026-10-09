import { ChangeDetectionStrategy, Component, DestroyRef, Directive, ElementRef, ViewEncapsulation, computed, contentChild, effect, inject, input, model, output, viewChild } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { SocLabsIconButton } from '../icon-button/icon-button';
import { nextLabsId } from '../internal/unique-id';

/** Badge à côté du titre (ex. `<soc-tag socLabsOverlayBadge>Données simulées</soc-tag>`). */
@Directive({ selector: '[socLabsOverlayBadge]', standalone: true })
export class SocLabsOverlayBadge {}

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), iframe, [contenteditable=""], [contenteditable=true], [tabindex]:not([tabindex="-1"])';

/**
 * ## Rôle
 * Calque **plein écran** qui recouvre toute l'application (bandeau et menu compris) : prévisualiser
 * un tableau de bord, consulter un contenu dense sans le shell. Barre du haut (titre, sous-titre,
 * badge, bouton Fermer) et contenu qui défile.
 *
 * ## Comportement et accessibilité
 * - `role="dialog"` + `aria-modal`, nommé par le titre et décrit par le sous-titre.
 * - À l'ouverture : le focus entre dans le calque, le défilement de la page est bloqué.
 * - **Piège du focus** : Tab / Maj+Tab bouclent dans le calque.
 * - **Échap** ou le bouton Fermer : `open` repasse à `false` et `(close)` est émis.
 * - À la fermeture : le focus revient à l'élément qui l'avait avant l'ouverture.
 *
 * `open` est un `model` (↔) : `[(open)]="apercu"` suit la fermeture tout seul. Rendu dans `<body>`
 * (comme `soc-dialog`), au-dessus des autres overlays du kit.
 */
@Component({
  selector: 'soc-labs-fullscreen-overlay',
  standalone: true,
  imports: [SocLabsIconButton, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (open()) {
      <div
        #panel
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        [attr.aria-labelledby]="titleId"
        [attr.aria-describedby]="subtitle() ? subtitleId : null"
        (keydown)="trapFocus($event)"
        class="fixed inset-0 z-[60] flex flex-col bg-[var(--bridges-color-background-layer-1)] outline-none"
      >
        <header
          class="flex shrink-0 items-center gap-[var(--bridges-position-gap-lg)] border-b-[length:var(--bridges-shape-line-hairline)] border-[var(--bridges-color-border-subtle)] bg-[var(--bridges-color-surface-neutral-white)] px-[var(--bridges-position-padding-xl)] py-[var(--bridges-position-padding-md)]"
        >
          <div class="flex min-w-0 flex-1 flex-col gap-[var(--bridges-position-gap-2xs)]">
            <div class="flex min-w-0 items-center gap-[var(--bridges-position-gap-sm)]">
              <h2
                [id]="titleId"
                class="truncate text-[length:var(--bridges-size-text-text-size-xl)] text-[var(--bridges-color-text-primary)] [font-family:var(--bridges-shape-text-label-font)] [font-weight:var(--bridges-shape-text-label-weight)]"
              >{{ title() }}</h2>
              @if (hasBadge()) {
                <span class="flex shrink-0"><ng-content select="[socLabsOverlayBadge]" /></span>
              }
            </div>
            @if (subtitle()) {
              <p [id]="subtitleId" class="truncate text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-secondary)]">{{ subtitle() }}</p>
            }
          </div>
          <soc-labs-icon-button data-close [ariaLabel]="closeLabel()" [tooltip]="closeLabel()" tooltipPosition="bottom" size="md" (click)="dismiss()">
            <svg lucideX class="size-full" [strokeWidth]="2"></svg>
          </soc-labs-icon-button>
        </header>
        <div class="min-h-0 flex-1 overflow-auto p-[var(--bridges-position-padding-xl)]">
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class SocLabsFullscreenOverlay {
  readonly open = model(false);
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly closeLabel = input('Fermer');
  /** Émis à la fermeture par Échap ou par le bouton Fermer. */
  readonly close = output<void>();

  protected readonly titleId = nextLabsId('soc-labs-overlay-title');
  protected readonly subtitleId = nextLabsId('soc-labs-overlay-subtitle');
  private readonly badge = contentChild(SocLabsOverlayBadge);
  protected readonly hasBadge = computed(() => !!this.badge());

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private returnFocusTo: HTMLElement | null = null;
  private previousOverflow: string | null = null;

  constructor() {
    effect(() => {
      const el = this.panel()?.nativeElement;
      if (el) {
        if (el.parentElement !== document.body) document.body.appendChild(el);
        if (this.previousOverflow === null) {
          this.returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          this.previousOverflow = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
          el.focus();
        }
      } else {
        this.release();
      }
    });

    const onKeydown = (e: KeyboardEvent) => {
      if (this.open() && e.key === 'Escape') {
        e.preventDefault();
        this.dismiss();
      }
    };
    document.addEventListener('keydown', onKeydown);
    inject(DestroyRef).onDestroy(() => {
      document.removeEventListener('keydown', onKeydown);
      this.panel()?.nativeElement.remove();
      this.release();
    });
  }

  protected dismiss(): void {
    this.open.set(false);
    this.close.emit();
  }

  protected trapFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const panel = this.panel()?.nativeElement;
    if (!panel) return;
    const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.closest('[inert]'));
    if (!items.length) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /** Unlocks page scroll and gives focus back (once per opening). */
  private release(): void {
    if (this.previousOverflow === null) return;
    document.body.style.overflow = this.previousOverflow;
    this.previousOverflow = null;
    const target = this.returnFocusTo;
    this.returnFocusTo = null;
    if (target?.isConnected) target.focus();
  }
}
