import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, computed, contentChild, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'lg';

/**
 * Marks the element projected into `SocButton`'s leading icon slot (`<ng-content
 * select="[socButtonLeftIcon]">`) — see `SocButtonRightIcon` for the trailing one. Angular's
 * equivalent of React `Button`'s `leftIcon?: ReactNode` prop: the consumer supplies their own icon
 * (in `currentColor`), this component never draws one itself. A plain marker, not a real directive
 * behavior — only its selector matters, for `<ng-content>` routing and presence detection via
 * `contentChild()`.
 */
@Directive({ selector: '[socButtonLeftIcon]', standalone: true })
export class SocButtonLeftIcon {}

/** Trailing icon slot — see `SocButtonLeftIcon`. React `Button`'s `rightIcon?: ReactNode`. */
@Directive({ selector: '[socButtonRightIcon]', standalone: true })
export class SocButtonRightIcon {}

/**
 * Class names below must stay as literal strings (no template-built class names) — Tailwind's
 * compiler scans source text statically and can't see classes assembled at runtime. Each one maps
 * 1:1 to an "Index/Button/Button/*" or "Index/Button/Split/*" token from
 * packages/tokens/tokens/components/button.json in design_system (the React reference repo, read
 * only). Exported so `SocSplitButton` shares the exact same variant styling — mirrors React
 * `Button.tsx`'s own exported class maps verbatim.
 */
export const buttonPaddingClasses: Record<ButtonSize, string> = {
  sm: 'gap-[var(--index-button-button-gap-sm)] px-[var(--index-button-button-padding-h-sm)] py-[var(--index-button-button-padding-v-sm)]',
  lg: 'gap-[var(--index-button-button-gap-lg)] px-[var(--index-button-button-padding-h-lg)] py-[var(--index-button-button-padding-v-lg)]',
};

export const buttonRadiusClasses: Record<ButtonSize, string> = {
  sm: 'rounded-[var(--index-button-button-radius-sm)]',
  lg: 'rounded-[var(--index-button-button-radius-lg)]',
};

export const buttonRadiusLeftClasses: Record<ButtonSize, string> = {
  sm: 'rounded-l-[var(--index-button-button-radius-sm)]',
  lg: 'rounded-l-[var(--index-button-button-radius-lg)]',
};

export const buttonRadiusRightClasses: Record<ButtonSize, string> = {
  sm: 'rounded-r-[var(--index-button-button-radius-sm)]',
  lg: 'rounded-r-[var(--index-button-button-radius-lg)]',
};

export const buttonTypographyClass =
  '[font-family:var(--index-button-button-text-font-family)] [font-weight:var(--index-button-button-text-font-weight)] text-[length:var(--index-button-button-text-size)]';

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--index-button-button-bg-primary-default)] text-[var(--index-button-button-text-on-fill)] hover:bg-[var(--index-button-button-bg-primary-hover)] active:bg-[var(--index-button-button-bg-primary-pressed)] disabled:bg-[var(--index-button-button-bg-primary-disabled)] disabled:text-[var(--index-button-button-text-disabled)]',
  secondary:
    'bg-[var(--index-button-button-bg-secondary-default)] text-[var(--index-button-button-text-default)] hover:bg-[var(--index-button-button-bg-secondary-hover)] active:bg-[var(--index-button-button-bg-secondary-pressed)] disabled:bg-[var(--index-button-button-bg-secondary-disabled)] disabled:text-[var(--index-button-button-text-disabled)]',
  tertiary:
    'border-[length:var(--index-button-button-stroke-width)] border-[var(--index-button-button-stroke-tertiary)] bg-[var(--index-button-button-bg-tertiary-default)] text-[var(--index-button-button-text-default)] hover:bg-[var(--index-button-button-bg-tertiary-hover)] active:bg-[var(--index-button-button-bg-tertiary-pressed)] disabled:bg-[var(--index-button-button-bg-tertiary-disabled)] disabled:border-[var(--index-button-button-stroke-tertiary-disabled)] disabled:text-[var(--index-button-button-text-disabled)]',
  danger:
    'bg-[var(--index-button-button-bg-danger-default)] text-[var(--index-button-button-text-on-fill)] hover:bg-[var(--index-button-button-bg-danger-hover)] active:bg-[var(--index-button-button-bg-danger-pressed)] disabled:bg-[var(--index-button-button-bg-danger-disabled)] disabled:text-[var(--index-button-button-text-disabled)]',
  ghost:
    'bg-transparent text-[var(--index-button-button-text-action)] hover:bg-[var(--index-button-button-bg-ghost-hover)] hover:text-[var(--index-button-button-text-action-hover)] active:bg-[var(--index-button-button-bg-ghost-pressed)] disabled:bg-transparent disabled:text-[var(--index-button-button-text-disabled)]',
};

/** Both dimensions bind to the same token — `Button.tsx`'s `buttonIconSizeStyle` has `width` and
 * `height` set to the identical `var(--index-button-button-icon-size)` value. */
export const buttonIconSizeVar = 'var(--index-button-button-icon-size)';

const sizeClasses: Record<ButtonSize, string> = {
  sm: `${buttonPaddingClasses.sm} ${buttonRadiusClasses.sm}`,
  lg: `${buttonPaddingClasses.lg} ${buttonRadiusClasses.lg}`,
};

/**
 * Attribute selector on a real `<button>` — not a wrapper component — so native attributes and
 * events (`type`, `[disabled]`, `(click)`, `aria-label`, …) just work as plain HTML on the host
 * element, the Angular equivalent of React `Button`'s `...props` spread onto its own `<button>`.
 * No `output()`/`input()` re-declares any of them. See this repo's CLAUDE.md, "Attribute-selector
 * components" — the pattern to reuse for every future component wrapping a single native
 * interactive element (InputText, Checkbox, RadioButton, Switch…).
 *
 * `[class]` merges with any static `class` a consumer adds directly on the same `<button socButton
 * class="...">` — Angular composes host class bindings with a literal class attribute rather than
 * one overwriting the other, so there's no separate `className`-style input to accept and merge by
 * hand the way React's version needs one.
 */
@Component({
  selector: 'button[socButton]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Tailwind utility classes are global by design (one `.inline-flex` rule reused everywhere) —
  // incompatible with Angular's default emulated encapsulation, which rewrites every selector in
  // `styleUrl` to only match elements carrying its own auto-generated `_ngcontent-*` attribute.
  // That rewritten selector never matches this component's own HOST element (`[class]` above
  // targets the host directly, and the host gets `_nghost-*`, not `_ngcontent-*`) — verified this
  // was silently eating every utility class before adding this. See CLAUDE.md's
  // "ViewEncapsulation.None for Tailwind-styled components" convention.
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClasses()',
  },
  template: `
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
    @if (hasRightIcon()) {
      <span
        class="shrink-0 group-disabled:text-[var(--index-button-button-icon-disabled)]"
        [style.width]="iconSize"
        [style.height]="iconSize"
      >
        <ng-content select="[socButtonRightIcon]" />
      </span>
    }
  `,
})
export class SocButton {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('sm');

  protected readonly iconSize = buttonIconSizeVar;

  private readonly leftIconContent = contentChild(SocButtonLeftIcon);
  private readonly rightIconContent = contentChild(SocButtonRightIcon);
  protected readonly hasLeftIcon = computed(() => !!this.leftIconContent());
  protected readonly hasRightIcon = computed(() => !!this.rightIconContent());

  protected readonly hostClasses = computed(
    () =>
      `group inline-flex items-center justify-center whitespace-nowrap transition-colors disabled:cursor-not-allowed ${buttonTypographyClass} ${sizeClasses[this.size()]} ${buttonVariantClasses[this.variant()]}`,
  );
}
