import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, computed, contentChild, input, output, signal } from '@angular/core';
import { LucideBell, LucideCircleHelp } from '@lucide/angular';
import { SocPopover, SocPopoverTrigger } from '../../primitifs/popover/popover';
import { SocTooltip, SocTooltipLabel } from '../../primitifs/tooltip/tooltip';

/** React `HeaderApp`'s `left: ReactNode` — typically an EnterpriseSelect or a Logo. */
@Directive({ selector: '[socHeaderAppLeft]', standalone: true })
export class SocHeaderAppLeft {}

/** React `avatar: ReactNode` — typically a `soc-avatar` (size="md", mode="solid"). */
@Directive({ selector: '[socHeaderAppAvatar]', standalone: true })
export class SocHeaderAppAvatar {}

/** React `avatarMenu?: ReactNode` — content of the dropdown opened by clicking the AvatarZone,
 * typically a `soc-avatar-menu`. Omit it to keep the AvatarZone a plain, non-interactive display
 * (no hover state, no click handler): the AvatarZone only becomes a button once this is present. */
@Directive({ selector: '[socHeaderAppAvatarMenu]', standalone: true })
export class SocHeaderAppAvatarMenu {}

/** React `languageSelect?: ReactNode` — rendered between the notification icon and the separator,
 * typically a `soc-language-select`. Omit to not show a language control at all. */
@Directive({ selector: '[socHeaderAppLanguageSelect]', standalone: true })
export class SocHeaderAppLanguageSelect {}

/**
 * Maps 1:1 to "Index/Navigation/HeaderApp/*" tokens — see
 * packages/tokens/tokens/components/navigation.json in design_system (React reference repo, read
 * only). Plain wrapper (`soc-header-app`, `role="banner"` to keep the landmark React's `<header>`
 * gives for free); React's `className` is a literal `class` on the host. The help/notification
 * icons are Lucide's `CircleHelp`/`Bell` (Figma names its icon instances after Lucide slugs).
 *
 * Every `ReactNode` prop -> named content slot with a marker directive. `avatar` is needed in two
 * mutually exclusive places (inside the AvatarZone button when `avatarMenu` is present, bare
 * otherwise) — Angular only reliably honours ONE physical `<ng-content>` per selector, so the
 * AvatarZone lives in a single `<ng-template>` rendered from either branch (same fix as `Message`/
 * `Tooltip`). `onHelpClick`/`onNotificationsClick` -> `helpClick`/`notificationsClick` outputs.
 *
 * No left padding on purpose — `left` (typically an EnterpriseSelect) must sit flush with
 * HeaderApp's own left edge, so it lines up with SideNavigation's left border below it in the
 * "Full Page" composition. `pad-h` still applies on the right, ahead of the icons/AvatarZone.
 */
@Component({
  selector: 'soc-header-app',
  standalone: true,
  imports: [NgTemplateOutlet, SocPopover, SocPopoverTrigger, SocTooltip, SocTooltipLabel, LucideBell, LucideCircleHelp],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    role: 'banner',
    class:
      'flex w-full items-center justify-between bg-[var(--index-navigation-headerapp-bg)] pr-[var(--index-navigation-headerapp-pad-h)] py-[var(--index-navigation-headerapp-pad-v)]',
  },
  template: `
    <div><ng-content select="[socHeaderAppLeft]" /></div>
    <div class="flex items-center gap-[var(--index-navigation-headerapp-gap)]">
      <soc-tooltip>
        <button
          type="button"
          (click)="helpClick.emit()"
          aria-label="Aide"
          class="inline-flex size-[var(--index-navigation-headerapp-icon-size)] items-center justify-center text-[var(--index-navigation-headerapp-icon-color)]"
        >
          <svg lucideCircleHelp class="size-full" [strokeWidth]="iconThickness"></svg>
        </button>
        <span socTooltipLabel>Aide</span>
      </soc-tooltip>
      <soc-tooltip>
        <button
          type="button"
          (click)="notificationsClick.emit()"
          aria-label="Notifications"
          class="inline-flex size-[var(--index-navigation-headerapp-icon-size)] items-center justify-center text-[var(--index-navigation-headerapp-icon-color)]"
        >
          <svg lucideBell class="size-full" [strokeWidth]="iconThickness"></svg>
        </button>
        <span socTooltipLabel>Notifications</span>
      </soc-tooltip>
      <ng-content select="[socHeaderAppLanguageSelect]" />
      <span aria-hidden="true" class="w-px self-stretch bg-[var(--index-navigation-headerapp-separator-color)]"></span>
      @if (hasAvatarMenu()) {
        <soc-popover position="bottom-end" [(open)]="avatarMenuOpen">
          <button
            socPopoverTrigger
            type="button"
            class="rounded-[var(--index-navigation-headerapp-avatarzone-radius)] px-[var(--index-navigation-headerapp-avatarzone-pad-h)] py-[var(--index-navigation-headerapp-avatarzone-pad-v)] hover:bg-[var(--index-navigation-headerapp-avatarzone-bg-hover)]"
          >
            <ng-container [ngTemplateOutlet]="avatarZone" />
          </button>
          <ng-content select="[socHeaderAppAvatarMenu]" />
        </soc-popover>
      } @else {
        <ng-container [ngTemplateOutlet]="avatarZone" />
      }
    </div>

    <ng-template #avatarZone>
      <div class="flex items-center gap-[var(--index-navigation-headerapp-avatar-zone-gap)]">
        <span class="whitespace-nowrap text-[length:var(--index-navigation-headerapp-avatar-title-size)] text-[var(--index-navigation-headerapp-label-headerapp-color)] [font-family:var(--index-navigation-headerapp-avatar-title-font)] [font-weight:var(--index-navigation-headerapp-avatar-title-weight)]">
          {{ userName() }}
        </span>
        <ng-content select="[socHeaderAppAvatar]" />
      </div>
    </ng-template>
  `,
  styleUrl: './header-app.css',
})
export class SocHeaderApp {
  /** The signed-in user's display name, rendered inside HeaderApp's own AvatarZone next to the
   * `avatar` slot — not a free-form slot: the gap and typography between the two come from
   * `Index/Navigation/HeaderApp/avatar-*` tokens, matching Figma's AvatarZone exactly. */
  readonly userName = input.required<string>();
  readonly helpClick = output<void>();
  readonly notificationsClick = output<void>();

  protected readonly iconThickness = 'var(--index-navigation-headerapp-icon-thickness)';
  protected readonly avatarMenuOpen = signal(false);

  private readonly avatarMenuContent = contentChild(SocHeaderAppAvatarMenu);
  protected readonly hasAvatarMenu = computed(() => !!this.avatarMenuContent());
}
