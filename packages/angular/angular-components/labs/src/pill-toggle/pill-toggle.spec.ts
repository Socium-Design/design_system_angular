import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { qa } from '../../../src/testing/helpers';
import { SocLabsPillToggle, type LabsPillOption } from './pill-toggle';

const STATUTS: LabsPillOption[] = [
  { value: 'actif', label: 'Actif', color: 'green' },
  { value: 'inactif', label: 'Inactif', color: 'gray' },
  { value: 'archive', label: 'Archivé', color: 'amber' },
];

@Component({
  standalone: true,
  imports: [SocLabsPillToggle, ReactiveFormsModule],
  template: `
    <soc-labs-pill-toggle class="bound" ariaLabel="Statut" [options]="options()" [(value)]="value" [size]="'sm'" />
    <soc-labs-pill-toggle class="form" ariaLabel="Opérateur" [options]="operateurs" [formControl]="control" />
  `,
})
class Host {
  options = signal<LabsPillOption[]>(STATUTS);
  value = signal<string | null>('actif');
  operateurs: LabsPillOption[] = [
    { value: 'ET', label: 'ET' },
    { value: 'OU', label: 'OU' },
  ];
  control = new FormControl<string | null>('ET');
}

describe('Labs / PillToggle', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const radios = (sel = '.bound') => qa<HTMLButtonElement>(fixture, `${sel} [role=radio]`);
    return { fixture, host: fixture.componentInstance, radios };
  }
  const key = (el: HTMLElement, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

  it('renders a named radiogroup of radios reflecting the value, with one tab stop', () => {
    const { fixture, radios } = setup();
    const group = fixture.nativeElement.querySelector('.bound [role=radiogroup]') as HTMLElement;
    expect(group.getAttribute('aria-label')).toBe('Statut');
    expect(radios().map((r) => r.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false']);
    expect(radios().map((r) => r.tabIndex)).toEqual([0, -1, -1]);
  });

  it('uses the option colour for the selected pill', () => {
    const { fixture, host, radios } = setup();
    expect(radios()[0].className).toContain('bg-[var(--bridges-color-accent-green-bg)]');
    host.value.set('archive');
    fixture.detectChanges();
    expect(radios()[2].className).toContain('bg-[var(--bridges-color-accent-amber-bg)]');
    expect(radios()[0].className).not.toContain('accent-green');
  });

  it('click selects and updates the two-way binding', () => {
    const { fixture, host, radios } = setup();
    radios()[1].click();
    fixture.detectChanges();
    expect(host.value()).toBe('inactif');
    expect(radios()[1].getAttribute('aria-checked')).toBe('true');
    expect(radios()[1].tabIndex).toBe(0);
  });

  it('arrow keys move focus and selection, wrapping, Home/End jump, disabled options are skipped', () => {
    const { fixture, host, radios } = setup();
    host.options.set([STATUTS[0], { ...STATUTS[1], disabled: true }, STATUTS[2]]);
    fixture.detectChanges();
    radios()[0].focus();
    key(radios()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(host.value()).toBe('archive'); // skipped the disabled one
    expect(document.activeElement).toBe(radios()[2]);
    key(radios()[2], 'ArrowRight');
    fixture.detectChanges();
    expect(host.value()).toBe('actif'); // wrapped
    key(radios()[0], 'ArrowLeft');
    fixture.detectChanges();
    expect(host.value()).toBe('archive');
    key(radios()[2], 'Home');
    fixture.detectChanges();
    expect(host.value()).toBe('actif');
    key(radios()[0], 'End');
    fixture.detectChanges();
    expect(host.value()).toBe('archive');
  });

  it('works as a form control (value in, value out, disabled from the form)', () => {
    const { fixture, host, radios } = setup();
    expect(radios('.form')[0].getAttribute('aria-checked')).toBe('true');
    radios('.form')[1].click();
    expect(host.control.value).toBe('OU');
    host.control.setValue('ET');
    fixture.detectChanges();
    expect(radios('.form')[0].getAttribute('aria-checked')).toBe('true');
    host.control.disable();
    fixture.detectChanges();
    expect(radios('.form').every((r) => r.disabled)).toBeTrue();
    radios('.form')[1].click();
    expect(host.control.value).toBe('ET');
  });

  it('marks the control touched on blur', () => {
    const { host, radios } = setup();
    radios('.form')[0].dispatchEvent(new FocusEvent('blur'));
    expect(host.control.touched).toBeTrue();
  });
});
