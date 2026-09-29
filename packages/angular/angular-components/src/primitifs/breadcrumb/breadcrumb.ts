import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, output } from '@angular/core';
import { LucideChevronRight, LucideHouse, LucideMoreHorizontal } from '@lucide/angular';

export interface BreadcrumbItemData {
  label: string;
  onClick?: () => void;
}

/**
 * No native HTML equivalent — plain wrapper (`soc-breadcrumb`). `items: BreadcrumbItemData[]` is
 * plain data (not ReactNode), so a plain `input()`, same as `Message`'s `primaryAction` object —
 * each item's own `onClick` stays a plain callback field on the data, since it's tied to that
 * specific item, not a single component-wide event. `onHomeClick`, by contrast, IS a single
 * component-wide handler (not nested in an array item) — that one becomes an `output()`
 * (`homeClick`), matching how `SplitButton`'s direct handler props became outputs.
 *
 * Maps 1:1 to "Index/Navigation/Breadcrumb/*" tokens — see packages/tokens/tokens/components/navigation.json
 * in design_system (React reference repo, read only).
 */
@Component({
  selector: 'soc-breadcrumb',
  standalone: true,
  imports: [LucideChevronRight, LucideHouse, LucideMoreHorizontal, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'flex items-center gap-[var(--index-navigation-breadcrumb-item-gap)]',
    role: 'navigation',
    'aria-label': "Fil d'Ariane",
  },
  template: `
    <button
      type="button"
      (click)="homeClick.emit()"
      aria-label="Accueil"
      class="flex cursor-pointer items-center rounded px-[var(--index-navigation-breadcrumb-pad-h)] py-[var(--index-navigation-breadcrumb-pad-v)] text-[var(--index-navigation-breadcrumb-icon-default)] hover:text-[var(--index-navigation-breadcrumb-icon-hover)]"
    >
      <span class="size-[var(--index-navigation-breadcrumb-icon-size)]">
        <svg lucideHouse class="size-full" [strokeWidth]="iconThickness"></svg>
      </span>
    </button>

    @if (visibleItems().length > 0) {
      <ng-container [ngTemplateOutlet]="chevron" />
    }

    @if (truncated() && items().length > 2) {
      <span class="flex items-center px-[var(--index-navigation-breadcrumb-pad-h)] py-[var(--index-navigation-breadcrumb-pad-v)] text-[var(--index-navigation-breadcrumb-icon-default)]">
        <span class="size-[var(--index-navigation-breadcrumb-icon-size)]">
          <svg lucideMoreHorizontal class="size-full" [strokeWidth]="iconThickness"></svg>
        </span>
      </span>
      <ng-container [ngTemplateOutlet]="chevron" />
    }

    @for (item of visibleItems(); track item.label + $index) {
      <div class="flex items-center gap-[var(--index-navigation-breadcrumb-item-gap)]">
        @if ($index === visibleItems().length - 1) {
          <span class="rounded px-[var(--index-navigation-breadcrumb-pad-h)] py-[var(--index-navigation-breadcrumb-pad-v)] [font-family:var(--index-navigation-breadcrumb-font-family)] [font-weight:var(--index-navigation-breadcrumb-font-weight-pressed)] text-[length:var(--index-navigation-breadcrumb-font-size)] text-[var(--index-navigation-breadcrumb-text-pressed)]">
            {{ item.label }}
          </span>
        } @else {
          <button type="button" (click)="item.onClick?.()" class="cursor-pointer rounded px-[var(--index-navigation-breadcrumb-pad-h)] py-[var(--index-navigation-breadcrumb-pad-v)] [font-family:var(--index-navigation-breadcrumb-font-family)] [font-weight:var(--index-navigation-breadcrumb-font-weight-default)] text-[length:var(--index-navigation-breadcrumb-font-size)] text-[var(--index-navigation-breadcrumb-text-default)] hover:text-[var(--index-navigation-breadcrumb-text-hover)]">
            {{ item.label }}
          </button>
        }
        @if ($index !== visibleItems().length - 1) {
          <ng-container [ngTemplateOutlet]="chevron" />
        }
      </div>
    }

    <ng-template #chevron>
      <span class="size-[var(--index-navigation-breadcrumb-icon-size)] shrink-0 text-[var(--index-navigation-breadcrumb-chevron-color)]">
        <svg lucideChevronRight class="size-full" [strokeWidth]="iconThickness"></svg>
      </span>
    </ng-template>
  `,
  styleUrl: './breadcrumb.css',
})
export class SocBreadcrumb {
  readonly items = input.required<BreadcrumbItemData[]>();
  readonly truncated = input(false);
  readonly homeClick = output<void>();

  protected readonly iconThickness = 'var(--index-navigation-breadcrumb-icon-thickness)';

  protected readonly visibleItems = computed(() => {
    const all = this.items();
    return this.truncated() && all.length > 2 ? all.slice(-2) : all;
  });
}
