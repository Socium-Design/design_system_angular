import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LucideLayoutGrid } from '@lucide/angular';
import { q } from '../../../src/testing/helpers';
import { LABS_ICON_TILE_COLORS, SocLabsIconTile, type LabsIconTileColor, type LabsIconTileSize } from './icon-tile';

@Component({
  standalone: true,
  imports: [SocLabsIconTile, LucideLayoutGrid],
  template: `
    <soc-labs-icon-tile [color]="color()" [size]="size()" [label]="label()" [decorative]="decorative()">
      <svg lucideLayoutGrid class="size-full"></svg>
    </soc-labs-icon-tile>
  `,
})
class Host {
  color = signal<LabsIconTileColor>('blue');
  size = signal<LabsIconTileSize>(32);
  label = signal<string | undefined>('Tableau de bord');
  decorative = signal(false);
}

describe('Labs / IconTile', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance, tile: () => q(fixture, 'soc-labs-icon-tile') };
  }

  it('projects the icon inside a sized wrapper', () => {
    const { tile } = setup();
    const wrapper = tile().querySelector('span')!;
    expect(wrapper.querySelector('svg')).not.toBeNull();
    expect(wrapper.getAttribute('aria-hidden')).toBe('true');
  });

  it('defaults to a 32px blue tile (accent-blue bg + text, kit icon xl)', () => {
    const { tile } = setup();
    expect(tile().className).toContain('bg-[var(--bridges-color-accent-blue-bg)]');
    expect(tile().className).toContain('text-[var(--bridges-color-accent-blue-text)]');
    expect(tile().className).toContain('size-[var(--bridges-size-icon-xl)]');
  });

  it('has one distinct kit background per colour, never a hard-coded colour', () => {
    const { fixture, host, tile } = setup();
    const backgrounds = new Set<string>();
    for (const color of LABS_ICON_TILE_COLORS) {
      host.color.set(color);
      fixture.detectChanges();
      expect(tile().getAttribute('data-color')).toBe(color);
      expect(tile().className).toMatch(/bg-\[var\(--bridges-color-/);
      expect(tile().className).not.toMatch(/#[0-9a-f]{3,6}/i);
      backgrounds.add(/bg-\[var\(([^)]+)\)\]/.exec(tile().className)![1]);
    }
    expect(backgrounds.size).toBe(LABS_ICON_TILE_COLORS.length);
  });

  it('has 20, 28 and 32px sizes (kit icon md, icon lg + gap-2xs, icon xl)', () => {
    const { fixture, host, tile } = setup();
    const expected: Record<LabsIconTileSize, string> = {
      20: 'size-[var(--bridges-size-icon-md)]',
      28: 'size-[calc(var(--bridges-size-icon-lg)+var(--bridges-position-gap-2xs))]',
      32: 'size-[var(--bridges-size-icon-xl)]',
    };
    for (const size of [20, 28, 32] as const) {
      host.size.set(size);
      fixture.detectChanges();
      expect(tile().className).withContext(`${size}`).toContain(expected[size]);
    }
  });

  it('is an img named by label; hidden from AT when decorative or unnamed', () => {
    const { fixture, host, tile } = setup();
    expect(tile().getAttribute('role')).toBe('img');
    expect(tile().getAttribute('aria-label')).toBe('Tableau de bord');
    host.decorative.set(true);
    fixture.detectChanges();
    expect(tile().getAttribute('role')).toBeNull();
    expect(tile().getAttribute('aria-label')).toBeNull();
    expect(tile().getAttribute('aria-hidden')).toBe('true');
    host.decorative.set(false);
    host.label.set(undefined);
    fixture.detectChanges();
    expect(tile().getAttribute('role')).toBeNull();
    expect(tile().getAttribute('aria-hidden')).toBe('true');
  });
});
