import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, qa } from '../../testing/helpers';
import { SocSideNavigation } from './side-navigation';
import type { NavigationProduct } from './navigation-presets';

@Component({
  standalone: true,
  imports: [SocSideNavigation],
  template: `<soc-side-navigation [product]="product()" [selectedId]="selected()" [collapsed]="collapsed()" (select)="selected.set($event)" (toggleCollapse)="toggles = toggles + 1" />`,
})
class NavHost {
  product = signal<NavigationProduct>('workspace');
  selected = signal<string | undefined>(undefined);
  collapsed = signal(false);
  toggles = 0;
}

describe('SideNavigation', () => {
  function setup() {
    const fixture = TestBed.createComponent(NavHost);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the preset sections and items for the product', () => {
    const f = setup();
    expect(qa(f, 'soc-side-nav-section').length).toBeGreaterThan(1);
    expect(q(f, 'soc-side-navigation').textContent).toContain('Workspace');
  });

  it('gives preset icons the React size and stroke tokens (class + strokeWidth inputs)', () => {
    const f = setup();
    const itemIcons = qa<SVGElement>(f, 'soc-side-nav-section button > span svg').filter((s) => !s.parentElement!.className.includes('chevron'));
    expect(itemIcons.length).toBeGreaterThan(3);
    for (const svg of itemIcons.slice(0, 6)) {
      expect(svg.getAttribute('class')).toContain('size-full');
      expect(svg.getAttribute('stroke-width')).toBe('var(--index-navigation-sidenavigation-item-icon-thickness)');
    }
    f.componentInstance.product.set('perfs'); // the only preset with an action section
    f.detectChanges();
    const actionIcons = qa<SVGElement>(f, 'span.size-3\\.5 svg');
    expect(actionIcons.length).toBeGreaterThan(0);
    expect(actionIcons[0].getAttribute('stroke-width')).toBe('var(--index-navigation-sidenavigation-action-icon-thickness)');
  });

  it('emits select with the item id and marks the selected item', () => {
    const f = setup();
    const item = qa<HTMLButtonElement>(f, 'soc-side-nav-section button').find((b) => b.textContent!.includes('Tableau de bord'))!;
    item.click();
    f.detectChanges();
    expect(f.componentInstance.selected()).toBe('workspace-tableau-de-bord');
    expect(item.className).toContain('border-r-');
  });

  it('collapses to icons only (titles/labels hidden) and emits toggleCollapse', () => {
    const f = setup();
    q<HTMLButtonElement>(f, 'button[aria-label="Replier le menu"]').click();
    expect(f.componentInstance.toggles).toBe(1);
    f.componentInstance.collapsed.set(true);
    f.detectChanges();
    expect(q(f, 'soc-side-navigation').textContent).not.toContain('Tableau de bord');
    expect(qa(f, 'button[aria-label="Déplier le menu"]').length).toBe(1);
  });

  it('switching product swaps the whole menu', () => {
    const f = setup();
    const before = q(f, 'soc-side-navigation').textContent;
    f.componentInstance.product.set('payroll');
    f.detectChanges();
    expect(q(f, 'soc-side-navigation').textContent).not.toBe(before);
  });
});
