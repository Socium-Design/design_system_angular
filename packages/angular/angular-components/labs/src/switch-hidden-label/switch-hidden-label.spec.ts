import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SocSwitch } from '@socium-design/angular-components';
import { q } from '../../../src/testing/helpers';
import { SocLabsSwitchHiddenLabel } from './switch-hidden-label';

@Component({
  standalone: true,
  imports: [SocSwitch, SocLabsSwitchHiddenLabel],
  template: `<soc-switch socLabsSwitchHiddenLabel label="Entreprise active" [checked]="true" />`,
})
class Host {}

describe('Labs / SwitchHiddenLabel', () => {
  it('keeps the label as the switch name but hides it visually', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const sw = q<HTMLButtonElement>(fixture, '[role="switch"]');
    const label = q(fixture, `label[for="${sw.id}"] > span`);
    expect(label.textContent!.trim()).toBe('Entreprise active');
    const host = q(fixture, 'soc-switch');
    expect(host.className).toContain('[&_label>span]:sr-only');
    expect(host.className).toContain('relative');
  });
});
