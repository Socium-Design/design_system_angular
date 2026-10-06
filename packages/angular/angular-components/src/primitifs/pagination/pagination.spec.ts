import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, qa } from '../../testing/helpers';
import { SocPagination } from './pagination';

@Component({
  standalone: true,
  imports: [SocPagination],
  template: `<soc-pagination [currentPage]="page()" [totalPages]="total()" [totalEntries]="200" [pageSize]="10" (pageChange)="page.set($event)" (pageSizeChange)="size = $event" />`,
})
class Host {
  page = signal(1);
  total = signal(20);
  size = 0;
}

describe('Pagination', () => {
  const setup = (patch: (h: Host) => void = () => {}) => {
    const f = TestBed.createComponent(Host);
    patch(f.componentInstance);
    f.detectChanges();
    return f;
  };
  const labels = (f: ReturnType<typeof setup>) => qa(f, 'nav button, nav span').map((b) => b.textContent!.trim()).filter((t) => /^\d+$|…/.test(t));

  it('lists every page when there are 7 or fewer', () => {
    expect(labels(setup((h) => h.total.set(5)))).toEqual(['1', '2', '3', '4', '5']);
  });

  it('windows long ranges around the current page with ellipses', () => {
    expect(labels(setup((h) => h.page.set(10)))).toEqual(['1', '…', '9', '10', '11', '…', '20']);
    expect(labels(setup())).toEqual(['1', '2', '…', '20']);
  });

  it('navigates and marks the current page', () => {
    const f = setup();
    qa<HTMLButtonElement>(f, 'button').find((b) => b.textContent!.trim() === '2')!.click();
    f.detectChanges();
    expect(f.componentInstance.page()).toBe(2);
    expect(q(f, '[aria-current=page]').textContent!.trim()).toBe('2');
  });

  it('shows the entry range', () => {
    expect(q(setup((h) => h.page.set(3)), 'soc-pagination').textContent).toContain('Affichage de 21 à 30 sur 200');
  });
});
