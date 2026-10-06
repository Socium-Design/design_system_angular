import { ChangeDetectionStrategy, Component, DestroyRef, Injector, ViewEncapsulation, afterNextRender, booleanAttribute, computed, inject, input, model, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { provideFormControl } from '../../internal/form-control';

/** Same structural GAP-DECISION as Checkbox — see that component's own docstring, not repeated
 * here. Maps 1:1 to "Index/Contrôleur/Radio/*" tokens — see
 * packages/tokens/tokens/components/contrôleur.json in design_system (React reference repo, read
 * only). Unlike Checkbox/Switch, React's `RadioButton` has no internal `useState`/`defaultSelected`
 * at all — purely controlled (`selected` prop + `onSelect` callback) — so this is a plain
 * `input()` + `output()` pair, no `model()`/uncontrolled-fallback needed.
 */
@Component({
  selector: 'soc-radio-button',
  standalone: true,
  providers: [provideFormControl(() => SocRadioButton)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // `id` targets the inner control (the `<label for>` target), like React — a static `id="…"` on
  // the element would otherwise also land on this host as a duplicate DOM id.
  host: { '[attr.id]': 'null' },
  template: `
    <label [for]="id()" [class]="hostClass()">
      <button
        [id]="id()"
        type="button"
        role="radio"
        [name]="name()"
        [attr.aria-checked]="selected()"
        [disabled]="isDisabled()"
        (click)="handleClick()"
        (blur)="onTouched()"
        [class]="buttonClass()"
      >
        @if (selected()) {
          <span [class]="dotClass()"></span>
        }
      </button>
      @if (label()) {
        <span class="text-[var(--bridges-color-text-primary)]">{{ label() }}</span>
      }
    </label>
  `,
})
export class SocRadioButton implements ControlValueAccessor {
  /** Controlled like React (`selected` + `(select)`), but a `model()` so a form can drive it too. */
  readonly selected = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly label = input<string>();
  readonly name = input<string>();
  readonly id = input<string>();
  readonly select = output<void>();

  /** Forms: the value this radio stands for. Give every radio of a group the same `formControlName`/
   * `[formControl]`/`ngModel` and its own `value` — the group's value selects the matching radio, and
   * clicking one writes its `value` back to the control (the standard pattern for custom radios). */
  readonly value = input<unknown>();

  private onChange: (value: unknown) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    // Angular only calls `writeValue` on the radio that was clicked (the one whose view changed the
    // control); its siblings sharing the same FormControl hear nothing (native radios use a
    // dedicated registry for this). Listening to the control itself keeps the whole group in sync.
    // Deferred: `NgControl` injects this accessor, and the control is only attached once the form
    // directive has initialised.
    const injector = inject(Injector);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const control = injector.get(NgControl, null)?.control;
      control?.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe((groupValue) => this.writeValue(groupValue));
    });
  }

  protected handleClick(): void {
    if (this.isDisabled()) return;
    this.selected.set(true);
    this.select.emit();
    this.onChange(this.value());
  }

  writeValue(groupValue: unknown): void {
    this.selected.set(this.value() !== undefined && groupValue === this.value());
  }
  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected readonly hostClass = computed(() => `inline-flex items-center gap-2 ${this.isDisabled() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`);

  protected readonly buttonClass = computed(() => {
    const base = 'group flex size-[var(--index-contrôleur-radio-size)] shrink-0 items-center justify-center rounded-full border-[length:var(--index-contrôleur-radio-stroke-weight)] transition-colors disabled:cursor-not-allowed';
    if (this.isDisabled()) {
      return `${base} ${this.selected() ? 'border-[var(--index-contrôleur-radio-dot-selected-disabled)]' : 'border-[var(--index-contrôleur-radio-dot-disabled)]'}`;
    }
    return `${base} ${
      this.selected()
        ? 'border-[var(--index-contrôleur-radio-dot-selected)] hover:border-[var(--index-contrôleur-radio-dot-selected-hover)] active:border-[var(--index-contrôleur-radio-dot-selected-pressed)]'
        : 'border-[var(--index-contrôleur-radio-dot-default)] hover:border-[var(--index-contrôleur-radio-dot-hover)] active:border-[var(--index-contrôleur-radio-dot-pressed)]'
    }`;
  });

  protected readonly dotClass = computed(
    () =>
      `size-[var(--index-contrôleur-radio-dot-size)] rounded-full transition-colors ${
        this.isDisabled()
          ? 'bg-[var(--index-contrôleur-radio-dot-selected-disabled)]'
          : 'bg-[var(--index-contrôleur-radio-dot-selected)] group-hover:bg-[var(--index-contrôleur-radio-dot-selected-hover)] group-active:bg-[var(--index-contrôleur-radio-dot-selected-pressed)]'
      }`,
  );
}
