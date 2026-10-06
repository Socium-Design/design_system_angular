import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, effect, input, model, viewChild } from '@angular/core';
import { LucideInfo } from '@lucide/angular';
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
        [disabled]="disabled()"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
        [rows]="rows()"
        [placeholder]="placeholder()"
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
export class SocInputArea {
  readonly label = input<string>();
  readonly required = input(false);
  readonly error = input(false);
  readonly helperText = input<string>();
  readonly disabled = input(false);
  readonly placeholder = input<string>();
  readonly rows = input(3);
  readonly value = model('');

  protected readonly inputId = nextUniqueId('soc-input-area');
  protected readonly helpIconThickness = 'var(--index-input-input-area-icon-help-thickness)';

  private readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textareaEl');

  constructor() {
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
