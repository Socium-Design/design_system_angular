import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, qa } from '../../../src/testing/helpers';
import { SocLabsNavList, type LabsNavListItem } from './nav-list';

@Component({
  standalone: true,
  imports: [SocLabsNavList],
  template: `<soc-labs-nav-list ariaLabel="Produits" [items]="items" [(value)]="value" />`,
})
class Host {
  items: LabsNavListItem[] = [
    { id: 'tous', label: 'Tous les produits', count: '12 / 60', countLabel: '12 activées sur 60' },
    { id: 'workspace', label: 'Workspace', count: '4 / 23', countLabel: '4 activées sur 23', icon: 'workspace' },
    { id: 'payroll', label: 'Payroll', icon: 'payroll' },
  ];
  value = signal('tous');
}

describe('Labs / NavList', () => {
  it('named nav of buttons; current item has aria-current; click selects', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(q(fixture, 'nav').getAttribute('aria-label')).toBe('Produits');
    const buttons = qa<HTMLButtonElement>(fixture, 'nav button');
    expect(buttons.length).toBe(3);
    expect(buttons[0].getAttribute('aria-current')).toBe('true');
    expect(buttons[1].hasAttribute('aria-current')).toBeFalse();
    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('workspace');
    expect(buttons[1].getAttribute('aria-current')).toBe('true');
  });

  it('visual count hidden from AT when countLabel is given, read instead', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const [first, , last] = qa<HTMLButtonElement>(fixture, 'nav button');
    expect(first.querySelector('[data-part="count"]')!.getAttribute('aria-hidden')).toBe('true');
    expect(first.querySelector('.sr-only')!.textContent).toContain('12 activées sur 60');
    expect(last.querySelector('[data-part="count"]')).toBeNull();
  });

  it('product icon (kit AppSwitch glyph) is decorative; items without icon keep the slot for alignment', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const [tous, workspace] = qa<HTMLButtonElement>(fixture, 'nav button');
    const icon = workspace.querySelector('[data-part="icon"]')!;
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.querySelector('soc-app-icon-glyph svg')).not.toBeNull();
    expect(tous.querySelector('[data-part="icon"]')!.childElementCount).toBe(0);
    expect(workspace.textContent!.trim().startsWith('Workspace')).toBeTrue();
  });

  it('no icon slot when no item has an icon', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.items = fixture.componentInstance.items.map(({ icon, ...i }) => i);
    fixture.detectChanges();
    expect(qa(fixture, '[data-part="icon"]').length).toBe(0);
  });
});
