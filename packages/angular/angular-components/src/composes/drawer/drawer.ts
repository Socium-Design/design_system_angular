import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation, computed, effect, inject, input, output, viewChild } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { SocButton } from '../../primitifs/button/button';

export type DrawerAnchor = 'left' | 'right' | 'bottom';

export interface DrawerAction {
  label: string;
  onClick?: () => void;
}

const ANCHOR_CLASSES: Record<DrawerAnchor, string> = {
  left: 'inset-y-0 left-0 h-full w-[480px] max-w-[90vw]',
  right: 'inset-y-0 right-0 h-full w-[480px] max-w-[90vw]',
  bottom: 'inset-x-0 bottom-0 w-full max-h-[90vh]',
};

/**
 * Maps 1:1 to "Index/Conteneur/Drawer/*" tokens — see packages/tokens/tokens/components/conteneur.json
 * in design_system (React reference repo, read only). Plain wrapper (`soc-drawer`), same
 * open/close/portal/actions conventions as `SocDialog` (see its doc, not repeated here).
 */
@Component({
  selector: 'soc-drawer',
  standalone: true,
  imports: [SocButton, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (open()) {
      <div #overlay class="fixed inset-0 z-50 bg-black/20" (click)="close.emit()">
        <div role="dialog" aria-modal="true" (click)="$event.stopPropagation()" [class]="panelClass()">
          <div class="flex w-full items-start gap-3 py-[var(--index-conteneur-drawer-header-pad-v)] pl-[var(--index-conteneur-drawer-header-pad-h)] pr-[var(--index-conteneur-drawer-header-pad-h-right)]">
            <div class="flex min-w-0 flex-1 flex-col gap-[var(--index-conteneur-drawer-header-gap)]">
              @if (topline()) {
                <p class="w-full text-[length:var(--index-conteneur-drawer-subtitle-size)] text-[var(--index-conteneur-drawer-topline-color)]">{{ topline() }}</p>
              }
              <p class="w-full text-[length:var(--index-conteneur-drawer-title-size)] text-[var(--index-conteneur-drawer-title-color)] [font-family:var(--index-conteneur-drawer-title-font)] [font-weight:var(--index-conteneur-drawer-title-weight)]">
                {{ title() }}
              </p>
              @if (subtitle()) {
                <p class="w-full text-[length:var(--index-conteneur-drawer-subtitle-size)] text-[var(--index-conteneur-drawer-subtitle-color)]">{{ subtitle() }}</p>
              }
            </div>
            <button
              type="button"
              (click)="close.emit()"
              aria-label="Fermer"
              class="size-[var(--index-conteneur-drawer-close-icon-size)] shrink-0 text-[var(--index-conteneur-drawer-close-icon-color)]"
            >
              <svg lucideX class="size-full" [strokeWidth]="closeIconThickness"></svg>
            </button>
          </div>
          <div class="h-[length:var(--index-conteneur-drawer-separator-height)] w-full bg-[var(--index-conteneur-drawer-separator-color)]"></div>
          <div class="flex w-full flex-1 flex-col gap-[var(--index-conteneur-drawer-section-inner-gap)] overflow-y-auto px-[var(--index-conteneur-drawer-content-pad-h)] py-[var(--index-conteneur-drawer-content-pad-v)]">
            @if (sectionTitle() || sectionSubtitle()) {
              <div class="flex w-full flex-col gap-[var(--index-conteneur-drawer-section-title-gap)]">
                @if (sectionTitle()) {
                  <p class="w-full text-[length:var(--index-conteneur-drawer-section-title-size)] text-[var(--index-conteneur-drawer-section-title-color)] [font-family:var(--index-conteneur-drawer-section-title-font)] [font-weight:var(--index-conteneur-drawer-section-title-weight)]">
                    {{ sectionTitle() }}
                  </p>
                }
                @if (sectionSubtitle()) {
                  <p class="w-full text-[length:var(--index-conteneur-drawer-section-subtitle-size)] text-[var(--index-conteneur-drawer-section-subtitle-color)]">{{ sectionSubtitle() }}</p>
                }
              </div>
            }
            <ng-content />
          </div>
          @if (primaryAction() || secondaryAction()) {
            <div class="h-[length:var(--index-conteneur-drawer-separator-height)] w-full bg-[var(--index-conteneur-drawer-separator-color)]"></div>
            <div class="flex w-full items-center justify-end gap-[var(--index-conteneur-drawer-button-gap)] px-[var(--index-conteneur-drawer-footer-pad-h)] py-[var(--index-conteneur-drawer-footer-pad-v)]">
              @if (secondaryAction(); as secondary) {
                <button socButton variant="secondary" (click)="secondary.onClick?.()">{{ secondary.label }}</button>
              }
              @if (primaryAction(); as primary) {
                <button socButton variant="primary" (click)="primary.onClick?.()">{{ primary.label }}</button>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './drawer.css',
})
export class SocDrawer {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly topline = input<string>();
  readonly subtitle = input<string>();
  readonly anchor = input<DrawerAnchor>('right');
  readonly sectionTitle = input<string>();
  readonly sectionSubtitle = input<string>();
  readonly primaryAction = input<DrawerAction>();
  readonly secondaryAction = input<DrawerAction>();
  readonly close = output<void>();

  protected readonly closeIconThickness = 'var(--index-conteneur-drawer-close-icon-thickness)';

  protected readonly panelClass = computed(
    () =>
      `absolute flex flex-col items-start overflow-hidden border-[length:var(--index-conteneur-drawer-border-width)] border-[var(--index-conteneur-drawer-border)] bg-[var(--index-conteneur-drawer-bg)] shadow-[0_0_var(--index-conteneur-drawer-shadow-blur)_rgba(0,0,0,0.15)] ${
        this.anchor() === 'bottom' ? 'rounded-t-[var(--index-conteneur-drawer-radius)]' : 'rounded-[var(--index-conteneur-drawer-radius)]'
      } ${ANCHOR_CLASSES[this.anchor()]}`,
  );

  private readonly overlayRef = viewChild<ElementRef<HTMLElement>>('overlay');

  constructor() {
    effect(() => {
      const el = this.overlayRef()?.nativeElement;
      if (el && el.parentElement !== document.body) document.body.appendChild(el);
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (this.open() && e.key === 'Escape') this.close.emit();
    };
    document.addEventListener('keydown', onKeyDown);
    inject(DestroyRef).onDestroy(() => {
      document.removeEventListener('keydown', onKeyDown);
      this.overlayRef()?.nativeElement.remove();
    });
  }
}

/** A label/value row matching Figma's Drawer "Détail" mode — see Index/Conteneur/Drawer/detail-*. */
@Component({
  selector: 'soc-drawer-detail-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex w-full flex-col gap-[var(--index-conteneur-drawer-detail-item-gap)]' },
  template: `
    <p class="w-full text-[length:var(--index-conteneur-drawer-detail-item-size)] text-[var(--index-conteneur-drawer-detail-label-color)] [font-family:var(--index-conteneur-drawer-detail-item-font)] [font-weight:var(--index-conteneur-drawer-detail-item-weight)]">
      {{ label() }}
    </p>
    <p class="w-full text-[length:var(--index-conteneur-drawer-detail-item-size)] text-[var(--index-conteneur-drawer-detail-value-color)] [font-family:var(--index-conteneur-drawer-detail-item-font)] [font-weight:var(--index-conteneur-drawer-detail-item-weight)]">
      {{ value() }}
    </p>
  `,
  styleUrl: './drawer.css',
})
export class SocDrawerDetailItem {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
}
