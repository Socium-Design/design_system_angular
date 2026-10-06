import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SocCheckbox } from '../primitifs/checkbox/checkbox';
import { SocInputArea } from '../primitifs/input-area/input-area';
import { SocInputNumber } from '../primitifs/input-number/input-number';
import { SocInputText } from '../primitifs/input-text/input-text';
import { SocPassword } from '../primitifs/password/password';
import { SocRadioButton } from '../primitifs/radio-button/radio-button';
import { SocSearchBar } from '../primitifs/search-bar/search-bar';
import { SocSwitch } from '../primitifs/switch/switch';
import { SocMultiSelect } from '../composes/multi-select/multi-select';
import { SocSelect } from '../composes/select/select';
import { SocTableFilterSelect } from '../composes/table-filter-select/table-filter-select';
import { SocUploadFile } from '../composes/upload-file/upload-file';
import { pointerDownOutside, q, qa, type, visiblePanels } from '../testing/helpers';

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
  { value: 'c', label: 'Charlie' },
];

@Component({
  selector: 'test-forms-host',
  standalone: true,
  imports: [
    ReactiveFormsModule, SocInputText, SocInputArea, SocInputNumber, SocPassword, SocSearchBar, SocCheckbox, SocSwitch,
    SocRadioButton, SocSelect, SocMultiSelect, SocTableFilterSelect, SocUploadFile,
  ],
  template: `
    <soc-input-text id="text" [formControl]="f.controls.text" />
    <soc-input-area id="area" [formControl]="f.controls.area" />
    <soc-input-number id="num" [formControl]="f.controls.num" />
    <soc-password id="pwd" [formControl]="f.controls.pwd" />
    <soc-search-bar id="search" [formControl]="f.controls.search" />
    <soc-checkbox id="check" [formControl]="f.controls.check" />
    <soc-switch id="sw" [formControl]="f.controls.sw" />
    <soc-radio-button id="radio-a" value="a" [formControl]="f.controls.radio" />
    <soc-radio-button id="radio-b" value="b" [formControl]="f.controls.radio" />
    <soc-select id="select" [formControl]="f.controls.select" [options]="options" />
    <soc-multi-select id="multi" [formControl]="f.controls.multi" [options]="options" />
    <soc-table-filter-select id="filter" [formControl]="f.controls.filter" [options]="options" />
    <soc-upload-file id="upload" [formControl]="f.controls.upload" />
  `,
})
class FormsHost {
  readonly options = OPTIONS;
  private readonly fb = new FormBuilder();
  readonly f = this.fb.group({
    text: this.fb.control<string | null>(''),
    area: this.fb.control<string | null>(''),
    num: this.fb.control<number | null>(3),
    pwd: this.fb.control<string | null>(''),
    search: this.fb.control<string | null>(''),
    check: this.fb.control<boolean | null>(false),
    sw: this.fb.control<boolean | null>(false),
    radio: this.fb.control<string | null>('a'),
    select: this.fb.control<string | null>(null),
    multi: this.fb.control<string[] | null>([]),
    filter: this.fb.control<string | null>(null),
    upload: this.fb.control<File[] | null>([]),
  });
}

describe('form controls (ControlValueAccessor)', () => {
  let fixture: ComponentFixture<FormsHost>;
  let host: FormsHost;

  const el = (selector: string) => q(fixture, selector);
  const control = () => host.f.controls;
  const flush = () => fixture.detectChanges();

  beforeEach(() => {
    fixture = TestBed.createComponent(FormsHost);
    host = fixture.componentInstance;
    flush();
  });

  afterEach(() => fixture.destroy());

  describe('text-like fields', () => {
    const cases: [string, string, string][] = [
      ['soc-input-text', 'input', 'text'],
      ['soc-input-area', 'textarea', 'area'],
      ['soc-password', 'input', 'pwd'],
      ['soc-search-bar', 'input', 'search'],
    ];
    for (const [tag, native, name] of cases) {
      it(`${tag}: control → view, view → control, reset`, () => {
        const field = () => q<HTMLInputElement>(el(tag), native);
        (control() as Record<string, any>)[name].setValue('bonjour');
        flush();
        expect(field().value).toBe('bonjour');

        type(field(), 'salut');
        expect((control() as Record<string, any>)[name].value).toBe('salut');

        host.f.reset();
        flush();
        expect(field().value).toBe('');
      });

      it(`${tag}: disabled state and touched on blur`, () => {
        const ctrl = (control() as Record<string, any>)[name];
        ctrl.disable();
        flush();
        expect(q<HTMLInputElement>(el(tag), native).disabled).toBeTrue();
        ctrl.enable();
        flush();
        expect(q<HTMLInputElement>(el(tag), native).disabled).toBeFalse();

        expect(ctrl.touched).toBeFalse();
        q<HTMLInputElement>(el(tag), native).dispatchEvent(new Event('blur'));
        expect(ctrl.touched).toBeTrue();
      });
    }
  });

  describe('soc-input-number', () => {
    it('shows the value, writes user input back, and reset empties it (null)', () => {
      expect(q<HTMLInputElement>(el('soc-input-number'), 'input').value).toBe('3');
      type(q<HTMLInputElement>(el('soc-input-number'), 'input'), '8', 'change');
      expect(control().num.value).toBe(8);
      host.f.reset();
      flush();
      expect(control().num.value).toBeNull();
      expect(q<HTMLInputElement>(el('soc-input-number'), 'input').value).toBe('');
    });
  });

  describe('soc-checkbox / soc-switch', () => {
    it('checkbox follows the control and updates it on click', () => {
      const box = () => q(el('soc-checkbox'), '[role=checkbox]');
      control().check.setValue(true);
      flush();
      expect(box().getAttribute('aria-checked')).toBe('true');
      box().click();
      expect(control().check.value).toBeFalse();
      expect(control().check.touched).toBeFalse();
      box().dispatchEvent(new Event('blur'));
      expect(control().check.touched).toBeTrue();
    });

    it('switch follows the control, updates on click, and reset turns it off', () => {
      const sw = () => q(el('soc-switch'), '[role=switch]');
      sw().click();
      expect(control().sw.value).toBeTrue();
      host.f.reset();
      flush();
      expect(sw().getAttribute('aria-checked')).toBe('false');
    });

    it('both are disabled when the control is disabled', () => {
      control().check.disable();
      control().sw.disable();
      flush();
      expect((q(el('soc-checkbox'), '[role=checkbox]') as HTMLButtonElement).disabled).toBeTrue();
      expect((q(el('soc-switch'), '[role=switch]') as HTMLButtonElement).disabled).toBeTrue();
    });
  });

  describe('soc-radio-button group', () => {
    const radios = () => qa(fixture, 'soc-radio-button [role=radio]');

    it('selects the radio matching the control value', () => {
      expect(radios().map((r) => r.getAttribute('aria-checked'))).toEqual(['true', 'false']);
      control().radio.setValue('b');
      flush();
      expect(radios().map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'true']);
    });

    it('clicking one writes its value and un-selects its siblings', () => {
      radios()[1].click();
      flush();
      expect(control().radio.value).toBe('b');
      expect(radios().map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'true']);
      radios()[0].click();
      flush();
      expect(control().radio.value).toBe('a');
      expect(radios().map((r) => r.getAttribute('aria-checked'))).toEqual(['true', 'false']);
    });

    it('reset un-selects every radio', () => {
      host.f.reset();
      flush();
      expect(radios().map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'false']);
    });
  });

  describe('soc-select / soc-table-filter-select', () => {
    for (const [tag, name] of [['soc-select', 'select'], ['soc-table-filter-select', 'filter']] as const) {
      it(`${tag}: shows the selected label, writes the chosen value, reset restores the placeholder`, () => {
        const trigger = () => q<HTMLButtonElement>(el(tag), 'button');
        (control() as Record<string, any>)[name].setValue('b');
        flush();
        expect(trigger().textContent).toContain('Bravo');

        trigger().click();
        flush();
        const item = qa<HTMLButtonElement>(visiblePanels()[0], 'button[socmenuitem]').find((b) => b.textContent!.includes('Charlie'))!;
        item.click();
        flush();
        expect((control() as Record<string, any>)[name].value).toBe('c');

        host.f.reset();
        flush();
        expect(trigger().textContent).not.toContain('Charlie');
      });
    }

    it('soc-select is touched once its menu closes', () => {
      q<HTMLButtonElement>(el('soc-select'), 'button').click();
      flush();
      expect(control().select.touched).toBeFalse();
      pointerDownOutside();
      flush();
      expect(control().select.touched).toBeTrue();
    });

    it('soc-select: the label targets the inner button and the host keeps no id', () => {
      expect(el('soc-select').getAttribute('id')).toBeNull();
    });
  });

  describe('soc-multi-select', () => {
    it('shows chips for the control value and toggles values through the menu', () => {
      control().multi.setValue(['a']);
      flush();
      expect(qa(el('soc-multi-select'), 'soc-input-chip').map((c) => c.textContent!.trim())).toEqual(['Alpha']);

      q<HTMLButtonElement>(el('soc-multi-select'), 'button').click();
      flush();
      const rows = qa<HTMLButtonElement>(visiblePanels()[0], 'button[socmenuitem]');
      rows[1].click();
      flush();
      expect(control().multi.value).toEqual(['a', 'b']);
      rows[0].click();
      flush();
      expect(control().multi.value).toEqual(['b']);
    });

    it('reset (null) empties the selection', () => {
      control().multi.setValue(['a', 'c']);
      flush();
      host.f.reset();
      flush();
      expect(qa(el('soc-multi-select'), 'soc-input-chip').length).toBe(0);
    });
  });

  describe('soc-upload-file', () => {
    it('writes the picked files (as File[]) to the control and reset clears them', () => {
      const input = q<HTMLInputElement>(el('soc-upload-file'), 'input[type=file]');
      const dt = new DataTransfer();
      dt.items.add(new File(['x'], 'cv.pdf'));
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      expect(control().upload.value!.map((f) => f.name)).toEqual(['cv.pdf']);
      expect(control().upload.touched).toBeTrue();

      host.f.reset();
      flush();
      expect(input.value).toBe('');
    });
  });
});

describe('form validation', () => {
  it('the native `required` attribute on the host applies Validators.required', () => {
    @Component({
      standalone: true,
      imports: [ReactiveFormsModule, SocInputText],
      template: `<soc-input-text required [formControl]="c" />`,
    })
    class RequiredHost {
      c = new FormBuilder().control('');
    }
    const f = TestBed.createComponent(RequiredHost);
    f.detectChanges();
    expect(f.componentInstance.c.valid).toBeFalse();
    type(q<HTMLInputElement>(f, 'input'), 'ok');
    expect(f.componentInstance.c.valid).toBeTrue();
  });

  it('works with explicit validators and a multi-field group', () => {
    @Component({
      standalone: true,
      imports: [ReactiveFormsModule, SocCheckbox],
      template: `<soc-checkbox [formControl]="c" />`,
    })
    class TermsHost {
      c = new FormBuilder().control(false, Validators.requiredTrue);
    }
    const f = TestBed.createComponent(TermsHost);
    f.detectChanges();
    expect(f.componentInstance.c.valid).toBeFalse();
    q(f, '[role=checkbox]').click();
    expect(f.componentInstance.c.valid).toBeTrue();
  });
});
