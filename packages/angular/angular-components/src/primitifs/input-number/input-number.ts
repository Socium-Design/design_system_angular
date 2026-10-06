import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, input, model, viewChild } from '@angular/core';
import { LucideInfo, LucideMinus, LucidePlus } from '@lucide/angular';
import { SocTextFieldBase, provideFormControl } from '../../internal/form-control';
import { nextUniqueId } from '../../internal/unique-id';

/** Same structural GAP-DECISION as InputText — see that component's own docstring, not repeated
 * here. Maps 1:1 to "Index/Input/Input number/*" tokens — see
 * packages/tokens/tokens/components/input.json in design_system (React reference repo, read
 * only). `value`/`defaultValue`'s controlled-vs-uncontrolled split in React collapses to a single
 * `model()` here — a signal always holds the current value regardless of whether the consumer
 * binds `[(value)]` or just reads/sets the initial one, so there's no separate "was a value prop
 * given" branch to reproduce.
 */
@Component({
  selector: 'soc-input-number',
  standalone: true,
  imports: [LucideInfo, LucideMinus, LucidePlus],
  providers: [provideFormControl(() => SocInputNumber)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'flex w-full flex-col gap-[var(--index-input-input-number-label-gap)]',
  },
  template: `
    @if (label()) {
      <label [for]="inputId" [class]="labelClass()">
        {{ label() }}
        @if (required()) {
          <span class="text-[var(--index-input-input-number-required-color)]"> *</span>
        }
      </label>
    }
    <div [class]="fieldClass()">
      <input
        #field
        [id]="inputId"
        type="number"
        [attr.name]="name()"
        [attr.autocomplete]="autocomplete()"
        [readOnly]="readonly()"
        [placeholder]="placeholder() ?? ''"
        [required]="required()"
        [disabled]="disabled()"
        [attr.min]="min()"
        [attr.max]="max()"
        [step]="step()"
        [value]="value() ?? ''"
        (change)="handleInputChange($event)"
        (blur)="onTouched()"
        [class]="inputClass()"
        class="w-full min-w-0 flex-1 bg-transparent py-[var(--index-input-input-number-field-pad-v)] pl-[var(--index-input-input-number-field-pad-h)] text-[var(--index-input-input-number-value-color)] outline-none placeholder:text-[var(--index-input-input-number-placeholder-color)] disabled:cursor-not-allowed [font-family:var(--index-input-input-number-value-font-family)] [font-weight:var(--index-input-input-number-value-font-weight)] text-[length:var(--index-input-input-number-value-font-size)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      @if (showSteppers()) {
        <span class="h-6 w-px shrink-0 bg-[var(--index-input-input-number-stepper-border)]"></span>
        <button
          type="button"
          [disabled]="disabled() || readonly() || atMin()"
          (click)="commit((value() ?? 0) - step())"
          aria-label="Diminuer"
          class="flex h-full w-9 shrink-0 items-center justify-center text-[var(--index-input-input-number-stepper-icon)] disabled:cursor-not-allowed disabled:text-[var(--index-input-input-number-stepper-icon-disabled)]"
        >
          <span class="size-4">
            <svg lucideMinus class="size-full" [strokeWidth]="1.5"></svg>
          </span>
        </button>
        <span class="h-6 w-px shrink-0 bg-[var(--index-input-input-number-stepper-border)]"></span>
        <button
          type="button"
          [disabled]="disabled() || readonly() || atMax()"
          (click)="commit((value() ?? 0) + step())"
          aria-label="Augmenter"
          class="flex h-full w-9 shrink-0 items-center justify-center text-[var(--index-input-input-number-stepper-icon)] disabled:cursor-not-allowed disabled:text-[var(--index-input-input-number-stepper-icon-disabled)]"
        >
          <span class="size-4">
            <svg lucidePlus class="size-full" [strokeWidth]="1.5"></svg>
          </span>
        </button>
      }
    </div>
    @if (helperText()) {
      <div class="flex items-center gap-[var(--index-input-input-number-helper-gap)]">
        <span [class]="error() ? 'size-3.5 shrink-0 text-[var(--index-input-input-number-icon-helper-error)]' : 'size-3.5 shrink-0 text-[var(--index-input-input-number-icon-helper)]'">
          <svg lucideInfo class="size-full" [strokeWidth]="helpIconThickness"></svg>
        </span>
        <span [class]="helperTextClass()">{{ helperText() }}</span>
      </div>
    }
  `,
})
export class SocInputNumber extends SocTextFieldBase<number | null> {
  readonly showSteppers = input(true);
  readonly min = input<number>();
  readonly max = input<number>();
  readonly step = input(1);
  /** `null` = empty field (what a form `reset()` produces); React's version is always a number. */
  readonly value = model<number | null>(0);

  protected readonly valueModel = this.value;
  private readonly fieldRef = viewChild<ElementRef<HTMLInputElement>>('field');
  protected nativeField = () => this.fieldRef()?.nativeElement;
  protected coerce(value: unknown): number | null {
    if (value == null || value === '') return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }

  private readonly generatedId = nextUniqueId('soc-input-number');
  protected get inputId(): string {
    return this.id() ?? this.generatedId;
  }
  protected readonly helpIconThickness = 'var(--index-input-input-number-icon-help-thickness)';

  protected readonly atMax = computed(() => this.max() !== undefined && (this.value() ?? 0) >= this.max()!);
  protected readonly atMin = computed(() => this.min() !== undefined && (this.value() ?? 0) <= this.min()!);

  protected commit(next: number): void {
    const max = this.max() ?? Infinity;
    const min = this.min() ?? -Infinity;
    this.value.set(Math.min(max, Math.max(min, next)));
  }

  protected handleInputChange(event: Event): void {
    const next = (event.target as HTMLInputElement).valueAsNumber;
    if (Number.isNaN(next)) this.value.set(null);
    else this.commit(next);
  }

  protected readonly labelClass = computed(
    () =>
      `[font-family:var(--index-input-input-number-label-font-family)] [font-weight:var(--index-input-input-number-label-font-weight)] text-[length:var(--index-input-input-number-label-font-size)] ${this.disabled() ? 'text-[var(--index-input-input-number-label-color-disabled)]' : 'text-[var(--index-input-input-number-label-color)]'}`,
  );

  protected readonly fieldClass = computed(
    () =>
      `flex w-full items-center overflow-hidden rounded-[var(--index-input-input-number-field-radius)] border-[length:var(--index-input-input-number-field-stroke-width)] bg-[var(--index-input-input-number-field-bg)] ${this.disabled() ? 'opacity-[var(--index-input-input-number-disabled-opacity)]' : ''} ${
        this.error()
          ? 'border-[var(--index-input-input-number-field-stroke-error)]'
          : 'border-[var(--index-input-input-number-field-stroke)] hover:border-[var(--index-input-input-number-field-stroke-pressed)] has-[:focus]:border-[var(--index-input-input-number-field-stroke-focus)]'
      }`,
  );

  protected readonly helperTextClass = computed(
    () =>
      `[font-family:var(--index-input-input-number-help-font-family)] [font-weight:var(--index-input-input-number-help-font-weight)] text-[length:var(--index-input-input-number-helper-font-size)] ${this.error() ? 'text-[var(--index-input-input-number-helper-color-error)]' : 'text-[var(--index-input-input-number-helper-color)]'}`,
  );
}
