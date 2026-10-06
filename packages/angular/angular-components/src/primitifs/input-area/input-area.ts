import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, effect, input, model, viewChild } from '@angular/core';
import { LucideInfo } from '@lucide/angular';
import { SocTextFieldBase, provideFormControl } from '../../internal/form-control';
import { nextUniqueId } from '../../internal/unique-id';

/** Same structural GAP-DECISION as InputText — see that component's own docstring, not repeated
 * here. Maps 1:1 to "Index/Input/Input area/*" tokens — see
 * packages/tokens/tokens/components/input.json in design_system (React reference repo, read
 * only). Grows with its content (auto-height) instead of scrolling internally, same as React's
 * own `useLayoutEffect` — done here with `viewChild` + `effect()` instead, reading `value()` so it
 * re-measures on every change exactly like React's `[value]` dependency array.
 */
@Component({
  selector: 'soc-input-area',
  standalone: true,
  imports: [LucideInfo],
  providers: [provideFormControl(() => SocInputArea)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'flex w-full flex-col gap-[var(--index-input-input-area-label-gap)]',
  },
  template: `
    @if (label()) {
      <label [for]="inputId" [class]="labelClass()">
        {{ label() }}
        @if (required()) {
          <span class="text-[var(--index-input-input-area-required-color)]"> *</span>
        }
      </label>
    }
    <div [class]="fieldClass()">
      <textarea
        #textareaEl
        [id]="inputId"
        [attr.name]="name()"
        [attr.autocomplete]="autocomplete()"
        [attr.maxlength]="maxlength()"
        [readOnly]="readonly()"
        [disabled]="disabled()"
        [required]="required()"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
        (blur)="onTouched()"
        [rows]="rows()"
        [placeholder]="placeholder() ?? ''"
        [class]="inputClass()"
        class="w-full min-w-0 flex-1 resize-none bg-transparent text-[var(--index-input-input-area-value-color)] outline-none placeholder:text-[var(--index-input-input-area-placeholder-color)] disabled:cursor-not-allowed [font-family:var(--index-input-input-area-value-font-family)] [font-weight:var(--index-input-input-area-value-font-weight)] text-[length:var(--index-input-input-area-value-font-size)]"
      ></textarea>
    </div>
    @if (helperText()) {
      <div class="flex items-center gap-[var(--index-input-input-area-helper-gap)]">
        <span [class]="error() ? 'size-3.5 shrink-0 text-[var(--index-input-input-area-icon-helper-error)]' : 'size-3.5 shrink-0 text-[var(--index-input-input-area-icon-helper)]'">
          <svg lucideInfo class="size-full" [strokeWidth]="helpIconThickness"></svg>
        </span>
        <span [class]="helperTextClass()">{{ helperText() }}</span>
      </div>
    }
  `,
})
export class SocInputArea extends SocTextFieldBase<string> {
  readonly rows = input(3);
  readonly maxlength = input<number>();
  readonly value = model('');

  protected readonly valueModel = this.value;
  protected nativeField = () => this.textareaRef()?.nativeElement;
  protected coerce(value: unknown): string {
    return value == null ? '' : String(value);
  }

  private readonly generatedId = nextUniqueId('soc-input-area');
  protected get inputId(): string {
    return this.id() ?? this.generatedId;
  }
  protected readonly helpIconThickness = 'var(--index-input-input-area-icon-help-thickness)';

  private readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textareaEl');

  constructor() {
    super();
    effect(() => {
      this.value();
      const el = this.textareaRef()?.nativeElement;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    });
  }

  protected readonly labelClass = computed(
    () =>
      `[font-family:var(--index-input-input-area-label-font-family)] [font-weight:var(--index-input-input-area-label-font-weight)] text-[length:var(--index-input-input-area-label-font-size)] ${this.disabled() ? 'text-[var(--index-input-input-area-label-color-disabled)]' : 'text-[var(--index-input-input-area-label-color)]'}`,
  );

  protected readonly fieldClass = computed(
    () =>
      `flex w-full rounded-[var(--index-input-input-area-field-radius)] border-[length:var(--index-input-input-area-field-stroke-width)] bg-[var(--index-input-input-area-field-bg)] px-[var(--index-input-input-area-field-pad-h)] py-[var(--index-input-input-area-field-pad-v)] ${this.disabled() ? 'opacity-[var(--index-input-input-area-disabled-opacity)]' : ''} ${
        this.error()
          ? 'border-[var(--index-input-input-area-field-stroke-error)]'
          : 'border-[var(--index-input-input-area-field-stroke)] hover:border-[var(--index-input-input-area-field-stroke-pressed)] has-[:focus]:border-[var(--index-input-input-area-field-stroke-focus)]'
      }`,
  );

  protected readonly helperTextClass = computed(
    () =>
      `[font-family:var(--index-input-input-area-help-font-family)] [font-weight:var(--index-input-input-area-help-font-weight)] text-[length:var(--index-input-input-area-helper-font-size)] ${this.error() ? 'text-[var(--index-input-input-area-helper-color-error)]' : 'text-[var(--index-input-input-area-helper-color)]'}`,
  );
}
