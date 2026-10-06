import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from '@angular/core';
import { LucideLogOut } from '@lucide/angular';
import { SocAvatar } from '../../primitifs/avatar/avatar';
import { SocButton } from '../../primitifs/button/button';
import { SocMenu, SocMenuItem, SocMenuItemIcon } from '../menu/menu';

/**
 * Contenu du menu déroulant ouvert au clic sur l'avatar dans `HeaderApp` — à passer à sa prop
 * `avatarMenu` (rendu dans un `Popover` ancré à l'AvatarZone). Ne s'utilise jamais seul en dehors de
 * ce contexte : ce n'est qu'un panneau de contenu, pas un composant de déclenchement. Plain wrapper
 * (`soc-avatar-menu`); React's root `<div className>` is this host, so a literal `class` on
 * `<soc-avatar-menu>` replaces React's `className` prop.
 *
 * Maps 1:1 to Figma's "AvatarMenu" (node 630:2682) — reuses the popover surface tokens of
 * `Menu`/`Popover` (`Index/Conteneur/Menu/popover-*`), no distinct token set exists for this panel.
 *
 * GAP-DECISION (flagged, not decided silently): React shows the "Voir profil" / "Modifier avatar"
 * ghost buttons only when the matching `onViewProfile` / `onEditAvatar` prop is *passed* ("Omit to
 * hide"). An Angular `output()` has no public way to ask whether anyone subscribed, so that
 * presence-of-handler signal can't be reproduced. Mirrored with two explicit boolean inputs,
 * `showViewProfile` / `showEditAvatar` (both false by default, i.e. hidden — same default as
 * "handler omitted" in React), next to the `viewProfile` / `editAvatar` outputs. `disconnect` is
 * always rendered, like React's required `onDisconnect`.
 */
@Component({
  selector: 'soc-avatar-menu',
  standalone: true,
  imports: [SocAvatar, SocButton, SocMenu, SocMenuItem, SocMenuItemIcon, LucideLogOut],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class:
      'flex w-[231px] flex-col items-start gap-[3px] rounded-[var(--index-conteneur-menu-popover-radius)] bg-[var(--index-conteneur-menu-popover-bg)] py-[var(--index-conteneur-menu-popover-pad)] drop-shadow-[0px_var(--index-conteneur-menu-popover-shadow-y)_var(--index-conteneur-menu-popover-shadow-blur)_rgba(68,84,111,var(--index-conteneur-menu-popover-shadow-opacity))]',
  },
  template: `
    <div class="flex w-full flex-col gap-3 p-3">
      <soc-avatar class="w-full" [label]="avatarLabel()" [name]="userName()" [subtitle]="userEmail()" size="lg" namePosition="right" />
      @if (showViewProfile() || showEditAvatar()) {
        <div class="flex items-start gap-2">
          @if (showViewProfile()) {
            <button socButton variant="ghost" size="sm" (click)="viewProfile.emit()">Voir profil</button>
          }
          @if (showEditAvatar()) {
            <button socButton variant="ghost" size="sm" (click)="editAvatar.emit()">Modifier avatar</button>
          }
        </div>
      }
    </div>
    <div class="h-px w-full bg-[var(--index-conteneur-dialog-separator-color)]"></div>
    <soc-menu>
      <button socMenuItem label="Déconnexion" (click)="disconnect.emit()">
        <svg lucideLogOut socMenuItemIcon class="size-full" [strokeWidth]="1.5"></svg>
      </button>
    </soc-menu>
  `,
  styleUrl: './avatar-menu.css',
})
export class SocAvatarMenu {
  readonly userName = input.required<string>();
  readonly userEmail = input.required<string>();
  /** Initials shown in the profile circle — 2 characters max, forwarded to `Avatar`. */
  readonly avatarLabel = input.required<string>();
  readonly showViewProfile = input(false);
  readonly showEditAvatar = input(false);

  readonly viewProfile = output<void>();
  readonly editAvatar = output<void>();
  readonly disconnect = output<void>();
}
