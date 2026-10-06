import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideCalendarDays, LucideClipboardList, LucidePlus, LucideUsers } from '@lucide/angular';
import { SocBreadcrumb } from '../../primitifs/breadcrumb/breadcrumb';
import { SocButton, SocButtonLeftIcon } from '../../primitifs/button/button';
import { SocCard, SocCardIcon } from '../../primitifs/card/card';
import { SocCardGrid } from '../../composes/card-grid/card-grid';
import { SocPageBreadcrumb, SocPageSectionActions } from '../page-slots';
import { StoryShell } from '../stories-shared';
import { SocPageHome } from './page-home';

const BODY = (n: string) => `<div class="flex size-full min-h-[100px] items-center justify-center text-2xl font-semibold text-[var(--bridges-color-text-primary)]">${n}</div>`;

@Component({
  selector: 'story-pagehome-example',
  standalone: true,
  imports: [SocPageHome, SocPageBreadcrumb, SocPageSectionActions, SocBreadcrumb, SocButton, SocButtonLeftIcon, SocCardGrid, SocCard, SocCardIcon, LucideUsers, LucideCalendarDays, LucideClipboardList, LucidePlus],
  template: `
    <soc-page-home
      welcomeLabel="Accueil"
      welcomeTitle="Bienvenue Cheikh"
      welcomeDescription="Voici un aperçu de votre activité aujourd'hui."
      [searchable]="true"
      sectionTitle="Titre de la section"
      sectionSubtitle="Sous-titre descriptif de la section"
    >
      <soc-breadcrumb socPageBreadcrumb [items]="[{ label: 'Accueil' }]" />
      <button socButton socPageSectionActions variant="primary" size="lg">
        <svg lucidePlus socButtonLeftIcon class="size-full"></svg>
        Button
      </button>
      <soc-card-grid mode="bento" gap="md">
        <soc-card title="Employés" subtitle="Effectif total" [colSpan]="2">
          <svg lucideUsers socCardIcon class="size-full" strokeWidth="var(--index-conteneur-card-iconarea-icon-thickness)"></svg>
          ${BODY('248')}
        </soc-card>
        <soc-card title="Demandes de congé" subtitle="En attente">
          <svg lucideCalendarDays socCardIcon class="size-full" strokeWidth="var(--index-conteneur-card-iconarea-icon-thickness)"></svg>
          ${BODY('12')}
        </soc-card>
        <soc-card title="Tâches" subtitle="À traiter cette semaine">
          <svg lucideClipboardList socCardIcon class="size-full" strokeWidth="var(--index-conteneur-card-iconarea-icon-thickness)"></svg>
          ${BODY('5')}
        </soc-card>
      </soc-card-grid>
    </soc-page-home>
  `,
})
class PageHomeExample {}

const meta: Meta = {
  title: 'Templates/Page Home',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [PageHomeExample, StoryShell, SocPageHome, SocPageBreadcrumb, SocBreadcrumb, SocCardGrid, SocCard, SocCardIcon, LucideUsers] })],
};
export default meta;
type Story = StoryObj;

/** PageHome fills its container's full height (`size-full`) — outside Storybook that container is
 * always AppShell's Content Zone. The `h-screen` wrapper stands in for that height. */
export const Default: Story = { render: () => ({ template: `<div class="h-screen"><story-pagehome-example /></div>` }) };

/** The welcome banner and search bar are both optional — only the section/content is needed, for a home
 * screen that's just a content section (e.g. a dashboard with no personalized greeting). */
export const WithoutWelcomeOrSearch: Story = {
  render: () => ({
    template: `
      <div class="h-screen">
        <soc-page-home sectionTitle="Titre de la section">
          <soc-breadcrumb socPageBreadcrumb [items]="[{ label: 'Accueil' }]" />
          <soc-card-grid mode="bento" gap="md">
            <soc-card title="Employés">
              <svg lucideUsers socCardIcon class="size-full" strokeWidth="var(--index-conteneur-card-iconarea-icon-thickness)"></svg>
              ${BODY('248')}
            </soc-card>
          </soc-card-grid>
        </soc-page-home>
      </div>
    `,
  }),
};

/** PageHome is only the Content Zone's child — AppSwitch, HeaderApp and SideNavigation live in
 * `soc-app-shell`. This shows it assembled the way it actually ships. */
export const FullPage: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({ template: `<story-shell navSelectedId="workspace-accueil"><story-pagehome-example /></story-shell>` }),
};
