import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, booleanAttribute, computed, effect, input, model, signal, viewChild } from '@angular/core';
import { LucidePencil } from '@lucide/angular';
import { labsFocusRing } from '../internal/classes';

/**
 * ## Rôle
 * Libellé **modifiable sur place** (nom d'une section, titre d'un widget) : le texte s'affiche tel
 * quel, un crayon apparaît au survol ; un clic le remplace par un champ **à la même place et à la
 * même taille** (le champ hérite de la police du parent et s'élargit avec son contenu).
 *
 * ## Comportement
 * - Entrée ou perte du focus : valide ; Échap : annule (le texte d'origine revient).
 * - Valeur vide (après `trim`) : revient à `defaultValue`.
 * - `value` est un `model` (↔) : `(valueChange)` n'est émis que si la valeur change réellement.
 *
 * ## Accessibilité
 * Hors édition, le libellé est un `<button>` (« Modifier {ariaLabel} : {valeur} ») — atteignable au
 * clavier, Entrée/Espace ouvrent l'édition ; le focus revient sur ce bouton après Entrée ou Échap.
 */
@Component({
  selector: 'soc-labs-inline-edit',
  standalone: true,
  imports: [LucidePencil],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'inline-flex min-w-0 max-w-full align-baseline' },
  template: `
    @if (editing()) {
      <span class="inline-grid min-w-0 max-w-full">
        <span aria-hidden="true" class="invisible whitespace-pre [grid-area:1/1] px-[var(--bridges-position-gap-2xs)]">{{ draft() || ' ' }}</span>
        <input
          #field
          type="text"
          [attr.aria-label]="ariaLabel()"
          [attr.maxlength]="maxlength() ?? null"
          [value]="draft()"
          (input)="draft.set($any($event.target).value)"
          (keydown)="onKeydown($event)"
          (blur)="commit(false)"
          class="[grid-area:1/1] w-full min-w-[2ch] rounded-[var(--bridges-shape-figure-radius-sm)] border-none bg-[var(--bridges-color-surface-neutral-white)] px-[var(--bridges-position-gap-2xs)] text-inherit [font:inherit] outline-[length:var(--bridges-shape-line-thick)] outline-offset-0 outline-[var(--bridges-color-border-focus)] [outline-style:solid]"
        />
      </span>
    } @else {
      <button
        #display
        type="button"
        [disabled]="disabled()"
        [attr.aria-label]="'Modifier ' + ariaLabel() + ' : ' + shown()"
        (click)="start()"
        class="group inline-flex min-w-0 max-w-full items-center gap-[var(--bridges-position-gap-2xs)] rounded-[var(--bridges-shape-figure-radius-sm)] px-[var(--bridges-position-gap-2xs)] text-left text-inherit [font:inherit] hover:bg-[var(--bridges-color-background-layer-1)] disabled:cursor-default disabled:hover:bg-transparent {{ focusRing }}"
      >
        <span [class]="isPlaceholder() ? 'truncate text-[var(--bridges-color-text-tertiary)]' : 'truncate'">{{ shown() }}</span>
        @if (!disabled()) {
          <svg
            lucidePencil
            aria-hidden="true"
            class="size-[var(--bridges-size-icon-xs)] shrink-0 text-[var(--bridges-color-icon-secondary)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            [strokeWidth]="2"
          ></svg>
        }
      </button>
    }
  `,
})
export class SocLabsInlineEdit {
  readonly value = model('');
  /** Valeur reprise quand le champ est validé vide. */
  readonly defaultValue = input('');
  /** Ce qui est modifié (« le nom de la section ») — nomme le champ et le bouton. */
  readonly ariaLabel = input('le libellé');
  /** Texte affiché quand la valeur et la valeur par défaut sont vides. */
  readonly placeholder = input('Sans titre');
  readonly maxlength = input<number>();
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly focusRing = labsFocusRing;
  protected readonly editing = signal(false);
  protected readonly draft = signal('');
  protected readonly isPlaceholder = computed(() => !this.value() && !this.defaultValue());
  protected readonly shown = computed(() => this.value() || this.defaultValue() || this.placeholder());

  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
  private readonly display = viewChild<ElementRef<HTMLButtonElement>>('display');
  private refocusDisplay = false;

  constructor() {
    effect(() => {
      const el = this.field()?.nativeElement;
      if (el) {
        el.focus();
        el.select();
      }
    });
    effect(() => {
      const el = this.display()?.nativeElement;
      if (el && this.refocusDisplay) {
        this.refocusDisplay = false;
        el.focus();
      }
    });
  }

  protected start(): void {
    if (this.disabled()) return;
    this.draft.set(this.value() || this.defaultValue());
    this.editing.set(true);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commit(true);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation(); // don't also close an enclosing overlay
      this.cancel();
    }
  }

  /** Validates the draft; `refocus` returns focus to the label (keyboard validation). */
  protected commit(refocus: boolean): void {
    if (!this.editing()) return;
    const next = this.draft().trim() || this.defaultValue();
    this.refocusDisplay = refocus;
    this.editing.set(false);
    if (next !== this.value()) this.value.set(next);
  }

  protected cancel(): void {
    if (!this.editing()) return;
    this.refocusDisplay = true;
    this.editing.set(false);
  }
}
