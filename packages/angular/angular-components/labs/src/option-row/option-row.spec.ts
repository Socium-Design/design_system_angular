import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, qa } from '../../../src/testing/helpers';
import { SocLabsTag } from '../tag/tag';
import { SocLabsOptionRow, SocLabsOptionRowTags } from './option-row';

@Component({
  standalone: true,
  imports: [SocLabsOptionRow, SocLabsOptionRowTags, SocLabsTag],
  template: `
    <div role="list">
      <soc-labs-option-row
        class="parent"
        label="Parcours d'intégration"
        description="Active le parcours d'arrivée d'un nouvel employé."
        [(checked)]="parent"
        [confirmMessage]="confirm()"
        [isNew]="isNew()"
        (labelClick)="opened.set(opened() + 1)"
      >
        <soc-labs-tag socLabsOptionRowTags color="orange">Payant</soc-labs-tag>
        <soc-labs-option-row
          class="child"
          label="Étape Documents"
          [(checked)]="child"
          [disabled]="!parent()"
          disabledReason="Activez d'abord « Parcours d'intégration »."
        />
      </soc-labs-option-row>
    </div>
  `,
})
class Host {
  parent = signal(false);
  child = signal(false);
  confirm = signal<string | undefined>('Option payante : vérifiez qu’elle a été vendue au client.');
  isNew = signal(false);
  opened = signal(0);
}

describe('Labs / OptionRow', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const parent = () => q(fixture, 'soc-labs-option-row.parent');
    const part = (name: string, root: Element = parent()) => root.querySelector(`[data-part="${name}"]`) as HTMLElement | null;
    const switchOf = (row: Element) => row.querySelector<HTMLButtonElement>('[role="switch"]')!;
    return { fixture, host: fixture.componentInstance, parent, part, switchOf };
  }

  it('renders switch, label button, one-line description and tags; switch named by the label', () => {
    const { parent, part, switchOf } = setup();
    expect(parent().getAttribute('role')).toBe('listitem');
    expect(part('label')!.tagName).toBe('BUTTON');
    expect(part('label')!.getAttribute('aria-haspopup')).toBe('dialog');
    expect(part('description')!.className).toContain('truncate');
    expect(part('tags')!.textContent).toContain('Payant');
    const sw = switchOf(parent());
    const name = document.querySelector(`label[for="${sw.id}"]`)!.textContent!.trim();
    expect(name).toBe("Parcours d'intégration");
    expect(parent().hasAttribute('title')).toBeFalse();
  });

  it('label click emits labelClick; "Nouveau" badge only when isNew', () => {
    const { fixture, host, part } = setup();
    part('label')!.click();
    expect(host.opened()).toBe(1);
    expect(part('new')).toBeNull();
    host.isNew.set(true);
    fixture.detectChanges();
    expect(part('new')!.textContent!.trim()).toBe('Nouveau');
  });

  it('with confirmMessage: enabling opens the in-row confirmation; Confirmer commits', async () => {
    const { fixture, host, parent, part, switchOf } = setup();
    switchOf(parent()).click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.parent()).toBeFalse();
    expect(parent().getAttribute('data-state')).toBe('confirming');
    expect(part('confirm')!.getAttribute('role')).toBe('group');
    expect(part('confirm')!.textContent).toContain('vendue au client');
    expect(document.activeElement).toBe(part('confirm-ok'));
    part('confirm-ok')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.parent()).toBeTrue();
    expect(part('confirm')).toBeNull();
    expect(document.activeElement).toBe(switchOf(parent()));
  });

  it('Annuler (or Escape) reverts the switch and emits nothing', async () => {
    const { fixture, host, parent, part, switchOf } = setup();
    switchOf(parent()).click();
    fixture.detectChanges();
    part('confirm-cancel')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.parent()).toBeFalse();
    expect(switchOf(parent()).getAttribute('aria-checked')).toBe('false');
    switchOf(parent()).click();
    fixture.detectChanges();
    part('confirm')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(part('confirm')).toBeNull();
    expect(host.parent()).toBeFalse();
  });

  it('without confirmMessage the switch commits directly; disabling never asks', () => {
    const { fixture, host, parent, part, switchOf } = setup();
    host.confirm.set(undefined);
    fixture.detectChanges();
    switchOf(parent()).click();
    fixture.detectChanges();
    expect(host.parent()).toBeTrue();
    host.confirm.set('Confirmer ?');
    fixture.detectChanges();
    switchOf(parent()).click();
    fixture.detectChanges();
    expect(host.parent()).toBeFalse();
    expect(part('confirm')).toBeNull();
  });

  it('sub-options are nested in a list; disabled with a reason while the parent is off', () => {
    const { fixture, host, parent, switchOf } = setup();
    const nested = parent().querySelector('[data-part="children"]')!;
    expect(nested.getAttribute('role')).toBe('list');
    const child = q(fixture, 'soc-labs-option-row.child');
    expect(nested.contains(child)).toBeTrue();
    expect(switchOf(child).disabled).toBeTrue();
    expect(child.querySelector('[data-part="disabled-reason"]')!.textContent).toContain('Activez d');
    host.parent.set(true);
    fixture.detectChanges();
    expect(switchOf(child).disabled).toBeFalse();
    expect(child.querySelector('[data-part="disabled-reason"]')).toBeNull();
    expect(qa(fixture, '[role="switch"]').length).toBe(2);
  });
});
