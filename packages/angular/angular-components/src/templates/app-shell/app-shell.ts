import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, computed, contentChild, input, model, output } from '@angular/core';
import { SocAppSwitch, SocAppSwitchLogo } from '../../primitifs/app-switch/app-switch';
import { SocSwitchLogo } from '../../primitifs/app-switch/app-icons';
import { SocSideNavigation } from '../../primitifs/side-navigation/side-navigation';
import type { NavigationProduct } from '../../primitifs/side-navigation/navigation-presets';
import { SocAvatarMenu } from '../../composes/avatar-menu/avatar-menu';
import {
  SocHeaderApp,
  SocHeaderAppAvatar,
  SocHeaderAppAvatarMenu,
  SocHeaderAppLanguageSelect,
  SocHeaderAppLeft,
} from '../../composes/header-app/header-app';
import { LanguageOption, SocLanguageSelect } from '../../composes/language-select/language-select';

export type AppShellProduct = NavigationProduct;

export interface AppShellHeaderUser {
  name: string;
  email: string;
  /** Initials shown in the avatar circle — 2 characters max. */
  avatarLabel: string;
}

/** HeaderApp's `left` slot — typically a `soc-enterprise-select`. Never a fixed generic instance: its
 * content depends on the signed-in user/enterprise context, which only the consumer has. */
@Directive({ selector: '[socAppShellHeaderLeft]', standalone: true })
export class SocAppShellHeaderLeft {}

/** HeaderApp's `avatar` slot — typically a `soc-avatar` (size="md", mode="solid"). */
@Directive({ selector: '[socAppShellHeaderAvatar]', standalone: true })
export class SocAppShellHeaderAvatar {}

/** Advanced/custom escape hatch — full control over the avatar menu's content, for cases `user` +
 * `showViewProfile`/`showEditAvatar`/`(disconnect)` can't express. Wins over `user` if both are given. */
@Directive({ selector: '[socAppShellHeaderAvatarMenu]', standalone: true })
export class SocAppShellHeaderAvatarMenu {}

/** Advanced/custom escape hatch for the language control — same idea; wins over `languages`. */
@Directive({ selector: '[socAppShellHeaderLanguageSelect]', standalone: true })
export class SocAppShellHeaderLanguageSelect {}

/**
 * ## Rôle
 * Conteneur racine de toute page applicative du Design System: assemble AppSwitch, HeaderApp,
 * SideNavigation et la Content Zone dans une seule structure fixe, identique quel que soit le produit ou
 * l'écran. À utiliser systématiquement comme racine d'une page applicative (jamais deux imbriqués, jamais
 * pour un écran hors-application: connexion, erreur plein écran).
 *
 * ## Cas particuliers
 * - `product` pilote à la fois AppSwitch (icône sélectionnée) et SideNavigation (contenu du menu): les
 *   deux ne doivent jamais être synchronisés manuellement ni diverger.
 * - SideNavigation reste scrollable indépendamment de la Content Zone.
 * - Espacements internes verrouillés (tokens du DS): aucune surcharge `style`/`class`/gap/padding.
 *
 * ## Menu avatar et sélecteur de langue
 * Usage recommandé: `[user]="{ name, email, avatarLabel }"` + `(disconnect)` (+ `showViewProfile`/
 * `showEditAvatar`) et `[languages]` + `[(language)]` — AppShell construit et câble lui-même
 * `soc-avatar-menu`/`soc-language-select`. `socAppShellHeaderAvatarMenu`/`socAppShellHeaderLanguageSelect`
 * restent en secours pour un contenu totalement custom (ils gagnent si les deux sont fournis).
 *
 * ## Différences avec React (décisions signalées)
 * 1. `product`, `navSelectedId`, `navCollapsed`, `language` sont des `model()` (`[(product)]`…): AppShell
 *    suit le clic tout seul, là où React exige que le parent mette à jour `navSelectedId`/`navCollapsed`
 *    depuis `onNavSelect`/`onNavToggleCollapse` (sinon l'item actif ne bouge pas et le bouton de repli ne
 *    fait rien). Les sorties `productChange`/`navSelectedIdChange`/`navCollapsedChange`/`languageChange`
 *    jouent le rôle des callbacks React; le routage de la page affichée reste au consommateur.
 * 2. `onViewProfile`/`onEditAvatar` (leur présence affichait les boutons) -> `showViewProfile`/
 *    `showEditAvatar` + sorties (même décision que `soc-avatar-menu`).
 * 3. Slots `ReactNode` (`headerLeft`, `headerAvatar`, `headerAvatarMenu`, `headerLanguageSelect`) ->
 *    marqueurs `socAppShellHeader*`. Chacun est ré-exposé à HeaderApp via un wrapper `display: contents`
 *    déclaré ici: un `<ng-content>` transmis tel quel ne porterait pas les marqueurs de HeaderApp, et les
 *    requêtes de contenu de HeaderApp ne voient que les nœuds déclarés dans CE template.
 * 4. `children` = la page (`soc-page-list`/`details`/`form`/`profile`/`home`) dans la Content Zone.
 *
 * Maps 1:1 to "Index/Template/AppShell/*" tokens — see packages/tokens/tokens/components/template.json.
 */
@Component({
  selector: 'soc-app-shell',
  standalone: true,
  imports: [
    SocAppSwitch,
    SocAppSwitchLogo,
    SocSwitchLogo,
    SocHeaderApp,
    SocHeaderAppLeft,
    SocHeaderAppAvatar,
    SocHeaderAppAvatarMenu,
    SocHeaderAppLanguageSelect,
    SocAvatarMenu,
    SocLanguageSelect,
    SocSideNavigation,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex h-screen w-full gap-0 bg-[var(--index-template-appshell-page-bg)]' },
  template: `
    <soc-app-switch [product]="product()" (select)="product.set($any($event))">
      <soc-switch-logo socAppSwitchLogo />
    </soc-app-switch>

    <div class="flex min-w-0 flex-1 flex-col gap-0">
      <soc-header-app [userName]="headerUserName()" (helpClick)="helpClick.emit()" (notificationsClick)="notificationsClick.emit()">
        <div socHeaderAppLeft class="contents"><ng-content select="[socAppShellHeaderLeft]" /></div>
        <div socHeaderAppAvatar class="contents"><ng-content select="[socAppShellHeaderAvatar]" /></div>
        @if (hasCustomLanguageSelect()) {
          <div socHeaderAppLanguageSelect class="contents"><ng-content select="[socAppShellHeaderLanguageSelect]" /></div>
        } @else if (languages()) {
          <soc-language-select socHeaderAppLanguageSelect [options]="languages()!" [(value)]="language" />
        }
        @if (hasCustomAvatarMenu()) {
          <div socHeaderAppAvatarMenu class="contents"><ng-content select="[socAppShellHeaderAvatarMenu]" /></div>
        } @else if (user()) {
          <soc-avatar-menu
            socHeaderAppAvatarMenu
            [userName]="user()!.name"
            [userEmail]="user()!.email"
            [avatarLabel]="user()!.avatarLabel"
            [showViewProfile]="showViewProfile()"
            [showEditAvatar]="showEditAvatar()"
            (viewProfile)="viewProfile.emit()"
            (editAvatar)="editAvatar.emit()"
            (disconnect)="disconnect.emit()"
          />
        }
      </soc-header-app>

      <div class="flex min-h-0 flex-1 gap-0">
        <soc-side-navigation
          [product]="product()"
          [selectedId]="navSelectedId()"
          (select)="navSelectedId.set($event)"
          [collapsed]="navCollapsed()"
          (toggleCollapse)="navCollapsed.set(!navCollapsed())"
        />

        <div class="scrollbar-hide min-w-0 flex-1 overflow-y-auto pl-[var(--index-template-appshell-content-zone-pad-left)]">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class SocAppShell {
  /** Which app is active — drives AppSwitch's selected icon and SideNavigation's preset content at
   * once. AppShell has no meaningful "no product" state, so this is required. */
  readonly product = model.required<AppShellProduct>();
  /** Forwarded to HeaderApp's `userName` — rendered in its AvatarZone next to the avatar slot. */
  readonly headerUserName = input.required<string>();
  readonly helpClick = output<void>();
  readonly notificationsClick = output<void>();

  /** Signed-in user shown in the avatar menu — standard way to get a clickable avatar menu. */
  readonly user = input<AppShellHeaderUser>();
  readonly showViewProfile = input(false);
  readonly showEditAvatar = input(false);
  readonly viewProfile = output<void>();
  readonly editAvatar = output<void>();
  readonly disconnect = output<void>();

  /** Standard way to get a language control next to the notification icon. */
  readonly languages = input<LanguageOption[]>();
  readonly language = model<string>();

  /** Which item is highlighted within the product's preset menu. Kept in sync with the clicked item;
   * the consumer reacts to `navSelectedIdChange` to show the matching page. */
  readonly navSelectedId = model<string>();
  readonly navCollapsed = model(false);

  private readonly customAvatarMenu = contentChild(SocAppShellHeaderAvatarMenu);
  private readonly customLanguageSelect = contentChild(SocAppShellHeaderLanguageSelect);
  protected readonly hasCustomAvatarMenu = computed(() => !!this.customAvatarMenu());
  protected readonly hasCustomLanguageSelect = computed(() => !!this.customLanguageSelect());
}
