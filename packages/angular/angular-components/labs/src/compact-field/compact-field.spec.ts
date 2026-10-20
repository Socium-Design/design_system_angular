import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { q, type } from '../../../src/testing/helpers';
import { SocLabsCompactField, type LabsCompactFieldControl, type LabsCompactFieldMode, type LabsCompactFieldSize } from './compact-field';

@Component({
  standalone: true,
  imports: [SocLabsCompactField, ReactiveFormsModule],
  template: `
    <soc-labs-compact-field id="f" label="Libellé" [mode]="mode()" [control]="control()" [options]="options" [formControl]="form" placeholder="Choisir" [size]="size()" />
  `,
})
class Host {
  mode = signal<LabsCompactFieldMode>('read');
  control = signal<LabsCompactFieldControl>('text');
  size = signal<LabsCompactFieldSize>('md');
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

  describe('size', () => {
    const MD_TEXT = 'text-[length:var(--bridges-size-text-text-size-sm)]';
    const SM_TEXT = 'text-[length:var(--bridges-size-text-text-size-xs)]';
    const MD_HEIGHT = 'h-[calc(var(--bridges-size-icon-lg)+var(--bridges-position-gap-2xs))]';
    const SM_HEIGHT = 'h-[var(--bridges-size-icon-lg)]';
    const host = (el: HTMLElement) => q(el, 'soc-labs-compact-field');

    it('defaults to md: data-size="md", 14px value, 28px controls (unchanged rendering)', () => {
      const { fixture, host: h, el } = setup();
      expect(host(el()).getAttribute('data-size')).toBe('md');
      expect(q(el(), 'p').className).toContain(MD_TEXT);
      h.mode.set('edit');
      fixture.detectChanges();
      const input = q(el(), 'input');
      expect(input.className).toContain(MD_TEXT);
      expect(input.className).toContain(MD_HEIGHT);
      expect(input.className).toContain('px-[var(--bridges-position-padding-3xs)]');
      expect(host(el()).className).toContain('gap-[var(--bridges-position-gap-2xs)]');
      expect(host(el()).className).toContain('pb-[var(--bridges-position-padding-3xs)]');
    });

    it('sm: data-size="sm", read value in 12px, label still small caps 10px', () => {
      const { fixture, host: h, el } = setup();
      h.size.set('sm');
      fixture.detectChanges();
      expect(host(el()).getAttribute('data-size')).toBe('sm');
      const text = q(el(), 'p');
      expect(text.className).toContain(SM_TEXT);
      expect(text.className).not.toContain(MD_TEXT);
      const label = q(el(), 'soc-labs-compact-field > span');
      expect(label.className).toContain('uppercase');
      expect(label.className).toContain('text-[length:var(--bridges-size-text-text-size-tiny)]');
      expect(host(el()).className).toContain('gap-[var(--bridges-position-gap-xs)]');
      expect(host(el()).className).toContain('pb-[var(--bridges-position-padding-xs)]');
    });

    it('sm / text: 12px, 24px high input', () => {
      const { fixture, host: h, el } = setup();
      h.size.set('sm');
      h.mode.set('edit');
      fixture.detectChanges();
      const input = q(el(), 'input');
      expect(input.className).toContain(SM_TEXT);
      expect(input.className).toContain(SM_HEIGHT);
      expect(input.className).not.toContain(MD_HEIGHT);
      expect(q(el(), 'label').className).toContain('uppercase');
    });

    it('sm / textarea: 12px text, xs line height', () => {
      const { fixture, host: h, el } = setup();
      h.size.set('sm');
      h.mode.set('edit');
      h.control.set('textarea');
      fixture.detectChanges();
      const area = q(el(), 'textarea');
      expect(area.className).toContain(SM_TEXT);
      expect(area.className).toContain('[line-height:var(--bridges-size-text-line-height-xs)]');
      expect(area.className).not.toContain(MD_TEXT);
    });

    it('sm / select: 12px, 24px high, smaller chevron', () => {
      const { fixture, host: h, el } = setup();
      h.size.set('sm');
      h.mode.set('edit');
      h.control.set('select');
      fixture.detectChanges();
      const select = q(el(), 'select');
      expect(select.className).toContain(SM_TEXT);
      expect(select.className).toContain(SM_HEIGHT);
      expect(select.className).toContain('appearance-none');
      const chevron = q(el(), 'svg');
      expect(chevron.getAttribute('class')).toContain('size-[var(--bridges-size-icon-xs)]');
      expect(chevron.getAttribute('class')).toContain('pointer-events-none');
    });

    it('switching size back to md restores md classes', () => {
      const { fixture, host: h, el } = setup();
      h.size.set('sm');
      h.mode.set('edit');
      fixture.detectChanges();
      h.size.set('md');
      fixture.detectChanges();
      const input = q(el(), 'input');
      expect(input.className).toContain(MD_HEIGHT);
      expect(input.className).not.toContain(SM_TEXT);
      expect(host(el()).getAttribute('data-size')).toBe('md');
    });
  });
});
