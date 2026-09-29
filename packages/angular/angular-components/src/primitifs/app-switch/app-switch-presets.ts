import type { NavigationProduct } from '../side-navigation/navigation-presets';
import type { AppIconName } from './app-icons';

export interface AppSwitchItemData {
  id: string;
  name: AppIconName;
  label: string;
}

/**
 * One entry per "Produit" variant — the same 6 values `SocSideNavigation`'s `product` input
 * resolves against (see navigation-presets.ts). `name` maps to the matching AppIconName glyph;
 * note `perfs` (NavigationProduct) draws the `performance` glyph — the two are spelled
 * differently between Figma's SideNavigation and AppIcon components (carried over verbatim from
 * React's own appSwitchPresets.ts).
 */
export const APP_SWITCH_ITEMS: Record<NavigationProduct, AppSwitchItemData> = {
  workspace: { id: 'workspace', name: 'workspace', label: 'Workspace' },
  job: { id: 'job', name: 'job', label: 'Job' },
  workflow: { id: 'workflow', name: 'workflow', label: 'Workflow' },
  perfs: { id: 'perfs', name: 'performance', label: 'Perfs' },
  doc: { id: 'doc', name: 'doc', label: 'Doc' },
  payroll: { id: 'payroll', name: 'payroll', label: 'Payroll' },
};

export const APP_SWITCH_PRODUCTS: NavigationProduct[] = ['workspace', 'job', 'workflow', 'perfs', 'doc', 'payroll'];
