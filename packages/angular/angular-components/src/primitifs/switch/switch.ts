import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model } from '@angular/core';
import { SocFormControl, provideFormControl } from '../../internal/form-control';
import { nextUniqueId } from '../../internal/unique-id';

export type SwitchSize = 'sm' | 'md' | 'lg';

const trackSizeClasses: Record<SwitchSize, string> = {
  sm: 'h-[var(--index-contrôleur-switch-track-h-sm)] w-[var(--index-contrôleur-switch-track-w-sm)]',
  md: 'h-[var(--index-contrôleur-switch-track-h-md)] w-[var(--index-contrôleur-switch-track-w-md)]',
  lg: 'h-[var(--index-contrôleur-switch-track-h-lg)] w-[var(--index-contrôleur-switch-track-w-lg)]',
};

const thumbSizeClasses: Record<SwitchSize, string> = {
  sm: 'size-[var(--index-contrôleur-switch-thumb-sm)]',
  md: 'size-[var(--index-contrôleur-switch-thumb-md)]',
  lg: 'size-[var(--index-contrôleur-switch-thumb-lg)]',
};

const thumbTranslateClasses: Record<SwitchSize, string> = {
  sm: 'translate-x-[calc(var(--index-contrôleur-switch-track-w-sm)-var(--index-contrôleur-switch-thumb-sm)-2*var(--index-contrôleur-switch-track-padding))]',
  md: 'translate-x-[calc(var(--index-contrôleur-switch-track-w-md)-var(--index-contrôleur-switch-thumb-md)-2*var(--index-contrôleur-switch-track-padding))]',
  lg: 'translate-x-[calc(var(--index-contrôleur-switch-track-w-lg)-var(--index-contrôleur-switch-thumb-lg)-2*var(--index-contrôleur-switch-track-padding))]',
};

/** Same structural GAP-DECISION as Checkbox — see that component's own docstring, not repeated
 * here. Maps 1:1 to "Index/Contrôleur/Switch/*" tokens — see
 * packages/tokens/tokens/components/contrôleur.json in design_system (React reference repo, read
 * only).
 */
@Component({
  selector: 'soc-switch',
  standalone: true,
  providers: [provideFormControl(() => SocSwitch)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // `id` targets the inner control (the `<label for>` target), like React — a static `id="…"` on
  // the element would otherwise also land on this host as a duplicate DOM id.
  host: { '[attr.id]': 'null' },
  template: `
    <label [for]="switchId" [class]="hostClass()">
      <button
        [id]="switchId"
        type="button"
        role="switch"
        [attr.aria-checked]="checked()"
        [disabled]="isDisabled()"
        (click)="toggle()"
        (blur)="onTouched()"
        class="inline-flex shrink-0 items-center justify-center rounded-[var(--index-contrôleur-switch-radius-track)] p-[var(--index-contrôleur-switch-outer-padding)] focus-visible:outline-none focus-visible:ring-[length:var(--index-contrôleur-switch-border-focus-stroke)] focus-visible:ring-[var(--index-contrôleur-switch-border-focus-color)]"
      >
        <span [class]="trackClass()">
          <span [class]="thumbClass()"></span>
        </span>
      </button>
      @if (label()) {
        <span class="text-[var(--bridges-color-text-primary)]">{{ label() }}</span>
      }
    </label>
  `,
})
export class SocSwitch extends SocFormControl<boolean> {
  readonly checked = model(false);
  readonly size = input<SwitchSize>('sm');

  protected readonly valueModel = this.checked;
  protected coerce(value: unknown): boolean {
    return !!value;
  }
  readonly label = input<string>();
  readonly id = input<string>();

  private readonly generatedId = nextUniqueId('soc-switch');
  protected get switchId(): string {
    return this.id() ?? this.generatedId;
  }

  protected toggle(): void {
    if (this.isDisabled()) return;
    this.checked.set(!this.checked());
  }

  protected readonly hostClass = computed(
    () =>
      `inline-flex items-center gap-2 ${this.isDisabled() ? `cursor-not-allowed opacity-[var(--index-contrôleur-switch-opacity-disabled)]` : 'cursor-pointer'}`,
  );

  protected readonly trackClass = computed(
    () =>
      `relative flex shrink-0 items-center rounded-[var(--index-contrôleur-switch-radius-track)] p-[var(--index-contrôleur-switch-track-padding)] transition-colors ${trackSizeClasses[this.size()]} ${
        this.checked()
          ? 'bg-[var(--index-contrôleur-switch-track-on-default)] hover:bg-[var(--index-contrôleur-switch-track-on-hover)] active:bg-[var(--index-contrôleur-switch-track-on-pressed)]'
          : 'bg-[var(--index-contrôleur-switch-track-off-default)] hover:bg-[var(--index-contrôleur-switch-track-off-hover)] active:bg-[var(--index-contrôleur-switch-track-off-pressed)]'
      }`,
  );

  protected readonly thumbClass = computed(
    () =>
      `block shrink-0 rounded-full bg-[var(--index-contrôleur-switch-thumb-fill)] transition-transform ${thumbSizeClasses[this.size()]} ${this.checked() ? thumbTranslateClasses[this.size()] : 'translate-x-0'}`,
  );
}
