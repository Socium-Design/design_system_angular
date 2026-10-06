import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, ViewEncapsulation, computed, input, output } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
  /** React's `icon?: ReactNode` — a per-item piece of arbitrary content embedded in a plain data
   * array, not a component's own content-projection slot. Angular's equivalent for "renderable
   * content living inside a data value" is a `TemplateRef`, not a plain input — the consumer
   * defines it with `<ng-template #tpl>...</ng-template>` in their own component and puts the
   * resulting `TemplateRef` in this field, same idea as Angular Material's own table cell
   * templates. */
  icon?: TemplateRef<void>;
  disabled?: boolean;
}

export type TabsVariant = 'underline' | 'pill';

/**
 * No native HTML equivalent — plain wrapper (`soc-tabs`). Maps to "Index/Navigation/Tab/*"
 * (underline) or "Index/Navigation/Tab2/*" (pill) tokens in design_system (React reference repo,
 * read only). Both variants live in one component/template (an `@if`), same as React's own
 * `Tabs` picking between its two internal `UnderlineTabs`/`PillTabs` functions.
 */
@Component({
  selector: 'soc-tabs',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    role: 'tablist',
    '[class]': 'hostClasses()',
  },
  template: `
    @if (variant() === 'pill') {
      @for (item of items(); track item.id) {
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="item.id === value()"
          [disabled]="item.disabled"
          (click)="change.emit(item.id)"
          [class]="pillItemClass(item)"
        >
          {{ item.label }}
        </button>
      }
    } @else {
      @for (item of items(); track item.id) {
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="item.id === value()"
          [disabled]="item.disabled"
          (click)="change.emit(item.id)"
          [class]="underlineButtonClass(item)"
        >
          <span [class]="underlineInnerClass(item)">
            @if (item.icon) {
              <span [class]="underlineIconClass(item)">
                <ng-container [ngTemplateOutlet]="item.icon" />
              </span>
            }
            {{ item.label }}
          </span>
          <span [class]="underlineIndicatorClass(item)"></span>
        </button>
      }
    }
  `,
})
export class SocTabs {
  readonly items = input.required<TabItem[]>();
  readonly value = input.required<string>();
  readonly variant = input<TabsVariant>('underline');
  readonly change = output<string>();

  protected readonly hostClasses = computed(() =>
    this.variant() === 'pill'
      ? 'inline-flex items-center gap-[var(--index-navigation-tab2-container-gap)] rounded-[var(--index-navigation-tab2-container-radius)] bg-[var(--index-navigation-tab2-container-bg)] p-[var(--index-navigation-tab2-container-padding)]'
      : 'flex border-b-[1px] border-[var(--index-navigation-tab-border-bottom)]',
  );

  protected pillItemClass(item: TabItem): string {
    const selected = item.id === this.value();
    return `rounded-[var(--index-navigation-tab2-item-radius)] px-[var(--index-navigation-tab2-item-padding-h)] py-[var(--index-navigation-tab2-item-padding-v)] disabled:cursor-not-allowed disabled:opacity-50 [font-family:var(--index-navigation-tab2-font-family)] [font-weight:var(--index-navigation-tab2-font-weight)] text-[length:var(--index-navigation-tab2-font-size)] ${
      selected
        ? 'bg-[var(--index-navigation-tab2-item-bg-selected)] text-[var(--index-navigation-tab2-item-text-selected)] shadow-sm'
        : 'bg-[var(--index-navigation-tab2-item-bg-default)] text-[var(--index-navigation-tab2-item-text-default)] hover:bg-[var(--index-navigation-tab2-item-bg-hover)] hover:text-[var(--index-navigation-tab2-item-text-hover)]'
    }`;
  }

  protected underlineButtonClass(item: TabItem): string {
    const selected = item.id === this.value();
    return `group flex flex-col items-center disabled:cursor-not-allowed disabled:opacity-50 [font-family:var(--index-navigation-tab-font-family)] text-[length:var(--index-navigation-tab-font-size)] ${
      selected ? '[font-weight:var(--index-navigation-tab-font-weight-selected)]' : '[font-weight:var(--index-navigation-tab-font-weight-default)]'
    }`;
  }

  protected underlineInnerClass(item: TabItem): string {
    const selected = item.id === this.value();
    return `flex items-center gap-[var(--index-navigation-tab-icon-gap)] px-[var(--index-navigation-tab-pad-h)] py-[var(--index-navigation-tab-pad-v)] ${
      selected ? 'text-[var(--index-navigation-tab-text-selected)]' : 'text-[var(--index-navigation-tab-text-default)] group-hover:text-[var(--index-navigation-tab-text-hover)]'
    }`;
  }

  protected underlineIconClass(item: TabItem): string {
    const selected = item.id === this.value();
    return `size-[var(--index-navigation-tab-icon-size)] shrink-0 ${
      selected ? 'text-[var(--index-navigation-tab-icon-selected)]' : 'text-[var(--index-navigation-tab-icon-default)] group-hover:text-[var(--index-navigation-tab-icon-hover)]'
    }`;
  }

  protected underlineIndicatorClass(item: TabItem): string {
    const selected = item.id === this.value();
    return `h-[var(--index-navigation-tab-indicator-height)] w-full ${
      selected ? 'bg-[var(--index-navigation-tab-indicator-selected)]' : 'bg-transparent group-hover:bg-[var(--index-navigation-tab-indicator-hover)]'
    }`;
  }
}
