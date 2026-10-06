import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, contentChild, input } from '@angular/core';
import { SocPageActions, SocPageSecondaryTabs, SocPageTabs } from '../page-slots';

/**
 * ## Rôle
 * Afficher une liste d'instances d'un même type d'objet métier, avec recherche, filtres et
 * pagination, avant d'accéder au détail de l'un d'eux.
 *
 * ## Quand l'utiliser / ne pas l'utiliser
 * Chaque fois qu'un écran présente plusieurs éléments du même type à parcourir ou filtrer. Pour un seul
 * objet → `soc-page-details`; une personne → `soc-page-profile`; créer/modifier → `soc-page-form`.
 *
 * ## Contraintes de composition (inchangées par rapport à React)
 * - Seul le Breadcrumb a son propre padding vertical; l'espacement entre les autres zones vient
 *   uniquement du `content-gap` du conteneur scrollable — jamais un padding-top/bottom par zone.
 * - Le conteneur scrollable a un padding-bottom fixe de 120px (aucun token de l'échelle Position ne le
 *   couvre), non exposé. Aucune surcharge de style/espacement depuis l'extérieur : corriger le token.
 * - Liste vide → `Empty State`; sélection multiple → zone d'actions contextuelles; liste volumineuse →
 *   pagination obligatoire.
 *
 * Slots (marqueurs de `page-slots.ts`): `socPageBreadcrumb`, `socPageSecondaryTabs`, `socPageBadge`,
 * `socPageActions`, `socPageTabs`; contenu par défaut = `children` (typiquement un `soc-data-table`).
 * `title` est requis, `statusLabel`/`description` optionnels.
 *
 * Maps 1:1 to "Index/Template/PageList/*" tokens — see packages/tokens/tokens/components/template.json
 * in design_system (React reference repo, read only). `fourth-bg` (not `page-bg`) for the content
 * background; `page-bg` and the left inset belong to `soc-app-shell`'s Content Zone.
 */
@Component({
  selector: 'soc-page-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex size-full flex-col items-start' },
  template: `
    <div class="flex w-full min-h-px flex-[1_0_0] flex-col items-center overflow-clip rounded-tl-[var(--bridges-shape-figure-radius-xl)] bg-[var(--index-template-pagelist-fourth-bg)]">
      <!-- Fixed: only the breadcrumb stays put. Everything below it — secondary tabs, header, tab row,
           table — scrolls together internally, so it's the card that scrolls, not the whole page. -->
      <div class="w-full shrink-0 px-[var(--index-template-pagelist-breadcrumb-pad-h)] py-[var(--index-template-pagelist-breadcrumb-pad-v)]">
        <ng-content select="[socPageBreadcrumb]" />
      </div>

      <!-- pb-[120px]: no Bridges/Position/Padding step covers this (max is 4xl/48px) — fixed, not
           exposed as an input, so the last row never sits flush against the viewport's bottom edge. -->
      <div class="scrollbar-hide flex w-full min-h-0 flex-1 flex-col gap-[var(--index-template-pagelist-content-gap)] overflow-y-auto pb-[120px]">
        @if (hasSecondaryTabs()) {
          <div class="w-full pl-[var(--index-template-pagelist-tabs-pad-left)] pr-[var(--index-template-pagelist-tabs-pad-right)]">
            <ng-content select="[socPageSecondaryTabs]" />
          </div>
        }

        <div class="flex w-full items-start justify-between px-[var(--index-template-pagelist-pageheader-pad-h)]">
          <div class="flex min-w-0 flex-col gap-[var(--index-template-pagelist-title-block-gap)]">
            <div class="flex items-center gap-[var(--index-template-pagelist-title-row-gap)]">
              <h1 class="text-[length:var(--index-template-pagelist-page-title-size)] text-[var(--index-template-pagelist-page-title-color)] [font-family:var(--index-template-pagelist-page-title-font)] [font-weight:var(--index-template-pagelist-page-title-weight)]">
                {{ title() }}
              </h1>
              <ng-content select="[socPageBadge]" />
              @if (statusLabel()) {
                <span class="text-[length:var(--index-template-pagelist-status-label-size)] text-[var(--index-template-pagelist-status-label-color)] [font-family:var(--index-template-pagelist-status-label-font)] [font-weight:var(--index-template-pagelist-status-label-weight)]">
                  {{ statusLabel() }}
                </span>
              }
            </div>
            @if (description()) {
              <p class="text-[length:var(--index-template-pagelist-page-description-size)] text-[var(--index-template-pagelist-page-description-color)] [font-family:var(--index-template-pagelist-page-description-font)] [font-weight:var(--index-template-pagelist-page-description-weight)]">
                {{ description() }}
              </p>
            }
          </div>
          @if (hasActions()) {
            <div class="flex shrink-0 gap-[var(--index-template-pagelist-actions-gap)] pt-[var(--index-template-pagelist-actions-pad-top)]">
              <ng-content select="[socPageActions]" />
            </div>
          }
        </div>

        @if (hasTabs()) {
          <div class="w-full px-[var(--index-template-pagelist-tab-pad-h)]">
            <ng-content select="[socPageTabs]" />
          </div>
        }

        <div class="w-full px-[var(--index-template-pagelist-tab-pad-h)]">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class SocPageList {
  readonly title = input.required<string>();
  readonly statusLabel = input<string>();
  readonly description = input<string>();

  private readonly secondaryTabsContent = contentChild(SocPageSecondaryTabs);
  private readonly actionsContent = contentChild(SocPageActions);
  private readonly tabsContent = contentChild(SocPageTabs);
  protected readonly hasSecondaryTabs = computed(() => !!this.secondaryTabsContent());
  protected readonly hasActions = computed(() => !!this.actionsContent());
  protected readonly hasTabs = computed(() => !!this.tabsContent());
}
