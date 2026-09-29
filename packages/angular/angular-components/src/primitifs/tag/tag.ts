import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, output } from '@angular/core';
import { LucideX } from '@lucide/angular';

export type TagColor = 'success' | 'warning' | 'error' | 'information' | 'purple' | 'orange';
export type TagSize = 'sm' | 'lg';

const colorClasses: Record<TagColor, string> = {
  success: 'bg-[var(--index-feedback-tag-bg-success)] text-[var(--index-feedback-tag-text-success)]',
  warning: 'bg-[var(--index-feedback-tag-bg-warning)] text-[var(--index-feedback-tag-text-warning)]',
  error: 'bg-[var(--index-feedback-tag-bg-error)] text-[var(--index-feedback-tag-text-error)]',
  information: 'bg-[var(--index-feedback-tag-bg-information)] text-[var(--index-feedback-tag-text-information)]',
  purple: 'bg-[var(--index-feedback-tag-bg-purple)] text-[var(--index-feedback-tag-text-purple)]',
  orange: 'bg-[var(--index-feedback-tag-bg-orange)] text-[var(--index-feedback-tag-text-orange)]',
};

const sizeClasses: Record<TagSize, string> = {
  sm: 'px-[var(--index-feedback-tag-padding-h-sm)] py-[var(--index-feedback-tag-padding-v-sm)] text-[length:var(--index-feedback-tag-font-size-sm)]',
  lg: 'px-[var(--index-feedback-tag-padding-h-lg)] py-[var(--index-feedback-tag-padding-v-lg)] text-[length:var(--index-feedback-tag-font-size-lg)]',
};

/**
 * No native HTML equivalent — plain wrapper (`soc-tag` element selector). `children: ReactNode`
 * becomes a default `<ng-content>`.
 *
 * React's `onRemove?: () => void` prop doubles as both "show the remove button" and "the handler"
 * — an `output()` can't be introspected the same way (no public "is anyone listening" signal), so
 * this splits into a `removable` input (controls whether the button renders) plus a `remove`
 * output (the handler) instead of inferring visibility from whether `(remove)` was bound.
 *
 * The remove (×) button draws its own icon (`LucideX`, `@lucide/angular`) rather than projecting
 * one — same as React's own `<X className="size-3" .../>`, not a consumer-supplied slot.
 *
 * Maps 1:1 to "Index/Feedback/Tag/*" tokens — see packages/tokens/tokens/components/feedback.json
 * in design_system (React reference repo, read only).
 */
@Component({
  selector: 'soc-tag',
  standalone: true,
  imports: [LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClasses()',
  },
  template: `
    <ng-content />
    @if (removable()) {
      <button type="button" (click)="remove.emit()" aria-label="Retirer" class="shrink-0 opacity-70 hover:opacity-100">
        <svg lucideX class="size-3" [strokeWidth]="1.5"></svg>
      </button>
    }
  `,
  styleUrl: './tag.css',
})
export class SocTag {
  readonly color = input<TagColor>('success');
  readonly size = input<TagSize>('sm');
  readonly removable = input(false);
  readonly remove = output<void>();

  protected readonly hostClasses = computed(
    () =>
      `inline-flex items-center gap-1 whitespace-nowrap rounded-[var(--index-feedback-tag-radius)] text-center [font-family:var(--index-feedback-tag-font-family)] [font-weight:var(--index-feedback-tag-font-weight)] ${colorClasses[this.color()]} ${sizeClasses[this.size()]}`,
  );
}
