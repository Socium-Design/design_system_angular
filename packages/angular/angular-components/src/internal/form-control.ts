import { Directive, ModelSignal, Provider, Type, booleanAttribute, computed, effect, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { OutputRefSubscription } from '@angular/core';

/** Registers a component as its own `ControlValueAccessor` (`formControl`, `formControlName`,
 * `ngModel`). `type` is a thunk because the class isn't defined yet where the decorator runs. */
export function provideFormControl(type: () => Type<unknown>): Provider {
  return { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(type), multi: true };
}

/** Plain native attributes forwarded to the inner control — the Angular counterpart of React's
 * `{...props}` spread on `<input>`: anything without a dedicated input (`inputmode`, `pattern`,
 * `aria-*`, `data-*`, `autofocus`, …). `null`/`undefined`/`false` remove the attribute, `true` sets
 * it empty (boolean attribute), anything else is stringified. */
export type NativeAttributes = Record<string, string | number | boolean | null | undefined>;

/** Keeps `attrs()` applied on the element returned by `element()`; call from an injection context. */
export function syncNativeAttributes(element: () => HTMLElement | undefined, attrs: () => NativeAttributes | undefined): void {
  let applied = new Set<string>();
  effect(() => {
    const el = element();
    if (!el) return;
    const next = attrs() ?? {};
    for (const key of applied) if (!(key in next)) el.removeAttribute(key);
    applied = new Set();
    for (const [key, value] of Object.entries(next)) {
      if (value == null || value === false) el.removeAttribute(key);
      else el.setAttribute(key, value === true ? '' : String(value));
      applied.add(key);
    }
  });
}

/**
 * Turns a component whose value already lives in a `model()` into a form control.
 *
 * The model stays the single source of truth (so `[(value)]`/`[(checked)]` keep working exactly as
 * before): `writeValue` sets it with change notification muted, and every *other* write — i.e. a user
 * interaction — is forwarded to the form through the model's own change stream. No template needs to
 * call `onChange` by hand; only `onTouched` is wired to blur/close where it makes sense.
 *
 * `disabled` is the plain input (`[disabled]="x"` or the bare attribute); `isDisabled()` combines it with
 * the state the form writes through `setDisabledState` — templates and computed classes read that one.
 */
@Directive()
export abstract class SocFormControl<T> implements ControlValueAccessor {
  /** The model carrying this control's value (`value`, `checked`, …). */
  protected abstract readonly valueModel: ModelSignal<T>;

  /** `[disabled]` / bare `disabled` attribute. (An `input()` rather than a `model()` so the bare-attribute
   * form works — models can't take a transform.) Templates read `isDisabled()`, not this. */
  readonly disabled = input(false, { transform: booleanAttribute });
  private readonly formDisabled = signal(false);
  /** The input OR'ed with the state the form writes through `setDisabledState`. */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected onTouched: () => void = () => {};
  private writing = false;
  private subscription?: OutputRefSubscription;

  /** Maps whatever the form hands in (`null` after `reset()`, …) onto this control's value type. */
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

/**
 * Shared surface of the label + bordered field + helper-text inputs (`InputText`, `InputArea`,
 * `InputNumber`, `Password`): everything React gets for free from `InputHTMLAttributes` spread.
 *
 * - dedicated inputs for the common native attributes (`id`, `name`, `autocomplete`, `readonly`);
 * - `inputClass` = React's `className` (lands on the inner control; a plain `class` on the host is
 *   React's `wrapperClassName`);
 * - `inputAttrs` = the escape hatch for every other native attribute.
 *
 * `id`/`name` are meant for the inner control, so the host's own copies are cleared — a static
 * `id="…"`/`name="…"` on `<soc-input-text>` would otherwise be a duplicate DOM id and a bogus
 * attribute on a custom element.
 */
@Directive({ host: { '[attr.id]': 'null', '[attr.name]': 'null' } })
export abstract class SocTextFieldBase<T> extends SocFormControl<T> {
  readonly label = input<string>();
  readonly required = input(false, { transform: booleanAttribute });
  readonly error = input(false, { transform: booleanAttribute });
  readonly helperText = input<string>();
  readonly placeholder = input<string>();
  readonly id = input<string>();
  readonly name = input<string>();
  readonly autocomplete = input<string>();
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly inputClass = input<string>();
  readonly inputAttrs = input<NativeAttributes>();

  /** The inner `<input>`/`<textarea>`, for `inputAttrs`. */
  protected abstract readonly nativeField: () => HTMLElement | undefined;

  constructor() {
    super();
    syncNativeAttributes(
      () => this.nativeField(),
      () => this.inputAttrs(),
    );
  }
}
