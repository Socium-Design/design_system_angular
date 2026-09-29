import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, computed, contentChild, input } from '@angular/core';

export type ProgressBarStatus = 'information' | 'success' | 'warning' | 'error';
export type ProgressBarSize = 'tiny' | 'sm' | 'md' | 'lg';

/** Marks the element projected into the extra row below the bar (typically a `<soc-tag>`) — React
 * `ProgressBar`'s `tag?: ReactNode` prop. Ignored when `size()` is `"tiny"`, same as React. */
@Directive({ selector: '[socProgressBarTag]', standalone: true })
export class SocProgressBarTag {}

const fillClasses: Record<ProgressBarStatus, string> = {
  information: 'bg-[var(--index-feedback-progressbar-fill-information)]',
  success: 'bg-[var(--index-feedback-progressbar-fill-success)]',
  warning: 'bg-[var(--index-feedback-progressbar-fill-warning)]',
  error: 'bg-[var(--index-feedback-progressbar-fill-error)]',
};

const barHeightClasses: Record<ProgressBarSize, string> = {
  tiny: 'h-[var(--index-feedback-progressbar-bar-height-tiny)]',
  sm: 'h-[var(--index-feedback-progressbar-bar-height-sm)]',
  md: 'h-[var(--index-feedback-progressbar-bar-height-md)]',
  lg: 'h-[var(--index-feedback-progressbar-bar-height-lg)]',
};

/**
 * No native HTML equivalent (the `role="progressbar"` div is hand-rolled, same as React) — plain
 * wrapper (`soc-progress-bar`). Maps 1:1 to "Index/Feedback/ProgressBar/*" tokens — see
 * packages/tokens/tokens/components/feedback.json in design_system (React reference repo, read
 * only). The `progress-indeterminate` keyframes it references live in
 * src/styles/tailwind-entry.css (global), matching where React's own src/index.css defines them —
 * not local to this component in either repo.
 */
@Component({
  selector: 'soc-progress-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'flex w-full flex-col gap-[var(--index-feedback-progressbar-label-gap)]',
  },
  template: `
    @if (label() && !isTiny()) {
      <p class="w-full text-[length:var(--index-feedback-progressbar-label-size)] text-[var(--index-feedback-progressbar-label-color)] [font-family:var(--index-feedback-progressbar-label-font)] [font-weight:var(--index-feedback-progressbar-label-weight)]">
        {{ label() }}
      </p>
    }
    <div
      role="progressbar"
      [attr.aria-valuenow]="indeterminate() ? null : clamped()"
      aria-valuemin="0"
      aria-valuemax="100"
      [class]="trackClass()"
    >
      <div [class]="fillClass()" [style.width]="indeterminate() ? null : clamped() + '%'">
        @if (size() === 'lg' && !indeterminate()) {
          {{ clamped() }}%
        }
      </div>
    </div>
    @if (isTiny() && tinyLabel()) {
      <p class="w-full pt-[var(--index-feedback-progressbar-tiny-label-gap)] text-[length:var(--index-feedback-progressbar-tiny-label-size)] text-[var(--index-feedback-progressbar-tiny-label-color)] [font-family:var(--index-feedback-progressbar-tiny-label-font)] [font-weight:var(--index-feedback-progressbar-tiny-label-weight)]">
        {{ tinyLabel() }}
      </p>
    }
    @if (!isTiny() && (helpTextLeft() || helpTextRight())) {
      <div class="flex w-full items-start justify-between gap-[var(--index-feedback-progressbar-bar-bottom-gap)] text-[length:var(--index-feedback-progressbar-help-size)] [font-family:var(--index-feedback-progressbar-help-font)] [font-weight:var(--index-feedback-progressbar-help-weight)]">
        @if (helpTextLeft()) {
          <p class="min-w-0 flex-1 text-[var(--index-feedback-progressbar-help-text-color)]">{{ helpTextLeft() }}</p>
        }
        @if (helpTextRight()) {
          <p class="shrink-0 whitespace-nowrap text-[var(--index-feedback-progressbar-progress-text-color)]">{{ helpTextRight() }}</p>
        }
      </div>
    }
    @if (!isTiny() && hasTag()) {
      <div class="flex w-full items-start pt-[var(--index-feedback-progressbar-help-tag-gap)]">
        <ng-content select="[socProgressBarTag]" />
      </div>
    }
  `,
  styleUrl: './progress-bar.css',
})
export class SocProgressBar {
  readonly value = input<number>(0);
  readonly status = input<ProgressBarStatus>('information');
  readonly size = input<ProgressBarSize>('md');
  readonly label = input<string>();
  readonly helpTextLeft = input<string>();
  readonly helpTextRight = input<string>();
  readonly tinyLabel = input<string>();
  readonly indeterminate = input(false);

  private readonly tagContent = contentChild(SocProgressBarTag);
  protected readonly hasTag = computed(() => !!this.tagContent());

  protected readonly isTiny = computed(() => this.size() === 'tiny');
  protected readonly clamped = computed(() => Math.min(100, Math.max(0, this.value())));

  protected readonly trackClass = computed(
    () =>
      `relative w-full overflow-hidden bg-[var(--index-feedback-progressbar-track-bg)] ${this.isTiny() ? 'rounded-[var(--index-feedback-progressbar-tiny-radius)]' : 'rounded-[var(--index-feedback-progressbar-radius-lg)]'} ${barHeightClasses[this.size()]}`,
  );

  protected readonly fillClass = computed(
    () =>
      `flex h-full items-center justify-center text-[length:var(--index-feedback-progressbar-fill-size)] text-[var(--index-feedback-progressbar-fill-text-color)] [font-family:var(--index-feedback-progressbar-fill-font)] [font-weight:var(--index-feedback-progressbar-fill-weight)] ${fillClasses[this.status()]} ${this.indeterminate() ? 'animate-[progress-indeterminate_1.4s_ease-in-out_infinite] w-1/3' : ''}`,
  );
}
