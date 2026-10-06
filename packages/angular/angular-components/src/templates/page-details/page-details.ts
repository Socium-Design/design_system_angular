import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, contentChild, input, output } from '@angular/core';
import { LucideArrowLeft } from '@lucide/angular';
import { SocButton, SocButtonLeftIcon } from '../../primitifs/button/button';
import { SocPageActions, SocPageTabs } from '../page-slots';

/**
 * ## Rôle
 * Présenter en lecture les informations complètes d'un seul objet métier (non-personne), organisées en
 * sections, avec des actions contextuelles (modifier, supprimer, valider…). Pour une personne →
 * `soc-page-profile`; créer/modifier → `soc-page-form`; une liste → `soc-page-list`.
 *
 * ## Contraintes de composition (inchangées par rapport à React)
 * - Seul le Breadcrumb a son propre padding vertical; l'espacement entre zones vient du `content-gap`
 *   du conteneur scrollable. Padding-bottom fixe de 120px non exposé. Aucune surcharge de style.
 * - Les boutons de `socPageActions` sont toujours en variante `tertiary`, icône seule (`aria-label`),
 *   chacun enveloppé dans `<soc-tooltip>` (même texte) pour que son nom soit visible au survol — c'est
 *   au consommateur de le faire, `socPageActions` est un slot libre.
 *
 * `onBack` (React: sa présence affiche le bouton "Retour") -> `showBack` + sortie `back`, même décision
 * que partout dans le kit (un `output()` ne peut pas dire s'il a un abonné). Slots: `socPageBreadcrumb`,
 * `socPageBadge`, `socPageTag`, `socPageActions`, `socPageTabs`; contenu par défaut = `children`, empilé
 * avec un gap constant.
 *
 * Maps 1:1 to "Index/Template/PageDetails/*" tokens — see packages/tokens/tokens/components/template.json.
 */
@Component({
  selector: 'soc-page-details',
  standalone: true,
  imports: [SocButton, SocButtonLeftIcon, LucideArrowLeft],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex size-full flex-col items-start' },
  template: `
    <div class="flex w-full min-h-px flex-[1_0_0] flex-col items-center overflow-clip rounded-tl-[var(--bridges-shape-figure-radius-xl)] bg-[var(--index-template-pagedetails-fourth-bg)]">
      <div class="w-full shrink-0 px-[var(--index-template-pagedetails-breadcrumb-pad-h)] py-[var(--index-template-pagedetails-breadcrumb-pad-v)]">
        <ng-content select="[socPageBreadcrumb]" />
      </div>

      <div class="scrollbar-hide flex w-full min-h-0 flex-1 flex-col gap-[var(--index-template-pagedetails-content-gap)] overflow-y-auto pb-[120px]">
        @if (showBack()) {
          <div class="pl-[var(--index-template-pagedetails-back-zone-pad-left)] pr-[var(--index-template-pagedetails-back-zone-pad-right)]">
            <button socButton variant="secondary" (click)="back.emit()">
              <svg lucideArrowLeft socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
              {{ backLabel() }}
            </button>
          </div>
        }

        <div class="flex w-full items-start justify-between px-[var(--index-template-pagedetails-pageheader-pad-h)]">
          <div class="flex min-w-0 flex-col gap-[var(--index-template-pagedetails-title-block-gap)]">
            @if (topStatusLabel()) {
              <span class="text-[length:var(--index-template-pagedetails-status-label-size)] text-[var(--index-template-pagedetails-status-label-color)] [font-family:var(--index-template-pagedetails-status-label-font)] [font-weight:var(--index-template-pagedetails-status-label-weight)]">
                {{ topStatusLabel() }}
              </span>
            }
            <div class="flex items-center gap-[var(--index-template-pagedetails-title-row-gap)]">
              <h1 class="text-[length:var(--index-template-pagedetails-page-title-size)] text-[var(--index-template-pagedetails-page-title-color)] [font-family:var(--index-template-pagedetails-page-title-font)] [font-weight:var(--index-template-pagedetails-page-title-weight)]">
                {{ title() }}
              </h1>
              <ng-content select="[socPageBadge]" />
              <ng-content select="[socPageTag]" />
              @if (statusLabel()) {
                <span class="text-[length:var(--index-template-pagedetails-status-label-size)] text-[var(--index-template-pagedetails-status-label-color)] [font-family:var(--index-template-pagedetails-status-label-font)] [font-weight:var(--index-template-pagedetails-status-label-weight)]">
                  {{ statusLabel() }}
                </span>
              }
            </div>
            @if (description()) {
              <p class="text-[length:var(--index-template-pagedetails-page-description-size)] text-[var(--index-template-pagedetails-page-description-color)] [font-family:var(--index-template-pagedetails-page-description-font)] [font-weight:var(--index-template-pagedetails-page-description-weight)]">
                {{ description() }}
              </p>
            }
          </div>
          @if (hasActions()) {
            <div class="flex shrink-0 gap-[var(--index-template-pagedetails-actions-gap)] pt-[var(--index-template-pagedetails-actions-pad-top)]">
              <ng-content select="[socPageActions]" />
            </div>
          }
        </div>

        <div class="h-px w-full bg-[var(--bridges-color-border-subtle)]"></div>

        @if (hasTabs()) {
          <div class="w-full px-[var(--index-template-pagedetails-pageheader-pad-h)]">
            <ng-content select="[socPageTabs]" />
          </div>
        }

        <div class="flex w-full flex-col gap-[var(--index-template-pagedetails-content-gap)] px-[var(--index-template-pagedetails-pageheader-pad-h)]">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class SocPageDetails {
  readonly showBack = input(false);
  readonly backLabel = input('Retour');
  /** Small label above the title. */
  readonly topStatusLabel = input<string>();
  readonly title = input.required<string>();
  readonly statusLabel = input<string>();
  readonly description = input<string>();
  readonly back = output<void>();

  private readonly actionsContent = contentChild(SocPageActions);
  private readonly tabsContent = contentChild(SocPageTabs);
  protected readonly hasActions = computed(() => !!this.actionsContent());
  protected readonly hasTabs = computed(() => !!this.tabsContent());
}
