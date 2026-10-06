import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, qa, visiblePanels } from '../../testing/helpers';
import { SocMenu, SocMenuItem } from '../menu/menu';
import { SocSelect } from './select';

const OPTIONS = [
  { value: 'fr', label: 'France' },
  { value: 'sn', label: 'Sénégal' },
];

@Component({
  standalone: true,
  imports: [SocSelect],
  template: `
    <soc-select
      id="country"
      label="Pays"
      [required]="required()"
      [error]="error()"
      helperText="Aide"
      placeholder="Choisir"
      [options]="options"
      [defaultValue]="defaultValue()"
      [(value)]="value"
      [disabled]="disabled()"
      [mode]="mode()"
    />
  `,
})
class SelectHost {
  options = OPTIONS;
  value = signal<string | undefined>(undefined);
  defaultValue = signal<string | undefined>(undefined);
  required = signal(false);
  error = signal(false);
  disabled = signal(false);
  mode = signal<'formulaire' | 'labelHeader'>('formulaire');
}

describe('Select', () => {
  function setup(patch: (h: SelectHost) => void = () => {}) {
    const f = TestBed.createComponent(SelectHost);
    patch(f.componentInstance);
    f.detectChanges();
    return { f, host: f.componentInstance, trigger: () => q<HTMLButtonElement>(f, 'soc-select button') };
  }
  const open = (f: { detectChanges(): void }, trigger: HTMLButtonElement) => {
    trigger.click();
    f.detectChanges();
    return visiblePanels()[0];
  };

  it('shows the placeholder, then the chosen label, and closes after a pick', () => {
    const { f, host, trigger } = setup();
    expect(trigger().textContent).toContain('Choisir');
    const panel = open(f, trigger());
    qa<HTMLButtonElement>(panel, 'button[socmenuitem]')[1].click();
    f.detectChanges();
    expect(host.value()).toBe('sn');
    expect(trigger().textContent).toContain('Sénégal');
    expect(visiblePanels().length).toBe(0);
  });

  it('uses defaultValue until a value is set (uncontrolled start), then the value wins', () => {
    const { f, host, trigger } = setup((h) => h.defaultValue.set('fr'));
    expect(trigger().textContent).toContain('France');
    const panel = open(f, trigger());
    qa<HTMLButtonElement>(panel, 'button[socmenuitem]')[1].click();
    f.detectChanges();
    expect(trigger().textContent).toContain('Sénégal');
    expect(host.value()).toBe('sn');
  });

  it('marks the selected option with a check icon in the menu', () => {
    const { f, trigger } = setup((h) => h.value.set('fr'));
    const items = qa<HTMLButtonElement>(open(f, trigger()), 'button[socmenuitem]');
    expect(items[0].querySelector('svg.lucide-check')).not.toBeNull();
    expect(items[1].querySelector('svg')).toBeNull();
  });

  it('label targets the trigger via the custom id; host keeps no id', () => {
    const { f, trigger } = setup();
    expect(trigger().id).toBe('country');
    expect(q<HTMLLabelElement>(f, 'soc-select label').htmlFor).toBe('country');
    expect(q(f, 'soc-select').getAttribute('id')).toBeNull();
  });

  it('required adds the marker; labelHeader mode moves the label inside the field (no <label>)', () => {
    const { f, host } = setup((h) => h.required.set(true));
    expect(q(f, 'soc-select label').textContent).toContain('*');
    host.mode.set('labelHeader');
    f.detectChanges();
    expect(qa(f, 'soc-select label').length).toBe(0);
    expect(q(f, 'soc-select button').textContent).toContain('Pays');
  });

  it('a disabled select never opens', () => {
    const { f, trigger } = setup((h) => h.disabled.set(true));
    expect(trigger().disabled).toBeTrue();
    trigger().click();
    f.detectChanges();
    expect(visiblePanels().length).toBe(0);
  });

  it('error/helper text styling follows the error flag', () => {
    const { f, host } = setup();
    const helper = () => q(f, 'soc-select').querySelectorAll('span')[q(f, 'soc-select').querySelectorAll('span').length - 1];
    expect(helper().className).toContain('help-color)');
    host.error.set(true);
    f.detectChanges();
    expect(helper().className).toContain('help-color-error');
  });
});

describe('MenuItem', () => {
  @Component({
    standalone: true,
    imports: [SocMenu, SocMenuItem],
    template: `
      <soc-menu>
        <button socMenuItem label="Un" (click)="log.push('un')"></button>
        <button socMenuItem label="Deux" mode="checkbox" [checked]="true"></button>
        <button socMenuItem label="Trois" mode="radio" [checked]="true"></button>
        <button socMenuItem label="Niveau 2" [level]="2"></button>
        <button socMenuItem label="Niveau 3" [level]="3"></button>
      </soc-menu>
    `,
  })
  class Host {
    log: string[] = [];
  }

  it('renders icon/checkbox/radio modes, a native click, and level indents', () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    const items = qa<HTMLButtonElement>(f, 'button[socmenuitem]');
    expect(items.every((i) => i.type === 'button')).toBeTrue();
    items[0].click();
    expect(f.componentInstance.log).toEqual(['un']);
    expect(items[1].querySelector('[role=checkbox]')!.getAttribute('aria-checked')).toBe('true');
    expect(items[2].querySelector('[role=radio]')!.getAttribute('aria-checked')).toBe('true');
    expect(items[0].className).toContain('menu-item-pad-h');
    expect(items[3].className).toContain('level2-indent');
    expect(items[4].className).toContain('level3-indent');
  });
});
