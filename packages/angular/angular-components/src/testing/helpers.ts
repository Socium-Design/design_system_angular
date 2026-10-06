import type { ComponentFixture } from '@angular/core/testing';

/** Test helpers shared by the specs (not part of the public API). */
export function q<T extends Element = HTMLElement>(root: ComponentFixture<unknown> | Element, selector: string): T {
  const el = (root instanceof Element ? root : (root.nativeElement as Element)).querySelector<T>(selector);
  if (!el) throw new Error(`No element matches "${selector}"`);
  return el;
}

export function qa<T extends Element = HTMLElement>(root: ComponentFixture<unknown> | Element, selector: string): T[] {
  return [...(root instanceof Element ? root : (root.nativeElement as Element)).querySelectorAll<T>(selector)];
}

/** Types into an `<input>`/`<textarea>` the way a user does. */
export function type(el: HTMLInputElement | HTMLTextAreaElement, value: string, eventName: 'input' | 'change' = 'input'): void {
  el.value = value;
  el.dispatchEvent(new Event(eventName, { bubbles: true }));
}

/** Popover/Dialog/Drawer/Tooltip panels are portaled to `document.body`. */
export function visiblePanels(): HTMLElement[] {
  return qa<HTMLElement>(document.body, 'body > [role=dialog]').filter((p) => getComputedStyle(p).visibility !== 'hidden');
}

export function bodyPortals(): HTMLElement[] {
  return qa<HTMLElement>(document.body, 'body > [role=dialog], body > div.fixed');
}

export function pressEscape(): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}

export function pointerDownOutside(): void {
  document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
}
