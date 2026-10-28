import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q } from '../../../src/testing/helpers';
import { SocLabsChangesBar } from './changes-bar';

@Component({
  standalone: true,
  imports: [SocLabsChangesBar],
  template: `<soc-labs-changes-bar [count]="count()" [saved]="saved()" (save)="saves = saves + 1" (cancel)="cancels = cancels + 1" />`,
})
class Host {
  count = signal(0);
  saved = signal(false);
  saves = 0;
  cancels = 0;
}

describe('Labs / ChangesBar', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const bar = () => q(fixture, 'soc-labs-changes-bar');
    const part = (name: string) => bar().querySelector(`[data-part="${name}"]`) as HTMLElement | null;
    return { fixture, host: fixture.componentInstance, bar, part };
  }

  it('hidden without changes, live region still present', () => {
    const { bar, part } = setup();
    expect(bar().getAttribute('data-state')).toBe('idle');
    expect(bar().querySelector('[role="region"]')!.className).toContain('hidden');
    expect(part('live')!.getAttribute('aria-live')).toBe('polite');
    expect(part('save')).toBeNull();
  });

  it('compensates the 120px bottom padding of the kit page templates', () => {
    const { bar } = setup();
    expect(bar().style.bottom).toBe('calc(-120px)');
  });

  it('pluralised message, Annuler / Enregistrer emit', () => {
    const { fixture, host, part } = setup();
    host.count.set(1);
    fixture.detectChanges();
    expect(part('message')!.textContent!.trim()).toBe('1 modification non enregistrée');
    host.count.set(3);
    fixture.detectChanges();
    expect(part('message')!.textContent!.trim()).toBe('3 modifications non enregistrées');
    expect(part('live')!.textContent!.trim()).toBe('3 modifications non enregistrées');
    part('cancel')!.click();
    part('save')!.click();
    expect(host.cancels).toBe(1);
    expect(host.saves).toBe(1);
  });

  it('saved state replaces the buttons with "Enregistré"', () => {
    const { fixture, host, part, bar } = setup();
    host.saved.set(true);
    fixture.detectChanges();
    expect(bar().getAttribute('data-state')).toBe('saved');
    expect(part('message')!.textContent!.trim()).toBe('Enregistré');
    expect(part('save')).toBeNull();
    expect(bar().querySelector('[role="region"]')!.getAttribute('aria-label')).toBe('Modifications non enregistrées');
  });
});
