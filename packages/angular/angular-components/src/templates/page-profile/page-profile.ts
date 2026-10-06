import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, contentChild, input, output } from '@angular/core';
import { LucideArrowLeft } from '@lucide/angular';
import { SocButton, SocButtonLeftIcon } from '../../primitifs/button/button';
import { SocPageMessage, SocPageTabs } from '../page-slots';

/**
 * ## Rôle
 * Présenter le profil complet d'une personne (employé, utilisateur connecté), avec une structure centrée
 * sur l'identité — avatar, nom, poste en en-tête. Pour un objet non-personne → `soc-page-details`.
 *
 * ## Cas particuliers
 * Plusieurs onglets/sections selon le produit; la structure d'en-tête (identité) reste fixe. "Vue par
 * soi-même" vs "vue par un gestionnaire": même structure, actions différentes.
 *
 * ## Zone flexible (slot) et éléments optionnels
 * Le contenu par défaut (`children`) est libre: choisir les composants du DS adaptés au besoin réel,
 * ne jamais le laisser vide. Pour un élément optionnel que les specs ne tranchent pas, demander
 * confirmation à l'utilisateur plutôt que de décider seul.
 *
 * `onBack` -> `showBack` + sortie `back` (voir `soc-page-details`). `className` de React = `class` sur
 * l'hôte. Slots: `socPageBreadcrumb`, `socPageHeader` (identité, typiquement `soc-profile-line`),
 * `socPageTag`, `socPageTabs`, `socPageMessage`. Pas de padding-bottom de 120px ici, comme en React.
 *
 * Maps 1:1 to "Index/Template/PageProfile/*" tokens — see packages/tokens/tokens/components/template.json.
 */
@Component({
  selector: 'soc-page-profile',
  standalone: true,
  imports: [SocButton, SocButtonLeftIcon, LucideArrowLeft],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex size-full flex-col items-start' },
  template: `
    <div class="flex w-full min-h-px flex-[1_0_0] flex-col items-center overflow-clip rounded-tl-[var(--bridges-shape-figure-radius-xl)] bg-[var(--index-template-pageprofile-fourth-bg)]">
      <div class="w-full shrink-0 px-[var(--index-template-pageprofile-breadcrumb-pad-h)] py-[var(--index-template-pageprofile-breadcrumb-pad-v)]">
        <ng-content select="[socPageBreadcrumb]" />
      </div>

      <div class="scrollbar-hide flex w-full min-h-0 flex-1 flex-col gap-[var(--index-template-pageprofile-content-gap)] overflow-y-auto">
        @if (showBack()) {
          <div class="pl-[var(--index-template-pageprofile-back-zone-pad-left)] pr-[var(--index-template-pageprofile-back-zone-pad-right)]">
            <button socButton variant="secondary" (click)="back.emit()">
              <svg lucideArrowLeft socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
              {{ backLabel() }}
            </button>
          </div>
        }

        <div class="flex w-full items-center gap-[var(--index-template-pageprofile-pageheader-gap)] px-[var(--index-template-pageprofile-pageheader-pad-h)]">
          <ng-content select="[socPageHeader]" />
          <ng-content select="[socPageTag]" />
          @if (statusLabel()) {
            <span class="text-[length:var(--index-template-pageprofile-status-label-size)] text-[var(--index-template-pageprofile-status-label-color)] [font-family:var(--index-template-pageprofile-status-label-font)] [font-weight:var(--index-template-pageprofile-status-label-weight)]">
              {{ statusLabel() }}
            </span>
          }
        </div>

        <div class="h-px w-full bg-[var(--bridges-color-border-subtle)]"></div>

        @if (hasTabs()) {
          <div class="w-full px-[var(--index-template-pageprofile-pageheader-pad-h)]">
            <ng-content select="[socPageTabs]" />
          </div>
        }

        @if (hasMessage()) {
          <div class="w-full px-[var(--index-template-pageprofile-message-zone-pad-h)]">
            <ng-content select="[socPageMessage]" />
          </div>
        }

        <div class="w-full px-[var(--index-template-pageprofile-pageheader-pad-h)]">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class SocPageProfile {
  readonly showBack = input(false, { transform: booleanAttribute });
  readonly backLabel = input('Retour');
  readonly statusLabel = input<string>();
  readonly back = output<void>();

  private readonly tabsContent = contentChild(SocPageTabs);
  private readonly messageContent = contentChild(SocPageMessage);
  protected readonly hasTabs = computed(() => !!this.tabsContent());
  protected readonly hasMessage = computed(() => !!this.messageContent());
}
