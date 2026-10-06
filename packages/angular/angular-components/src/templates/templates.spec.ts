import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SocAvatar } from '../primitifs/avatar/avatar';
import { SocButton } from '../primitifs/button/button';
import { SocAvatarMenu } from '../composes/avatar-menu/avatar-menu';
import { SocEnterpriseSelect } from '../composes/enterprise-select/enterprise-select';
import {
  SocHeaderApp,
  SocHeaderAppAvatar,
  SocHeaderAppAvatarMenu,
  SocHeaderAppLanguageSelect,
  SocHeaderAppLeft,
} from '../composes/header-app/header-app';
import { SocLanguageSelect } from '../composes/language-select/language-select';
import { q, qa, visiblePanels } from '../testing/helpers';
import { SocAppShell, SocAppShellHeaderAvatar, SocAppShellHeaderAvatarMenu, SocAppShellHeaderLeft, type AppShellProduct } from './app-shell/app-shell';
import { SocPageDetails } from './page-details/page-details';
import { SocPageForm } from './page-form/page-form';
import { SocPageHome } from './page-home/page-home';
import { SocPageList } from './page-list/page-list';
import { SocPageProfile } from './page-profile/page-profile';
import {
  SocPageActions,
  SocPageBadge,
  SocPageBreadcrumb,
  SocPageHeader,
  SocPageMessage,
  SocPageSecondContent,
  SocPageSecondaryTabs,
  SocPageSectionActions,
  SocPageStepper,
  SocPageTabs,
  SocPageTag,
} from './page-slots';

describe('HeaderApp', () => {
  @Component({
    standalone: true,
    imports: [SocHeaderApp, SocHeaderAppLeft, SocHeaderAppAvatar, SocHeaderAppAvatarMenu, SocHeaderAppLanguageSelect, SocAvatar, SocAvatarMenu, SocLanguageSelect],
    template: `
      <soc-header-app userName="Absatou" (helpClick)="log.push('help')" (notificationsClick)="log.push('notif')">
        <span socHeaderAppLeft class="left">Entreprise</span>
        <soc-avatar socHeaderAppAvatar label="AD" />
        @if (menu()) {
          <soc-avatar-menu socHeaderAppAvatarMenu userName="Absatou" userEmail="a@b.c" avatarLabel="AD" />
        }
        @if (lang()) {
          <soc-language-select socHeaderAppLanguageSelect [options]="[{ value: 'fr', label: 'FR' }]" />
        }
      </soc-header-app>
    `,
  })
  class Host {
    log: string[] = [];
    menu = signal(false);
    lang = signal(false);
  }
  const setup = () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    return f;
  };

  it('has the banner landmark, the user name, the avatar and the left slot', () => {
    const f = setup();
    expect(q(f, 'soc-header-app').getAttribute('role')).toBe('banner');
    expect(q(f, '.left').textContent).toBe('Entreprise');
    expect(q(f, 'soc-header-app').textContent).toContain('Absatou');
    expect(qa(f, 'soc-avatar').length).toBe(1); // single physical avatar slot
  });

  it('keeps the AvatarZone a plain display without a menu, a button with one (avatar never duplicated)', () => {
    const f = setup();
    expect(qa(f, 'button').some((b) => b.textContent!.includes('Absatou'))).toBeFalse();
    f.componentInstance.menu.set(true);
    f.detectChanges();
    expect(qa(f, 'button').some((b) => b.textContent!.includes('Absatou'))).toBeTrue();
    expect(qa(f, 'soc-avatar').length).toBe(1); // still a single zone avatar (the menu's own avatar is portaled to <body>)
  });

  it('opens the avatar menu from the zone, aligned right', () => {
    const f = setup();
    f.componentInstance.menu.set(true);
    f.detectChanges();
    qa<HTMLButtonElement>(f, 'button').find((b) => b.textContent!.includes('Absatou'))!.click();
    f.detectChanges();
    expect(visiblePanels()[0].textContent).toContain('Déconnexion');
  });

  it('emits help/notifications clicks and shows the optional language select only when given', () => {
    const f = setup();
    q<HTMLButtonElement>(f, 'button[aria-label=Aide]').click();
    q<HTMLButtonElement>(f, 'button[aria-label=Notifications]').click();
    expect(f.componentInstance.log).toEqual(['help', 'notif']);
    expect(qa(f, 'soc-language-select').length).toBe(0);
    f.componentInstance.lang.set(true);
    f.detectChanges();
    expect(qa(f, 'soc-language-select').length).toBe(1);
  });
});

describe('AppShell', () => {
  @Component({
    standalone: true,
    imports: [SocAppShell, SocAppShellHeaderLeft, SocAppShellHeaderAvatar, SocAppShellHeaderAvatarMenu, SocAvatar, SocEnterpriseSelect],
    template: `
      <soc-app-shell
        [(product)]="product"
        [(navSelectedId)]="navSelectedId"
        [(navCollapsed)]="collapsed"
        headerUserName="Absatou"
        [user]="withUser() ? user : undefined"
        [showViewProfile]="true"
        [languages]="withLanguages() ? languages : undefined"
        [(language)]="language"
        (disconnect)="log.push('disconnect')"
        (viewProfile)="log.push('profile')"
      >
        <soc-enterprise-select socAppShellHeaderLeft [options]="[{ value: 's', company: 'Socium', subsidiary: 'SN' }]" />
        <soc-avatar socAppShellHeaderAvatar label="AD" />
        @if (custom()) {
          <div socAppShellHeaderAvatarMenu class="custom-menu">Menu sur mesure</div>
        }
        <main class="page">Page</main>
      </soc-app-shell>
    `,
  })
  class Host {
    log: string[] = [];
    product = signal<AppShellProduct>('workspace');
    navSelectedId = signal<string | undefined>(undefined);
    collapsed = signal(false);
    language = signal<string | undefined>('fr');
    user = { name: 'Absatou', email: 'a@b.c', avatarLabel: 'AD' };
    languages = [{ value: 'en', label: 'EN' }, { value: 'fr', label: 'FR' }];
    withUser = signal(true);
    withLanguages = signal(true);
    custom = signal(false);
  }
  const setup = () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    return f;
  };

  it('assembles AppSwitch, HeaderApp, SideNavigation and the projected page', () => {
    const f = setup();
    for (const tag of ['soc-app-switch', 'soc-header-app', 'soc-side-navigation']) expect(qa(f, tag).length).toBe(1);
    expect(q(f, '.page').textContent).toBe('Page');
    expect(q(f, 'soc-header-app soc-enterprise-select').textContent).toContain('Socium');
    expect(qa(f, 'soc-header-app soc-avatar').length).toBeGreaterThan(0);
  });

  it('follows the navigation click by itself ([(navSelectedId)]) and toggles the collapse', () => {
    const f = setup();
    qa<HTMLButtonElement>(f, 'soc-side-navigation button').find((b) => b.textContent!.includes('Tableau de bord'))!.click();
    f.detectChanges();
    expect(f.componentInstance.navSelectedId()).toBe('workspace-tableau-de-bord');
    q<HTMLButtonElement>(f, 'button[aria-label="Replier le menu"]').click();
    f.detectChanges();
    expect(f.componentInstance.collapsed()).toBeTrue();
  });

  it('switches product through AppSwitch and updates the menu in lockstep', () => {
    const f = setup();
    const before = q(f, 'soc-side-navigation').textContent;
    qa<HTMLButtonElement>(f, 'soc-app-switch button').find((b) => b.getAttribute('aria-label') === 'Payroll')!.click();
    f.detectChanges();
    expect(f.componentInstance.product()).toBe('payroll');
    expect(q(f, 'soc-side-navigation').textContent).not.toBe(before);
  });

  it('builds the standard avatar menu and language select from plain data, and forwards their events', () => {
    const f = setup();
    expect(qa(f, 'soc-language-select').length).toBe(1);
    qa<HTMLButtonElement>(f, 'soc-header-app button').find((b) => b.textContent!.includes('Absatou'))!.click();
    f.detectChanges();
    const panel = visiblePanels().find((p) => p.textContent!.includes('Déconnexion'))!;
    expect(panel.textContent).toContain('a@b.c');
    qa<HTMLButtonElement>(panel, 'button').find((b) => b.textContent!.includes('Voir profil'))!.click();
    qa<HTMLButtonElement>(panel, 'button').find((b) => b.textContent!.includes('Déconnexion'))!.click();
    expect(f.componentInstance.log).toEqual(['profile', 'disconnect']);
  });

  it('a custom avatar-menu slot replaces the built-in one and makes the zone interactive', () => {
    const f = setup();
    f.componentInstance.withUser.set(false);
    f.componentInstance.custom.set(true);
    f.detectChanges();
    qa<HTMLButtonElement>(f, 'soc-header-app button').find((b) => b.textContent!.includes('Absatou'))!.click();
    f.detectChanges();
    expect(visiblePanels().some((p) => p.querySelector('.custom-menu'))).toBeTrue();
  });

  it('without user/languages/custom slots, the avatar zone is not a button and there is no language select', () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.withUser.set(false);
    f.componentInstance.withLanguages.set(false);
    f.detectChanges();
    expect(qa(f, 'soc-language-select').length).toBe(0);
    expect(qa(f, 'soc-header-app button').some((b) => b.textContent!.includes('Absatou'))).toBeFalse();
  });
});

describe('page templates: optional slots render only when projected', () => {
  @Component({
    standalone: true,
    imports: [SocPageList, SocPageDetails, SocPageForm, SocPageProfile, SocPageHome, SocPageBreadcrumb, SocPageSecondaryTabs, SocPageBadge, SocPageTag, SocPageActions, SocPageTabs, SocPageHeader, SocPageStepper, SocPageMessage, SocPageSecondContent, SocPageSectionActions, SocButton],
    template: `
      <soc-page-list title="Liste" statusLabel="Statut" description="Desc">
        <b socPageBreadcrumb class="bc">bc</b>
        @if (full()) { <i socPageSecondaryTabs class="sec">sec</i> }
        @if (full()) { <i socPageBadge class="badge">12</i> }
        @if (full()) { <button socButton socPageActions class="act">Act</button> }
        @if (full()) { <i socPageTabs class="tabs">tabs</i> }
        <p class="body">contenu</p>
      </soc-page-list>
      <soc-page-details title="Détail" [showBack]="full()" (back)="log.push('back')" topStatusLabel="Haut">
        <b socPageBreadcrumb>bc</b>
        @if (full()) { <i socPageTag class="tag">tag</i> }
        @if (full()) { <button socButton socPageActions class="dact">A</button> }
        <p class="dbody">contenu</p>
      </soc-page-details>
      <soc-page-form title="Formulaire" sectionTitle="Section" secondSectionTitle="Seconde">
        <b socPageBreadcrumb>bc</b>
        @if (full()) { <i socPageStepper class="stepper">s</i> }
        @if (full()) { <i socPageMessage class="fmsg">m</i> }
        @if (full()) { <button socButton socPageActions class="fact">Valider</button> }
        @if (full()) { <div socPageSecondContent class="second">second</div> }
        <input class="field" />
      </soc-page-form>
      <soc-page-profile statusLabel="OK">
        <b socPageBreadcrumb>bc</b>
        <i socPageHeader class="pheader">identité</i>
        @if (full()) { <i socPageTabs class="ptabs">t</i> }
        @if (full()) { <i socPageMessage class="pmsg">m</i> }
        <p class="pbody">contenu</p>
      </soc-page-profile>
      <soc-page-home [welcomeTitle]="full() ? 'Bienvenue' : undefined" welcomeLabel="Accueil" [searchable]="full()" (search)="log.push('search:' + $event)" sectionTitle="Section">
        <b socPageBreadcrumb>bc</b>
        @if (full()) { <button socButton socPageSectionActions class="hact">Nouveau</button> }
        <p class="hbody">contenu</p>
      </soc-page-home>
    `,
  })
  class Host {
    log: string[] = [];
    full = signal(false);
  }
  const setup = (full: boolean) => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.full.set(full);
    f.detectChanges();
    return f;
  };

  it('always renders the required parts: titles, breadcrumb, default content', () => {
    const f = setup(false);
    expect(q(f, 'soc-page-list h1').textContent).toContain('Liste');
    expect(q(f, 'soc-page-list .bc').textContent).toBe('bc');
    expect(q(f, '.body').textContent).toBe('contenu');
    expect(q(f, 'soc-page-form h1').textContent).toContain('Formulaire');
    expect(q(f, '.field')).toBeTruthy();
    expect(q(f, '.pheader').textContent).toBe('identité');
    expect(q(f, '.hbody')).toBeTruthy();
  });

  it('omits optional zones when nothing is projected', () => {
    const f = setup(false);
    for (const sel of ['.sec', '.badge', '.act', '.tabs', '.tag', '.dact', '.stepper', '.fmsg', '.fact', '.second', '.ptabs', '.pmsg', '.hact']) {
      expect(qa(f, sel).length).withContext(sel).toBe(0);
    }
    expect(qa(f, 'soc-page-details button').length).toBe(0); // no back button
    expect(qa(f, 'soc-page-home soc-search-bar').length).toBe(0);
    expect(q(f, 'soc-page-home').textContent).not.toContain('Bienvenue');
  });

  it('renders each optional zone once when projected', () => {
    const f = setup(true);
    for (const sel of ['.sec', '.badge', '.act', '.tabs', '.tag', '.dact', '.stepper', '.fmsg', '.fact', '.second', '.ptabs', '.pmsg', '.hact']) {
      expect(qa(f, sel).length).withContext(sel).toBe(1);
    }
    expect(q(f, 'soc-page-home').textContent).toContain('Bienvenue');
  });

  it('PageDetails: showBack renders "Retour" and emits back', () => {
    const f = setup(true);
    const back = qa<HTMLButtonElement>(f, 'soc-page-details button').find((b) => b.textContent!.includes('Retour'))!;
    back.click();
    expect(f.componentInstance.log).toEqual(['back']);
  });

  it('PageHome: searchable shows the search bar and emits the raw query', () => {
    const f = setup(true);
    const input = q<HTMLInputElement>(f, 'soc-page-home soc-search-bar input');
    input.value = 'abc';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(f.componentInstance.log).toEqual(['search:abc']);
  });

  it('every page is a full-height flex column (size-full) so it fills AppShell\'s content zone', () => {
    const f = setup(false);
    for (const tag of ['soc-page-list', 'soc-page-details', 'soc-page-form', 'soc-page-profile', 'soc-page-home']) {
      expect(q(f, tag).className).toContain('size-full');
    }
  });
});
