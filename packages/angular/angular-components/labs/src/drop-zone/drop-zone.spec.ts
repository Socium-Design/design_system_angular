import { CdkDropList } from '@angular/cdk/drag-drop';
import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q } from '../../../src/testing/helpers';
import { SocLabsDropZone, type LabsDropZoneVariant } from './drop-zone';

@Component({
  standalone: true,
  imports: [SocLabsDropZone, CdkDropList],
  template: `
    <soc-labs-drop-zone cdkDropList class="cdk" [variant]="variant()" [label]="label()" hint="ou glissez un indicateur" [active]="active()" [disabled]="disabled()" (activate)="activations = activations + 1" />
    <soc-labs-drop-zone class="plain" variant="slot" />
  `,
})
class Host {
  activations = 0;
  variant = signal<LabsDropZoneVariant>('empty');
  label = signal<string | undefined>(undefined);
  active = signal(false);
  disabled = signal(false);
  dropList = viewChild.required(CdkDropList);
}

describe('Labs / DropZone', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const zone = () => q(fixture, 'soc-labs-drop-zone.cdk');
    return { fixture, host: fixture.componentInstance, zone, button: () => q<HTMLButtonElement>(zone(), 'button') };
  }

  it('empty variant: dashed frame with a + icon, default text and hint; slot variant: compact "+ Ajouter…"', () => {
    const { fixture, button } = setup();
    expect(button().className).toContain('border-dashed');
    expect(button().className).toContain('flex-col');
    expect(button().textContent).toContain('Glissez un élément ici ou cliquez pour ajouter');
    expect(button().textContent).toContain('ou glissez un indicateur');
    expect(button().querySelector('svg')).not.toBeNull();
    const slot = q<HTMLButtonElement>(fixture, 'soc-labs-drop-zone.plain button');
    expect(slot.textContent!.trim()).toBe('Ajouter…');
    expect(slot.className).not.toContain('flex-col');
  });

  it('custom label', () => {
    const { fixture, host, button } = setup();
    host.label.set('Ajouter un graphe');
    fixture.detectChanges();
    expect(button().textContent).toContain('Ajouter un graphe');
  });

  it('is a clickable native button emitting (activate); disabled emits nothing', () => {
    const { fixture, host, button } = setup();
    expect(button().getAttribute('type')).toBe('button');
    button().click();
    expect(host.activations).toBe(1);
    host.disabled.set(true);
    fixture.detectChanges();
    button().click();
    expect(host.activations).toBe(1);
  });

  it('follows the host cdkDropList: entered → over, exited / dropped → back', () => {
    const { fixture, host, zone, button } = setup();
    const list = host.dropList();
    expect(zone().getAttribute('data-state')).toBeNull();
    list.entered.emit({} as never);
    fixture.detectChanges();
    expect(zone().getAttribute('data-state')).toBe('over');
    expect(button().className).toContain('border-[var(--bridges-color-border-focus)]');
    expect(button().className).toContain('bg-[var(--bridges-color-accent-blue-bg)]');
    list.exited.emit({} as never);
    fixture.detectChanges();
    expect(zone().getAttribute('data-state')).toBeNull();
    list.entered.emit({} as never);
    list.dropped.emit({} as never);
    fixture.detectChanges();
    expect(zone().getAttribute('data-state')).toBeNull();
  });

  it('`active` forces the drop-hover state; `disabled` cancels it', () => {
    const { fixture, host, zone } = setup();
    host.active.set(true);
    fixture.detectChanges();
    expect(zone().getAttribute('data-state')).toBe('over');
    host.disabled.set(true);
    fixture.detectChanges();
    expect(zone().getAttribute('data-state')).toBeNull();
  });

  it('works without cdkDropList', () => {
    const { fixture } = setup();
    expect(q(fixture, 'soc-labs-drop-zone.plain').getAttribute('data-state')).toBeNull();
  });

  it('hides the CDK drag placeholder inside the zone', () => {
    const { zone } = setup();
    expect(zone().className).toContain('[&_.cdk-drag-placeholder]:hidden');
  });
});
