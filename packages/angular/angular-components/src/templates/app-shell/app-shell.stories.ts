import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocAvatar } from '../../primitifs/avatar/avatar';
import { SocEnterpriseSelect } from '../../composes/enterprise-select/enterprise-select';
import { ENTERPRISES } from '../stories-shared';
import { SocAppShell, SocAppShellHeaderAvatar, SocAppShellHeaderLeft, type AppShellProduct } from './app-shell';

const PLACEHOLDER = `
  <div class="flex size-full items-center justify-center rounded-tl-[var(--bridges-shape-figure-radius-xl)] bg-[var(--bridges-color-surface-neutral-white)] text-[var(--bridges-color-text-secondary)]">
    Content Zone — page « {{ label }} » ici (PageList, PageDetails, PageForm ou PageProfile)
  </div>
`;

@Component({
  selector: 'story-appshell-switching',
  standalone: true,
  imports: [SocAppShell, SocAppShellHeaderLeft, SocAppShellHeaderAvatar, SocEnterpriseSelect, SocAvatar],
  template: `
    <soc-app-shell [(product)]="product" headerUserName="Absatou Diallo">
      <soc-enterprise-select socAppShellHeaderLeft [options]="enterprises" />
      <soc-avatar socAppShellHeaderAvatar label="DM" mode="solid" size="md" />
      <div class="flex size-full items-center justify-center rounded-tl-[var(--bridges-shape-figure-radius-xl)] bg-[var(--bridges-color-surface-neutral-white)] text-[var(--bridges-color-text-secondary)]">
        Content Zone — page « {{ product() }} » ici
      </div>
    </soc-app-shell>
  `,
})
class SwitchingDemo {
  product = signal<AppShellProduct>('workspace');
  enterprises = ENTERPRISES;
}

@Component({
  selector: 'story-appshell-navigating',
  standalone: true,
  imports: [SocAppShell, SocAppShellHeaderLeft, SocAppShellHeaderAvatar, SocEnterpriseSelect, SocAvatar],
  template: `
    <soc-app-shell product="workspace" [(navSelectedId)]="selected" headerUserName="Absatou Diallo">
      <soc-enterprise-select socAppShellHeaderLeft [options]="enterprises" />
      <soc-avatar socAppShellHeaderAvatar label="DM" mode="solid" size="md" />
      <div class="flex size-full items-center justify-center rounded-tl-[var(--bridges-shape-figure-radius-xl)] bg-[var(--bridges-color-surface-neutral-white)] text-[var(--bridges-color-text-secondary)]">
        Content Zone — page « {{ selected() }} » ici
      </div>
    </soc-app-shell>
  `,
})
class NavigatingDemo {
  selected = signal<string | undefined>('workspace-tableau-de-bord');
  enterprises = ENTERPRISES;
}

const meta: Meta = {
  title: 'Templates/App Shell',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    moduleMetadata({ imports: [SocAppShell, SocAppShellHeaderLeft, SocAppShellHeaderAvatar, SocEnterpriseSelect, SocAvatar, SwitchingDemo, NavigatingDemo] }),
  ],
  render: () => ({
    props: { enterprises: ENTERPRISES, label: 'workspace' },
    template: `
      <soc-app-shell product="workspace" navSelectedId="workspace-tableau-de-bord" headerUserName="Absatou Diallo">
        <soc-enterprise-select socAppShellHeaderLeft [options]="enterprises" />
        <soc-avatar socAppShellHeaderAvatar label="DM" mode="solid" size="md" />
        ${PLACEHOLDER}
      </soc-app-shell>
    `,
  }),
};
export default meta;
type Story = StoryObj;

/**
 * Root of every application page: AppSwitch (far left), HeaderApp (top band) and SideNavigation
 * (below the header) assembled with zero gap between them, around a Content Zone that only ever holds
 * one of the page templates (here, a placeholder).
 */
export const Default: Story = {};

/** `product` drives AppSwitch's selected icon and SideNavigation's menu content at once — clicking a
 * different app icon switches both in lockstep, never just one. */
export const ProductSwitching: Story = { render: () => ({ template: `<story-appshell-switching />` }) };

/** SideNavigation's own collapse toggle works through AppShell (`[(navCollapsed)]`) — it scrolls and
 * collapses independently of the Content Zone. */
export const CollapsedNavigation: Story = {
  render: () => ({
    props: { enterprises: ENTERPRISES, label: 'workspace' },
    template: `
      <soc-app-shell product="workspace" navSelectedId="workspace-tableau-de-bord" [navCollapsed]="true" headerUserName="Absatou Diallo">
        <soc-enterprise-select socAppShellHeaderLeft [options]="enterprises" />
        <soc-avatar socAppShellHeaderAvatar label="DM" mode="solid" size="md" />
        ${PLACEHOLDER}
      </soc-app-shell>
    `,
  }),
};

/** Recommended API for the avatar menu and language control: pass plain data (`user` + `(disconnect)`,
 * `languages` + `[(language)]`) — AppShell builds and wires `soc-avatar-menu`/`soc-language-select`
 * itself, no composition needed on the consumer side. */
export const WithAvatarMenuAndLanguage: Story = {
  render: () => ({
    props: {
      enterprises: ENTERPRISES,
      label: 'workspace',
      user: { name: 'Absatou Diallo', email: 'absatou.diallo@email.com', avatarLabel: 'AD' },
      languages: [
        { value: 'en', label: 'EN' },
        { value: 'fr', label: 'FR' },
      ],
    },
    template: `
      <soc-app-shell product="workspace" navSelectedId="workspace-tableau-de-bord" headerUserName="Absatou Diallo" [user]="user" [showViewProfile]="true" [showEditAvatar]="true" [languages]="languages" language="fr">
        <soc-enterprise-select socAppShellHeaderLeft [options]="enterprises" />
        <soc-avatar socAppShellHeaderAvatar label="DM" mode="solid" size="md" />
        ${PLACEHOLDER}
      </soc-app-shell>
    `,
  }),
};

/**
 * `navSelectedId` follows the clicked item (`[(navSelectedId)]`) — including `product`-preset items,
 * which have no click handler of their own — and the displayed page is driven by the same value. Click
 * between "Tableau de bord" and "Historique" in the sidebar: the active item and the page change together.
 */
export const NavigatingBetweenPages: Story = { render: () => ({ template: `<story-appshell-navigating />` }) };
