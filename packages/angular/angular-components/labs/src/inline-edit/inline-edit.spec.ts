import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, type } from '../../../src/testing/helpers';
import { SocLabsInlineEdit } from './inline-edit';

@Component({
  standalone: true,
  imports: [SocLabsInlineEdit],
  template: `
    <h3>
      <soc-labs-inline-edit
        ariaLabel="le nom de la section"
        defaultValue="Section 1"
        [disabled]="disabled()"
        [(value)]="value"
        (valueChange)="changes.push($event)"
      />
    </h3>
  `,
})
class Host {
  value = signal('Effectifs');
  disabled = signal(false);
  changes: string[] = [];
}

describe('Labs / InlineEdit', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const button = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement | null;
    const input = () => fixture.nativeElement.querySelector('input') as HTMLInputElement | null;
    const open = () => {
      button()!.click();
      fixture.detectChanges();
    };
    const key = (k: string) => {
      input()!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
      fixture.detectChanges();
    };
    return { fixture, host, button, input, open, key };
  }

  it('shows the text in an accessible button with a pencil, no input', () => {
    const { button, input } = setup();
    expect(button()!.textContent).toContain('Effectifs');
    expect(button()!.getAttribute('aria-label')).toBe('Modifier le nom de la section : Effectifs');
    expect(button()!.querySelector('svg[aria-hidden=true]')).not.toBeNull();
    expect(input()).toBeNull();
  });

  it('click swaps in a focused, pre-filled, selected field', () => {
    const { open, input, button } = setup();
    open();
    expect(button()).toBeNull();
    expect(input()!.value).toBe('Effectifs');
    expect(document.activeElement).toBe(input());
    expect(input()!.selectionEnd! - input()!.selectionStart!).toBe('Effectifs'.length);
    expect(input()!.getAttribute('aria-label')).toBe('le nom de la section');
  });

  it('Enter validates, emits valueChange once and gives focus back to the label', () => {
    const { open, input, key, host, button } = setup();
    open();
    type(input()!, '  Rémunération ');
    key('Enter');
    expect(host.value()).toBe('Rémunération');
    expect(host.changes).toEqual(['Rémunération']);
    expect(input()).toBeNull();
    expect(document.activeElement).toBe(button());
  });

  it('blur validates', () => {
    const { fixture, open, input, host } = setup();
    open();
    type(input()!, 'Absences');
    input()!.dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();
    expect(host.value()).toBe('Absences');
  });

  it('Escape cancels without emitting', () => {
    const { open, input, key, host, button } = setup();
    open();
    type(input()!, 'Autre chose');
    key('Escape');
    expect(host.value()).toBe('Effectifs');
    expect(host.changes).toEqual([]);
    expect(button()!.textContent).toContain('Effectifs');
    expect(document.activeElement).toBe(button());
  });

  it('an empty value falls back to the default value', () => {
    const { open, input, key, host } = setup();
    open();
    type(input()!, '   ');
    key('Enter');
    expect(host.value()).toBe('Section 1');
  });

  it('validating an unchanged value emits nothing', () => {
    const { open, key, host } = setup();
    open();
    key('Enter');
    expect(host.changes).toEqual([]);
  });

  it('an empty value displays the default value', () => {
    const { fixture, host, button } = setup();
    host.value.set('');
    fixture.detectChanges();
    expect(button()!.textContent).toContain('Section 1');
  });

  it('disabled: plain text, no pencil, no editing', () => {
    const { fixture, host, button, input } = setup();
    host.disabled.set(true);
    fixture.detectChanges();
    expect(button()!.disabled).toBeTrue();
    expect(button()!.querySelector('svg')).toBeNull();
    button()!.click();
    fixture.detectChanges();
    expect(input()).toBeNull();
  });
});
