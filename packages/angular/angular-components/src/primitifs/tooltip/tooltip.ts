import { ChangeDetectionStrategy, Component, DestroyRef, Directive, ElementRef, ViewEncapsulation, booleanAttribute, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { LucideCircleAlert, LucideCircleCheck, LucideCircleX, LucideTriangleAlert } from '@lucide/angular';
import { nextUniqueId } from '../../internal/unique-id';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipVariant = 'default' | 'extend' | 'message';
export type TooltipMessageStatus = 'success' | 'error' | 'warning' | 'info';

/** React `Tooltip`'s `label: ReactNode` (default/message variants). */
@Directive({ selector: '[socTooltipLabel]', standalone: true })
export class SocTooltipLabel {}

/** React `Tooltip`'s `content: ReactNode` (extend variant only — its `title` stays a plain
 * string input, it's typed `string` in React too). */
@Directive({ selector: '[socTooltipContent]', standalone: true })
export class SocTooltipContent {}

/** Gap (px) between trigger and bubble. Also reused as `flipIfNeeded`'s margin so a flip and the
 * resulting gap agree on how much room counts as "enough". Ported 1:1 from React Tooltip.tsx. */
const GAP = 8;
const VIEWPORT_MARGIN = 4;

function computeFixedPosition(position: TooltipPosition, triggerRect: DOMRect, bubbleRect: DOMRect) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (position === 'left' || position === 'right') {
    const left = position === 'right' ? triggerRect.right + GAP : triggerRect.left - bubbleRect.width - GAP;
    const top = triggerRect.top + triggerRect.height / 2 - bubbleRect.height / 2;
    return { top: Math.min(Math.max(VIEWPORT_MARGIN, top), vh - bubbleRect.height - VIEWPORT_MARGIN), left };
  }
  const top = position === 'bottom' ? triggerRect.bottom + GAP : triggerRect.top - bubbleRect.height - GAP;
  const left = triggerRect.left + triggerRect.width / 2 - bubbleRect.width / 2;
  return { top, left: Math.min(Math.max(VIEWPORT_MARGIN, left), vw - bubbleRect.width - VIEWPORT_MARGIN) };
}

function flipIfNeeded(preferred: TooltipPosition, triggerRect: DOMRect, bubbleRect: DOMRect): TooltipPosition {
  if (preferred === 'top' || preferred === 'bottom') {
    const spaceAbove = triggerRect.top;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const needed = bubbleRect.height + GAP;
    if (preferred === 'top' && spaceAbove < needed && spaceBelow > spaceAbove) return 'bottom';
    if (preferred === 'bottom' && spaceBelow < needed && spaceAbove > spaceBelow) return 'top';
    return preferred;
  }
  const spaceLeft = triggerRect.left;
  const spaceRight = window.innerWidth - triggerRect.right;
  const needed = bubbleRect.width + GAP;
  if (preferred === 'left' && spaceLeft < needed && spaceRight > spaceLeft) return 'right';
  if (preferred === 'right' && spaceRight < needed && spaceLeft > spaceRight) return 'left';
  return preferred;
}

/** Figma no longer exposes a bound "arrow-size" variable — the arrow is a fixed 10px-wide
 * triangle directly in the source art, hardcoded here too (matches React). */
const arrowPositionClasses: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px]',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-x-[5px] border-x-transparent border-b-[5px]',
  left: 'left-full top-1/2 -translate-y-1/2 border-y-[5px] border-y-transparent border-l-[5px]',
  right: 'right-full top-1/2 -translate-y-1/2 border-y-[5px] border-y-transparent border-r-[5px]',
};

const messageBgClasses: Record<TooltipMessageStatus, string> = {
  success: 'bg-[var(--index-feedback-tooltip-msg-bg-success)]',
  error: 'bg-[var(--index-feedback-tooltip-msg-bg-error)]',
  warning: 'bg-[var(--index-feedback-tooltip-msg-bg-warning)]',
  info: 'bg-[var(--index-feedback-tooltip-msg-bg-info)]',
};

const messageTextClasses: Record<TooltipMessageStatus, string> = {
  success: 'text-[var(--index-feedback-tooltip-msg-text-success)]',
  error: 'text-[var(--index-feedback-tooltip-msg-text-error)]',
  warning: 'text-[var(--index-feedback-tooltip-msg-text-warning)]',
  info: 'text-[var(--index-feedback-tooltip-msg-text-info)]',
};

const messageArrowColorVar: Record<TooltipMessageStatus, string> = {
  success: 'var(--index-feedback-tooltip-msg-bg-success)',
  error: 'var(--index-feedback-tooltip-msg-bg-error)',
  warning: 'var(--index-feedback-tooltip-msg-bg-warning)',
  info: 'var(--index-feedback-tooltip-msg-bg-info)',
};

/**
 * No native HTML equivalent — plain wrapper (`soc-tooltip`). React's version uses `cloneElement`
 * to inject `aria-describedby`/a composed `onClick` directly onto its `children` element — Angular
 * has no equivalent of cloning an arbitrary projected element with extra props (there's no
 * `TemplateRef`-free way to reach into projected content and add attributes/listeners to it).
 * Worked around it rather than reproducing it: the hover/focus/click listeners live on this
 * component's own HOST element instead (matching React's outer wrapper `<span ref={wrapperRef}>`,
 * which already carries the hover/focus listeners in React too) — `(focusout)`/`(focusin)` bubble
 * from any projected content the same way React's synthetic `onFocus`/`onBlur` do, and a host
 * `(click)` catches bubbled clicks from the trigger to dismiss the tooltip, without needing to
 * clone or modify the projected element itself. The one bit of fidelity this trades away:
 * `aria-describedby` lands on the wrapper host rather than the actual trigger element.
 *
 * Bubble is portaled to `document.body` via a direct `appendChild` in `ngAfterViewInit` (Angular
 * has no CDK Overlay in this project) — same reasoning as React's `createPortal`: a relatively-
 * positioned bubble gets silently clipped by any scrollable/`overflow` ancestor. Position-computing
 * functions (`computeFixedPosition`/`flipIfNeeded`) are ported 1:1 from React's own.
 *
 * Maps 1:1 to "Index/Feedback/Tooltip/*" tokens — see packages/tokens/tokens/components/feedback.json
 * in design_system (React reference repo, read only).
 */
@Component({
  selector: 'soc-tooltip',
  standalone: true,
  imports: [LucideCircleAlert, LucideCircleCheck, LucideCircleX, LucideTriangleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'relative inline-flex',
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
    '(click)': 'hide()',
    '[attr.aria-describedby]': 'visible() ? tooltipId : null',
  },
  template: `
    <ng-content />
    <span
      #bubble
      role="tooltip"
      [attr.id]="tooltipId"
      [style.position]="'fixed'"
      [style.top.px]="topPx()"
      [style.left.px]="leftPx()"
      [style.visibility]="visible() ? 'visible' : 'hidden'"
      [class]="bubbleClass()"
    >
      @if (variant() === 'extend') {
        <p class="w-full [font-weight:var(--index-feedback-tooltip-extend-title-weight)] text-[length:var(--index-feedback-tooltip-extend-title-size)] [font-family:var(--index-feedback-tooltip-extend-title-font)]">
          {{ title() }}
        </p>
        <div class="w-full font-normal">
          <ng-content select="[socTooltipContent]" />
        </div>
      } @else {
        @if (variant() === 'message' && showIcon()) {
          <span class="size-[var(--index-feedback-tooltip-msg-icon-size)] shrink-0">
            @switch (status()) {
              @case ('success') {
                <svg lucideCircleCheck class="size-full" [strokeWidth]="1.5"></svg>
              }
              @case ('error') {
                <svg lucideCircleX class="size-full" [strokeWidth]="1.5"></svg>
              }
              @case ('warning') {
                <svg lucideTriangleAlert class="size-full" [strokeWidth]="1.5"></svg>
              }
              @case ('info') {
                <svg lucideCircleAlert class="size-full" [strokeWidth]="1.5"></svg>
              }
            }
          </span>
        }
        <!-- Single instance of this selector for both "default" and "message" variants — Angular
             assigns each distinct ng-content selector to exactly one static slot bucket, so the
             same selector appearing in two different ng-content instances (one per variant branch)
             silently drops whichever one isn't the canonical slot, even though only one branch is
             ever active at a time. Verified this empirically: the "message" branch's copy worked,
             the "default" one silently rendered nothing. -->
        <ng-content select="[socTooltipLabel]" />
      }
      <span class="absolute size-0" [class]="arrowPositionClasses[resolvedPosition()]" [style]="arrowStyle()"></span>
    </span>
  `,
})
export class SocTooltip {
  readonly position = input<TooltipPosition>('top');
  readonly variant = input<TooltipVariant>('default');
  readonly title = input<string>();
  readonly status = input<TooltipMessageStatus>('info');
  readonly showIcon = input(true, { transform: booleanAttribute });

  protected readonly arrowPositionClasses = arrowPositionClasses;
  protected readonly tooltipId = nextUniqueId('soc-tooltip');

  protected readonly visible = signal(false);
  protected readonly resolvedPosition = signal<TooltipPosition>('top');
  protected readonly topPx = signal(0);
  protected readonly leftPx = signal(0);

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly bubbleRef = viewChild<ElementRef<HTMLElement>>('bubble');
  private appended = false;

  constructor() {
    effect(() => {
      // Re-run whenever visible/position change; reads both so both are tracked dependencies.
      const isVisible = this.visible();
      this.position();
      const bubbleEl = this.bubbleRef()?.nativeElement;
      if (!bubbleEl) return;
      if (!this.appended) {
        document.body.appendChild(bubbleEl);
        this.appended = true;
      }
      if (isVisible) this.reposition();
    });

    const onWindowChange = () => {
      if (this.visible()) this.reposition();
    };
    window.addEventListener('resize', onWindowChange);
    window.addEventListener('scroll', onWindowChange, true);
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('resize', onWindowChange);
      window.removeEventListener('scroll', onWindowChange, true);
      this.bubbleRef()?.nativeElement.remove();
    });
  }

  protected show(): void {
    this.visible.set(true);
  }

  protected hide(): void {
    this.visible.set(false);
  }

  private reposition(): void {
    const bubbleEl = this.bubbleRef()?.nativeElement;
    if (!bubbleEl) return;
    const triggerRect = this.hostRef.nativeElement.getBoundingClientRect();
    const bubbleRect = bubbleEl.getBoundingClientRect();
    const resolved = flipIfNeeded(this.position(), triggerRect, bubbleRect);
    this.resolvedPosition.set(resolved);
    const { top, left } = computeFixedPosition(resolved, triggerRect, bubbleRect);
    this.topPx.set(top);
    this.leftPx.set(left);
  }

  protected readonly arrowStyle = computed(() => {
    const key: Record<TooltipPosition, string> = {
      top: 'border-top-color',
      bottom: 'border-bottom-color',
      left: 'border-left-color',
      right: 'border-right-color',
    };
    const color = this.variant() === 'message' ? messageArrowColorVar[this.status()] : 'var(--index-feedback-tooltip-bg)';
    return `${key[this.resolvedPosition()]}: ${color}`;
  });

  protected readonly bubbleClass = computed(() => {
    const base =
      'pointer-events-none z-10 rounded-[var(--index-feedback-tooltip-radius)] px-[var(--index-feedback-tooltip-padding-h)] py-[var(--index-feedback-tooltip-padding-v)] text-[length:var(--index-feedback-tooltip-font-size)] [font-family:var(--index-feedback-tooltip-font-family)]';
    if (this.variant() === 'message') {
      return `${base} flex items-center gap-[var(--index-feedback-tooltip-msg-icon-gap)] whitespace-nowrap ${messageBgClasses[this.status()]} ${messageTextClasses[this.status()]}`;
    }
    if (this.variant() === 'extend') {
      return `${base} flex w-[220px] flex-col gap-[var(--index-feedback-tooltip-extend-gap)] bg-[var(--index-feedback-tooltip-bg)] text-[var(--index-feedback-tooltip-text-color)]`;
    }
    return `${base} whitespace-nowrap bg-[var(--index-feedback-tooltip-bg)] text-[var(--index-feedback-tooltip-text-color)] [font-weight:var(--index-feedback-tooltip-font-weight)]`;
  });
}
