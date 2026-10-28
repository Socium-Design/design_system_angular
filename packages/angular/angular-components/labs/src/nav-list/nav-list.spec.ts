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
    { id: 'workspace', label: 'Workspace', count: '4 / 23', countLabel: '4 activées sur 23' },
    { id: 'payroll', label: 'Payroll' },
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
});
