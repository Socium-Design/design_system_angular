import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, contentChild, input, output } from '@angular/core';
import { LucideArrowLeft } from '@lucide/angular';
import { SocButton, SocButtonLeftIcon } from '../../primitifs/button/button';
import { SocPageActions, SocPageMessage, SocPageSecondContent, SocPageStepper } from '../page-slots';

/**
 * Page de création/modification d'un objet: titre, stepper et message optionnels, une section de
 * formulaire (`children`, colonne de 595px) avec ses actions alignées à droite, puis un second bloc
 * optionnel (`socPageSecondContent`) avec son propre titre de section.
 *
 * `onBack` -> `showBack` + sortie `back` (voir `soc-page-details`). Slots: `socPageBreadcrumb`,
 * `socPageStepper`, `socPageMessage`, `socPageActions`, `socPageSecondContent`. Padding-bottom fixe de
 * 120px, comme `soc-page-list`. Les champs placés dans le slot par défaut sont typiquement des
 * `soc-input-text`… liés à un `FormGroup` (voir Guides/Formulaires).
 *
 * Maps 1:1 to "Index/Template/PageForm/*" tokens — see packages/tokens/tokens/components/template.json
 * in design_system (React reference repo, read only).
 */
@Component({
  selector: 'soc-page-form',
  standalone: true,
  imports: [SocButton, SocButtonLeftIcon, LucideArrowLeft],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex size-full flex-col items-start' },
  template: `
    <div class="flex w-full min-h-px flex-[1_0_0] flex-col items-center overflow-clip rounded-tl-[var(--bridges-shape-figure-radius-xl)] bg-[var(--index-template-pageform-fourth-bg)]">
      <div class="w-full shrink-0 px-[var(--index-template-pageform-breadcrumb-pad-h)] py-[var(--index-template-pageform-breadcrumb-pad-v)]">
        <ng-content select="[socPageBreadcrumb]" />
      </div>

      <div class="scrollbar-hide flex w-full min-h-0 flex-1 flex-col gap-[var(--index-template-pageform-content-gap)] overflow-y-auto pb-[120px]">
        @if (showBack()) {
          <div class="pl-[var(--index-template-pageform-back-zone-pad-left)] pr-[var(--index-template-pageform-back-zone-pad-right)]">
            <button socButton variant="secondary" (click)="back.emit()">
              <svg lucideArrowLeft socButtonLeftIcon class="size-full" [strokeWidth]="1.5"></svg>
              {{ backLabel() }}
            </button>
          </div>
        }

        <div class="flex w-full flex-col gap-[var(--index-template-pageform-title-block-gap)] px-[var(--index-template-pageform-pageheader-pad-h)]">
          <h1 class="text-[length:var(--index-template-pageform-page-title-size)] text-[var(--index-template-pageform-page-title-color)] [font-family:var(--index-template-pageform-page-title-font)] [font-weight:var(--index-template-pageform-page-title-weight)]">
            {{ title() }}
          </h1>
          @if (description()) {
            <p class="text-[length:var(--index-template-pageform-page-description-size)] text-[var(--index-template-pageform-page-description-color)] [font-family:var(--index-template-pageform-page-description-font)] [font-weight:var(--index-template-pageform-page-description-weight)]">
              {{ description() }}
            </p>
          }
        </div>

        <div class="h-px w-full bg-[var(--bridges-color-border-subtle)]"></div>

        @if (hasStepper()) {
          <div class="w-full px-[var(--index-template-pageform-stepper-zone-pad-h)]">
            <ng-content select="[socPageStepper]" />
          </div>
        }

        @if (hasMessage()) {
          <div class="w-full px-[var(--index-template-pageform-message-zone-pad-h)]">
            <ng-content select="[socPageMessage]" />
          </div>
        }

        <div class="flex w-full flex-col gap-[var(--index-template-pageform-section-zone-gap)] px-[var(--index-template-pageform-section-zone-pad-h)]">
          @if (sectionTitle() || sectionSubtitle()) {
            <div class="flex flex-col gap-[var(--index-template-pageform-titlesection-gap)]">
              @if (sectionTitle()) {
                <p class="text-[length:var(--index-template-pageform-section-title-size)] text-[var(--index-template-pageform-section-title-color)] [font-family:var(--index-template-pageform-section-title-font)] [font-weight:var(--index-template-pageform-section-title-weight)]">
                  {{ sectionTitle() }}
                </p>
              }
              @if (sectionSubtitle()) {
                <p class="text-[length:var(--index-template-pageform-section-subtitle-size)] text-[var(--index-template-pageform-section-subtitle-color)] [font-family:var(--index-template-pageform-section-subtitle-font)] [font-weight:var(--index-template-pageform-section-subtitle-weight)]">
                  {{ sectionSubtitle() }}
                </p>
              }
            </div>
          }
          <!-- The form column hugs its own width (595px, from the field slot) rather than stretching
               full-width — its left edge lines up with the section title above, but the actions are
               right-aligned within that same 595px column, flush with its right edge (Figma form_zone,
               items-end). -->
          <div class="flex w-fit flex-col items-end gap-[var(--index-template-pageform-form-zone-gap)]">
            <div class="flex w-[595px] max-w-full flex-col gap-[var(--bridges-position-gap-md)]">
              <ng-content />
            </div>
            @if (hasActions()) {
              <div class="flex items-center gap-[var(--index-template-pageform-actions-gap)] pt-[var(--index-template-pageform-actions-pad-top)]">
                <ng-content select="[socPageActions]" />
              </div>
            }
          </div>
        </div>

        @if (hasSecondContent()) {
          <div class="flex w-full flex-col gap-[var(--index-template-pageform-section-zone-gap)] px-[var(--index-template-pageform-section-zone-pad-h)]">
            @if (secondSectionTitle() || secondSectionSubtitle()) {
              <div class="flex flex-col gap-[var(--index-template-pageform-titlesection-gap)]">
                @if (secondSectionTitle()) {
                  <p class="text-[length:var(--index-template-pageform-section-title-size)] text-[var(--index-template-pageform-section-title-color)] [font-family:var(--index-template-pageform-section-title-font)] [font-weight:var(--index-template-pageform-section-title-weight)]">
                    {{ secondSectionTitle() }}
                  </p>
                }
                @if (secondSectionSubtitle()) {
                  <p class="text-[length:var(--index-template-pageform-section-subtitle-size)] text-[var(--index-template-pageform-section-subtitle-color)] [font-family:var(--index-template-pageform-section-subtitle-font)] [font-weight:var(--index-template-pageform-section-subtitle-weight)]">
                    {{ secondSectionSubtitle() }}
                  </p>
                }
              </div>
            }
            <div class="w-full">
              <ng-content select="[socPageSecondContent]" />
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class SocPageForm {
  readonly showBack = input(false);
  readonly backLabel = input('Retour');
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly sectionTitle = input<string>();
  readonly sectionSubtitle = input<string>();
  readonly secondSectionTitle = input<string>();
  readonly secondSectionSubtitle = input<string>();
  readonly back = output<void>();

  private readonly stepperContent = contentChild(SocPageStepper);
  private readonly messageContent = contentChild(SocPageMessage);
  private readonly actionsContent = contentChild(SocPageActions);
  private readonly secondContent = contentChild(SocPageSecondContent);
  protected readonly hasStepper = computed(() => !!this.stepperContent());
  protected readonly hasMessage = computed(() => !!this.messageContent());
  protected readonly hasActions = computed(() => !!this.actionsContent());
  protected readonly hasSecondContent = computed(() => !!this.secondContent());
}
