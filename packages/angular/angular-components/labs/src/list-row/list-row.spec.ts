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
  `,
})
class Host {
  clicks = 0;
  subtitle = signal<string | undefined>('Nombre de salariés');
  selected = signal(false);
  locked = signal(false);
  reason = signal<string | undefined>(undefined);
  draggable = signal(false);
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
});
