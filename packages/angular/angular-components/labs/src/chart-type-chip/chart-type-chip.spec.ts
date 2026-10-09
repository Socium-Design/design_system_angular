import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q } from '../../../src/testing/helpers';
import { LABS_CHART_TYPE_LABELS, SocLabsChartTypeChip, type LabsChartType, type LabsChartTypeChipSize } from './chart-type-chip';

@Component({
  standalone: true,
  imports: [SocLabsChartTypeChip],
  template: `<soc-labs-chart-type-chip [type]="type()" [size]="size()" [label]="label()" [decorative]="decorative()" />`,
})
class Host {
  type = signal<LabsChartType>('courbe');
  size = signal<LabsChartTypeChipSize>(20);
  label = signal<string | undefined>(undefined);
  decorative = signal(false);
}

describe('Labs / ChartTypeChip', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance, chip: () => q(fixture, 'soc-labs-chart-type-chip') };
  }

  it('renders an icon and a tinted background for each of the 9 types, all distinct', () => {
    const { fixture, host, chip } = setup();
    const backgrounds = new Set<string>();
    for (const type of Object.keys(LABS_CHART_TYPE_LABELS) as LabsChartType[]) {
      host.type.set(type);
      fixture.detectChanges();
      expect(chip().querySelector('svg')).withContext(type).not.toBeNull();
      expect(chip().getAttribute('aria-label')).toBe(LABS_CHART_TYPE_LABELS[type]);
      backgrounds.add(/bg-\[var\(([^)]+)\)\]/.exec(chip().className)![1]);
    }
    expect(backgrounds.size).toBe(9);
  });

  it('only uses kit tokens for colours', () => {
    const { chip } = setup();
    expect(chip().className).toMatch(/bg-\[var\(--bridges-color-/);
    expect(chip().className).toMatch(/text-\[var\(--bridges-color-/);
    expect(chip().className).not.toMatch(/#[0-9a-f]{3,6}/i);
  });

  it('is an img named by its type, overridable, and hidden from AT when decorative', () => {
    const { fixture, host, chip } = setup();
    expect(chip().getAttribute('role')).toBe('img');
    host.label.set('Graphique en courbe');
    fixture.detectChanges();
    expect(chip().getAttribute('aria-label')).toBe('Graphique en courbe');
    host.decorative.set(true);
    fixture.detectChanges();
    expect(chip().getAttribute('role')).toBeNull();
    expect(chip().getAttribute('aria-label')).toBeNull();
    expect(chip().getAttribute('aria-hidden')).toBe('true');
  });

  it('has 20 and 28px sizes (kit icon md, icon lg + gap-2xs)', () => {
    const { fixture, host, chip } = setup();
    expect(chip().className).toContain('size-[var(--bridges-size-icon-md)]');
    host.size.set(28);
    fixture.detectChanges();
    expect(chip().className).toContain('size-[calc(var(--bridges-size-icon-lg)+var(--bridges-position-gap-2xs))]');
  });
});
