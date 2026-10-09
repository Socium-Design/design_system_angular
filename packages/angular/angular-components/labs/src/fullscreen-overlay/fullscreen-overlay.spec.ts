import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { pressEscape, q, qa } from '../../../src/testing/helpers';
import { SocLabsFullscreenOverlay, SocLabsOverlayBadge } from './fullscreen-overlay';

@Component({
  standalone: true,
  imports: [SocLabsFullscreenOverlay, SocLabsOverlayBadge],
  template: `
    <button class="opener" (click)="open.set(true)">Prévisualiser</button>
    @if (alive()) {
      <soc-labs-fullscreen-overlay [(open)]="open" title="Tableau de bord RH" subtitle="Prévisualisation · Siège · 6 KPIs" (close)="closes = closes + 1">
        <span socLabsOverlayBadge class="badge">Données simulées</span>
        <button class="first">Premier</button>
        <button class="last">Dernier</button>
      </soc-labs-fullscreen-overlay>
    }
  `,
})
class Host {
  open = signal(false);
  alive = signal(true);
  closes = 0;
}

describe('Labs / FullscreenOverlay', () => {
  const dialogs = () => qa(document.body, 'body > [role=dialog]');
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const openIt = () => {
      const opener = q<HTMLButtonElement>(fixture, '.opener');
      opener.focus();
      opener.click();
      fixture.detectChanges();
      return dialogs()[0];
    };
    return { fixture, host, openIt, opener: () => q<HTMLButtonElement>(fixture, '.opener') };
  }
  const tab = (shiftKey = false) => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true }));

  afterEach(() => {
    expect(dialogs().length).toBe(0);
    expect(document.body.style.overflow).toBe('');
  });

  it('renders nothing while closed; open portals a full-screen modal dialog to <body>', () => {
    const { fixture, host, openIt } = setup();
    expect(dialogs().length).toBe(0);
    const dialog = openIt();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.className).toContain('fixed inset-0');
    expect(document.body.style.overflow).toBe('hidden');
    host.open.set(false);
    fixture.detectChanges();
  });

  it('top bar: title (names the dialog), subtitle (describes it), badge, close button; content projected', () => {
    const { fixture, host, openIt } = setup();
    const dialog = openIt();
    const title = q(dialog, '#' + dialog.getAttribute('aria-labelledby'));
    expect(title.textContent).toContain('Tableau de bord RH');
    expect(q(dialog, '#' + dialog.getAttribute('aria-describedby')).textContent).toContain('Prévisualisation · Siège · 6 KPIs');
    expect(q(dialog, '.badge').textContent).toContain('Données simulées');
    expect(q(dialog, '[data-close] button').getAttribute('aria-label')).toBe('Fermer');
    expect(q(dialog, '.first')).toBeTruthy();
    host.open.set(false);
    fixture.detectChanges();
  });

  it('moves focus into the overlay, traps Tab / Shift+Tab, and returns focus on close', () => {
    const { fixture, host, openIt, opener } = setup();
    const dialog = openIt();
    expect(document.activeElement).toBe(dialog);
    const close = q<HTMLButtonElement>(dialog, '[data-close] button');
    const last = q<HTMLButtonElement>(dialog, '.last');
    tab(true); // from the panel itself → last
    expect(document.activeElement).toBe(last);
    tab(); // last → wraps to first (the close button)
    expect(document.activeElement).toBe(close);
    tab(true); // first → wraps to last
    expect(document.activeElement).toBe(last);
    host.open.set(false);
    fixture.detectChanges();
    expect(document.activeElement).toBe(opener());
  });

  it('Escape closes: open goes false (two-way), close emitted once, focus returned', () => {
    const { fixture, host, openIt, opener } = setup();
    openIt();
    pressEscape();
    fixture.detectChanges();
    expect(host.open()).toBeFalse();
    expect(host.closes).toBe(1);
    expect(dialogs().length).toBe(0);
    expect(document.activeElement).toBe(opener());
    pressEscape(); // closed: ignored
    expect(host.closes).toBe(1);
  });

  it('the close button closes', () => {
    const { fixture, host, openIt } = setup();
    q<HTMLButtonElement>(openIt(), '[data-close] button').click();
    fixture.detectChanges();
    expect(host.open()).toBeFalse();
    expect(host.closes).toBe(1);
  });

  it('destroying it while open removes the portal and unlocks scrolling', () => {
    const { fixture, host, openIt } = setup();
    openIt();
    host.alive.set(false);
    fixture.detectChanges();
    expect(dialogs().length).toBe(0);
  });
});
