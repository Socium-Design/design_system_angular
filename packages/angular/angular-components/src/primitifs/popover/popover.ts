import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  ViewEncapsulation,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right' | 'bottom-end';

/** React `Popover`'s `trigger: ReactElement` — receives a click handler (React clones it in;
 * here the click listener lives on this component's own wrapper around the projected content
 * instead, same workaround as `Tooltip`'s trigger — see that component's own docstring for why
 * cloning has no Angular equivalent). */
@Directive({ selector: '[socPopoverTrigger]', standalone: true })
export class SocPopoverTrigger {}

const GAP = 4;
const VIEWPORT_MARGIN = 4;

/** Ported 1:1 from React Popover.tsx's own `computePosition`. */
function computePosition(position: PopoverPosition, triggerRect: DOMRect, panelRect: DOMRect) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (position === 'left' || position === 'right') {
    const spaceLeft = triggerRect.left;
    const spaceRight = vw - triggerRect.right;
    const needed = panelRect.width + GAP;
    let openRight = position === 'right';
    if (openRight && spaceRight < needed && spaceLeft > spaceRight) openRight = false;
    if (!openRight && spaceLeft < needed && spaceRight > spaceLeft) openRight = true;
    const left = openRight ? triggerRect.right + GAP : triggerRect.left - panelRect.width - GAP;
    const top = Math.min(Math.max(VIEWPORT_MARGIN, triggerRect.top), vh - panelRect.height - VIEWPORT_MARGIN);
    return { top, left: Math.min(Math.max(VIEWPORT_MARGIN, left), vw - panelRect.width - VIEWPORT_MARGIN) };
  }

  const spaceBelow = vh - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  const needed = panelRect.height + GAP;
  let openBelow = position !== 'top';
  if (openBelow && spaceBelow < needed && spaceAbove > spaceBelow) openBelow = false;
  if (!openBelow && spaceAbove < needed && spaceBelow > spaceAbove) openBelow = true;
  const top = openBelow ? triggerRect.bottom + GAP : triggerRect.top - panelRect.height - GAP;

  const alignEnd = position === 'bottom-end';
  const left = alignEnd ? triggerRect.right - panelRect.width : triggerRect.left;
  return { top, left: Math.min(Math.max(VIEWPORT_MARGIN, left), vw - panelRect.width - VIEWPORT_MARGIN) };
}

/**
 * No native HTML equivalent — plain wrapper (`soc-popover`). Maps 1:1 to
 * "Index/Conteneur/Menu/popover-*" tokens (Figma has no standalone Popover token set — Menu is
 * the only component that binds the floating-surface tokens) — see
 * packages/tokens/tokens/components/conteneur.json in design_system (React reference repo, read
 * only). `trigger` -> named content slot (`socPopoverTrigger`); panel content -> default
 * unnamed slot, same split as `Card`'s icon-slots-vs-default-children precedent.
 *
 * Portaled to `document.body` via a direct `appendChild`, positioned with computed `position:
 * fixed` — same reasoning and same technique as `Tooltip`'s own bubble (see its docstring).
 * `computePosition` ported 1:1 from React. React's controlled-vs-uncontrolled `open` collapses to
 * one `model()`, same pattern as `Checkbox`/`Accordion`.
 */
@Component({
  selector: 'soc-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div #triggerWrapper class="relative inline-flex" (click)="toggle()">
      <ng-content select="[socPopoverTrigger]" />
    </div>
    <div
      #panel
      role="dialog"
      [style.position]="'fixed'"
      [style.top.px]="topPx()"
      [style.left.px]="leftPx()"
      [style.width.px]="matchTriggerWidth() && open() ? triggerWidthPx() : null"
      [style.visibility]="open() ? 'visible' : 'hidden'"
      class="z-20 flex min-w-[200px] flex-col items-start rounded-[var(--index-conteneur-menu-popover-radius)] bg-[var(--index-conteneur-menu-popover-bg)] py-[var(--index-conteneur-menu-popover-pad)] drop-shadow-[0px_var(--index-conteneur-menu-popover-shadow-y)_var(--index-conteneur-menu-popover-shadow-blur)_rgba(68,84,111,var(--index-conteneur-menu-popover-shadow-opacity))]"
    >
      <ng-content />
    </div>
  `,
  styleUrl: './popover.css',
})
export class SocPopover {
  readonly position = input<PopoverPosition>('bottom');
  readonly open = model(false);
  readonly matchTriggerWidth = input(false);

  private readonly triggerWrapperRef = viewChild<ElementRef<HTMLElement>>('triggerWrapper');
  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  private appended = false;

  protected readonly topPx = signal(0);
  protected readonly leftPx = signal(0);
  protected readonly triggerWidthPx = signal(0);

  constructor() {
    effect(() => {
      const isOpen = this.open();
      this.position();
      this.matchTriggerWidth();
      const panelEl = this.panelRef()?.nativeElement;
      if (!panelEl) return;
      if (!this.appended) {
        document.body.appendChild(panelEl);
        this.appended = true;
      }
      if (isOpen) this.reposition();
    });

    const onWindowChange = () => {
      if (this.open()) this.reposition();
    };
    const onPointerDown = (e: MouseEvent) => {
      if (!this.open()) return;
      const target = e.target as Node;
      if (this.triggerWrapperRef()?.nativeElement.contains(target)) return;
      if (this.panelRef()?.nativeElement.contains(target)) return;
      this.open.set(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (this.open() && e.key === 'Escape') this.open.set(false);
    };
    window.addEventListener('resize', onWindowChange);
    window.addEventListener('scroll', onWindowChange, true);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('resize', onWindowChange);
      window.removeEventListener('scroll', onWindowChange, true);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      this.panelRef()?.nativeElement.remove();
    });
  }

  protected toggle(): void {
    this.open.set(!this.open());
  }

  private reposition(): void {
    const triggerEl = this.triggerWrapperRef()?.nativeElement;
    const panelEl = this.panelRef()?.nativeElement;
    if (!triggerEl || !panelEl) return;
    const triggerRect = triggerEl.getBoundingClientRect();
    this.triggerWidthPx.set(triggerRect.width);
    const { top, left } = computePosition(this.position(), triggerRect, panelEl.getBoundingClientRect());
    this.topPx.set(top);
    this.leftPx.set(left);
  }
}
