import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, output, signal } from '@angular/core';
import { LucideChevronDown, LucidePanelLeftClose, LucidePanelLeftOpen } from '@lucide/angular';
import {
  NAVIGATION_PRESETS,
  type NavigationProduct,
  type SideNavActionData,
  type SideNavItemData,
  type SideNavSectionData,
} from './navigation-presets';

/**
 * Internal — one collapsible section of the nav (React's own local `NavSection` function
 * component, promoted to its own Angular component since Angular doesn't have React's casual
 * "just define another function in the same file" pattern for a stateful sub-view — this needs
 * its own `open` signal per section instance). Not exported from `public-api.ts`.
 */
@Component({
  selector: 'soc-side-nav-section',
  standalone: true,
  imports: [LucideChevronDown, NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex w-full flex-col gap-[var(--index-navigation-sidenavigation-menu-gap)]' },
  template: `
    @if (!collapsed()) {
      <button type="button" (click)="open.set(!open())" class="flex h-7 w-full items-center justify-between pl-[var(--index-navigation-sidenavigation-item-padding-h)] pr-4">
        <span class="whitespace-nowrap text-[length:var(--index-navigation-sidenavigation-menu-title-size)] tracking-[1.12px] text-[var(--index-navigation-sidenavigation-menu-title-text)] [font-family:var(--index-navigation-sidenavigation-menu-title-font)] [font-weight:var(--index-navigation-sidenavigation-menu-title-weight)]">
          {{ section().title }}
        </span>
        <span [class]="'size-[var(--index-navigation-sidenavigation-menu-title-chevron-size)] text-[var(--index-navigation-sidenavigation-menu-title-chevron)] transition-transform ' + (open() ? '' : '-rotate-90')">
          <svg lucideChevronDown class="size-full" [strokeWidth]="chevronThickness"></svg>
        </span>
      </button>
    }
    @if (open() || collapsed()) {
      <div class="flex w-full flex-col items-start gap-[var(--index-navigation-sidenavigation-items-gap)]">
        @for (item of section().items; track item.id) {
          <button
            type="button"
            (click)="itemClick(item)"
            [title]="collapsed() ? item.label : null"
            [class]="itemClass(item.id)"
          >
            <span [class]="item.id === selectedId() ? 'size-[18px] shrink-0 text-[var(--index-navigation-sidenavigation-item-icon-selected)]' : 'size-[18px] shrink-0 text-[var(--index-navigation-sidenavigation-item-icon-default)]'">
              <ng-container [ngComponentOutlet]="item.icon" />
            </span>
            @if (!collapsed()) {
              <span class="flex-1 truncate text-left">{{ item.label }}</span>
            }
          </button>
        }
      </div>
    }
  `,
})
export class SocSideNavSection {
  readonly section = input.required<SideNavSectionData>();
  readonly selectedId = input<string>();
  readonly collapsed = input(false);
  readonly itemSelect = output<string>();

  protected readonly open = signal(true);
  protected readonly chevronThickness = 'var(--index-navigation-sidenavigation-menu-title-chevron-thickness)';

  protected itemClick(item: SideNavItemData): void {
    item.onClick?.();
    this.itemSelect.emit(item.id);
  }

  protected itemClass(id: string): string {
    const base =
      'flex h-9 w-full items-center gap-[var(--index-navigation-sidenavigation-item-gap)] rounded-l-[var(--index-navigation-sidenavigation-item-radius-left)] rounded-r-[var(--index-navigation-sidenavigation-item-radius-right)] px-[var(--index-navigation-sidenavigation-item-padding-h)] py-[var(--index-navigation-sidenavigation-item-padding-v)] text-[length:var(--index-navigation-sidenavigation-item-size)] [font-family:var(--index-navigation-sidenavigation-item-font)] [font-weight:var(--index-navigation-sidenavigation-item-weight)]';
    return `${base} ${
      id === this.selectedId()
        ? 'border-r-[length:var(--index-navigation-sidenavigation-item-border-width)] border-[var(--index-navigation-sidenavigation-item-border-selected)] bg-[var(--index-navigation-sidenavigation-item-bg-selected)] text-[var(--index-navigation-sidenavigation-item-text-selected)]'
        : 'text-[var(--index-navigation-sidenavigation-item-text-default)] hover:bg-[var(--index-navigation-sidenavigation-item-bg-hover)] hover:text-[var(--index-navigation-sidenavigation-item-text-hover)]'
    }`;
  }
}

/**
 * No native HTML equivalent — plain wrapper (`soc-side-navigation`). Maps 1:1 to
 * "Index/Navigation/SideNavigation/*" tokens — see packages/tokens/tokens/components/navigation.json
 * in design_system (React reference repo, read only). `collapsed` has no internal
 * uncontrolled/default fallback in React either (purely controlled, parent owns it entirely via
 * `onToggleCollapse`) — plain `input()`, not `model()`, unlike Accordion/Checkbox/Switch.
 * `onSelect`/`onToggleCollapse` are direct component-level handlers -> `output()`s
 * (`select`/`toggleCollapse`).
 */
@Component({
  selector: 'soc-side-navigation',
  standalone: true,
  imports: [LucidePanelLeftClose, LucidePanelLeftOpen, SocSideNavSection, NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClasses()',
  },
  template: `
    <div class="flex w-full shrink-0 items-center justify-between py-1 pl-[var(--index-navigation-sidenavigation-title-padding-h)] pr-4">
      @if (!collapsed()) {
        <span class="flex-1 truncate text-[length:var(--index-navigation-sidenavigation-title-size)] text-[var(--index-navigation-sidenavigation-title-text)] [font-family:var(--index-navigation-sidenavigation-title-font)] [font-weight:var(--index-navigation-sidenavigation-title-weight)]">
          {{ resolvedTitle() }}
        </span>
      }
      <button
        type="button"
        (click)="toggleCollapse.emit()"
        [attr.aria-label]="collapsed() ? 'Déplier le menu' : 'Replier le menu'"
        class="size-[18px] shrink-0 text-[var(--index-navigation-sidenavigation-title-icon)]"
      >
        @if (collapsed()) {
          <svg lucidePanelLeftOpen class="size-full" [strokeWidth]="titleIconThickness"></svg>
        } @else {
          <svg lucidePanelLeftClose class="size-full" [strokeWidth]="titleIconThickness"></svg>
        }
      </button>
    </div>

    <div class="scrollbar-hide flex w-full min-h-0 flex-1 flex-col items-start gap-[var(--index-navigation-sidenavigation-section-gap)] overflow-y-auto pt-2 pb-[var(--index-navigation-sidenavigation-nav-padding-v)]">
      @for (section of resolvedSections(); track section.title) {
        <soc-side-nav-section [section]="section" [selectedId]="selectedId()" [collapsed]="collapsed()" (itemSelect)="select.emit($event)" />
      }

      @if (resolvedActionSection(); as actionSection) {
        <div class="flex w-full flex-col gap-[var(--index-navigation-sidenavigation-menu-gap)]">
          @if (!collapsed()) {
            <div class="flex h-7 w-full items-center pl-[var(--index-navigation-sidenavigation-item-padding-h)] pr-4">
              <span class="whitespace-nowrap text-[length:var(--index-navigation-sidenavigation-menu-title-size)] tracking-[1.12px] text-[var(--index-navigation-sidenavigation-menu-title-text)] [font-family:var(--index-navigation-sidenavigation-menu-title-font)] [font-weight:var(--index-navigation-sidenavigation-menu-title-weight)]">
                {{ actionSection.title }}
              </span>
            </div>
          }
          <div class="flex w-full flex-col items-start gap-[2px]">
            @for (action of actionSection.items; track action.id) {
              <button
                type="button"
                (click)="actionClick(action)"
                [title]="collapsed() ? action.label : null"
                class="flex h-10 w-full items-center gap-[var(--index-navigation-sidenavigation-action-gap)] rounded px-[var(--index-navigation-sidenavigation-action-padding-h)] py-[var(--index-navigation-sidenavigation-action-padding-v)] text-[length:var(--index-navigation-sidenavigation-item-size)] text-[var(--index-navigation-sidenavigation-action-text-default)] [font-family:var(--index-navigation-sidenavigation-item-font)] [font-weight:var(--index-navigation-sidenavigation-item-weight)] hover:bg-[var(--index-navigation-sidenavigation-action-bg-hover)]"
              >
                <span class="flex size-[var(--index-navigation-sidenavigation-action-icon-square)] shrink-0 items-center justify-center rounded-[var(--index-navigation-sidenavigation-action-icon-radius)] bg-[var(--index-navigation-sidenavigation-action-icon-bg)] text-[var(--index-navigation-sidenavigation-action-icon-color)]">
                  <span class="size-3.5">
                    <ng-container [ngComponentOutlet]="action.icon" />
                  </span>
                </span>
                @if (!collapsed()) {
                  <span class="flex-1 truncate text-left">{{ action.label }}</span>
                }
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './side-navigation.css',
})
export class SocSideNavigation {
  readonly product = input<NavigationProduct>();
  readonly title = input<string>();
  readonly sections = input<SideNavSectionData[]>();
  readonly actionSection = input<{ title: string; items: SideNavActionData[] }>();
  readonly selectedId = input<string>();
  readonly collapsed = input(false);

  readonly select = output<string>();
  readonly toggleCollapse = output<void>();

  protected readonly titleIconThickness = 'var(--index-navigation-sidenavigation-title-icon-thickness)';

  private readonly preset = computed(() => {
    const product = this.product();
    return product ? NAVIGATION_PRESETS[product] : undefined;
  });

  protected readonly hostClasses = computed(
    () =>
      `flex h-full min-h-0 flex-col overflow-hidden rounded-t-[var(--index-navigation-sidenavigation-nav-radius)] bg-[var(--index-navigation-sidenavigation-nav-bg)] pl-[var(--index-navigation-sidenavigation-nav-padding-h)] pt-[var(--index-navigation-sidenavigation-nav-padding-v)] ${
        this.collapsed() ? 'w-[var(--index-navigation-sidenavigation-nav-width-closed)]' : 'w-[var(--index-navigation-sidenavigation-nav-width-open)]'
      }`,
  );

  protected readonly resolvedTitle = computed(() => this.title() ?? this.preset()?.title ?? '');
  protected readonly resolvedSections = computed(() => this.sections() ?? this.preset()?.sections ?? []);
  protected readonly resolvedActionSection = computed(() => this.actionSection() ?? this.preset()?.actionSection);

  protected actionClick(action: SideNavActionData): void {
    // Matches React exactly: onClick={action.onClick} on the action button, with no onSelect
    // call — React's own doc comment: "Not called for actionSection items — those are commands,
    // not navigation destinations."
    action.onClick?.();
  }
}
