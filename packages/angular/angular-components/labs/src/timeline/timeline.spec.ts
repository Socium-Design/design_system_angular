import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, qa } from '../../../src/testing/helpers';
import { SocLabsTimeline, type LabsTimelineEvent } from './timeline';

@Component({
  standalone: true,
  imports: [SocLabsTimeline],
  template: `<soc-labs-timeline [events]="events()" [legend]="legend" emptyText="Aucun historique." />`,
})
class Host {
  legend = [
    { tone: 'success' as const, label: 'Modification', description: 'changement des informations' },
    { tone: 'information' as const, label: 'Mise à jour', description: 'changement de la progression' },
  ];
  events = signal<LabsTimelineEvent[]>([
    { id: 'e1', label: 'Ajout soumis', tone: 'warning', date: '16/10/2026 · 10:37', author: 'Mayna Sow', role: 'Admin RH', reason: 'test' },
    {
      id: 'e2',
      label: 'Ajout validé',
      tone: 'success',
      date: '16/10/2026 · 10:38',
      author: 'Mayna Sow',
      role: 'Admin RH',
      details: [
        { label: 'Objectif créé', value: 'Test bouton' },
        { label: 'Personne assignée', value: 'Thierno Adam' },
      ],
    },
  ]);
}

describe('Labs / Timeline', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance };
  }

  it('renders the legend then an ordered list of events', () => {
    const { fixture } = setup();
    expect(qa(fixture, 'ul li').map((li) => li.textContent!.replace(/\s+/g, ' ').trim())).toEqual([
      'Modification — changement des informations',
      'Mise à jour — changement de la progression',
    ]);
    expect(qa(fixture, 'ol > li').length).toBe(2);
  });

  it('shows tag, date, author with role, reason and details', () => {
    const { fixture } = setup();
    const first = q(fixture, 'li[data-event="e1"]');
    expect(first.querySelector('soc-labs-tag')!.textContent!.trim()).toBe('Ajout soumis');
    expect(first.querySelector('soc-labs-tag')!.getAttribute('data-color')).toBe('warning');
    expect(first.textContent).toContain('16/10/2026 · 10:37');
    expect(first.textContent!.replace(/\s+/g, ' ')).toContain('Par Mayna Sow · Admin RH');
    expect(first.textContent).toContain('Motif : « test »');
    const dts = qa(fixture, 'li[data-event="e2"] dt').map((d) => d.textContent!.trim());
    const dds = qa(fixture, 'li[data-event="e2"] dd').map((d) => d.textContent!.trim());
    expect(dts).toEqual(['Objectif créé', 'Personne assignée']);
    expect(dds).toEqual(['Test bouton', 'Thierno Adam']);
  });

  it('keeps the dots decorative and shows the empty text without events', () => {
    const { fixture, host } = setup();
    for (const dot of qa(fixture, 'ol span.rounded-\\[var\\(--bridges-shape-figure-radius-full\\)\\]')) {
      expect(dot.getAttribute('aria-hidden')).toBe('true');
    }
    host.events.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ol')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Aucun historique.');
  });
});
