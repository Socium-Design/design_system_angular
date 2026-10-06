import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, output } from '@angular/core';
import { LucideX } from '@lucide/angular';

export type ChipsSize = 'sm' | 'lg';

const textSizeClasses: Record<ChipsSize, string> = {
  sm: 'text-[length:var(--index-selection-chips-text-size-sm)]',
  lg: 'text-[length:var(--index-selection-chips-text-size-lg)]',
};

const paddingClasses = 'py-[var(--index-selection-chips-pad-v)] pl-[var(--index-selection-chips-pad-h-left)]';

/**
 * React's Chips.tsx exports three components sharing one file — mirrored the same way here rather
 * than splitting into three files, since they share the `ChipsSize` type and padding/text classes.
 * `label` is a plain `string` in all three (not `ReactNode`), so plain `input()`s throughout, no
 * content projection — same reasoning as `DocumentLine`. `onRemove`/`onClick` follow the same
 * split as `Tag`'s `removable`/`remove`: a boolean input controls visibility, an output is the
 * handler (an `output()` can't be introspected for "is anyone listening" the way an optional
 * callback prop can).
 *
 * Maps 1:1 to "Index/Selection/Chips/*" tokens — see packages/tokens/tokens/components/selection.json
 * in design_system (React reference repo, read only).
 */
@Component({
  selector: 'soc-chips',
  standalone: true,
  imports: [LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClasses()',
  },
  template: `
    {{ label() }}
    @if (removable()) {
      <button type="button" (click)="remove.emit()" [attr.aria-label]="'Retirer ' + label()" class="shrink-0 size-[var(--index-selection-chips-close-size)] text-[var(--index-selection-chips-icon-close-color)]">
        <svg lucideX class="size-full" [strokeWidth]="closeIconThickness"></svg>
      </button>
    }
  `,
})
export class SocChips {
  readonly label = input.required<string>();
  readonly size = input<ChipsSize>('sm');
  readonly removable = input(false, { transform: booleanAttribute });
  readonly remove = output<void>();

  protected readonly closeIconThickness = 'var(--index-selection-chips-close-icon-thickness)';

  protected readonly hostClasses = computed(
    () =>
      `inline-flex items-center gap-[var(--index-selection-chips-gap)] rounded-[var(--index-selection-chips-radius)] bg-[var(--index-selection-chips-bg-default)] pr-[var(--index-selection-chips-pad-h-right)] text-[var(--index-selection-chips-text-color)] [font-family:var(--index-selection-chips-text-font)] [font-weight:var(--index-selection-chips-text-weight)] ${paddingClasses} ${textSizeClasses[this.size()]}`,
  );
}

/**
 * Maps 1:1 to "Index/Selection/Chips/*" tokens (type=Selectable). Structurally this one IS just a
 * bare `<button>{label}</button>`, same shape as `Button` — could have been an attribute selector.
 * Kept as a wrapper element instead, consistent with the migration spec explicitly categorizing
 * "Chips" (this whole file, all three exports) under the wrapper list rather than the native-
 * element-attribute-selector one, and to stay consistent with its two siblings above/below sharing
 * this same file.
 */
@Component({
  selector: 'soc-selectable-chips',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[attr.aria-pressed]': 'selected()',
    '(click)': 'click.emit()',
  },
  template: `
    <button type="button" [class]="hostClasses()">
      {{ label() }}
    </button>
  `,
})
export class SocSelectableChips {
  readonly label = input.required<string>();
  readonly size = input<ChipsSize>('sm');
  readonly selected = input(false, { transform: booleanAttribute });
  readonly click = output<void>();

  protected readonly hostClasses = computed(
    () =>
      `inline-flex items-center gap-[var(--index-selection-chips-gap)] rounded-[var(--index-selection-chips-radius)] px-[var(--index-selection-chips-pad-h-left)] [font-family:var(--index-selection-chips-text-font)] [font-weight:var(--index-selection-chips-text-weight)] focus-visible:outline-none focus-visible:border-[length:var(--index-selection-chips-border-width)] focus-visible:border-[var(--index-selection-chips-border-focus)] ${paddingClasses} ${textSizeClasses[this.size()]} ${
        this.selected()
          ? 'bg-[var(--index-selection-chips-bg-selected)] text-[var(--index-selection-chips-text-color-selected)]'
          : 'bg-[var(--index-selection-chips-bg-default)] text-[var(--index-selection-chips-text-color)] hover:bg-[var(--index-selection-chips-bg-hover)]'
      }`,
  );
}

/** Maps 1:1 to "Index/Selection/Chips/*" tokens (type=Input) — used for the tags shown inside a
 * Multi-select's field once options are selected. */
@Component({
  selector: 'soc-input-chip',
  standalone: true,
  imports: [LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class:
      'inline-flex items-center gap-[var(--index-selection-chips-gap)] rounded-[var(--index-selection-chips-radius)] bg-[var(--index-selection-chips-input-bg-default)] py-[var(--index-selection-chips-pad-input-v)] pl-[var(--index-selection-chips-pad-h-left)] pr-[var(--index-selection-chips-pad-h-right)] text-[length:var(--index-selection-chips-text-input-size)] text-[var(--index-selection-chips-input-text-color)] [font-family:var(--index-selection-chips-text-font)] [font-weight:var(--index-selection-chips-text-weight)] hover:bg-[var(--index-selection-chips-input-bg-hover)]',
  },
  template: `
    {{ label() }}
    @if (removable()) {
      <button type="button" (click)="remove.emit()" [attr.aria-label]="'Retirer ' + label()" class="size-[var(--index-selection-chips-close-input-size)] shrink-0 text-[var(--index-selection-chips-input-icon-color)]">
        <svg lucideX class="size-full" [strokeWidth]="closeIconThickness"></svg>
      </button>
    }
  `,
})
export class SocInputChip {
  readonly label = input.required<string>();
  readonly removable = input(false, { transform: booleanAttribute });
  readonly remove = output<void>();

  protected readonly closeIconThickness = 'var(--index-selection-chips-close-icon-input-thickness)';
}
