import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q } from '../../../src/testing/helpers';
import { SocLabsActionChip } from './action-chip';

@Component({
  standalone: true,
  imports: [SocLabsActionChip],
  template: `<soc-labs-action-chip label="Intranet" (action)="clics = clics + 1" />`,
})
class Host {
  clics = 0;
}

describe('Labs / ActionChip', () => {
  it('label + named action button that emits', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(q(fixture, '[data-part="label"]').textContent!.trim()).toBe('Intranet');
    const button = q<HTMLButtonElement>(fixture, '[data-part="action"]');
    expect(button.textContent!.trim()).toBe('Désactiver');
    expect(button.getAttribute('aria-label')).toBe('Désactiver Intranet');
    button.click();
    expect(fixture.componentInstance.clics).toBe(1);
  });
});
