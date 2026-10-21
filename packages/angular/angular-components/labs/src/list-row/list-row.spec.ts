import { CdkDrag, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, qa } from '../../../src/testing/helpers';
import { SocLabsListRow, SocLabsListRowAction, SocLabsListRowLeading } from './list-row';

@Component({
  standalone: true,
  imports: [SocLabsListRow, SocLabsListRowLeading, SocLabsListRowAction, CdkDropList, CdkDrag],
  template: `
    <div role="list" cdkDropList>
      <soc-labs-list-row
        cdkDrag
        class="row"
        title="Effectif total"
        [subtitle]="subtitle()"
        [selected]="selected()"
        [locked]="locked()"
        [lockedReason]="reason()"
        [draggable]="draggable()"
      >
        <span socLabsListRowLeading class="lead">●</span>
        <button socLabsListRowAction class="add" (click)="clicks = clicks + 1">+</button>
      </soc-labs-list-row>
      <soc-labs-list-row class="bare" title="Sans slot" />
    </div>
    <div role="list">
      <soc-labs-list-row
        class="flush"
        appearance="flush"
        title="Effectif total"
        subtitle="Nombre de salariés"
        [selected]="flushSelected()"
        [locked]="flushLocked()"
      />
    </div>
  `,
})
class Host {
  clicks = 0;
  subtitle = signal<string | undefined>('Nombre de salariés');
  selected = signal(false);
  locked = signal(false);
  reason = signal<string | undefined>(undefined);
  draggable = signal(false);
  flushSelected = signal(false);
  flushLocked = signal(false);
  drag = viewChild.required(CdkDrag);
}

describe('Labs / ListRow', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance, row: () => q(fixture, 'soc-labs-list-row.row') };
  }
  afterEach(() => expect(qa(document.body, 'body > [role=tooltip]').length).toBe(0));

  it('renders leading slot, truncated title + subtitle and action slot; slots are optional', () => {
    const { fixture, row } = setup();
    expect(row().getAttribute('role')).toBe('listitem');
    expect(row().querySelector('.lead')).not.toBeNull();
    expect(row().querySelector('.add')).not.toBeNull();
    const [title, subtitle] = qa(row(), '.truncate');
    expect(title.textContent).toContain('Effectif total');
    expect(subtitle.textContent).toContain('Nombre de salariés');
    const bare = q(fixture, 'soc-labs-list-row.bare');
    expect(bare.children.length).toBe(1); // only the text column
  });

  it('selected: light blue background, bold blue title, "Ajouté" for screen readers', () => {
    const { fixture, host, row } = setup();
    host.selected.set(true);
    fixture.detectChanges();
    expect(row().getAttribute('data-state')).toBe('selected');
    expect(row().className).toContain('bg-[var(--bridges-color-surface-selected)]');
    expect(qa(row(), '.truncate')[0].className).toContain('text-[var(--bridges-color-text-action)]');
    expect(q(row(), '.sr-only').textContent).toContain('Ajouté');
  });

  it('locked: 50% opacity, not-allowed cursor, aria-disabled, inert action', () => {
    const { fixture, host, row } = setup();
    host.locked.set(true);
    fixture.detectChanges();
    expect(row().className).toContain('opacity-50');
    expect(row().className).toContain('cursor-not-allowed');
    expect(row().getAttribute('aria-disabled')).toBe('true');
    expect(q(row(), '.add').parentElement!.hasAttribute('inert')).toBeTrue();
  });

  it('locked with a reason: focusable kit tooltip showing the reason', () => {
    const { fixture, host, row } = setup();
    host.locked.set(true);
    host.reason.set('Indisponible pour cette population');
    fixture.detectChanges();
    const tooltip = q(row(), 'soc-tooltip');
    expect(tooltip.getAttribute('tabindex')).toBe('0');
    const bubble = q(document.body, 'body > [role=tooltip]');
    expect(bubble.textContent).toContain('Indisponible pour cette population');
    tooltip.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    fixture.detectChanges();
    expect(bubble.style.visibility).toBe('visible');
    fixture.destroy();
  });

  it('draggable: renders a drag handle registered on the host cdkDrag', () => {
    const { fixture, host, row } = setup();
    expect(row().querySelector('[data-drag-handle]')).toBeNull();
    host.draggable.set(true);
    fixture.detectChanges();
    const handle = q(row(), '[data-drag-handle]');
    expect(handle.classList).toContain('cdk-drag-handle');
    expect(handle.getAttribute('aria-hidden')).toBe('true');
    // CDK keeps its handles private; bracket access is the only way to assert the registration.
    expect(host.drag()['_handles'].getValue().map((h: CdkDragHandle) => h.element.nativeElement)).toEqual([handle]);
  });

  it('action click goes through', () => {
    const { host, row } = setup();
    q<HTMLButtonElement>(row(), '.add').click();
    expect(host.clicks).toBe(1);
  });

  describe('appearance', () => {
    const flushRow = (fixture: ReturnType<typeof TestBed.createComponent<Host>>) => q(fixture, 'soc-labs-list-row.flush');

    it('defaults to card: rounded block, data-appearance="card", 14px title', () => {
      const { row } = setup();
      expect(row().getAttribute('data-appearance')).toBe('card');
      expect(row().className).toContain('rounded-[var(--bridges-shape-figure-radius-md)]');
      expect(row().className).not.toContain('border-b-[length:var(--bridges-shape-line-hairline)]');
      expect(qa(row(), '.truncate')[0].className).toContain('text-[length:var(--bridges-size-text-text-size-sm)]');
    });

    it('flush: no radius, hairline subtle bottom separator, compact padding, hover background', () => {
      const { fixture } = setup();
      const row = flushRow(fixture);
      expect(row.getAttribute('data-appearance')).toBe('flush');
      expect(row.getAttribute('data-state')).toBe('default');
      expect(row.className).not.toContain('rounded');
      expect(row.className).toContain('border-b-[length:var(--bridges-shape-line-hairline)]');
      expect(row.className).toContain('border-[var(--bridges-color-border-subtle)]');
      expect(row.className).toContain('py-[var(--bridges-position-padding-xs)]');
      expect(row.className).toContain('hover:bg-[var(--bridges-color-background-layer-1)]');
    });

    it('flush: 12px title, 11px subtitle (derived from tiny + xs)', () => {
      const { fixture } = setup();
      const [title, subtitle] = qa(flushRow(fixture), '.truncate');
      expect(title.className).toContain('text-[length:var(--bridges-size-text-text-size-xs)]');
      expect(title.className).toContain('text-[var(--bridges-color-text-primary)]');
      expect(subtitle.className).toContain(
        'text-[length:calc((var(--bridges-size-text-text-size-tiny)+var(--bridges-size-text-text-size-xs))/2)]',
      );
    });

    it('flush selected: very light blue background, action-blue semibold title', () => {
      const { fixture, host } = setup();
      host.flushSelected.set(true);
      fixture.detectChanges();
      const row = flushRow(fixture);
      expect(row.getAttribute('data-state')).toBe('selected');
      expect(row.className).toContain(
        'bg-[color-mix(in_srgb,var(--bridges-color-surface-selected)_50%,var(--bridges-color-surface-neutral-white))]',
      );
      expect(row.className).not.toContain('bg-[var(--bridges-color-surface-selected)]');
      expect(row.className).not.toContain('hover:bg-');
      const title = qa(row, '.truncate')[0];
      expect(title.className).toContain('text-[var(--bridges-color-text-action)]');
      expect(title.className).toContain('[font-weight:var(--bridges-shape-text-heading-2-weight)]');
      expect(q(row, '.sr-only').textContent).toContain('Ajouté');
    });

    it('flush locked: unchanged locked behaviour (opacity, cursor, aria-disabled), separator kept', () => {
      const { fixture, host } = setup();
      host.flushLocked.set(true);
      host.flushSelected.set(true);
      fixture.detectChanges();
      const row = flushRow(fixture);
      expect(row.getAttribute('data-state')).toBe('locked');
      expect(row.className).toContain('opacity-50');
      expect(row.className).toContain('cursor-not-allowed');
      expect(row.className).toContain('border-b-[length:var(--bridges-shape-line-hairline)]');
      expect(row.getAttribute('aria-disabled')).toBe('true');
      expect(qa(row, '.truncate')[0].className).not.toContain('text-[var(--bridges-color-text-action)]');
    });
  });
});
