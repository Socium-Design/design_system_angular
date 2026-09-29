import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideLayoutGrid, LucidePlus, LucideSearch, LucideUser } from '@lucide/angular';
import { SocSideNavigation } from './side-navigation';
import type { NavigationProduct } from './navigation-presets';

const PRODUCTS: NavigationProduct[] = ['workspace', 'job', 'workflow', 'perfs', 'doc', 'payroll'];

@Component({
  selector: 'story-sidenav-default',
  standalone: true,
  imports: [SocSideNavigation],
  template: `
    <soc-side-navigation
      title="Workspace"
      [selectedId]="selected()"
      [collapsed]="collapsed()"
      (toggleCollapse)="collapsed.set(!collapsed())"
      [sections]="sections()"
      [actionSection]="actionSection"
    />
  `,
})
class DefaultDemo {
  selected = signal('search');
  collapsed = signal(false);
  sections = signal([
    {
      title: 'MENU PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LucideLayoutGrid, onClick: () => this.selected.set('dashboard') },
        { id: 'profile', label: 'Mon Profil', icon: LucideUser, onClick: () => this.selected.set('profile') },
        { id: 'search', label: 'Recherche', icon: LucideSearch, onClick: () => this.selected.set('search') },
      ],
    },
  ]);
  actionSection = {
    title: 'ACTIONS RAPIDES',
    items: [
      { id: 'new-employee', label: 'Nouvel employé', icon: LucidePlus },
      { id: 'new-position', label: 'Ajout poste', icon: LucidePlus },
    ],
  };
}

@Component({
  selector: 'story-sidenav-by-product',
  standalone: true,
  imports: [SocSideNavigation],
  template: `<soc-side-navigation product="workspace" [collapsed]="collapsed()" (toggleCollapse)="collapsed.set(!collapsed())" class="h-[900px]" />`,
})
class ByProductDemo {
  collapsed = signal(false);
}

@Component({
  selector: 'story-sidenav-all-products',
  standalone: true,
  imports: [SocSideNavigation],
  template: `
    <div class="flex gap-4">
      @for (product of products; track product) {
        <soc-side-navigation [product]="product" class="h-[900px]" />
      }
    </div>
  `,
})
class AllProductsDemo {
  products = PRODUCTS;
}

@Component({
  selector: 'story-sidenav-collapsed',
  standalone: true,
  imports: [SocSideNavigation],
  template: `
    <soc-side-navigation
      title="Workspace"
      [collapsed]="collapsed()"
      (toggleCollapse)="collapsed.set(!collapsed())"
      selectedId="search"
      [sections]="sections"
    />
  `,
})
class CollapsedDemo {
  collapsed = signal(true);
  sections = [
    {
      title: 'MENU PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LucideLayoutGrid },
        { id: 'search', label: 'Recherche', icon: LucideSearch },
      ],
    },
  ];
}

const meta: Meta<SocSideNavigation> = {
  title: 'Components/Navigation/Side Navigation',
  component: SocSideNavigation,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<SocSideNavigation>;

export const Default: Story = {
  decorators: [moduleMetadata({ imports: [DefaultDemo] })],
  render: () => ({ template: `<story-sidenav-default />` }),
};

export const ByProduct: Story = {
  decorators: [moduleMetadata({ imports: [ByProductDemo] })],
  render: () => ({ template: `<story-sidenav-by-product />` }),
};

export const AllProducts: Story = {
  decorators: [moduleMetadata({ imports: [AllProductsDemo] })],
  render: () => ({ template: `<story-sidenav-all-products />` }),
};

export const PresetWithOverride: Story = {
  render: () => ({ template: `<soc-side-navigation product="doc" title="Doc (titre personnalisé)" class="h-[900px]" />` }),
};

export const Collapsed: Story = {
  decorators: [moduleMetadata({ imports: [CollapsedDemo] })],
  render: () => ({ template: `<story-sidenav-collapsed />` }),
};
