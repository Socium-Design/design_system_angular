import { ChangeDetectionStrategy, Component, ViewEncapsulation, output } from '@angular/core';

/**
 * Full-bleed dark backdrop — sits behind a Dialog/Drawer/floating panel. Standalone: neither
 * Dialog nor Drawer render one themselves yet (not migrated in this batch either), so pair this
 * manually (`@if (open()) { <soc-overlay /> }`) until they do — same as React's own doc comment.
 * Maps 1:1 to "Index/Conteneur/Overlay/*" tokens — see packages/tokens/tokens/components/conteneur.json
 * in design_system (React reference repo, read only). `onClick` is a direct component-level
 * handler -> output(), same reasoning as every other direct handler prop this batch.
 */
@Component({
  selector: 'soc-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'fixed inset-0 bg-[var(--index-conteneur-overlay-background-color)] opacity-[var(--index-conteneur-overlay-background-opacity)]',
    '(click)': 'overlayClick.emit()',
  },
  template: ``,
})
export class SocOverlay {
  readonly overlayClick = output<void>();
}
