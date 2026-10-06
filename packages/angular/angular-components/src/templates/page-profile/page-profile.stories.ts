import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideCircleAlert } from '@lucide/angular';
import { SocBreadcrumb } from '../../primitifs/breadcrumb/breadcrumb';
import { SocMessage, SocMessageContent, SocMessageIcon } from '../../primitifs/message/message';
import { SocTabs } from '../../primitifs/tabs/tabs';
import { SocTag } from '../../primitifs/tag/tag';
import { SocProfileLine } from '../../composes/profile-line/profile-line';
import { SocPageBreadcrumb, SocPageHeader, SocPageMessage, SocPageTabs, SocPageTag } from '../page-slots';
import { StoryShell } from '../stories-shared';
import { SocPageProfile } from './page-profile';

@Component({
  selector: 'story-pageprofile-example',
  standalone: true,
  imports: [
    SocPageProfile, SocPageBreadcrumb, SocPageHeader, SocPageTag, SocPageTabs, SocPageMessage,
    SocBreadcrumb, SocProfileLine, SocTag, SocTabs, SocMessage, SocMessageContent, SocMessageIcon, LucideCircleAlert,
  ],
  template: `
    <soc-page-profile [showBack]="true" statusLabel="Text">
      <soc-breadcrumb socPageBreadcrumb [items]="[{ label: 'Parent' }, { label: 'Page actuelle' }]" />
      <soc-profile-line socPageHeader avatarLabel="DM" name="Nom Prénom" id="#123456789" role="Poste" department="Département" email="email@example.com" company="Entreprise" />
      <soc-tag socPageTag color="information">Tag</soc-tag>
      <soc-tabs socPageTabs variant="underline" [value]="tab()" (change)="tab.set($event)" [items]="[{ id: 'onglet-1', label: 'Onglet 1' }, { id: 'onglet-2', label: 'Onglet 2' }, { id: 'onglet-3', label: 'Onglet 3' }]" />
      <soc-message socPageMessage variant="banner" status="info">
        <svg lucideCircleAlert socMessageIcon class="size-full" [strokeWidth]="1.5"></svg>
        <span socMessageContent>Description text</span>
      </soc-message>
      <div class="flex h-96 w-full items-center justify-center rounded-md border border-dashed border-[var(--bridges-color-border-tertiary)] text-sm text-[var(--bridges-color-text-secondary)]">
        Content slot
      </div>
    </soc-page-profile>
  `,
})
class PageProfileExample {
  tab = signal('onglet-1');
}

const meta: Meta = {
  title: 'Templates/Page Profile',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [PageProfileExample, StoryShell] })],
};
export default meta;
type Story = StoryObj;

/** PageProfile fills its container's full height (`size-full`) — outside Storybook that container is
 * always AppShell's Content Zone. The `h-screen` wrapper stands in for that height. */
export const Default: Story = { render: () => ({ template: `<div class="h-screen"><story-pageprofile-example /></div>` }) };

export const FullPage: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({ template: `<story-shell><story-pageprofile-example /></story-shell>` }),
};
