import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, qa } from '../../../src/testing/helpers';
import {
  SocLabsWidgetCard,
  SocLabsWidgetCardActions,
  SocLabsWidgetCardFilters,
  SocLabsWidgetCardFooter,
  SocLabsWidgetCardIcon,
} from './widget-card';

@Component({
  standalone: true,
  imports: [SocLabsWidgetCard, SocLabsWidgetCardIcon, SocLabsWidgetCardActions, SocLabsWidgetCardFilters, SocLabsWidgetCardFooter],
  template: `
    <div class="grid grid-cols-2">
      <soc-labs-widget-card
        class="full"
        [title]="title()"
        [description]="description()"
        [titleLines]="titleLines()"
        [descriptionLines]="descriptionLines()"
      >
        <span socLabsWidgetCardIcon class="ico">i</span>
        <button socLabsWidgetCardActions class="menu" (click)="clicks = clicks + 1">⋯</button>
        <select socLabsWidgetCardFilters class="f1"><option>2026</option></select>
        <select socLabsWidgetCardFilters class="f2"><option>Siège</option></select>
        <strong class="kpi">1 284</strong>
        <span socLabsWidgetCardFooter class="foot">+3 % vs N-1</span>
      </soc-labs-widget-card>
      <soc-labs-widget-card class="bare" title="Effectif">
        <strong class="kpi">42</strong>
      </soc-labs-widget-card>
    </div>
  `,
})
class Host {
  clicks = 0;
  title = signal('Effectif total des salariés actifs à fin de mois, tous établissements confondus');
  description = signal<string | undefined>('Salariés en CDI, CDD et alternance');
  titleLines = signal(2);
  descriptionLines = signal(2);
}

describe('Labs / WidgetCard', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return {
      fixture,
      host: fixture.componentInstance,
      full: () => q(fixture, 'soc-labs-widget-card.full'),
      bare: () => q(fixture, 'soc-labs-widget-card.bare'),
    };
  }
  const region = (card: HTMLElement, name: string) => card.querySelector<HTMLElement>(`[data-region="${name}"]`);

  it('host: role="group" named by the title, h-full flex column, kit card surface, no native title tooltip', () => {
    const { full } = setup();
    const card = full();
    expect(card.getAttribute('role')).toBe('group');
    expect(card.getAttribute('aria-label')).toBe('Effectif total des salariés actifs à fin de mois, tous établissements confondus');
    expect(card.hasAttribute('title')).toBeFalse();
    for (const cls of ['flex', 'h-full', 'min-w-0', 'flex-col']) expect(card.classList).toContain(cls);
    expect(card.className).toContain('bg-[var(--index-conteneur-card-bg)]');
    expect(card.className).toContain('border-[var(--index-conteneur-card-border)]');
    expect(card.className).toContain('border-[length:var(--index-conteneur-card-border-width)]');
    expect(card.className).toContain('rounded-[var(--index-conteneur-card-radius)]');
  });

  it('only the title, header and body render by default (no icon, actions, filters, description or footer)', () => {
    const { bare } = setup();
    const card = bare();
    expect(region(card, 'header')).not.toBeNull();
    expect(region(card, 'title')).not.toBeNull();
    expect(region(card, 'body')!.querySelector('.kpi')).not.toBeNull();
    for (const name of ['icon', 'actions', 'filters', 'footer', 'description']) expect(region(card, name)).withContext(name).toBeNull();
  });

  it('projects every slot into its own region', () => {
    const { full } = setup();
    const card = full();
    expect(region(card, 'icon')!.querySelector('.ico')).not.toBeNull();
    expect(region(card, 'actions')!.querySelector('.menu')).not.toBeNull();
    expect(qa(region(card, 'filters')!, 'select').length).toBe(2);
    expect(region(card, 'body')!.querySelector('.kpi')).not.toBeNull();
    expect(region(card, 'body')!.querySelector('select, .foot, .menu, .ico')).toBeNull();
    expect(region(card, 'footer')!.querySelector('.foot')).not.toBeNull();
    // Order: header, filters, body, footer.
    expect([...card.children].map((c) => c.getAttribute('data-region'))).toEqual(['header', 'filters', 'body', 'footer']);
  });

  it('title: <p>, 13px semibold primary, clamped to titleLines with the full text in the title attribute', () => {
    const { fixture, host, full } = setup();
    const title = region(full(), 'title')!;
    expect(title.tagName).toBe('P');
    expect(title.getAttribute('title')).toBe(host.title());
    expect(title.className).toContain('text-[length:calc((var(--bridges-size-text-text-size-xs)+var(--bridges-size-text-text-size-sm))/2)]');
    expect(title.className).toContain('[font-weight:var(--bridges-shape-text-heading-2-weight)]');
    expect(title.className).toContain('text-[var(--bridges-color-text-primary)]');
    expect(title.className).toContain('[-webkit-line-clamp:var(--soc-labs-widget-card-lines)]');
    expect(title.className).toContain('overflow-hidden');
    expect(title.style.getPropertyValue('--soc-labs-widget-card-lines')).toBe('2');
    host.titleLines.set(1);
    fixture.detectChanges();
    expect(title.style.getPropertyValue('--soc-labs-widget-card-lines')).toBe('1');
  });

  it('description: 12px secondary, clamped to descriptionLines', () => {
    const { fixture, host, full } = setup();
    const desc = region(full(), 'description')!;
    expect(desc.textContent!.trim()).toBe('Salariés en CDI, CDD et alternance');
    expect(desc.className).toContain('text-[length:var(--bridges-size-text-text-size-xs)]');
    expect(desc.className).toContain('text-[var(--bridges-color-text-secondary)]');
    expect(desc.className).toContain('[-webkit-line-clamp:var(--soc-labs-widget-card-lines)]');
    expect(desc.style.getPropertyValue('--soc-labs-widget-card-lines')).toBe('2');
    host.descriptionLines.set(3);
    host.description.set(undefined);
    fixture.detectChanges();
    expect(region(full(), 'description')).toBeNull();
    host.description.set('Retour');
    fixture.detectChanges();
    expect(region(full(), 'description')!.style.getPropertyValue('--soc-labs-widget-card-lines')).toBe('3');
  });

  it('filters wrap instead of overflowing; actions never shrink; body fills and can shrink', () => {
    const { full } = setup();
    const filters = region(full(), 'filters')!;
    for (const cls of ['flex', 'flex-wrap', 'items-center', 'min-w-0', 'gap-[var(--bridges-position-gap-xs)]']) expect(filters.classList).toContain(cls);
    const actions = region(full(), 'actions')!;
    expect(actions.classList).toContain('shrink-0');
    expect(actions.classList).toContain('self-start');
    expect(region(full(), 'header')!.classList).toContain('items-start');
    const body = region(full(), 'body')!;
    expect(body.classList).toContain('flex-1');
    expect(body.classList).toContain('min-w-0');
    expect(region(full(), 'footer')!.classList).toContain('min-w-0');
  });

  it('projected actions stay interactive', () => {
    const { host, full } = setup();
    q<HTMLButtonElement>(full(), '.menu').click();
    expect(host.clicks).toBe(1);
  });
});
