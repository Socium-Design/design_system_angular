import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SocSwitch } from '@socium-design/angular-components';
import { q } from '../../../src/testing/helpers';
import { SocLabsSettingsCard, SocLabsSettingsCardAction, SocLabsSettingsCardFootnote } from './settings-card';

@Component({
  standalone: true,
  imports: [SocLabsSettingsCard, SocLabsSettingsCardAction, SocLabsSettingsCardFootnote, SocSwitch],
  template: `
    <soc-labs-settings-card title="Note objectif" [overline]="overline()" [disabled]="disabled()" [disabledNote]="note()">
      @if (withAction()) {
        <soc-switch socLabsSettingsCardAction label="Activer le barème" [checked]="!disabled()" (checkedChange)="disabled.set(!$event)" />
      }
      <button type="button" class="corps">5</button>
      @if (withFootnote()) {
        <p socLabsSettingsCardFootnote class="regle">Règle de calcul</p>
      }
    </soc-labs-settings-card>
  `,
})
class Host {
  overline = signal<string | undefined>('BARÈME');
  disabled = signal(false);
  note = signal<string | undefined>('Barème désactivé : objectifs affichés sur 100');
  withAction = signal(true);
  withFootnote = signal(true);
}

describe('Labs / SettingsCard', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const card = () => q(fixture, 'soc-labs-settings-card');
    const region = (name: string) => card().querySelector(`[data-region="${name}"]`) as HTMLElement | null;
    return { fixture, host: fixture.componentInstance, card, region };
  }

  it('renders overline, title, header action, body and footnote in that order', () => {
    const { card, region } = setup();
    expect(region('overline')!.textContent!.trim()).toBe('BARÈME');
    expect(region('title')!.textContent!.trim()).toBe('Note objectif');
    expect(region('action')!.querySelector('soc-switch')).not.toBeNull();
    expect(region('body')!.querySelector('.corps')).not.toBeNull();
    expect(region('footnote')!.textContent!.trim()).toBe('Règle de calcul');
    expect(region('footnote')!.className).toContain('border-dashed');
    const order = Array.from(card().querySelectorAll('[data-region]')).map((el) => el.getAttribute('data-region'));
    expect(order).toEqual(['header', 'overline', 'title', 'action', 'body', 'footnote']);
  });

  it('optional regions only when provided; no "•••" button', () => {
    const { fixture, host, region, card } = setup();
    host.overline.set(undefined);
    host.withAction.set(false);
    host.withFootnote.set(false);
    fixture.detectChanges();
    expect(region('overline')).toBeNull();
    expect(region('action')).toBeNull();
    expect(region('footnote')).toBeNull();
    expect(card().querySelector('[aria-label="Actions"]')).toBeNull();
  });

  it('is a group named by its title; native title attribute not set on the host', () => {
    const { card, region } = setup();
    expect(card().getAttribute('role')).toBe('group');
    expect(card().getAttribute('aria-labelledby')).toBe(region('title')!.id);
    expect(card().hasAttribute('title')).toBeFalse();
  });

  it('disabled: body and footnote greyed and inert, note shown, header action still usable', () => {
    const { fixture, host, region, card } = setup();
    expect(region('disabled-note')).toBeNull();
    host.disabled.set(true);
    fixture.detectChanges();
    const body = region('body')!;
    expect(card().hasAttribute('data-disabled')).toBeTrue();
    expect(body.hasAttribute('inert')).toBeTrue();
    expect(body.getAttribute('aria-disabled')).toBe('true');
    expect(body.className).toContain('opacity-[var(--bridges-texture-opacity-disabled)]');
    expect(body.contains(region('footnote'))).toBeTrue();
    expect(region('disabled-note')!.textContent!.trim()).toBe('Barème désactivé : objectifs affichés sur 100');
    expect(region('action')!.hasAttribute('inert')).toBeFalse();
    expect(region('action')!.closest('[inert]')).toBeNull();
    // inert: no keyboard focus, and the pointer can't hit the content (element.click() would still
    // dispatch programmatically, so it proves nothing about the user).
    const corps = body.querySelector('.corps') as HTMLButtonElement;
    corps.focus();
    expect(document.activeElement).not.toBe(corps);
    const rect = corps.getBoundingClientRect();
    expect(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)).not.toBe(corps);
    // the header switch re-enables the card
    (region('action')!.querySelector('[role="switch"], input, button') as HTMLElement).click();
    fixture.detectChanges();
    expect(host.disabled()).toBeFalse();
    expect(region('body')!.hasAttribute('inert')).toBeFalse();
    const enabled = region('body')!.querySelector('.corps') as HTMLButtonElement;
    enabled.focus();
    expect(document.activeElement).toBe(enabled);
  });

  it('only uses kit tokens', () => {
    const { card } = setup();
    expect(card().outerHTML).not.toMatch(/#[0-9a-f]{3,6}\b/i);
    expect(card().className).toContain('border-[var(--index-conteneur-card-border)]');
  });
});
