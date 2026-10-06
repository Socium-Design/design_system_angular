import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, computed, contentChild, input, output } from '@angular/core';
import type { NavigationProduct } from '../side-navigation/navigation-presets';
import { SocAppIconGlyph, type AppIconName } from './app-icons';
import { APP_SWITCH_ITEMS, type AppSwitchItemData } from './app-switch-presets';

/** React `AppSwitch`'s `logo?: ReactNode` — rendered above the icon list (pass the Logo
 * component, e.g. `SocSwitchLogo`, once it exists — same "not implemented yet" note as React's
 * own doc comment). */
@Directive({ selector: '[socAppSwitchLogo]', standalone: true })
export class SocAppSwitchLogo {}

/**
 * Attribute selector on a real `<button>` (`button[socAppIcon]`) — structurally just a button
 * with a self-drawn icon inside, no siblings needed, same shape as `Button` itself. Maps 1:1 to
 * "Index/Navigation/AppIcon/*" tokens — see packages/tokens/tokens/components/navigation.json in
 * design_system (React reference repo, read only).
 */
@Component({
  selector: 'button[socAppIcon]',
  standalone: true,
  imports: [SocAppIconGlyph],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[attr.aria-label]': 'label()',
    '[attr.aria-pressed]': 'selected()',
    '[attr.title]': 'label()',
    '[class]': 'hostClasses()',
  },
  template: `<soc-app-icon-glyph [name]="name()" [selected]="selected()" />`,
})
export class SocAppIcon {
  readonly name = input.required<AppIconName>();
  readonly label = input.required<string>();
  readonly selected = input(false);

  protected readonly hostClasses = computed(
    () =>
      `group flex size-[var(--index-navigation-appicon-item-size)] shrink-0 items-center justify-center rounded-[var(--index-button-button-radius)] ${
        this.selected() ? 'bg-[var(--index-navigation-appicon-bg-selected)]' : 'hover:bg-[var(--index-navigation-appicon-bg-hover)]'
      }`,
  );
}

/**
 * No native HTML equivalent — plain wrapper (`soc-app-switch`). Maps 1:1 to
 * "Index/Navigation/AppSwitch/*" tokens — see packages/tokens/tokens/components/navigation.json
 * in design_system (React reference repo, read only). `onSelect` -> `select` output(); `logo` ->
 * named content slot (`socAppSwitchLogo`), same reasoning as every other `ReactNode` slot this
 * migration.
 */
@Component({
  selector: 'soc-app-switch',
  standalone: true,
  imports: [SocAppIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class:
      'flex h-full w-[var(--index-navigation-appswitch-bar-width)] flex-col items-center gap-[var(--index-navigation-appswitch-logo-gap)] bg-[var(--index-navigation-appswitch-bar-bg)] px-[var(--index-button-button-padding-h)] pt-[var(--index-navigation-appswitch-padding-top)] pb-[var(--index-navigation-appswitch-padding-bottom)]',
  },
  template: `
    @if (hasLogo()) {
      <div class="shrink-0 text-[var(--index-navigation-appswitch-logo-color)]">
        <ng-content select="[socAppSwitchLogo]" />
      </div>
    }
    <div class="flex w-full flex-col items-center gap-[var(--index-navigation-appicon-items-gap)]">
      @for (item of resolvedItems(); track item.id) {
        <button socAppIcon [name]="item.name" [label]="item.label" [selected]="item.id === resolvedSelectedId()" (click)="select.emit(item.id)"></button>
      }
    </div>
  `,
})
export class SocAppSwitch {
  readonly product = input<NavigationProduct>();
  readonly items = input<AppSwitchItemData[]>();
  readonly selectedId = input<string>();
  readonly select = output<string>();

  private readonly logoContent = contentChild(SocAppSwitchLogo);
  protected readonly hasLogo = computed(() => !!this.logoContent());

  protected readonly resolvedItems = computed(() => this.items() ?? (this.product() ? Object.values(APP_SWITCH_ITEMS) : []));
  protected readonly resolvedSelectedId = computed(() => this.selectedId() ?? this.product());
}
