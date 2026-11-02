import { Component, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, qa } from '../../../src/testing/helpers';
import { SocLabsPopulationPicker, type LabsPopulationMode, type LabsPopulationPerson } from './population-picker';

const PEOPLE: Record<string, LabsPopulationPerson[]> = {
  e1: [{ id: 'e1', initials: 'AD', name: 'Awa Diop', subtitle: 'DSI' }],
  dsi: [
    { id: 'e1', initials: 'AD', name: 'Awa Diop', subtitle: 'DSI' },
    { id: 'e2', initials: 'MN', name: 'Moussa Ndiaye', subtitle: 'DSI' },
  ],
  vacant: [],
};

@Component({
  standalone: true,
  imports: [SocLabsPopulationPicker],
  template: `
    <soc-labs-population-picker
      label="Population concernée"
      required
      [modes]="modes"
      [(mode)]="mode"
      [(value)]="value"
      [people]="people()"
      warning="Cette liste affiche tous les employés de votre scope."
      emptyText="Aucun employé ne correspond à cette sélection."
    />
  `,
})
class Host {
  modes: LabsPopulationMode[] = [
    { id: 'personne', label: 'Personne nommée', fieldLabel: 'Employés', options: [{ value: 'e1', label: 'Awa Diop' }] },
    { id: 'structure', label: 'Structure', fieldLabel: 'Structures', hint: 'Les sous-structures sont incluses.', options: [{ value: 'dsi', label: 'DSI' }] },
    { id: 'poste', label: 'Poste', fieldLabel: 'Postes', options: [{ value: 'vacant', label: 'Poste vacant' }] },
  ];
  mode = signal('personne');
  value = signal<string[]>([]);
  people = computed(() => this.value().flatMap((v) => PEOPLE[v] ?? []));
}

describe('Labs / PopulationPicker', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const tabs = () => qa<HTMLButtonElement>(fixture, '[role="tab"]');
    return { fixture, host: fixture.componentInstance, tabs };
  }

  it('is a fieldset named by its legend, with one pill tab per mode', () => {
    const { fixture, tabs } = setup();
    const legend = q(fixture, 'legend');
    expect(legend.textContent).toContain('Population concernée');
    expect(legend.querySelector('.sr-only')!.textContent).toBe('(obligatoire)');
    expect(tabs().map((t) => t.textContent!.trim())).toEqual(['Personne nommée', 'Structure', 'Poste']);
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
    expect(q(fixture, 'fieldset').getAttribute('aria-describedby')).toBe(q(fixture, 'fieldset > p[id]').id);
  });

  it('hides the preview until something is selected, then lists the people', () => {
    const { fixture, host } = setup();
    expect(fixture.nativeElement.querySelector('[data-preview]')).toBeNull();
    host.value.set(['e1']);
    fixture.detectChanges();
    expect(q(fixture, '[data-count]').textContent!.trim()).toBe('1 employé(s) concerné(s)');
    expect(q(fixture, '[data-count]').getAttribute('aria-live')).toBe('polite');
    expect(qa(fixture, '[data-person]').map((li) => li.getAttribute('data-person'))).toEqual(['e1']);
  });

  it('clears the selection when switching mode (one mode at a time)', () => {
    const { fixture, host, tabs } = setup();
    host.value.set(['e1']);
    fixture.detectChanges();
    tabs()[1].click();
    fixture.detectChanges();
    expect(host.mode()).toBe('structure');
    expect(host.value()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('Les sous-structures sont incluses.');
    tabs()[1].click();
    expect(host.mode()).toBe('structure');
  });

  it('shows the empty text when the selection resolves to nobody', () => {
    const { fixture, host, tabs } = setup();
    tabs()[2].click();
    host.value.set(['vacant']);
    fixture.detectChanges();
    expect(q(fixture, '[data-count]').textContent!.trim()).toBe('0 employé(s) concerné(s)');
    expect(q(fixture, '[data-empty]').textContent!.trim()).toBe('Aucun employé ne correspond à cette sélection.');
  });
});
