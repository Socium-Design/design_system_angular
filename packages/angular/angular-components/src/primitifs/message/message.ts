import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, computed, contentChild, input } from '@angular/core';
import { LucideCircleAlert, LucideCircleCheck, LucideCircleX, LucideTriangleAlert } from '@lucide/angular';

export type MessageStatus = 'success' | 'error' | 'warning' | 'info';
/** banner = "Type One" (filled, title+content+actions), inline = "Type Two" (pill bg),
 * plain = "Type Three" (no bg) — see packages/tokens/tokens/components/feedback.json. */
export type MessageVariant = 'banner' | 'inline' | 'plain';

export interface MessageAction {
  label: string;
  onClick?: () => void;
}

/** Marks a consumer-projected custom icon — React `Message`'s `icon?: ReactNode | null` prop, the
 * "override" branch (a plain `ReactNode`). React's `icon === undefined` (nothing passed at all)
 * defaults to a status-matching icon, and explicit `icon={null}` renders none — content projection
 * can't distinguish "nothing projected" from "explicitly told: render nothing" the way an optional
 * `ReactNode | null` prop can, so that second case is `hideIcon` below instead. */
@Directive({ selector: '[socMessageIcon]', standalone: true })
export class SocMessageIcon {}

/** React `Message`'s required `content: ReactNode` — content projection (not a string input)
 * since it accepts arbitrary rich content, same reasoning as `Button`'s icon slots. */
@Directive({ selector: '[socMessageContent]', standalone: true })
export class SocMessageContent {}

const bannerBgClasses: Record<MessageStatus, string> = {
  success: 'bg-[var(--index-feedback-message-bg-success)]',
  error: 'bg-[var(--index-feedback-message-bg-error)]',
  warning: 'bg-[var(--index-feedback-message-bg-warning)]',
  info: 'bg-[var(--index-feedback-message-bg-info)]',
};

const inlineBgClasses: Record<MessageStatus, string> = {
  success: 'bg-[var(--index-feedback-message-inline-bg-success)]',
  error: 'bg-[var(--index-feedback-message-inline-bg-error)]',
  warning: 'bg-[var(--index-feedback-message-inline-bg-warning)]',
  info: 'bg-[var(--index-feedback-message-inline-bg-info)]',
};

const inlineTextClasses: Record<MessageStatus, string> = {
  success: 'text-[var(--index-feedback-message-inline-text-success)]',
  error: 'text-[var(--index-feedback-message-inline-text-error)]',
  warning: 'text-[var(--index-feedback-message-inline-text-warning)]',
  info: 'text-[var(--index-feedback-message-inline-text-info)]',
};

const inlineIconClasses: Record<MessageStatus, string> = {
  success: 'text-[var(--index-feedback-message-inline-icon-success)]',
  error: 'text-[var(--index-feedback-message-inline-icon-error)]',
  warning: 'text-[var(--index-feedback-message-inline-icon-warning)]',
  info: 'text-[var(--index-feedback-message-inline-icon-info)]',
};

/**
 * No native HTML equivalent — plain wrapper (`soc-message`). Maps 1:1 to
 * "Index/Feedback/Message/*" tokens — see packages/tokens/tokens/components/feedback.json in
 * design_system (React reference repo, read only). `primaryAction`/`secondaryAction` stay plain
 * `input()` objects (`{ label, onClick? }`), matching React's own `MessageAction` shape exactly —
 * the click handler is consumer-supplied data on the object itself, not a component-level
 * notification, so no separate `output()` per action.
 *
 * Composition constraint carried over verbatim from React's own docstring — the "banner" variant
 * always sits top-right of the main content zone (24px from its right/top edges, right of
 * SiteNavigation, never relative to the whole window); this is fixed positioning, not a per-screen
 * choice. No 4th "outlined" variant either — Figma defines exactly banner/inline/plain.
 */
@Component({
  selector: 'soc-message',
  standalone: true,
  imports: [LucideCircleAlert, LucideCircleCheck, LucideCircleX, LucideTriangleAlert, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClasses()',
  },
  template: `
    @if (variant() === 'banner') {
      <div class="flex w-full items-start gap-[var(--index-feedback-message-icon-gap)]">
        @if (!hideIcon()) {
          <span class="size-6 shrink-0 text-[var(--index-feedback-message-icon-color)]">
            <ng-container [ngTemplateOutlet]="iconSlot" />
          </span>
        }
        <div class="flex min-w-0 flex-1 flex-col gap-[var(--index-feedback-message-content-gap)]">
          @if (title()) {
            <p class="text-[length:var(--index-feedback-message-title-size)] text-[var(--index-feedback-message-title-color)] [font-family:var(--index-feedback-message-title-font)] [font-weight:var(--index-feedback-message-title-weight)]">
              {{ title() }}
            </p>
          }
          <p class="text-[length:var(--index-feedback-message-content-size)] text-[var(--index-feedback-message-content-color)] [font-family:var(--index-feedback-message-content-font)] [font-weight:var(--index-feedback-message-content-weight)]">
            <ng-container [ngTemplateOutlet]="contentSlot" />
          </p>
        </div>
      </div>
      @if (primaryAction() || secondaryAction()) {
        <div class="flex w-full items-start justify-end gap-2">
          @if (primaryAction(); as action) {
            <button
              type="button"
              (click)="action.onClick?.()"
              class="rounded-[var(--index-button-oncolor-radius)] bg-[var(--index-button-oncolor-primary-bg)] px-[var(--index-button-oncolor-padding-h)] py-[var(--index-button-oncolor-padding-v)] text-[length:var(--index-button-oncolor-font-size)] text-[var(--index-button-oncolor-primary-text)] [font-family:var(--index-button-oncolor-font-family)] [font-weight:var(--index-button-oncolor-font-weight)]"
            >
              {{ action.label }}
            </button>
          }
          @if (secondaryAction(); as action) {
            <button
              type="button"
              (click)="action.onClick?.()"
              class="rounded-[var(--index-button-oncolor-radius)] border-[length:var(--index-button-oncolor-border-width)] border-[var(--index-button-oncolor-secondary-border)] px-[var(--index-button-oncolor-padding-h)] py-[var(--index-button-oncolor-padding-v)] text-[length:var(--index-button-oncolor-font-size)] text-[var(--index-button-oncolor-secondary-text)] [font-family:var(--index-button-oncolor-font-family)] [font-weight:var(--index-button-oncolor-font-weight)]"
            >
              {{ action.label }}
            </button>
          }
        </div>
      }
    } @else {
      @if (!hideIcon()) {
        <span [class]="'size-5 shrink-0 ' + inlineIconClasses[status()]">
          <ng-container [ngTemplateOutlet]="iconSlot" />
        </span>
      }
      <p [class]="'text-[length:var(--index-feedback-message-inline-size)] [font-family:var(--index-feedback-message-inline-font)] [font-weight:var(--index-feedback-message-inline-weight)] ' + inlineTextClasses[status()]">
        <ng-container [ngTemplateOutlet]="contentSlot" />
      </p>
    }

    <!-- Declared once each and reused via ngTemplateOutlet from both variant branches above —
         Angular allocates each distinct ng-content selector to exactly one static slot bucket at
         compile time, so the same selector written in two different ng-content instances (one per
         @if/@else branch) silently drops whichever one isn't the canonical slot, even though only
         one branch is ever active at runtime. Verified this empirically: with two separate
         <ng-content select="[socMessageContent]"> instances (one per branch), the "banner" one
         worked and the "inline"/"plain" one silently rendered nothing. A single ng-content inside
         an <ng-template>, outlet-referenced from wherever it's needed, has only one bucket to
         begin with, so there's no ambiguity regardless of how many places instantiate it. -->
    <ng-template #iconSlot>
      @if (hasCustomIcon()) {
        <ng-content select="[socMessageIcon]" />
      } @else {
        <ng-container [ngTemplateOutlet]="defaultIcon" />
      }
    </ng-template>
    <ng-template #contentSlot>
      <ng-content select="[socMessageContent]" />
    </ng-template>

    <ng-template #defaultIcon>
      @switch (status()) {
        @case ('success') {
          <svg lucideCircleCheck class="size-full" [strokeWidth]="iconThickness"></svg>
        }
        @case ('error') {
          <svg lucideCircleX class="size-full" [strokeWidth]="iconThickness"></svg>
        }
        @case ('warning') {
          <svg lucideTriangleAlert class="size-full" [strokeWidth]="iconThickness"></svg>
        }
        @case ('info') {
          <svg lucideCircleAlert class="size-full" [strokeWidth]="iconThickness"></svg>
        }
      }
    </ng-template>
  `,
})
export class SocMessage {
  readonly status = input<MessageStatus>('info');
  readonly variant = input<MessageVariant>('banner');
  /** Equivalent of React's explicit `icon={null}` — suppresses the icon entirely, default (false)
   * matches React's default behavior of always showing one. */
  readonly hideIcon = input(false);
  readonly title = input<string>();
  readonly primaryAction = input<MessageAction>();
  readonly secondaryAction = input<MessageAction>();

  protected readonly iconThickness = 'var(--index-feedback-message-icon-thickness)';
  protected readonly inlineIconClasses = inlineIconClasses;
  protected readonly inlineTextClasses = inlineTextClasses;

  private readonly customIconContent = contentChild(SocMessageIcon);
  protected readonly hasCustomIcon = computed(() => !!this.customIconContent());

  protected readonly hostClasses = computed(() => {
    if (this.variant() === 'banner') {
      return `flex w-full flex-col gap-[var(--index-feedback-message-button-gap)] rounded-[var(--index-feedback-message-radius)] p-[var(--index-feedback-message-padding)] ${bannerBgClasses[this.status()]}`;
    }
    const inline = this.variant() === 'inline';
    return `inline-flex items-center gap-[var(--index-feedback-message-icon-gap)] px-[var(--index-feedback-message-inline-padding-h)] py-[var(--index-feedback-message-inline-padding-v)] ${inline ? `rounded-[var(--index-feedback-message-inline-radius)] ${inlineBgClasses[this.status()]}` : ''}`;
  });
}
