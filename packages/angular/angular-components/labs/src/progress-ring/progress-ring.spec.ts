import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ProgressBarStatus } from '@socium-design/angular-components';
import { q } from '../../../src/testing/helpers';
import { SocLabsProgressRing } from './progress-ring';

@Component({
  standalone: true,
  imports: [SocLabsProgressRing],
  template: `<soc-labs-progress-ring [value]="value()" [status]="status()" label="Progression de Test bouton" [hideValue]="hide()" />`,
})
class Host {
  value = signal(60);
  status = signal<ProgressBarStatus>('success');
  hide = signal(false);
}

describe('Labs / ProgressRing', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const ring = () => q(fixture, 'soc-labs-progress-ring');
    const arc = () => ring().querySelectorAll('circle')[1] as SVGCircleElement;
    return { fixture, host: fixture.componentInstance, ring, arc };
  }

  it('is a named progressbar with the French-formatted value', () => {
    const { ring } = setup();
    expect(ring().getAttribute('role')).toBe('progressbar');
    expect(ring().getAttribute('aria-label')).toBe('Progression de Test bouton');
    expect(ring().getAttribute('aria-valuenow')).toBe('60');
    expect(ring().getAttribute('aria-valuetext')).toBe('60 %');
    expect(ring().textContent!.trim()).toBe('60 %');
  });

  it('keeps the real value above 100 % but fills the ring at most once', () => {
    const { fixture, host, ring, arc } = setup();
    host.value.set(157.37);
    fixture.detectChanges();
    expect(ring().getAttribute('aria-valuenow')).toBe('100');
    expect(ring().textContent!.trim()).toBe('157,37 %');
    const [filled, total] = arc().getAttribute('stroke-dasharray')!.split(' ').map(Number);
    expect(filled).toBeCloseTo(total, 3);
  });

  it('draws no arc at 0 % and uses the kit fill token of each status', () => {
    const { fixture, host, arc } = setup();
    expect(arc().getAttribute('class')).toContain('stroke-[var(--index-feedback-progressbar-fill-success)]');
    host.status.set('information');
    fixture.detectChanges();
    expect(arc().getAttribute('class')).toContain('stroke-[var(--index-feedback-progressbar-fill-information)]');
    host.value.set(0);
    fixture.detectChanges();
    expect(arc().getAttribute('class')).toContain('stroke-transparent');
  });

  it('can hide the visible value while keeping aria-valuetext', () => {
    const { fixture, host, ring } = setup();
    host.hide.set(true);
    fixture.detectChanges();
    expect(ring().textContent!.trim()).toBe('');
    expect(ring().getAttribute('aria-valuetext')).toBe('60 %');
  });
});
