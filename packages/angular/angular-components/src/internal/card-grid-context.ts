import { InjectionToken, type Signal } from '@angular/core';

/**
 * Angular's substitute for React `CardGrid`'s `cloneElement(child, { colSpan, className })`: there
 * is no way to rewrite another component's inputs from the outside, so `soc-card-grid` provides
 * this context and each `soc-card` reads it (element injectors follow the *declaring* template, so
 * a `soc-card` written inside `<soc-card-grid>` finds it even though it's rendered inside the
 * grid's own inner div via content projection). Kept in `internal/` so the `Card` primitif doesn't
 * import from the composed `CardGrid` — no circular or upward dependency.
 */
export interface CardGridContext {
  mode: Signal<'fixed' | 'bento'>;
  columns: Signal<number | undefined>;
}

export const CARD_GRID_CONTEXT = new InjectionToken<CardGridContext>('CARD_GRID_CONTEXT');
