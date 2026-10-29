import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model } from '@angular/core';
import { SocAppIconGlyph, type AppIconName } from '@socium-design/angular-components';
import { labsFocusRing } from '../internal/classes';

export interface LabsNavListItem {
  id: string;
  label: string;
  /** Compteur affiché à droite (« 4 / 23 »). */
  count?: string;
  /** Compteur lu par les lecteurs d'écran à la place de `count` (« 4 activées sur 23 »). */
  countLabel?: string;
  /** Icône de produit du kit (`soc-app-icon-glyph`, la même que dans l'AppSwitch), décorative. */
  icon?: AppIconName;
}

/**
 * ## Rôle
 * Navigation **verticale** d'une colonne de filtre, dans la page : une entrée par catégorie (produit…), avec un
 * compteur à droite et, en option, l'icône du produit (`icon` : glyphe de l'AppSwitch du kit, à gauche du libellé ; dès
 * qu'une entrée en a une, les entrées sans icône gardent la place vide pour aligner les libellés). L'entrée courante est surlignée (fond `surface-selected`, texte action en demi-gras).
 * Diffère de `soc-tabs` (horizontal, sans compteur) et de `soc-side-navigation` (menu du shell, presets).
 *
 * ## Accessibilité
 * `<nav>` nommée par `ariaLabel`, liste de `<button>` ; icônes décoratives (`aria-hidden`) ; l'entrée courante porte `aria-current="true"`. Le compteur
 * visuel est masqué aux lecteurs d'écran quand `countLabel` est fourni, qui est lu à sa place. Tab parcourt
 * les entrées, Entrée / Espace sélectionne ; focus visible.
 */
@Component({
  selector: 'soc-labs-nav-list',
  standalone: true,
  imports: [SocAppIconGlyph],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'relative block min-w-0' },
  template: `
    <nav [attr.aria-label]="ariaLabel()">
      <ul class="flex flex-col gap-[var(--bridges-position-gap-2xs)]">
        @for (item of items(); track item.id) {
          <li>
            <button
              type="button"
              [class]="itemClass(item.id === value())"
              [attr.aria-current]="item.id === value() ? 'true' : null"
              [attr.data-id]="item.id"
              (click)="value.set(item.id)"
            >
              @if (withIcons()) {
                <span class="flex size-[var(--bridges-size-icon-md)] shrink-0 items-center justify-center" aria-hidden="true" data-part="icon">
                  @if (item.icon) {
                    <soc-app-icon-glyph [name]="item.icon" />
                  }
                </span>
              }
              <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
              @if (item.count) {
                <span
                  [class]="countClass(item.id === value())"
                  [attr.aria-hidden]="item.countLabel ? 'true' : null"
                  data-part="count"
                  >{{ item.count }}</span
                >
                @if (item.countLabel) {
                  <span class="sr-only">, {{ item.countLabel }}</span>
                }
              }
            </button>
          </li>
        }
      </ul>
    </nav>
  `,
})
export class SocLabsNavList {
  readonly items = input.required<LabsNavListItem[]>();
  /** Id de l'entrée courante (↔). */
  readonly value = model<string>('');
  readonly ariaLabel = input.required<string>();

  protected readonly withIcons = computed(() => this.items().some((i) => !!i.icon));

  /** Compteur : `text-secondary` tomberait à 4,1:1 sur `surface-selected` — l'entrée courante le passe en `text-action`. */
  protected countClass(current: boolean): string {
    return `shrink-0 tabular-nums [font-weight:var(--bridges-shape-text-body-weight)] ${current ? 'text-[var(--bridges-color-text-action)]' : 'text-[var(--bridges-color-text-secondary)]'}`;
  }

  protected itemClass(current: boolean): string {
    return `flex w-full items-center gap-[var(--bridges-position-gap-sm)] rounded-[var(--bridges-shape-figure-radius-md)] px-[var(--bridges-position-padding-md)] py-[var(--bridges-position-padding-xs)] text-left text-[length:var(--bridges-size-text-text-size-sm)] [font-family:var(--bridges-shape-text-body-font)] ${labsFocusRing} ${
      current
        ? 'bg-[var(--bridges-color-surface-selected)] text-[var(--bridges-color-text-action)] [font-weight:var(--bridges-shape-text-label-weight)]'
        : 'text-[var(--bridges-color-text-primary)] hover:bg-[var(--bridges-color-background-layer-1)]'
    }`;
  }
}
