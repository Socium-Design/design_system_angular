import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, model } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { labsOverlineText } from '../internal/classes';
import { SocLabsFormControl, provideLabsFormControl } from '../internal/form-control';
import { nextLabsId } from '../internal/unique-id';

export type LabsCompactFieldMode = 'read' | 'edit';
export type LabsCompactFieldControl = 'text' | 'textarea' | 'select';
export type LabsCompactFieldSize = 'md' | 'sm';

export interface LabsCompactFieldOption {
  value: string;
  label: string;
}

const controlBase =
  'w-full min-w-0 rounded-[var(--bridges-shape-figure-radius-sm)] border-[length:var(--bridges-shape-line-hairline)] border-[var(--bridges-color-border-tertiary)] bg-[var(--bridges-color-surface-neutral-white)] text-[var(--bridges-color-text-primary)] [font-family:var(--bridges-shape-text-body-font)] placeholder:text-[var(--bridges-color-text-tertiary)] hover:border-[var(--bridges-color-border-secondary)] outline-none focus:border-[var(--bridges-color-border-focus)] focus:outline-[length:var(--bridges-shape-line-hairline)] focus:outline-[var(--bridges-color-border-focus)] disabled:cursor-not-allowed disabled:bg-[var(--bridges-color-surface-neutral-disabled)] disabled:text-[var(--bridges-color-text-disabled)]';
/** Per-size classes. Literal strings only (Tailwind scans the source). */
const SIZES = {
  /** 14px text; controls 28px high (kit icon `lg` + `gap-2xs`) — fits a 220px side panel. */
  md: {
    text: 'text-[length:var(--bridges-size-text-text-size-sm)]',
    leading: '[line-height:var(--bridges-size-text-line-height-sm)]',
    padX: 'px-[var(--bridges-position-padding-3xs)]',
    height: 'h-[calc(var(--bridges-size-icon-lg)+var(--bridges-position-gap-2xs))]',
    textareaPadY: 'py-[var(--bridges-position-padding-2xs)]',
    chevron: 'right-[var(--bridges-position-padding-3xs)] size-[var(--bridges-size-icon-sm)]',
    selectPadRight: 'pr-[calc(var(--bridges-size-icon-sm)+var(--bridges-position-padding-3xs)*2)]',
    gap: 'gap-[var(--bridges-position-gap-2xs)]',
    separatorPad: 'pb-[var(--bridges-position-padding-3xs)]',
  },
  /** 12px text; controls 24px high (kit icon `lg`) — denser panels. */
  sm: {
    text: 'text-[length:var(--bridges-size-text-text-size-xs)]',
    leading: '[line-height:var(--bridges-size-text-line-height-xs)]',
    padX: 'px-[var(--bridges-position-padding-2xs)]',
    height: 'h-[var(--bridges-size-icon-lg)]',
    textareaPadY: 'py-[var(--bridges-position-padding-xs)]',
    chevron: 'right-[var(--bridges-position-padding-2xs)] size-[var(--bridges-size-icon-xs)]',
    selectPadRight: 'pr-[calc(var(--bridges-size-icon-xs)+var(--bridges-position-padding-2xs)*2)]',
    gap: 'gap-[var(--bridges-position-gap-xs)]',
    separatorPad: 'pb-[var(--bridges-position-padding-xs)]',
  },
} as const;

/**
 * ## Rôle
 * Champ **compact pour panneau latéral** (≥ 220 px) : libellé en petites capitales, puis la valeur
 * — en lecture (texte) ou en édition (champ texte, zone multiligne ou liste déroulante native, 28 px
 * de haut). Un séparateur fin sous chaque champ (`separator`, actif par défaut) rythme le panneau.
 *
 * ## Taille (`size`)
 * - **`md`** (défaut) : valeur et contrôles en 14 px, contrôles de 28 px de haut.
 * - **`sm`** : panneaux denses — valeur et contrôles (texte, zone multiligne, liste, lecture) en 12 px,
 *   contrôles de 24 px de haut (icône `lg` du kit), chevron 12 px, espacements réduits. Le libellé reste
 *   en petites capitales 10 px dans les deux tailles.
 * L'hôte expose `data-size` (`md` | `sm`).
 *
 * Même composant pour « Détail » et « Modifier » : on bascule `mode` sans changer la mise en page.
 *
 * Champ de formulaire (`formControl`, `formControlName`, `ngModel`) ; valeur `value` (↔, chaîne).
 * En lecture, une liste affiche le libellé de l'option, une valeur vide affiche `emptyText`.
 */
@Component({
  selector: 'soc-labs-compact-field',
  standalone: true,
  imports: [LucideChevronDown],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [provideLabsFormControl(() => SocLabsCompactField)],
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
    '[attr.data-size]': 'size()',
  },
  template: `
    @if (mode() === 'edit') {
      <label [attr.for]="controlId()" [class]="labelClass">{{ label() }}</label>
      @switch (control()) {
        @case ('textarea') {
          <textarea
            [id]="controlId()"
            [rows]="rows()"
            [value]="value()"
            [attr.placeholder]="placeholder() ?? null"
            [disabled]="isDisabled()"
            (input)="value.set($any($event.target).value)"
            (blur)="onTouched()"
            [class]="textareaClass()"
          ></textarea>
        }
        @case ('select') {
          <span class="relative flex w-full min-w-0">
            <select
              [id]="controlId()"
              [disabled]="isDisabled()"
              (change)="value.set($any($event.target).value)"
              (blur)="onTouched()"
              [class]="selectClass()"
            >
              @if (placeholder() || !selectedOption()) {
                <option value="" [selected]="!selectedOption()" disabled>{{ placeholder() ?? '' }}</option>
              }
              @for (option of options(); track option.value) {
                <option [value]="option.value" [selected]="option.value === value()">{{ option.label }}</option>
              }
            </select>
            <svg
              lucideChevronDown
              aria-hidden="true"
              [class]="chevronClass()"
              [strokeWidth]="2"
            ></svg>
          </span>
        }
        @default {
          <input
            type="text"
            [id]="controlId()"
            [value]="value()"
            [attr.placeholder]="placeholder() ?? null"
            [disabled]="isDisabled()"
            (input)="value.set($any($event.target).value)"
            (blur)="onTouched()"
            [class]="inputClass()"
          />
        }
      }
    } @else {
      <span [id]="controlId() + '-label'" [class]="labelClass">{{ label() }}</span>
      <p
        [attr.aria-labelledby]="controlId() + '-label'"
        [class]="readText().empty ? readClass() + ' text-[var(--bridges-color-text-tertiary)]' : readClass() + ' text-[var(--bridges-color-text-primary)]'"
      >{{ readText().text }}</p>
    }
  `,
})
export class SocLabsCompactField extends SocLabsFormControl<string> {
  readonly label = input.required<string>();
  readonly mode = input<LabsCompactFieldMode>('read');
  readonly control = input<LabsCompactFieldControl>('text');
  readonly value = model('');
  /** Options de la liste déroulante (`control="select"`). */
  readonly options = input<LabsCompactFieldOption[]>([]);
  readonly placeholder = input<string>();
  /** Texte affiché en lecture quand la valeur est vide. */
  readonly emptyText = input('—');
  readonly rows = input(3);
  readonly separator = input(true, { transform: booleanAttribute });
  /** Id du contrôle natif (sinon généré). */
  readonly id = input<string>();
  /** `md` (défaut, 14 px) ou `sm` (12 px, contrôles de 24 px) pour les panneaux denses. */
  readonly size = input<LabsCompactFieldSize>('md');

  protected readonly valueModel = this.value;
  protected readonly labelClass = labsOverlineText;
  private readonly sz = computed(() => SIZES[this.size()] ?? SIZES.md);
  protected readonly inputClass = computed(() => `${controlBase} ${this.sz().text} ${this.sz().padX} ${this.sz().height}`);
  protected readonly selectClass = computed(
    () => `${controlBase} ${this.sz().text} ${this.sz().padX} ${this.sz().height} appearance-none ${this.sz().selectPadRight} truncate`,
  );
  protected readonly textareaClass = computed(() => `${controlBase} ${this.sz().text} ${this.sz().padX} resize-y ${this.sz().textareaPadY} ${this.sz().leading}`);
  protected readonly chevronClass = computed(
    () =>
      `pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--bridges-color-icon-secondary)] ${this.sz().chevron}`,
  );
  protected readonly readClass = computed(
    () => `whitespace-pre-line break-words [font-family:var(--bridges-shape-text-body-font)] ${this.sz().text} ${this.sz().leading}`,
  );

  private readonly generatedId = nextLabsId('soc-labs-compact-field');
  protected readonly controlId = computed(() => this.id() ?? this.generatedId);
  protected readonly selectedOption = computed(() => this.options().find((o) => o.value === this.value()));
  protected readonly readText = computed(() => {
    const text = this.control() === 'select' ? (this.selectedOption()?.label ?? this.value()) : this.value();
    return text ? { text, empty: false } : { text: this.emptyText(), empty: true };
  });
  protected readonly hostClasses = computed(
    () =>
      `flex w-full min-w-0 flex-col ${this.sz().gap} ${this.separator() ? `border-b-[length:var(--bridges-shape-line-hairline)] border-[var(--bridges-color-border-subtle)] ${this.sz().separatorPad}` : ''}`,
  );

  protected coerce(value: unknown): string {
    return value == null ? '' : String(value);
  }
}
