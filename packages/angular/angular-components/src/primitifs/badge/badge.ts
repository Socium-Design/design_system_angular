import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';

export type BadgeColor = 'primary' | 'success' | 'warning' | 'danger';
export type BadgeSize = 'sm' | 'lg';

// "primary" is the exact same green as "success" (bridges.color.accent.lime-text) — not blue, and
// not merely "a green": bound to success's own token so the two colors can never drift apart
// independently. Blue was retired as a Badge color entirely, not just swapped visually. The
// variant name stays "primary" in the API. (Verbatim from React Badge.tsx's own comment.)
const colorClasses: Record<BadgeColor, string> = {
  primary: 'bg-[var(--index-feedback-badge-bg-1)] text-[var(--index-feedback-badge-text-primary)]',
  success: 'bg-[var(--index-feedback-badge-bg-2)] text-[var(--index-feedback-badge-text-success)]',
  warning: 'bg-[var(--index-feedback-badge-bg-3)] text-[var(--index-feedback-badge-text-warning)]',
  danger: 'bg-[var(--index-feedback-badge-bg-4)] text-[var(--index-feedback-badge-text-danger)]',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'rounded-[var(--index-feedback-badge-radius-sm)] px-[var(--index-feedback-badge-padding-h-sm)] py-[var(--index-feedback-badge-padding-v-sm)] text-[length:var(--index-feedback-badge-font-size-sm)]',
  lg: 'rounded-[var(--index-feedback-badge-radius-lg)] px-[var(--index-feedback-badge-padding-h-lg)] py-[var(--index-feedback-badge-padding-v-lg)] text-[length:var(--index-feedback-badge-font-size-lg)]',
};

/**
 * No native HTML equivalent — plain wrapper (`soc-badge` element selector). `children: ReactNode`
 * becomes a default `<ng-content>` (no named slot needed, there's only one content region).
 *
 * Maps 1:1 to "Index/Feedback/Badge/*" tokens — see packages/tokens/tokens/components/feedback.json
 * in design_system (React reference repo, read only).
 */
@Component({
  selector: 'soc-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClasses()',
  },
  template: `<ng-content />`,
  styleUrl: './badge.css',
})
export class SocBadge {
  readonly color = input<BadgeColor>('primary');
  readonly size = input<BadgeSize>('sm');

  protected readonly hostClasses = computed(
    () =>
      `inline-flex items-center justify-center whitespace-nowrap text-center [font-family:var(--index-feedback-badge-font-family)] [font-weight:var(--index-feedback-badge-font-weight)] ${colorClasses[this.color()]} ${sizeClasses[this.size()]}`,
  );
}
