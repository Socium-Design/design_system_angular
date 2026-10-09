import { CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, booleanAttribute, computed, inject, input, output, signal } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import { labsFocusRing } from '../internal/classes';

export type LabsDropZoneVariant = 'empty' | 'slot';

const DEFAULT_LABELS: Record<LabsDropZoneVariant, string> = {
  empty: 'Glissez un élément ici ou cliquez pour ajouter',
  slot: 'Ajouter…',
};

/**
 * ## Rôle
 * Zone de dépôt, **cliquable** (le clic reste le chemin principal, le glisser un raccourci) :
 * - `empty` : grand cadre pointillé avec une icône + et un texte — section ou liste vide ;
 * - `slot` : emplacement compact « + Ajouter… » en bas d'une liste ;
 * - état **survol de dépôt** (`data-state="over"`) : contour pointillé bleu et léger fond bleu.
 *
 * ## Glisser-déposer (`@angular/cdk/drag-drop`)
 * Poser `cdkDropList` sur `<soc-labs-drop-zone>` : le composant écoute ses événements `entered` /
 * `exited` / `dropped` et passe seul à l'état « survol de dépôt » ; le placeholder du CDK est masqué
 * à l'intérieur de la zone. Sans CDK (ou pour un autre mécanisme), forcer l'état avec `active`.
 *
 * ## Accessibilité
 * Un vrai `<button>` (texte visible = nom accessible) ; `(activate)` est émis au clic, à Entrée et à
 * Espace. `disabled` désactive le bouton et l'état de survol.
 */
@Component({
  selector: 'soc-labs-drop-zone',
  standalone: true,
  imports: [LucidePlus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    // CdkDropList moves its drag placeholder into the drop container (this host) — keep it invisible.
    class: 'flex w-full min-w-0 [&_.cdk-drag-placeholder]:hidden',
    '[attr.data-state]': 'isOver() ? "over" : null',
  },
  template: `
    <button type="button" [disabled]="disabled()" [class]="buttonClasses()" (click)="activate.emit()">
      @if (variant() === 'empty') {
        <span
          aria-hidden="true"
          class="flex size-[var(--bridges-size-icon-2xl)] items-center justify-center rounded-[var(--bridges-shape-figure-radius-full)] bg-[var(--bridges-color-background-layer-1)] text-[var(--bridges-color-icon-action)] group-disabled:text-[var(--bridges-color-icon-disabled)]"
        >
          <svg lucidePlus class="size-[var(--bridges-size-icon-md)]" [strokeWidth]="2"></svg>
        </span>
        <span class="flex flex-col gap-[var(--bridges-position-gap-2xs)]">
          <span>{{ text() }}</span>
          @if (hint()) {
            <span class="text-[length:var(--bridges-size-text-text-size-xs)] text-[var(--bridges-color-text-tertiary)]">{{ hint() }}</span>
          }
        </span>
      } @else {
        <svg lucidePlus aria-hidden="true" class="size-[var(--bridges-size-icon-sm)] shrink-0" [strokeWidth]="2"></svg>
        <span class="truncate">{{ text() }}</span>
      }
    </button>
  `,
})
export class SocLabsDropZone {
  readonly variant = input<LabsDropZoneVariant>('empty');
  /** Texte de la zone ; défaut selon la variante. */
  readonly label = input<string>();
  /** Texte secondaire (variante `empty`). */
  readonly hint = input<string>();
  /** Force l'état « survol de dépôt » (sans CDK, ou glisser natif). */
  readonly active = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Clic, Entrée ou Espace sur la zone. */
  readonly activate = output<void>();

  private readonly cdkOver = signal(false);
  protected readonly isOver = computed(() => !this.disabled() && (this.active() || this.cdkOver()));
  protected readonly text = computed(() => this.label() ?? DEFAULT_LABELS[this.variant()]);

  constructor() {
    const dropList = inject(CdkDropList, { optional: true, self: true });
    if (dropList) {
      const subs = [
        dropList.entered.subscribe(() => this.cdkOver.set(true)),
        dropList.exited.subscribe(() => this.cdkOver.set(false)),
        dropList.dropped.subscribe(() => this.cdkOver.set(false)),
      ];
      inject(DestroyRef).onDestroy(() => subs.forEach((s) => s.unsubscribe()));
    }
  }

  protected readonly buttonClasses = computed(() => {
    const over = this.isOver();
    const tone = over
      ? 'border-[var(--bridges-color-border-focus)] bg-[var(--bridges-color-accent-blue-bg)]'
      : 'border-[var(--bridges-color-border-tertiary)] bg-transparent hover:border-[var(--bridges-color-border-secondary)] hover:bg-[var(--bridges-color-background-layer-1)]';
    const base = `group flex w-full min-w-0 border-[length:var(--bridges-shape-line-default)] border-dashed [font-family:var(--bridges-shape-text-body-font)] text-[length:var(--bridges-size-text-text-size-sm)] transition-colors disabled:cursor-not-allowed disabled:border-[var(--bridges-color-border-subtle)] disabled:bg-transparent disabled:text-[var(--bridges-color-text-disabled)] ${labsFocusRing} ${tone}`;
    return this.variant() === 'empty'
      ? `${base} min-h-[calc(var(--bridges-size-icon-2xl)*4)] flex-col items-center justify-center gap-[var(--bridges-position-gap-md)] rounded-[var(--bridges-shape-figure-radius-lg)] p-[var(--bridges-position-padding-xl)] text-center text-[var(--bridges-color-text-secondary)]`
      : `${base} items-center gap-[var(--bridges-position-gap-2xs)] rounded-[var(--bridges-shape-figure-radius-md)] px-[var(--bridges-position-padding-3xs)] py-[var(--bridges-position-padding-2xs)] text-left text-[var(--bridges-color-text-action)]`;
  });
}
