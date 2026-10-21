import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LucideChevronRight, LucideLayoutGrid } from '@lucide/angular';
import { SocButton, SocButtonLeftIcon, SocButtonRightIcon, type ButtonSize } from '@socium-design/angular-components';
import { q } from '../../../src/testing/helpers';
import { SocLabsButton } from './button';

@Component({
  standalone: true,
  imports: [SocLabsButton, SocButton, SocButtonLeftIcon, SocButtonRightIcon, LucideLayoutGrid, LucideChevronRight],
  template: `
    <button socLabsButton data-testid="subtle" [size]="size()" [disabled]="disabled()" aria-describedby="hint" (click)="clicks = clicks + 1">
      @if (left()) { <svg lucideLayoutGrid socButtonLeftIcon class="size-full"></svg> }
      Visualiser
      @if (right()) { <svg lucideChevronRight socButtonRightIcon class="size-full"></svg> }
    </button>
    <button socButton data-testid="kit" [size]="size()">Détail</button>
  `,
})
class Host {
  size = signal<ButtonSize>('sm');
  disabled = signal(false);
  left = signal(true);
  right = signal(false);
  clicks = 0;
}

describe('Labs / Button', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return {
      fixture,
      host: fixture.componentInstance,
      button: () => q<HTMLButtonElement>(fixture, '[data-testid="subtle"]'),
      kit: () => q<HTMLButtonElement>(fixture, '[data-testid="kit"]'),
    };
  }

  it('is a real <button>: native attributes and click pass through', () => {
    const { host, button } = setup();
    expect(button().tagName).toBe('BUTTON');
    expect(button().getAttribute('aria-describedby')).toBe('hint');
    button().click();
    expect(host.clicks).toBe(1);
  });

  it('primary-subtle: light blue background, blue text, kit tokens only', () => {
    const { button } = setup();
    expect(button().className).toContain('bg-[var(--bridges-color-accent-blue-bg)]');
    expect(button().className).toContain('text-[var(--bridges-color-text-action)]');
    expect(button().className).not.toMatch(/#[0-9a-f]{3,6}/i);
  });

  it('shares the kit button geometry and typography (same padding, radius, font classes as socButton, per size)', () => {
    const { fixture, host, button, kit } = setup();
    for (const size of ['sm', 'lg'] as const) {
      host.size.set(size);
      fixture.detectChanges();
      for (const cls of [
        `px-[var(--index-button-button-padding-h-${size})]`,
        `py-[var(--index-button-button-padding-v-${size})]`,
        `rounded-[var(--index-button-button-radius-${size})]`,
        `gap-[var(--index-button-button-gap-${size})]`,
        'text-[length:var(--index-button-button-text-size)]',
      ]) {
        expect(kit().classList).withContext(`kit ${size}`).toContain(cls);
        expect(button().classList).withContext(`labs ${size}`).toContain(cls);
      }
    }
  });

  it('renders the icon slots only when projected, left before the label', () => {
    const { fixture, host, button } = setup();
    expect(button().querySelectorAll(':scope > span').length).toBe(1);
    expect(button().firstElementChild!.querySelector('svg')).not.toBeNull();
    host.left.set(false);
    host.right.set(true);
    fixture.detectChanges();
    const spans = button().querySelectorAll(':scope > span');
    expect(spans.length).toBe(1);
    expect(button().lastElementChild).toBe(spans[0]);
  });

  it('disabled: native disabled, no click, disabled tokens', () => {
    const { fixture, host, button } = setup();
    host.disabled.set(true);
    fixture.detectChanges();
    expect(button().disabled).toBeTrue();
    button().click();
    expect(host.clicks).toBe(0);
    expect(button().className).toContain('disabled:bg-[var(--index-button-button-bg-primary-disabled)]');
  });

  it('has a visible keyboard focus ring', () => {
    const { button } = setup();
    expect(button().className).toContain('focus-visible:outline-[var(--bridges-color-border-focus)]');
  });
});
