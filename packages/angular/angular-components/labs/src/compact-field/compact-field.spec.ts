import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { q, type } from '../../../src/testing/helpers';
import { SocLabsCompactField, type LabsCompactFieldControl, type LabsCompactFieldMode } from './compact-field';

@Component({
  standalone: true,
  imports: [SocLabsCompactField, ReactiveFormsModule],
  template: `
    <soc-labs-compact-field id="f" label="Libellé" [mode]="mode()" [control]="control()" [options]="options" [formControl]="form" placeholder="Choisir" />
  `,
})
class Host {
  mode = signal<LabsCompactFieldMode>('read');
  control = signal<LabsCompactFieldControl>('text');
  options = [
    { value: 'actif', label: 'Actif' },
    { value: 'inactif', label: 'Inactif' },
  ];
  form = new FormControl<string | null>('Tableau RH');
}

describe('Labs / CompactField', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance, el: () => fixture.nativeElement as HTMLElement };
  }

  it('read mode: small-caps label + text named by the label; empty shows the empty text', () => {
    const { fixture, host, el } = setup();
    const label = q(el(), 'soc-labs-compact-field > span');
    expect(label.className).toContain('uppercase');
    const text = q(el(), 'p');
    expect(text.textContent!.trim()).toBe('Tableau RH');
    expect(text.getAttribute('aria-labelledby')).toBe(label.id);
    expect(el().querySelector('input, textarea, select')).toBeNull();
    host.form.setValue('');
    fixture.detectChanges();
    expect(q(el(), 'p').textContent!.trim()).toBe('—');
  });

  it('read mode with a select shows the option label', () => {
    const { fixture, host, el } = setup();
    host.control.set('select');
    host.form.setValue('inactif');
    fixture.detectChanges();
    expect(q(el(), 'p').textContent!.trim()).toBe('Inactif');
  });

  it('edit / text: labelled input bound to the form, touched on blur; id moved off the host', () => {
    const { fixture, host, el } = setup();
    host.mode.set('edit');
    fixture.detectChanges();
    const input = q<HTMLInputElement>(el(), 'input');
    expect(q(el(), 'label').getAttribute('for')).toBe('f');
    expect(input.id).toBe('f');
    expect(q(el(), 'soc-labs-compact-field').hasAttribute('id')).toBeFalse();
    expect(input.value).toBe('Tableau RH');
    type(input, 'Tableau DG');
    expect(host.form.value).toBe('Tableau DG');
    input.dispatchEvent(new FocusEvent('blur'));
    expect(host.form.touched).toBeTrue();
  });

  it('edit / textarea is multi-line', () => {
    const { fixture, host, el } = setup();
    host.mode.set('edit');
    host.control.set('textarea');
    fixture.detectChanges();
    const area = q<HTMLTextAreaElement>(el(), 'textarea');
    expect(area.rows).toBe(3);
    type(area, 'ligne 1\nligne 2');
    expect(host.form.value).toBe('ligne 1\nligne 2');
  });

  it('edit / select: native select with options, placeholder, change updates the form', () => {
    const { fixture, host, el } = setup();
    host.form.setValue('');
    host.mode.set('edit');
    host.control.set('select');
    fixture.detectChanges();
    const select = q<HTMLSelectElement>(el(), 'select');
    expect([...select.options].map((o) => o.text)).toEqual(['Choisir', 'Actif', 'Inactif']);
    select.value = 'actif';
    select.dispatchEvent(new Event('change'));
    expect(host.form.value).toBe('actif');
  });

  it('disabled from the form disables the control; reset() empties it', () => {
    const { fixture, host, el } = setup();
    host.mode.set('edit');
    host.form.disable();
    fixture.detectChanges();
    expect(q<HTMLInputElement>(el(), 'input').disabled).toBeTrue();
    host.form.reset();
    fixture.detectChanges();
    expect(q<HTMLInputElement>(el(), 'input').value).toBe('');
  });
});
