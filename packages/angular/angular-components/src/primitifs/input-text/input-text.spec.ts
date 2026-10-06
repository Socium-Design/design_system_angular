import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, type } from '../../testing/helpers';
import { SocCheckbox } from '../checkbox/checkbox';
import { SocSelect } from '../../composes/select/select';
import { SocInputArea } from '../input-area/input-area';
import { SocInputNumber } from '../input-number/input-number';
import { SocPassword } from '../password/password';
import { SocInputText } from './input-text';

@Component({
  standalone: true,
  imports: [SocInputText, SocInputArea, SocPassword, SocInputNumber],
  template: `
    <soc-input-text
      id="my-id"
      name="email"
      autocomplete="email"
      [maxlength]="12"
      [readonly]="readonly()"
      inputClass="custom-input-class"
      [inputAttrs]="attrs()"
      label="Email"
      placeholder="vous@socium.link"
      required
      [(value)]="value"
    />
    <soc-input-area id="area-id" name="bio" label="Bio" [maxlength]="40" />
    <soc-password id="pwd-id" name="pwd" autocomplete="new-password" placeholder="••••" />
    <soc-input-number id="num-id" name="age" placeholder="0" [min]="0" [max]="5" />
  `,
})
class FieldsHost {
  value = signal('');
  readonly = signal(false);
  attrs = signal<Record<string, string | number | boolean | null>>({ 'data-testid': 'email-field', inputmode: 'email' });
}

describe('text fields: native attribute passthrough', () => {
  function setup() {
    const fixture = TestBed.createComponent(FieldsHost);
    fixture.detectChanges();
    return fixture;
  }

  it('forwards id/name/autocomplete/maxlength/placeholder/required to the inner <input>, not the host', () => {
    const fixture = setup();
    const input = q<HTMLInputElement>(fixture, 'soc-input-text input');
    expect(input.id).toBe('my-id');
    expect(input.name).toBe('email');
    expect(input.getAttribute('autocomplete')).toBe('email');
    expect(input.getAttribute('maxlength')).toBe('12');
    expect(input.placeholder).toBe('vous@socium.link');
    expect(input.required).toBeTrue();
    const host = q(fixture, 'soc-input-text');
    expect(host.getAttribute('id')).toBeNull();
    expect(host.getAttribute('name')).toBeNull();
  });

  it('points the <label for> at the inner input (custom id respected)', () => {
    const fixture = setup();
    expect(q<HTMLLabelElement>(fixture, 'soc-input-text label').htmlFor).toBe('my-id');
  });

  it('generates a unique id when none is given', () => {
    @Component({ standalone: true, imports: [SocInputText], template: `<soc-input-text label="A" /><soc-input-text label="B" />` })
    class Two {}
    const f = TestBed.createComponent(Two);
    f.detectChanges();
    const ids = [...f.nativeElement.querySelectorAll('input')].map((i: HTMLInputElement) => i.id);
    expect(ids[0]).toBeTruthy();
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('applies inputClass to the inner input only', () => {
    const fixture = setup();
    expect(q(fixture, 'soc-input-text input').classList).toContain('custom-input-class');
    expect(q(fixture, 'soc-input-text').classList).not.toContain('custom-input-class');
  });

  it('applies inputAttrs, updates them, and removes the ones that disappear', () => {
    const fixture = setup();
    const input = q<HTMLInputElement>(fixture, 'soc-input-text input');
    expect(input.getAttribute('data-testid')).toBe('email-field');
    expect(input.getAttribute('inputmode')).toBe('email');
    fixture.componentInstance.attrs.set({ 'data-testid': 'renamed', 'aria-describedby': 'hint' });
    fixture.detectChanges();
    expect(input.getAttribute('data-testid')).toBe('renamed');
    expect(input.getAttribute('aria-describedby')).toBe('hint');
    expect(input.hasAttribute('inputmode')).toBeFalse();
  });

  it('readonly is reactive', () => {
    const fixture = setup();
    const input = q<HTMLInputElement>(fixture, 'soc-input-text input');
    expect(input.readOnly).toBeFalse();
    fixture.componentInstance.readonly.set(true);
    fixture.detectChanges();
    expect(input.readOnly).toBeTrue();
  });

  it('two-way [(value)] still works', () => {
    const fixture = setup();
    type(q<HTMLInputElement>(fixture, 'soc-input-text input'), 'a@b.c');
    expect(fixture.componentInstance.value()).toBe('a@b.c');
  });

  it('InputArea, Password and InputNumber forward the same attributes', () => {
    const fixture = setup();
    const area = q<HTMLTextAreaElement>(fixture, 'soc-input-area textarea');
    expect([area.id, area.name, area.getAttribute('maxlength')]).toEqual(['area-id', 'bio', '40']);
    const pwd = q<HTMLInputElement>(fixture, 'soc-password input');
    expect([pwd.id, pwd.name, pwd.getAttribute('autocomplete'), pwd.placeholder]).toEqual(['pwd-id', 'pwd', 'new-password', '••••']);
    const num = q<HTMLInputElement>(fixture, 'soc-input-number input');
    expect([num.id, num.name, num.placeholder]).toEqual(['num-id', 'age', '0']);
    for (const tag of ['soc-input-area', 'soc-password', 'soc-input-number']) {
      expect(q(fixture, tag).getAttribute('id')).toBeNull();
    }
  });

  it('InputNumber clamps to min/max and disables the matching stepper at the bounds', () => {
    const fixture = setup();
    const input = q<HTMLInputElement>(fixture, 'soc-input-number input');
    type(input, '99', 'change');
    fixture.detectChanges();
    expect(input.value).toBe('5');
    const [minus, plus] = [...fixture.nativeElement.querySelectorAll('soc-input-number button')] as HTMLButtonElement[];
    expect(plus.disabled).toBeTrue();
    expect(minus.disabled).toBeFalse();
    minus.click();
    fixture.detectChanges();
    expect(input.value).toBe('4');
  });

  it('boolean inputs accept the bare-attribute form (<x required disabled>) as well as [x]="…"', () => {
    @Component({
      standalone: true,
      imports: [SocInputText, SocCheckbox, SocSelect],
      template: `
        <soc-input-text label="N" required disabled />
        <soc-input-text label="M" [disabled]="false" error />
        <soc-checkbox disabled />
        <soc-select [options]="[]" disabled required />
      `,
    })
    class BareHost {}
    const f = TestBed.createComponent(BareHost);
    f.detectChanges();
    const texts = [...f.nativeElement.querySelectorAll('soc-input-text')] as HTMLElement[];
    expect((texts[0].querySelector('input') as HTMLInputElement).disabled).toBeTrue();
    expect(texts[0].querySelector('label')!.textContent).toContain('*'); // required marker
    expect((texts[1].querySelector('input') as HTMLInputElement).disabled).toBeFalse();
    expect(texts[1].querySelector('div[class*="stroke-error"]')).not.toBeNull(); // bare `error`
    expect((q(f, 'soc-checkbox [role=checkbox]') as HTMLButtonElement).disabled).toBeTrue();
    expect(q<HTMLButtonElement>(f, 'soc-select button').disabled).toBeTrue();
  });
});
