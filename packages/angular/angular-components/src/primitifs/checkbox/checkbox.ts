import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import { SocFormControl, provideFormControl } from '../../internal/form-control';
import { nextUniqueId } from '../../internal/unique-id';

/** GAP-DECISION (flagged, not decided silently): the migration spec's rule for Checkbox was
 * "attribute selector on `input[type=checkbox]`". Read the real React source before writing
 * anything — Checkbox.tsx does NOT use a native `<input type="checkbox">` at all: it's a
 * `<button role="checkbox" aria-checked>` wrapped in a `<label>`, with an optional sibling
 * `<span>` for the label text. Same "can't render siblings from inside an attribute selector"
 * problem as InputText's whole family (see that component's own docstring) — the `<label>`
 * wrapper and text span sit OUTSIDE the button. Wrapper component instead (`soc-checkbox`), self-
 * contained the same way React's `Checkbox` is (its own `label` prop, not something the consumer
 * assembles by hand). Same reasoning applies to RadioButton and Switch, not repeated on each.
 *
 * Maps 1:1 to "Index/Contrôleur/Checkbox/*" tokens — see packages/tokens/tokens/components/contrôleur.json
 * in design_system (React reference repo, read only). Figma only defines unchecked/checked (no
 * indeterminate variant yet), same as React.
 */
@Component({
  selector: 'soc-checkbox',
  standalone: true,
  imports: [LucideCheck],
  providers: [provideFormControl(() => SocCheckbox)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // `id` targets the inner control (the `<label for>` target), like React — a static `id="…"` on
  // the element would otherwise also land on this host as a duplicate DOM id.
  host: { '[attr.id]': 'null' },
  template: `
    <label [for]="checkboxId" [class]="hostClass()">
      <button
        [id]="checkboxId"
        type="button"
        role="checkbox"
        [attr.aria-checked]="checked()"
        [disabled]="isDisabled()"
        (click)="toggle()"
        (blur)="onTouched()"
        [class]="buttonClass()"
      >
        @if (checked()) {
          <svg lucideCheck [class]="isDisabled() ? 'text-[var(--index-contrôleur-checkbox-check-disabled)]' : 'text-[var(--index-contrôleur-checkbox-check-color)]'" [style.width.px]="14" [style.height.px]="14" [strokeWidth]="2.5"></svg>
        }
      </button>
      @if (label()) {
        <span class="text-[var(--bridges-color-text-primary)]">{{ label() }}</span>
      }
    </label>
  `,
})
export class SocCheckbox extends SocFormControl<boolean> {
  readonly checked = model(false);

  protected readonly valueModel = this.checked;
  protected coerce(value: unknown): boolean {
    return !!value;
  }
  readonly label = input<string>();
  readonly id = input<string>();

  private readonly generatedId = nextUniqueId('soc-checkbox');
  protected get checkboxId(): string {
    return this.id() ?? this.generatedId;
  }

  protected toggle(): void {
    if (this.isDisabled()) return;
    this.checked.set(!this.checked());
  }

  // Applied to both the host and the inner <label> — this component's host IS effectively the
  // label wrapper (no separate outer element), matching React's own root-is-the-label structure.
  protected readonly hostClass = computed(() => `inline-flex items-center gap-2 ${this.isDisabled() ? 'cursor-not-allowed' : 'cursor-pointer'}`);

  protected readonly buttonClass = computed(() => {
    const base =
      'group flex shrink-0 items-center justify-center rounded-[var(--index-contrôleur-checkbox-radius)] border-[length:var(--index-contrôleur-checkbox-stroke-weight)] size-[var(--index-contrôleur-checkbox-size)] transition-colors disabled:cursor-not-allowed';
    if (this.isDisabled()) {
      return `${base} ${
        this.checked()
          ? 'border-[var(--index-contrôleur-checkbox-bg-checked-disabled)] bg-[var(--index-contrôleur-checkbox-bg-checked-disabled)]'
          : 'border-[var(--index-contrôleur-checkbox-stroke-disabled)] bg-[var(--index-contrôleur-checkbox-bg-disabled)]'
      }`;
    }
    return `${base} ${
      this.checked()
        ? 'border-[var(--index-contrôleur-checkbox-bg-checked)] bg-[var(--index-contrôleur-checkbox-bg-checked)] hover:border-[var(--index-contrôleur-checkbox-bg-checked-hover)] hover:bg-[var(--index-contrôleur-checkbox-bg-checked-hover)] active:border-[var(--index-contrôleur-checkbox-bg-checked-pressed)] active:bg-[var(--index-contrôleur-checkbox-bg-checked-pressed)]'
        : 'border-[var(--index-contrôleur-checkbox-stroke-default)] bg-[var(--index-contrôleur-checkbox-bg-default)] hover:bg-[var(--index-contrôleur-checkbox-bg-hover)] active:bg-[var(--index-contrôleur-checkbox-bg-pressed)]'
    }`;
  });
}
