import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocAppSwitch, SocAppSwitchLogo, SocAppIcon } from './app-switch';
import { SocSwitchLogo } from './app-icons';
import type { AppSwitchItemData } from './app-switch-presets';
import type { NavigationProduct } from '../side-navigation/navigation-presets';

const ITEMS: AppSwitchItemData[] = [
  { id: 'workspace', name: 'workspace', label: 'Workspace' },
  { id: 'job', name: 'job', label: 'Job' },
  { id: 'workflow', name: 'workflow', label: 'Workflow' },
  { id: 'performance', name: 'performance', label: 'Performance' },
  { id: 'doc', name: 'doc', label: 'Doc' },
  { id: 'payroll', name: 'payroll', label: 'Payroll' },
  { id: 'time', name: 'time', label: 'Time' },
  { id: 'baas', name: 'baas', label: 'BAAS' },
];

/** Always docked to the left edge of the screen, stretched to the full available height — the
 * logo and icon group stay pinned to the top rather than centering in that height. */
@Component({
  selector: 'story-appswitch-default',
  standalone: true,
  imports: [SocAppSwitch, SocAppSwitchLogo, SocSwitchLogo],
  template: `
    <div class="h-screen">
      <soc-app-switch [items]="items" [selectedId]="selected()" (select)="selected.set($event)">
        <soc-switch-logo socAppSwitchLogo />
      </soc-app-switch>
    </div>
  `,
})
class DefaultDemo {
  items = ITEMS;
  selected = signal('doc');
}

/** `product` auto-fills the 8-item list and highlights the matching one — the same shortcut
 * SideNavigation offers, used together in AppShell so both switch in lockstep. */
@Component({
  selector: 'story-appswitch-by-product',
  standalone: true,
  imports: [SocAppSwitch, SocAppSwitchLogo, SocSwitchLogo],
  template: `
    <div class="h-screen">
      <soc-app-switch [product]="product()" (select)="product.set($any($event))">
        <soc-switch-logo socAppSwitchLogo />
      </soc-app-switch>
    </div>
  `,
})
class ByProductDemo {
  product = signal<NavigationProduct>('workspace');
}

@Component({
  selector: 'story-appswitch-all-icons',
  standalone: true,
  imports: [SocAppIcon],
  template: `
    <div class="flex gap-8 bg-[var(--index-navigation-appswitch-bar-bg)] p-4">
      @for (item of items; track item.id) {
        <div class="flex flex-col items-center gap-2">
          <button socAppIcon [name]="item.name" [label]="item.label"></button>
          <button socAppIcon [name]="item.name" [label]="item.label" [selected]="true"></button>
          <span class="text-xs text-white/60">{{ item.label }}</span>
        </div>
      }
    </div>
  `,
})
class AllAppIconsDemo {
  items = ITEMS;
}

const meta: Meta<SocAppSwitch> = {
  title: 'Components/Navigation/App Switch',
  component: SocAppSwitch,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<SocAppSwitch>;

export const Default: Story = {
  decorators: [moduleMetadata({ imports: [DefaultDemo] })],
  render: () => ({ template: `<story-appswitch-default />` }),
};

export const ByProduct: Story = {
  decorators: [moduleMetadata({ imports: [ByProductDemo] })],
  render: () => ({ template: `<story-appswitch-by-product />` }),
};

export const AllAppIcons: Story = {
  decorators: [moduleMetadata({ imports: [AllAppIconsDemo] })],
  render: () => ({ template: `<story-appswitch-all-icons />` }),
};

