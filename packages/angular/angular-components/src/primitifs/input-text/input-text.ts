import { ChangeDetectionStrategy, Component, Directive, ElementRef, ViewEncapsulation, computed, contentChild, input, model, viewChild } from '@angular/core';
import { LucideInfo } from '@lucide/angular';
import { SocTextFieldBase, provideFormControl } from '../../internal/form-control';
import { nextUniqueId } from '../../internal/unique-id';

/** GAP-DECISION (flagged, not decided silently): the migration spec's rule says text-input-like
 * primitives should be attribute selectors on the native element, for free native
 * attribute/event passthrough. That works for `Button` (a `<button>` can have projected content
 * around it inside its own tag), but `InputText` — read from the real source before writing this —
 * isn't a thin wrapper around a bare `<input>`: it renders a `<label>` BEFORE the field and a
 * helper-text row AFTER it, around a bordered container with icon slots. An attribute-selector
 * component's template can only fill the CONTENT of the element it decorates, and `<input>` is a
 * void element — it can't have any injected content at all, so there is no way to make an
 * attribute selector on `<input>` also render a sibling `<label>`/helper text. Used a wrapper
 * component instead (`soc-input-text`). What an attribute selector would have given for free is
 * rebuilt explicitly (see `SocTextFieldBase`): dedicated inputs for `id`/`name`/`autocomplete`/
 * `readonly`/`maxlength`, `inputClass` (React's `className` on the `<input>`), and `inputAttrs`
 * for any other native attribute; it is also a `ControlValueAccessor` (`formControl`,
 * `formControlName`, `ngModel`). Same shape applies to InputArea, InputNumber, Password.
 */
@Directive({ selector: '[socInputTextLeftIcon]', standalone: true })
export class SocInputTextLeftIcon {}

@Directive({ selector: '[socInputTextRightIcon]', standalone: true })
export class SocInputTextRightIcon {}

/** Maps 1:1 to "Index/Input/Input text/*" tokens — see packages/tokens/tokens/components/input.json
 * in design_system (React reference repo, read only). */
@Component({
  selector: 'soc-input-text',
  standalone: true,
  imports: [LucideInfo, SocInputTextLeftIcon, SocInputTextRightIcon],
  providers: [provideFormControl(() => SocInputText)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'flex w-full flex-col gap-[var(--index-input-input-text-label-gap)]',
  },
  template: `
    @if (label()) {
      <label [for]="inputId" [class]="labelClass()">
        {{ label() }}
        @if (required()) {
          <span class="text-[var(--index-input-input-text-required-color)]"> *</span>
        }
      </label>
    }
    <div [class]="fieldClass()">
      @if (hasLeftIcon()) {
        <span class="size-4 shrink-0 text-[var(--index-input-input-text-icon-helper)]">
          <ng-content select="[socInputTextLeftIcon]" />
        </span>
      }
      <input
        #field
        [id]="inputId"
        [type]="type()"
        [attr.name]="name()"
        [attr.autocomplete]="autocomplete()"
        [attr.maxlength]="maxlength()"
        [readOnly]="readonly()"
        [placeholder]="placeholder() ?? ''"
        [disabled]="disabled()"
        [required]="required()"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
        (blur)="onTouched()"
        [class]="inputClass()"
        class="w-full min-w-0 flex-1 bg-transparent text-[var(--index-input-input-text-value-color)] outline-none placeholder:text-[var(--index-input-input-text-placeholder-color)] disabled:cursor-not-allowed [font-family:var(--index-input-input-text-value-font-family)] [font-weight:var(--index-input-input-text-value-font-weight)] text-[length:var(--index-input-input-text-value-font-size)]"
      />
      @if (hasRightIcon()) {
        <span class="size-4 shrink-0 text-[var(--index-input-input-text-icon-helper)]">
          <ng-content select="[socInputTextRightIcon]" />
        </span>
      }
    </div>
    @if (helperText()) {
      <div class="flex items-center gap-[var(--index-input-input-text-helper-gap)]">
        <span [class]="error() ? 'size-3.5 shrink-0 text-[var(--index-input-input-text-icon-helper-error)]' : 'size-3.5 shrink-0 text-[var(--index-input-input-text-icon-helper)]'">
          <svg lucideInfo class="size-full" [strokeWidth]="helpIconThickness"></svg>
        </span>
        <span [class]="helperTextClass()">{{ helperText() }}</span>
      </div>
    }
  `,
})
export class SocInputText extends SocTextFieldBase<string> {
  readonly type = input('text');
  readonly maxlength = input<number>();
  /** The one property that actually needs two-way sync — `model()` gives `[(value)]` plus a
   * `valueChange` output for free, the Angular equivalent of React's `value`+`onChange` pair
   * (or `defaultValue` for the uncontrolled case, via the initial signal value). */
  readonly value = model('');

  protected readonly valueModel = this.value;
  private readonly fieldRef = viewChild<ElementRef<HTMLInputElement>>('field');
  protected nativeField = () => this.fieldRef()?.nativeElement;
  protected coerce(value: unknown): string {
    return value == null ? '' : String(value);
  }

  private readonly generatedId = nextUniqueId('soc-input-text');
  protected get inputId(): string {
    return this.id() ?? this.generatedId;
  }
  protected readonly helpIconThickness = 'var(--index-input-input-text-icon-help-thickness)';

  private readonly leftIconContent = contentChild(SocInputTextLeftIcon);
  private readonly rightIconContent = contentChild(SocInputTextRightIcon);
  protected readonly hasLeftIcon = computed(() => !!this.leftIconContent());
  protected readonly hasRightIcon = computed(() => !!this.rightIconContent());

  protected readonly labelClass = computed(
    () =>
      `[font-family:var(--index-input-input-text-label-font-family)] [font-weight:var(--index-input-input-text-label-font-weight)] text-[length:var(--index-input-input-text-label-font-size)] ${this.disabled() ? 'text-[var(--index-input-input-text-label-color-disabled)]' : 'text-[var(--index-input-input-text-label-color)]'}`,
  );

  protected readonly fieldClass = computed(
    () =>
      `flex w-full items-center gap-2 rounded-[var(--index-input-input-text-field-radius)] border-[length:var(--index-input-input-text-field-stroke-width)] bg-[var(--index-input-input-text-field-bg)] px-[var(--index-input-input-text-field-pad-h)] py-[var(--index-input-input-text-field-pad-v)] has-[:disabled]:opacity-[var(--index-input-input-text-disabled-opacity)] ${
        this.error()
          ? 'border-[var(--index-input-input-text-field-stroke-error)]'
          : 'border-[var(--index-input-input-text-field-stroke)] hover:border-[var(--index-input-input-text-field-stroke-pressed)] has-[:focus]:border-[var(--index-input-input-text-field-stroke-focus)]'
      }`,
  );

  protected readonly helperTextClass = computed(
    () =>
      `[font-family:var(--index-input-input-text-help-font-family)] [font-weight:var(--index-input-input-text-help-font-weight)] text-[length:var(--index-input-input-text-helper-font-size)] ${this.error() ? 'text-[var(--index-input-input-text-helper-color-error)]' : 'text-[var(--index-input-input-text-helper-color)]'}`,
  );
}
