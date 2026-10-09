import { Directive, ModelSignal, Provider, Type, booleanAttribute, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { OutputRefSubscription } from '@angular/core';

/**
 * Copy of the kit's `SocFormControl` (`src/internal/form-control.ts`), which is internal and not
 * exported by the primary entry point — a secondary entry point can only import the primary through
 * its public API. Same contract: the `model()` stays the source of truth, `writeValue` mutes the
 * change stream, `disabled` is an input OR'ed with the form's own state. On promotion to the kit, a
 * Labs component switches to the kit's base class and this file goes away.
 */
export function provideLabsFormControl(type: () => Type<unknown>): Provider {
  return { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(type), multi: true };
}

@Directive()
export abstract class SocLabsFormControl<T> implements ControlValueAccessor {
  protected abstract readonly valueModel: ModelSignal<T>;

  readonly disabled = input(false, { transform: booleanAttribute });
  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected onTouched: () => void = () => {};
  private writing = false;
  private subscription?: OutputRefSubscription;

  protected abstract coerce(value: unknown): T;

  writeValue(value: unknown): void {
    this.writing = true;
    try {
      this.valueModel.set(this.coerce(value));
    } finally {
      this.writing = false;
    }
  }

  registerOnChange(fn: (value: T) => void): void {
    this.subscription?.unsubscribe();
    this.subscription = this.valueModel.subscribe((value) => {
      if (!this.writing) fn(value);
    });
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
