import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SocAccordion, SocSwitch, SocTag } from '@socium-design/angular-components';
import { q } from '../../../src/testing/helpers';
import {
  SocLabsSettingsCard,
  SocLabsSettingsCardAction,
  SocLabsSettingsCardDetails,
  SocLabsSettingsCardFootnote,
  SocLabsSettingsCardTags,
} from './settings-card';

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

@Component({
  standalone: true,
  imports: [SocLabsSettingsCard, SocLabsSettingsCardAction, SocLabsSettingsCardFootnote, SocSwitch],
  template: `
    <soc-labs-settings-card
      title="Note finale"
      overline="BARÈME"
      collapsible
      [(expanded)]="expanded"
      [summary]="summary()"
      [badge]="badge()"
      [badgeTone]="tone()"
      [lockExpanded]="locked()"
      [disabled]="disabled()"
      disabledNote="Barème désactivé"
    >
      <soc-switch socLabsSettingsCardAction label="Visible" [checked]="visible()" (checkedChange)="visible.set($event)" />
      <button type="button" class="corps">5</button>
      <p socLabsSettingsCardFootnote>Règle</p>
    </soc-labs-settings-card>
  `,
})
class CollapsibleHost {
  expanded = signal(false);
  summary = signal<string | undefined>('/20 · 2 décimales');
  badge = signal<string | undefined>(undefined);
  tone = signal<'information' | 'error'>('information');
  locked = signal(false);
  disabled = signal(false);
  visible = signal(true);
}

describe('Labs / SettingsCard — repliable', () => {
  function setup() {
    const fixture = TestBed.createComponent(CollapsibleHost);
    fixture.detectChanges();
    const card = () => q(fixture, 'soc-labs-settings-card');
    const region = (name: string) => card().querySelector(`[data-region="${name}"]`) as HTMLElement | null;
    const panel = () => card().querySelector('[data-part="panel"]') as HTMLElement;
    const toggle = () => region('toggle') as HTMLButtonElement;
    return { fixture, host: fixture.componentInstance, card, region, panel, toggle };
  }

  it('non repliable par défaut : pas de chevron, corps toujours ouvert (comportement inchangé)', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const card = q(fixture, 'soc-labs-settings-card');
    expect(card.querySelector('[data-region="toggle"]')).toBeNull();
    expect(card.hasAttribute('data-expanded')).toBeFalse();
    expect((card.querySelector('[data-part="panel"]') as HTMLElement).hasAttribute('inert')).toBeFalse();
  });

  it('fermée : résumé sous le titre, corps inerte, chevron aria-expanded="false" relié au corps', () => {
    const { region, panel, toggle, card } = setup();
    expect(card().getAttribute('data-expanded')).toBe('false');
    expect(region('summary')!.textContent!.trim()).toBe('/20 · 2 décimales');
    expect(panel().hasAttribute('inert')).toBeTrue();
    expect(panel().className).toContain('grid-rows-[0fr]');
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(toggle().getAttribute('aria-controls')).toBe(panel().id);
    expect(toggle().getAttribute('aria-labelledby')).toBe(region('title')!.id);
    expect(toggle().getAttribute('aria-describedby')).toBe(region('summary')!.id);
  });

  it('le chevron (Entrée / Espace = clic) et un clic sur l’en-tête ouvrent puis ferment ; [(expanded)] suit', () => {
    const { fixture, host, region, panel, toggle } = setup();
    toggle().click();
    fixture.detectChanges();
    expect(host.expanded()).toBeTrue();
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(panel().hasAttribute('inert')).toBeFalse();
    expect(region('summary')).toBeNull();
    region('title')!.click();
    fixture.detectChanges();
    expect(host.expanded()).toBeFalse();
    host.expanded.set(true);
    fixture.detectChanges();
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
  });

  it('l’interrupteur d’en-tête reste utilisable carte fermée et ne replie ni ne déplie la carte', () => {
    const { fixture, host, region } = setup();
    (region('action')!.querySelector('[role="switch"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.visible()).toBeFalse();
    expect(host.expanded()).toBeFalse();
    host.expanded.set(true);
    fixture.detectChanges();
    (region('action')!.querySelector('[role="switch"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.visible()).toBeTrue();
    expect(host.expanded()).toBeTrue();
  });

  it('lockExpanded : ouverte et impossible à refermer, chevron aria-disabled', () => {
    const { fixture, host, toggle, panel } = setup();
    host.locked.set(true);
    fixture.detectChanges();
    expect(panel().hasAttribute('inert')).toBeFalse();
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(toggle().getAttribute('aria-disabled')).toBe('true');
    host.expanded.set(true);
    fixture.detectChanges();
    toggle().click();
    fixture.detectChanges();
    expect(host.expanded()).toBeTrue();
    host.locked.set(false);
    fixture.detectChanges();
    expect(toggle().hasAttribute('aria-disabled')).toBeFalse();
  });

  it('badge dans l’en-tête (soc-tag du kit) avec son ton, carte ouverte ou fermée', () => {
    const { fixture, host, region } = setup();
    expect(region('badge')).toBeNull();
    host.badge.set('Erreur');
    host.tone.set('error');
    fixture.detectChanges();
    expect(region('badge')!.tagName).toBe('SOC-TAG');
    expect(region('badge')!.textContent!.trim()).toBe('Erreur');
    expect(region('badge')!.className).toMatch(/error/);
  });

  it('désactivée et fermée : pas de mention (le résumé la remplace) ; ouverte : mention et corps inerte', () => {
    const { fixture, host, region } = setup();
    host.disabled.set(true);
    fixture.detectChanges();
    expect(region('disabled-note')!.closest('[inert]')).not.toBeNull();
    host.expanded.set(true);
    fixture.detectChanges();
    expect(region('disabled-note')!.closest('[inert]')).toBeNull();
    expect(region('body')!.hasAttribute('inert')).toBeTrue();
  });

  it('chevron : anneau de focus visible (style d’outline explicite, sinon Tailwind v4 n’en dessine aucun)', () => {
    const { toggle } = setup();
    expect(toggle().className).toContain('focus-visible:outline-solid');
    expect(toggle().className).toContain('focus-visible:outline-[var(--bridges-color-border-focus)]');
  });

  it('animation courte, désactivée si prefers-reduced-motion', () => {
    const { panel } = setup();
    expect(panel().className).toContain('transition-[grid-template-rows]');
    expect(panel().className).toContain('motion-reduce:transition-none');
  });
});

@Component({
  standalone: true,
  imports: [SocLabsSettingsCard, SocLabsSettingsCardAction, SocLabsSettingsCardFootnote, SocLabsSettingsCardDetails, SocLabsSettingsCardTags, SocSwitch, SocTag, SocAccordion],
  template: `
    <soc-labs-settings-card title="Note Potentiel" collapsible [(expanded)]="expanded" [disabled]="disabled()" badge="Modifié" summary="/20">
      @if (withTag()) {
        <soc-tag socLabsSettingsCardTags color="information">Confidentialité du potentiel</soc-tag>
      }
      <soc-switch socLabsSettingsCardAction label="Visible par l’évalué" [checked]="true" />
      <button type="button" class="corps">5</button>
      <p socLabsSettingsCardFootnote>Règle de calcul</p>
      @if (withDetails()) {
        <soc-accordion socLabsSettingsCardDetails label="Ce qui sera mis à jour" [(open)]="detailsOpen">
          <p class="impact">Matrice 9-box</p>
        </soc-accordion>
      }
    </soc-labs-settings-card>
  `,
})
class DetailsHost {
  expanded = signal(true);
  disabled = signal(false);
  withTag = signal(true);
  withDetails = signal(true);
  detailsOpen = signal(false);
}

describe('Labs / SettingsCard — détails et tags (#62)', () => {
  function setup() {
    const fixture = TestBed.createComponent(DetailsHost);
    fixture.detectChanges();
    const card = () => q(fixture, 'soc-labs-settings-card');
    const region = (name: string) => card().querySelector(`[data-region="${name}"]`) as HTMLElement | null;
    return { fixture, host: fixture.componentInstance, card, region };
  }

  it('détails sous la note, hors du corps ; tags avant le badge, dans l’en-tête', () => {
    const { card, region } = setup();
    const order = Array.from(card().querySelectorAll('[data-region]')).map((el) => el.getAttribute('data-region'));
    expect(order).toEqual(['header', 'title', 'tags', 'badge', 'action', 'toggle', 'body', 'footnote', 'details']);
    expect(region('body')!.contains(region('details'))).toBeFalse();
    expect(region('details')!.querySelector('soc-accordion')).not.toBeNull();
    expect(region('tags')!.textContent!.trim()).toBe('Confidentialité du potentiel');
  });

  it('slots absents : aucune région', () => {
    const { fixture, host, region } = setup();
    host.withTag.set(false);
    host.withDetails.set(false);
    fixture.detectChanges();
    expect(region('tags')).toBeNull();
    expect(region('details')).toBeNull();
  });

  it('carte désactivée : détails ni grisés ni inertes, l’accordéon s’ouvre au clavier', () => {
    const { fixture, host, region } = setup();
    host.disabled.set(true);
    fixture.detectChanges();
    expect(region('body')!.hasAttribute('inert')).toBeTrue();
    const details = region('details')!;
    expect(details.closest('[inert]')).toBeNull();
    expect(details.className).not.toContain('opacity');
    const bouton = details.querySelector('button') as HTMLButtonElement;
    bouton.focus();
    expect(document.activeElement).toBe(bouton);
    expect(bouton.getAttribute('aria-expanded')).toBe('false');
    bouton.click();
    fixture.detectChanges();
    expect(host.detailsOpen()).toBeTrue();
    expect(details.querySelector('.impact')).not.toBeNull();
  });

  it('carte fermée : tags visibles, détails repliés avec le corps (inertes)', () => {
    const { fixture, host, region } = setup();
    host.expanded.set(false);
    fixture.detectChanges();
    expect(region('tags')!.closest('[inert]')).toBeNull();
    expect(region('details')!.closest('[inert]')).not.toBeNull();
  });

  it('clic sur un tag : replie la carte comme le reste de l’en-tête', () => {
    const { fixture, host, region } = setup();
    (region('tags')!.querySelector('soc-tag') as HTMLElement).click();
    fixture.detectChanges();
    expect(host.expanded()).toBeFalse();
  });
});
