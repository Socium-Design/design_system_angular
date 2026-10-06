import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, contentChild, input, output } from '@angular/core';
import { SocSearchBar } from '../../primitifs/search-bar/search-bar';
import { SocPageSectionActions } from '../page-slots';

/**
 * ## Rôle
 * Page d'accueil d'un produit Socium: bannière de bienvenue personnalisée, recherche globale, puis une
 * section de contenu libre (`children`: grille de `soc-card`, `soc-data-table`, raccourcis…).
 * Pour une liste → `soc-page-list`; un détail/profil → `soc-page-details`/`soc-page-profile`.
 *
 * ## Contraintes de composition
 * Comme `soc-page-list`: seul le Breadcrumb a son propre padding vertical, le reste tire son espacement
 * du `content-gap` du conteneur scrollable. `welcome-pad-h`/`search-pad-h`/`section-pad-h` sont trois
 * tokens distincts (24px chacun aujourd'hui) pour pouvoir diverger si Figma les sépare un jour.
 *
 * - La bannière (fond + label + description) ne s'affiche que si `welcomeTitle` est donné.
 * - `onSearch` (sa présence affiche la recherche) -> `searchable` + sortie `search` (texte brut à chaque
 *   frappe, présentationnel: ne filtre rien lui-même) — même décision que `DataTable`.
 * - `sectionActions` -> slot `socPageSectionActions`, affiché seulement avec `sectionTitle` (comme Figma).
 * - Slot `socPageBreadcrumb`; padding-bottom fixe de 120px non exposé.
 *
 * Le fond de la bannière est `.pagehome-welcome-bg` (`styles/images.css`, JPEG embarqué).
 * Maps 1:1 to "Index/Template/PageHome/*" tokens — see packages/tokens/tokens/components/template.json.
 */
@Component({
  selector: 'soc-page-home',
  standalone: true,
  imports: [SocSearchBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex size-full flex-col items-start' },
  template: `
    <div class="flex w-full min-h-px flex-[1_0_0] flex-col items-center overflow-clip rounded-tl-[var(--bridges-shape-figure-radius-xl)] bg-[var(--index-template-pagehome-fourth-bg)]">
      <div class="w-full shrink-0 px-[var(--index-template-pagehome-breadcrumb-pad-h)] py-[var(--index-template-pagehome-breadcrumb-pad-v)]">
        <ng-content select="[socPageBreadcrumb]" />
      </div>

      <div class="scrollbar-hide flex w-full min-h-0 flex-1 flex-col gap-[var(--index-template-pagehome-content-gap)] overflow-y-auto pb-[120px]">
        @if (welcomeTitle()) {
          <div class="w-full px-[var(--index-template-pagehome-welcome-pad-h)]">
            <div class="relative flex w-full flex-col items-start overflow-hidden rounded-[3px] px-[12px] pt-[10px] pb-[16px]">
              <div class="pagehome-welcome-bg pointer-events-none absolute inset-0 size-full bg-cover bg-center"></div>
              <div class="relative flex w-full max-w-[559px] flex-col items-start gap-[7px]">
                @if (welcomeLabel()) {
                  <p class="whitespace-nowrap text-[length:var(--index-template-pagehome-welcome-label-size)] leading-none text-[var(--index-template-pagehome-welcome-label-color)] [font-family:var(--index-template-pagehome-welcome-label-font)] [font-weight:var(--index-template-pagehome-welcome-label-weight)]">
                    {{ welcomeLabel() }}
                  </p>
                }
                <p class="whitespace-nowrap text-[length:var(--index-template-pagehome-welcome-title-size)] leading-[1.2] tracking-[-0.32px] text-[var(--index-template-pagehome-welcome-title-color)] [font-family:var(--index-template-pagehome-welcome-title-font)] [font-weight:var(--index-template-pagehome-welcome-title-weight)]">
                  {{ welcomeTitle() }}
                </p>
                @if (welcomeDescription()) {
                  <p class="w-full text-[length:14px] leading-[1.4] font-semibold text-[var(--index-template-pagehome-welcome-description-color)]">
                    {{ welcomeDescription() }}
                  </p>
                }
              </div>
            </div>
          </div>
        }

        @if (searchable()) {
          <div class="w-full px-[var(--index-template-pagehome-search-pad-h)]">
            <soc-search-bar placeholder="Rechercher ici" (valueChange)="search.emit($event)" class="w-[320px] h-[var(--index-template-pagehome-search-height)]" />
          </div>
        }

        <div class="flex w-full flex-1 flex-col gap-[var(--index-template-pagehome-content-section-gap)] px-[var(--index-template-pagehome-section-pad-h)]">
          @if (sectionTitle()) {
            <div class="flex w-full items-start gap-[var(--index-template-pagehome-section-title-gap)]">
              <div class="flex min-w-0 flex-1 flex-col gap-[var(--index-template-pagehome-section-title-gap)]">
                <p class="w-full text-[length:var(--index-template-pagehome-section-title-size)] text-[var(--index-template-pagehome-section-title-color)] [font-family:var(--index-template-pagehome-section-title-font)] [font-weight:var(--index-template-pagehome-section-title-weight)]">
                  {{ sectionTitle() }}
                </p>
                @if (sectionSubtitle()) {
                  <p class="w-full text-[length:var(--index-template-pagehome-section-subtitle-size)] text-[var(--index-template-pagehome-section-subtitle-color)] [font-family:var(--index-template-pagehome-section-subtitle-font)] [font-weight:var(--index-template-pagehome-section-subtitle-weight)]">
                    {{ sectionSubtitle() }}
                  </p>
                }
              </div>
              @if (hasSectionActions()) {
                <div class="flex shrink-0 items-center gap-[8px]">
                  <ng-content select="[socPageSectionActions]" />
                </div>
              }
            </div>
          }
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class SocPageHome {
  /** Small label above the welcome title (Figma: "Accueil"). */
  readonly welcomeLabel = input<string>();
  /** The banner's headline, e.g. "Bienvenue {name}" — its presence shows/hides the whole banner. */
  readonly welcomeTitle = input<string>();
  readonly welcomeDescription = input<string>();
  readonly searchable = input(false);
  readonly search = output<string>();
  readonly sectionTitle = input<string>();
  readonly sectionSubtitle = input<string>();

  private readonly sectionActionsContent = contentChild(SocPageSectionActions);
  protected readonly hasSectionActions = computed(() => !!this.sectionActionsContent());
}
