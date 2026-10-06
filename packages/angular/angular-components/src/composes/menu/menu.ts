import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, computed, contentChild, input } from '@angular/core';
import { SocCheckbox } from '../../primitifs/checkbox/checkbox';
import { SocRadioButton } from '../../primitifs/radio-button/radio-button';

export type MenuItemLevel = 1 | 2 | 3;
export type MenuItemMode = 'icon' | 'checkbox' | 'radio';

/** React `MenuItem`'s `icon?: ReactNode` — only rendered when `mode === 'icon'`. */
@Directive({ selector: '[socMenuItemIcon]', standalone: true })
export class SocMenuItemIcon {}

const LEVEL_PADDING: Record<MenuItemLevel, string> = {
  1: 'pl-[var(--index-conteneur-menu-item-pad-h)]',
  2: 'pl-[var(--index-conteneur-menu-level2-indent)]',
  3: 'pl-[var(--index-conteneur-menu-level3-indent)]',
};

/**
 * Attribute selector on a real `<button>` (`button[socMenuItem]`) — React's `MenuItem` root IS a
 * single `<button type="button">`, same shape as `Button` itself, so `(click)` (React `onClick`),
 * `disabled`, `aria-*` etc. are just the native ones. Maps 1:1 to "Index/Conteneur/Menu/*" tokens —
 * see packages/tokens/tokens/components/conteneur.json in design_system (React reference repo,
 * read only). `icon` -> named content slot (`socMenuItemIcon`).
 *
 * `checked` is optional here exactly like in React: undefined leaves the inner `Checkbox`
 * uncontrolled (it keeps its own state), a value drives it. One known difference, only reachable by
 * passing `checked` without ever updating it on click: React's controlled `Checkbox` then ignores
 * the click, whereas `soc-checkbox`'s `model()` flips its own value locally until the bound value
 * next changes. Normal usage (parent toggles `checked` in its own `(click)` handler) is identical.
 */
@Component({
  selector: 'button[socMenuItem]',
  standalone: true,
  imports: [SocCheckbox, SocRadioButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    type: 'button',
    '[class]': 'hostClasses()',
  },
  template: `
    @if (mode() === 'icon' && hasIcon()) {
      <span class="size-[var(--index-conteneur-menu-item-icon-size)] shrink-0 text-[var(--index-conteneur-menu-item-icon-color)]">
        <ng-content select="[socMenuItemIcon]" />
      </span>
    }
    @if (mode() === 'checkbox') {
      <soc-checkbox [checked]="checked() ?? false" />
    }
    @if (mode() === 'radio') {
      <soc-radio-button [selected]="checked() ?? false" />
    }
    <span class="flex-1 text-[length:var(--index-conteneur-menu-item-text-size)] text-[var(--index-conteneur-menu-item-text-color)] [font-family:var(--index-conteneur-menu-item-text-font)] [font-weight:var(--index-conteneur-menu-item-text-weight)]">
      {{ label() }}
    </span>
  `,
  styleUrl: './menu.css',
})
export class SocMenuItem {
  readonly label = input.required<string>();
  readonly level = input<MenuItemLevel>(1);
  readonly mode = input<MenuItemMode>('icon');
  readonly checked = input<boolean>();

  private readonly iconContent = contentChild(SocMenuItemIcon);
  protected readonly hasIcon = computed(() => !!this.iconContent());

  protected readonly hostClasses = computed(
    () =>
      `flex w-full min-w-[160px] items-center gap-[var(--index-conteneur-menu-item-gap)] py-[var(--index-conteneur-menu-item-pad-v)] pr-[var(--index-conteneur-menu-item-pad-h)] text-left hover:bg-[var(--index-conteneur-menu-item-bg-hover)] active:bg-[var(--index-conteneur-menu-item-bg-pressed)] focus-visible:outline-none focus-visible:border-[length:var(--index-conteneur-menu-item-border-width)] focus-visible:border-[var(--index-conteneur-menu-item-border-focus)] ${LEVEL_PADDING[this.level()]}`,
  );
}

/**
 * No native HTML equivalent — plain wrapper (`soc-menu`). A list of `button[socMenuItem]`, meant to
 * be the projected content of a `soc-popover`. React's `className` merge needs no input here: a
 * literal `class="..."` on `<soc-menu>` composes with this host's own classes natively.
 */
@Component({
  selector: 'soc-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex w-full flex-col items-start gap-[var(--index-conteneur-menu-items-gap)]' },
  template: `<ng-content />`,
  styleUrl: './menu.css',
})
export class SocMenu {}
