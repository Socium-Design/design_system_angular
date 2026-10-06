import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, contentChild, input, output } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import {
  SocButtonLeftIcon,
  buttonIconSizeVar,
  buttonPaddingClasses,
  buttonRadiusLeftClasses,
  buttonRadiusRightClasses,
  buttonTypographyClass,
  buttonVariantClasses,
  type ButtonSize,
  type ButtonVariant,
} from './button';

/** Maps 1:1 to "Index/Button/Split/*" tokens — see packages/tokens/tokens/components/button.json
 * in design_system (React reference repo, read only). */
const dividerClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--index-button-split-divider-primary)]',
  secondary: 'bg-[var(--index-button-split-divider-secondary)]',
  tertiary: 'bg-[var(--index-button-split-divider-tertiary)]',
  danger: 'bg-[var(--index-button-split-divider-danger)]',
  ghost: 'bg-[var(--index-button-split-divider-ghost)]',
};

const chevronColorVar: Record<ButtonVariant, string> = {
  primary: 'var(--index-button-split-chevron-color-primary)',
  secondary: 'var(--index-button-split-chevron-color-secondary)',
  tertiary: 'var(--index-button-split-chevron-color-tertiary)',
  danger: 'var(--index-button-split-chevron-color-danger)',
  ghost: 'var(--index-button-split-chevron-color-ghost)',
};

/**
 * Two real `<button>` elements internally (main action + dropdown trigger) — unlike `SocButton`,
 * this can't be a bare attribute selector: its host isn't itself a single clickable button, so
 * native `(click)` doesn't just pass through one level. Exposes `click`/`triggerClick` outputs
 * explicitly instead — matches React `SplitButtonProps` already being its own type rather than
 * extending `ButtonProps`, and its `onClick`/`onTriggerClick` being two distinct handlers.
 *
 * Reuses `SocButtonLeftIcon` from `./button` for its leading icon slot (React `SplitButton` only
 * has a `leftIcon` prop, no `rightIcon`) — same content-projection mechanism as `SocButton`, one
 * marker directive shared between both instead of a second one that would behave identically.
 *
 * The chevron is the one icon this component draws itself (`ChevronDown`, via `@lucide/angular` —
 * Angular's equivalent of `lucide-react`, already a dependency of `design_system`) — React
 * `SplitButton.tsx` does the same with `lucide-react`'s `ChevronDown`, nothing for a consumer to
 * project there.
 */
@Component({
  selector: 'soc-split-button',
  standalone: true,
  imports: [LucideChevronDown],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // See SocButton's own docstring for why — same Tailwind-vs-emulated-encapsulation mismatch.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'inline-flex items-stretch',
  },
  template: `
    <button
      type="button"
      [disabled]="disabled()"
      (click)="click.emit($event)"
      [class]="mainButtonClasses()"
    >
      @if (hasLeftIcon()) {
        <span
          class="shrink-0 group-disabled:text-[var(--index-button-button-icon-disabled)]"
          [style.width]="iconSize"
          [style.height]="iconSize"
        >
          <ng-content select="[socButtonLeftIcon]" />
        </span>
      }
      <ng-content />
    </button>

    <span aria-hidden="true" [class]="dividerClass()" [style.width]="dividerWidth"></span>

    <button
      type="button"
      [attr.aria-label]="triggerLabel()"
      [disabled]="disabled()"
      (click)="triggerClick.emit($event)"
      [class]="triggerButtonClasses()"
      [style.padding]="splitPad"
    >
      <span class="shrink-0" [style.width]="chevronSize" [style.height]="chevronSize" [style.color]="chevronColor()">
        <svg lucideChevronDown class="size-full" [strokeWidth]="chevronThickness"></svg>
      </span>
    </button>
  `,
})
export class SocSplitButton {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('sm');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly triggerLabel = input<string>("Plus d'options");

  readonly click = output<MouseEvent>();
  readonly triggerClick = output<MouseEvent>();

  protected readonly iconSize = buttonIconSizeVar;
  protected readonly dividerWidth = 'var(--index-button-split-divider-width)';
  protected readonly splitPad = 'var(--index-button-split-split-pad)';
  protected readonly chevronSize = 'var(--index-button-split-chevron-size)';
  protected readonly chevronThickness = 'var(--index-button-split-chevron-thickness)';

  private readonly leftIconContent = contentChild(SocButtonLeftIcon);
  protected readonly hasLeftIcon = computed(() => !!this.leftIconContent());

  protected readonly mainButtonClasses = computed(
    () =>
      `group inline-flex items-center justify-center whitespace-nowrap transition-colors disabled:cursor-not-allowed ${buttonTypographyClass} ${buttonPaddingClasses[this.size()]} ${buttonRadiusLeftClasses[this.size()]} ${buttonVariantClasses[this.variant()]}`,
  );
  protected readonly triggerButtonClasses = computed(
    () =>
      `inline-flex items-center justify-center transition-colors disabled:cursor-not-allowed ${buttonRadiusRightClasses[this.size()]} ${buttonVariantClasses[this.variant()]}`,
  );
  protected readonly dividerClass = computed(() => dividerClasses[this.variant()]);
  protected readonly chevronColor = computed(() =>
    this.disabled() ? 'var(--index-button-split-chevron-color-disabled)' : chevronColorVar[this.variant()],
  );
}
