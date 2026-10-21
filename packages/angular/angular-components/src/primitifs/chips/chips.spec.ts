import { Component, ErrorHandler, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q } from '../../testing/helpers';
import { SocSelectableChips } from './chips';

@Component({
  standalone: true,
  imports: [SocSelectableChips],
  template: `
    <div class="wrapper" (click)="bubbled = bubbled + 1">
      <soc-selectable-chips label="20" [selected]="selected()" (click)="clicks = clicks + 1" />
    </div>
    <soc-selectable-chips class="alone" label="50" />
  `,
})
class Host {
  selected = signal(false);
  clicks = 0;
  bubbled = 0;
}

describe('SelectableChips', () => {
  let errors: unknown[];

  function setup() {
    errors = [];
    TestBed.configureTestingModule({ providers: [{ provide: ErrorHandler, useValue: { handleError: (e: unknown) => errors.push(e) } }] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance, button: (sel = 'soc-selectable-chips') => q<HTMLButtonElement>(fixture, `${sel} button`) };
  }

  it('a click calls the consumer (click) handler exactly once, without error (regression: infinite recursion)', () => {
    const { host, button } = setup();
    button().click();
    expect(errors).toEqual([]);
    expect(host.clicks).toBe(1);
    expect(host.bubbled).toBe(1);
  });

  it('a click on a chip nobody listens to does not throw', () => {
    const { button } = setup();
    button('.alone').click();
    expect(errors).toEqual([]);
  });

  it('aria-pressed on the button follows selected', () => {
    const { fixture, host, button } = setup();
    expect(button().getAttribute('aria-pressed')).toBe('false');
    host.selected.set(true);
    fixture.detectChanges();
    expect(button().getAttribute('aria-pressed')).toBe('true');
    expect(q(fixture, 'soc-selectable-chips').hasAttribute('aria-pressed')).toBeFalse();
  });

  it('selected uses the kit "selected" tokens', () => {
    const { fixture, host, button } = setup();
    host.selected.set(true);
    fixture.detectChanges();
    expect(button().className).toContain('bg-[var(--index-selection-chips-bg-selected)]');
  });
});
