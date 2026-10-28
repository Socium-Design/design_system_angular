import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q } from '../../../src/testing/helpers';
import { SocLabsTag, type LabsTagColor } from './tag';

@Component({
  standalone: true,
  imports: [SocLabsTag],
  template: `<soc-labs-tag [color]="color()">Standard</soc-labs-tag>`,
})
class Host {
  color = signal<LabsTagColor>('neutral');
}

describe('Labs / Tag', () => {
  it('neutral by default, kit tag tokens for the shape; kit colours unchanged', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const tag = q(fixture, 'soc-labs-tag');
    expect(tag.textContent!.trim()).toBe('Standard');
    expect(tag.getAttribute('data-color')).toBe('neutral');
    expect(tag.className).toContain('--bridges-color-background-layer-1');
    expect(tag.className).toContain('--index-feedback-tag-radius');
    fixture.componentInstance.color.set('orange');
    fixture.detectChanges();
    expect(tag.className).toContain('--index-feedback-tag-bg-orange');
  });
});
