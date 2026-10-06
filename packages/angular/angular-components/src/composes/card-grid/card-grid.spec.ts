import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SocCard } from '../../primitifs/card/card';
import { q, qa } from '../../testing/helpers';
import { SocCardGrid, type CardGridMode } from './card-grid';

@Component({
  selector: 'test-grid-host',
  standalone: true,
  imports: [SocCardGrid, SocCard],
  template: `
    <soc-card-grid [mode]="mode()" [columns]="columns()" [rowHeight]="rowHeight()" [gap]="gap()">
      <soc-card title="A" [colSpan]="3" [rowSpan]="2" />
      <soc-card title="B" [colSpan]="2" />
      <soc-card title="C" />
    </soc-card-grid>
  `,
})
class GridHost {
  mode = input<CardGridMode>('bento');
  columns = input<number>();
  rowHeight = input<number | 'auto'>('auto');
  gap = input<'sm' | 'md' | 'lg'>('md');
}

@Component({ standalone: true, imports: [SocCard], template: `<soc-card title="Solo" [colSpan]="3" [rowSpan]="2" />` })
class StandaloneHost {}

function setup(inputs: Record<string, unknown> = {}) {
  const fixture = TestBed.createComponent(GridHost);
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  fixture.detectChanges();
  const cards = qa(fixture, 'soc-card').map((c) => c.className.split(/\s+/));
  return { fixture, cards };
}

describe('CardGrid', () => {
  it('fixed mode forces every card to 1×1 whatever it asked for', () => {
    const { cards } = setup({ mode: 'fixed' });
    for (const classes of cards) {
      expect(classes).toContain('col-span-1');
      expect(classes).toContain('row-span-1');
      expect(classes).not.toContain('col-span-2');
      expect(classes).not.toContain('col-span-3');
      expect(classes).not.toContain('row-span-2');
    }
  });

  it('bento clamps colSpan to 75% of the row at every responsive tier (never full width)', () => {
    const [a, b, c] = setup().cards;
    // colSpan 3: 1 col at the base tier, 2 from 600px, 3 from 900px
    expect(a).toContain('col-span-1');
    expect(a).toContain('@min-[600px]:col-span-2');
    expect(a).toContain('@min-[900px]:col-span-3');
    // colSpan 2: 1 col at the base tier, 2 from 600px
    expect(b).toContain('col-span-1');
    expect(b).toContain('@min-[600px]:col-span-2');
    expect(b).not.toContain('@min-[900px]:col-span-3');
    // colSpan 1 needs no clamp
    expect(c).toContain('col-span-1');
    expect(c.some((k) => k.startsWith('@min-'))).toBeFalse();
  });

  it('bento keeps rowSpan as requested', () => {
    expect(setup().cards[0]).toContain('row-span-2');
  });

  it('explicit `columns` applies the same 75% ceiling once, without responsive classes', () => {
    const two = setup({ columns: 2 }).cards;
    expect(two[0]).toContain('col-span-1'); // floor(2 * .75) = 1
    expect(two[1]).toContain('col-span-1');
    const four = setup({ columns: 4 }).cards;
    expect(four[0]).toContain('col-span-3'); // floor(4 * .75) = 3
    expect(four[1]).toContain('col-span-2');
    expect(four[0].some((k) => k.startsWith('@min-'))).toBeFalse();
  });

  it('a card outside any grid keeps the span it was given', () => {
    const f = TestBed.createComponent(StandaloneHost);
    f.detectChanges();
    const classes = q(f, 'soc-card').className.split(/\s+/);
    expect(classes).toContain('col-span-3');
    expect(classes).toContain('row-span-2');
  });

  it('is a block container-query root; `columns` and `rowHeight` become inline grid styles', () => {
    const { fixture } = setup({ columns: 3, rowHeight: 160 });
    expect(q(fixture, 'soc-card-grid').className).toContain('@container');
    expect(q(fixture, 'soc-card-grid').className).toContain('block');
    const grid = q(fixture, 'soc-card-grid > div');
    expect(grid.style.gridTemplateColumns).toBe('repeat(3, minmax(0px, 1fr))');
    expect(grid.style.gridAutoRows).toBe('160px');
    expect(grid.className).not.toContain('grid-cols-2');
  });

  it('uses the responsive column ladder when `columns` is omitted, with dense flow only in bento', () => {
    expect(q(setup().fixture, 'soc-card-grid > div').className).toContain('@min-[900px]:grid-cols-4');
    expect(q(setup().fixture, 'soc-card-grid > div').className).toContain('grid-flow-dense');
    expect(q(setup({ mode: 'fixed' }).fixture, 'soc-card-grid > div').className).not.toContain('grid-flow-dense');
  });
});
