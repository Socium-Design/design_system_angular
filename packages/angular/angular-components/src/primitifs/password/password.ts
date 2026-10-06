import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, signal } from '@angular/core';
import { LucideEye, LucideEyeOff, LucideInfo } from '@lucide/angular';
import { nextUniqueId } from '../../internal/unique-id';

/** Same structural GAP-DECISION as InputText — see that component's own docstring, not repeated
 * here. Maps 1:1 to "Index/Input/Input password/*" tokens — see
 * packages/tokens/tokens/components/input.json in design_system (React reference repo, read
 * only). The show/hide toggle is local component state (a plain `signal`), same as React's own
 * `useState` — not exposed as an input/output, nothing outside this component needs to know or
 * control it.
 */
@Component({
  selector: 'soc-password',
  standalone: true,
  imports: [LucideEye, LucideEyeOff, LucideInfo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'flex w-full flex-col gap-[var(--index-input-input-password-label-gap)]',
  },
  template: `
    @if (label()) {
      <label [for]="inputId" [class]="labelClass()">
        {{ label() }}
        @if (required()) {
          <span class="text-[var(--index-input-input-password-required-color)]"> *</span>
        }
      </label>
    }
    <div [class]="fieldClass()">
      <input
        [id]="inputId"
        [type]="visible() ? 'text' : 'password'"
        [disabled]="disabled()"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
        class="w-full min-w-0 flex-1 bg-transparent text-[var(--index-input-input-password-value-color)] outline-none placeholder:text-[var(--index-input-input-password-placeholder-color)] disabled:cursor-not-allowed [font-family:var(--index-input-input-password-value-font-family)] [font-weight:var(--index-input-input-password-value-font-weight)] text-[length:var(--index-input-input-password-value-font-size)]"
      />
      <button
        type="button"
        [disabled]="disabled()"
        (click)="visible.set(!visible())"
        [attr.aria-label]="visible() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
        class="size-[var(--index-input-input-password-icon-field-size)] shrink-0 text-[var(--index-input-input-password-toggle-icon)] disabled:cursor-not-allowed disabled:text-[var(--index-input-input-password-toggle-icon-disabled)]"
      >
        @if (visible()) {
          <svg lucideEyeOff class="size-full" [strokeWidth]="eyeThickness"></svg>
        } @else {
          <svg lucideEye class="size-full" [strokeWidth]="eyeThickness"></svg>
        }
      </button>
    </div>
    @if (helperText()) {
      <div class="flex items-center gap-[var(--index-input-input-password-helper-gap)]">
        <span [class]="error() ? 'size-3.5 shrink-0 text-[var(--index-input-input-password-icon-helper-error)]' : 'size-3.5 shrink-0 text-[var(--index-input-input-password-icon-helper)]'">
          <svg lucideInfo class="size-full" [strokeWidth]="helpIconThickness"></svg>
        </span>
        <span [class]="helperTextClass()">{{ helperText() }}</span>
      </div>
    }
  `,
})
export class SocPassword {
  readonly label = input<string>();
  readonly required = input(false);
  readonly error = input(false);
  readonly helperText = input<string>();
  readonly disabled = input(false);
  readonly value = model('');

  protected readonly visible = signal(false);
  protected readonly inputId = nextUniqueId('soc-password');
  protected readonly helpIconThickness = 'var(--index-input-input-password-icon-help-thickness)';
  protected readonly eyeThickness = 'var(--index-input-input-password-icon-eye-thickness)';

  protected readonly labelClass = computed(
    () =>
      `[font-family:var(--index-input-input-password-label-font-family)] [font-weight:var(--index-input-input-password-label-font-weight)] text-[length:var(--index-input-input-password-label-font-size)] ${this.disabled() ? 'text-[var(--index-input-input-password-label-color-disabled)]' : 'text-[var(--index-input-input-password-label-color)]'}`,
  );

  protected readonly fieldClass = computed(
    () =>
      `flex w-full items-center gap-2 rounded-[var(--index-input-input-password-field-radius)] border-[length:var(--index-input-input-password-field-stroke-width)] bg-[var(--index-input-input-password-field-bg)] ${this.disabled() ? 'opacity-[var(--index-input-input-password-disabled-opacity)]' : ''} ${
        this.error()
          ? 'border-[var(--index-input-input-password-field-stroke-error)]'
          : 'border-[var(--index-input-input-password-field-stroke)] hover:border-[var(--index-input-input-password-field-stroke-pressed)] has-[:focus]:border-[var(--index-input-input-password-field-stroke-focus)]'
      } px-[var(--index-input-input-password-field-pad-h)] py-[var(--index-input-input-password-field-pad-v)]`,
  );

  protected readonly helperTextClass = computed(
    () =>
      `[font-family:var(--index-input-input-password-help-font-family)] [font-weight:var(--index-input-input-password-help-font-weight)] text-[length:var(--index-input-input-password-helper-font-size)] ${this.error() ? 'text-[var(--index-input-input-password-helper-color-error)]' : 'text-[var(--index-input-input-password-helper-color)]'}`,
  );
}
