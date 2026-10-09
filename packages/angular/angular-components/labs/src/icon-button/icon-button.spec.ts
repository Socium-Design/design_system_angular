import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, qa } from '../../../src/testing/helpers';
import { SocLabsIconButton, type LabsIconButtonShape, type LabsIconButtonSize, type LabsIconButtonVariant } from './icon-button';

@Component({
  standalone: true,
  imports: [SocLabsIconButton],
  template: `
    <soc-labs-icon-button
      ariaLabel="Ajouter"
      [size]="size()"
      [variant]="variant()"
      [shape]="shape()"
      [tooltip]="tooltip()"
      [disabled]="disabled()"
      [pressed]="pressed()"
      (click)="clicks = clicks + 1"
    >
      <svg class="icon"></svg>
    </soc-labs-icon-button>
  `,
})
class Host {
  clicks = 0;
  size = signal<LabsIconButtonSize>('sm');
  variant = signal<LabsIconButtonVariant>('ghost');
  shape = signal<LabsIconButtonShape>('square');
  tooltip = signal<string | undefined>(undefined);
  disabled = signal(false);
  pressed = signal<boolean | undefined>(undefined);
}

describe('Labs / IconButton', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance, button: () => q<HTMLButtonElement>(fixture, 'button') };
  }

  afterEach(() => expect(qa(document.body, 'body > [role=tooltip]').length).toBe(0)); // tooltip bubble cleaned up

  it('renders a native type="button" carrying the required aria-label, with the icon projected and hidden from AT', () => {
    const { button } = setup();
    expect(button().getAttribute('type')).toBe('button');
    expect(button().getAttribute('aria-label')).toBe('Ajouter');
    expect(button().querySelector('[aria-hidden=true] svg.icon')).not.toBeNull();
    expect(button().hasAttribute('aria-pressed')).toBeFalse();
  });

  it('applies the size / variant / shape classes', () => {
    const { fixture, host, button } = setup();
    expect(button().className).toContain('size-[var(--bridges-size-icon-lg)]');
    host.size.set('xs');
    host.variant.set('primary-subtle');
    host.shape.set('round');
    fixture.detectChanges();
    expect(button().className).toContain('size-[var(--bridges-size-icon-md)]');
    expect(button().className).toContain('bg-[var(--bridges-color-accent-blue-bg)]');
    expect(button().className).toContain('rounded-[var(--bridges-shape-figure-radius-full)]');
    host.size.set('md');
    fixture.detectChanges();
    expect(button().className).toContain('size-[calc(var(--bridges-size-icon-lg)+var(--bridges-position-gap-2xs))]');
  });

  it('native click bubbles to the host; a disabled button does not fire', () => {
    const { fixture, host, button } = setup();
    button().click();
    expect(host.clicks).toBe(1);
    host.disabled.set(true);
    fixture.detectChanges();
    expect(button().disabled).toBeTrue();
    button().click();
    expect(host.clicks).toBe(1);
  });

  it('is reachable with the keyboard (a real <button>, no negative tabindex)', () => {
    const { button } = setup();
    button().focus();
    expect(document.activeElement).toBe(button());
  });

  it('sets aria-pressed only when used as a toggle', () => {
    const { fixture, host, button } = setup();
    host.pressed.set(true);
    fixture.detectChanges();
    expect(button().getAttribute('aria-pressed')).toBe('true');
    host.pressed.set(false);
    fixture.detectChanges();
    expect(button().getAttribute('aria-pressed')).toBe('false');
  });

  it('wraps the button in the kit tooltip only when `tooltip` is set, shown on focus', () => {
    const { fixture, host, button } = setup();
    expect(fixture.nativeElement.querySelector('soc-tooltip')).toBeNull();
    host.tooltip.set('Ajouter un indicateur');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('soc-tooltip button[aria-label=Ajouter]')).not.toBeNull();
    const bubble = q(document.body, 'body > [role=tooltip]');
    expect(bubble.textContent).toContain('Ajouter un indicateur');
    button().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    fixture.detectChanges();
    expect(bubble.style.visibility).toBe('visible');
    fixture.destroy();
  });
});
