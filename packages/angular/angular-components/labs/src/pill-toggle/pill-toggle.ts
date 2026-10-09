import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, input, model, viewChildren } from '@angular/core';
import { labsFocusRing } from '../internal/classes';
import { SocLabsFormControl, provideLabsFormControl } from '../internal/form-control';

/** Accent of the kit (`--bridges-color-accent-*`) used when the option is selected; `gray` = neutral. */
export type LabsPillColor = 'blue' | 'green' | 'gray' | 'amber' | 'red' | 'indigo' | 'purple' | 'orange';
export type LabsPillToggleSize = 'sm' | 'md';

export interface LabsPillOption<T = string> {
  value: T;
  label: string;
  /** Couleur de la pastille sélectionnée (défaut `blue`). */
  color?: LabsPillColor;
  disabled?: boolean;
}

const selectedClasses: Record<LabsPillColor, string> = {
  blue: 'bg-[var(--bridges-color-accent-blue-bg)] text-[var(--bridges-color-accent-blue-text)]',
  green: 'bg-[var(--bridges-color-accent-green-bg)] text-[var(--bridges-color-accent-green-text)]',
  gray: 'bg-[var(--bridges-color-surface-neutral-default)] text-[var(--bridges-color-text-primary)]',
  amber: 'bg-[var(--bridges-color-accent-amber-bg)] text-[var(--bridges-color-text-warning)]',
  red: 'bg-[var(--bridges-color-accent-red-bg)] text-[var(--bridges-color-accent-red-text)]',
  indigo: 'bg-[var(--bridges-color-accent-indigo-bg)] text-[var(--bridges-color-accent-indigo-text)]',
  purple: 'bg-[var(--bridges-color-accent-purple-bg)] text-[var(--bridges-color-accent-purple-text)]',
  orange: 'bg-[var(--bridges-color-accent-orange-bg)] text-[var(--bridges-color-accent-orange-text)]',
};

/** sm 24px / md 28px de haut (md : kit icon `lg` + `gap-2xs`, pas de token propre). */
const sizeClasses: Record<LabsPillToggleSize, string> = {
  sm: 'h-[var(--bridges-size-icon-lg)] px-[var(--bridges-position-padding-3xs)] text-[length:var(--bridges-size-text-text-size-xs)]',
  md: 'h-[calc(var(--bridges-size-icon-lg)+var(--bridges-position-gap-2xs))] px-[var(--bridges-position-padding-sm)] text-[length:var(--bridges-size-text-text-size-sm)]',
};

/**
 * ## Rôle
 * Bascule en pastilles, **choix unique** parmi 2 à 4 options courtes et immédiates : statut
 * (Actif / Inactif / Archivé), opérateur logique (ET / OU) d'une population.
 *
 * ## Accessibilité
 * `role="radiogroup"` (nommé par `ariaLabel`) contenant des `role="radio"` ; tabulation itinérante
 * (une seule pastille dans l'ordre de tabulation) ; ← → ↑ ↓ déplacent le focus **et** la sélection,
 * Origine / Fin vont aux extrémités ; les options désactivées sont sautées.
 *
 * Champ de formulaire (`formControl`, `formControlName`, `ngModel`) ; la valeur est `value` (↔).
 * La couleur est propre à chaque option (`color`, tokens `--bridges-color-accent-*`).
 */
@Component({
  selector: 'soc-labs-pill-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [provideLabsFormControl(() => SocLabsPillToggle)],
  host: { class: 'inline-flex' },
  template: `
    <div
      role="radiogroup"
      [attr.aria-label]="ariaLabel() ?? null"
      [attr.aria-disabled]="isDisabled() || null"
      class="inline-flex items-center gap-[var(--bridges-position-gap-xs)] rounded-[var(--bridges-shape-figure-radius-full)] bg-[var(--bridges-color-background-layer-1)] p-[var(--bridges-position-gap-xs)]"
    >
      @for (option of options(); track option.value; let i = $index) {
        <button
          #pill
          type="button"
          role="radio"
          [attr.aria-checked]="isSelected(option)"
          [attr.data-value]="option.value"
          [tabIndex]="i === tabStop() ? 0 : -1"
          [disabled]="isDisabled() || !!option.disabled"
          [class]="pillClasses(option)"
          (click)="select(option)"
          (keydown)="onKeydown($event, i)"
          (blur)="onTouched()"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class SocLabsPillToggle<T = string> extends SocLabsFormControl<T | null> {
  readonly options = input.required<LabsPillOption<T>[]>();
  readonly value = model<T | null>(null);
  readonly size = input<LabsPillToggleSize>('md');
  /** Nom accessible du groupe (ex. « Statut »). */
  readonly ariaLabel = input<string>();

  protected readonly valueModel = this.value;
  private readonly pills = viewChildren<ElementRef<HTMLButtonElement>>('pill');

  /** Index of the only pill in the tab order: the selected one, else the first enabled one. */
  protected readonly tabStop = computed(() => {
    const opts = this.options();
    const selected = opts.findIndex((o) => this.isSelected(o));
    return selected >= 0 ? selected : opts.findIndex((o) => !o.disabled);
  });

  protected coerce(value: unknown): T | null {
    return (value ?? null) as T | null;
  }

  protected isSelected(option: LabsPillOption<T>): boolean {
    return Object.is(option.value, this.value());
  }

  protected select(option: LabsPillOption<T>): void {
    if (this.isDisabled() || option.disabled) return;
    this.value.set(option.value);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const opts = this.options();
    const enabled = opts.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
    if (!enabled.length || this.isDisabled()) return;
    const pos = enabled.indexOf(index);
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = enabled[(pos + 1) % enabled.length];
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = enabled[(pos - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        next = enabled[0];
        break;
      case 'End':
        next = enabled[enabled.length - 1];
        break;
      default:
        return;
    }
    event.preventDefault();
    this.select(opts[next]);
    this.pills()[next]?.nativeElement.focus();
  }

  protected pillClasses(option: LabsPillOption<T>): string {
    const state = this.isSelected(option)
      ? `${selectedClasses[option.color ?? 'blue']} [font-weight:var(--bridges-shape-text-label-weight)]`
      : 'bg-transparent text-[var(--bridges-color-text-secondary)] hover:bg-[var(--bridges-color-surface-neutral-white)] hover:text-[var(--bridges-color-text-primary)]';
    return `inline-flex items-center justify-center whitespace-nowrap rounded-[var(--bridges-shape-figure-radius-full)] [font-family:var(--bridges-shape-text-body-font)] transition-colors disabled:cursor-not-allowed disabled:opacity-[var(--bridges-texture-opacity-disabled)] ${labsFocusRing} ${sizeClasses[this.size()]} ${state}`;
  }
}
