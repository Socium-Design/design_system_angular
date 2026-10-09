import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, booleanAttribute, computed, contentChild, input } from '@angular/core';
import { LucideGripVertical } from '@lucide/angular';
import { SocTooltip, SocTooltipLabel } from '@socium-design/angular-components';
import { labsFocusRing } from '../internal/classes';

/** Slot à gauche de la ligne : icône, pastille (`soc-labs-chart-type-chip`), avatar… */
@Directive({ selector: '[socLabsListRowLeading]', standalone: true })
export class SocLabsListRowLeading {}

/** Slot d'action à droite (typiquement un `soc-labs-icon-button`). Inerte quand la ligne est verrouillée. */
@Directive({ selector: '[socLabsListRowAction]', standalone: true })
export class SocLabsListRowAction {}

/**
 * ## Rôle
 * Ligne de liste **compacte** pour les catalogues en panneau latéral : slot à gauche, titre +
 * sous-titre tronqués sur une ligne, slot d'action à droite.
 *
 * ## États
 * - **survol** : fond léger ; si `draggable`, une poignée de glisser apparaît à gauche.
 * - **sélectionné / ajouté** (`selected`) : fond bleu clair, titre bleu en gras, « Ajouté » lu par
 *   les lecteurs d'écran (`selectedLabel`).
 * - **verrouillé** (`locked`) : opacité 50 %, curseur interdit, action inerte ; `lockedReason`
 *   s'affiche en info-bulle (`soc-tooltip` du kit) au survol et au focus clavier.
 *
 * ## Glisser-déposer (`@angular/cdk/drag-drop`)
 * Poser `cdkDrag` sur `<soc-labs-list-row>` : la poignée interne est un `cdkDragHandle` rattaché au
 * `cdkDrag` de l'hôte, la ligne ne se saisit donc que par elle (le clic sur la ligne et sur l'action
 * reste libre). Désactiver le glisser d'une ligne verrouillée avec `[cdkDragDisabled]="locked"`. Le
 * glisser n'est pas accessible au clavier : l'action à droite reste le chemin principal.
 *
 * L'hôte porte `role="listitem"` : placer les lignes dans un conteneur `role="list"` (ou `<ul>`).
 */
@Component({
  selector: 'soc-labs-list-row',
  standalone: true,
  imports: [NgTemplateOutlet, CdkDragHandle, LucideGripVertical, SocTooltip, SocTooltipLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    role: 'listitem',
    '[class]': 'hostClasses()',
    '[attr.aria-disabled]': 'locked() || null',
    '[attr.data-state]': 'state()',
  },
  template: `
    <ng-template #content>
      @if (draggable()) {
        <span
          cdkDragHandle
          aria-hidden="true"
          data-drag-handle
          class="flex size-[var(--bridges-size-icon-sm)] shrink-0 cursor-grab items-center justify-center text-[var(--bridges-color-icon-tertiary)] opacity-0 transition-opacity group-hover/row:opacity-100 active:cursor-grabbing"
        >
          <svg lucideGripVertical class="size-full" [strokeWidth]="2"></svg>
        </span>
      }
      @if (hasLeading()) {
        <span class="flex shrink-0 items-center"><ng-content select="[socLabsListRowLeading]" /></span>
      }
      <span class="flex min-w-0 flex-1 flex-col">
        <span [class]="titleClasses()" [attr.title]="locked() ? null : title()">{{ title() }}</span>
        @if (subtitle()) {
          <span
            class="truncate text-[length:var(--bridges-size-text-text-size-xs)] text-[var(--bridges-color-text-secondary)] [line-height:var(--bridges-size-text-line-height-xs)]"
            [attr.title]="locked() ? null : subtitle()"
          >{{ subtitle() }}</span>
        }
        @if (selected()) {
          <span class="sr-only">{{ selectedLabel() }}</span>
        }
      </span>
      @if (hasAction()) {
        <span class="flex shrink-0 items-center" [attr.inert]="locked() ? '' : null"><ng-content select="[socLabsListRowAction]" /></span>
      }
    </ng-template>

    @if (locked() && lockedReason()) {
      <soc-tooltip position="top" tabindex="0" [class]="'w-full min-w-0 items-center gap-[var(--bridges-position-gap-sm)] rounded-[var(--bridges-shape-figure-radius-sm)] ' + focusRing">
        <ng-container [ngTemplateOutlet]="content" />
        <span socTooltipLabel>{{ lockedReason() }}</span>
      </soc-tooltip>
    } @else {
      <ng-container [ngTemplateOutlet]="content" />
    }
  `,
})
export class SocLabsListRow {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  /** Ajouté / sélectionné. */
  readonly selected = input(false, { transform: booleanAttribute });
  readonly locked = input(false, { transform: booleanAttribute });
  /** Raison du verrouillage, en info-bulle. */
  readonly lockedReason = input<string>();
  /** Affiche la poignée de glisser au survol (avec `cdkDrag` sur l'hôte). */
  readonly draggable = input(false, { transform: booleanAttribute });
  /** Texte lu par les lecteurs d'écran pour l'état sélectionné. */
  readonly selectedLabel = input('Ajouté');

  protected readonly focusRing = labsFocusRing;
  private readonly leading = contentChild(SocLabsListRowLeading);
  private readonly action = contentChild(SocLabsListRowAction);
  protected readonly hasLeading = computed(() => !!this.leading());
  protected readonly hasAction = computed(() => !!this.action());

  protected readonly state = computed(() => (this.locked() ? 'locked' : this.selected() ? 'selected' : 'default'));

  protected readonly hostClasses = computed(() => {
    const base =
      'group/row flex w-full min-w-0 items-center gap-[var(--bridges-position-gap-sm)] rounded-[var(--bridges-shape-figure-radius-md)] px-[var(--bridges-position-padding-3xs)] py-[var(--bridges-position-padding-2xs)] [font-family:var(--bridges-shape-text-body-font)] transition-colors';
    if (this.locked()) return `${base} cursor-not-allowed opacity-50`;
    if (this.selected()) return `${base} bg-[var(--bridges-color-surface-selected)]`;
    return `${base} hover:bg-[var(--bridges-color-background-layer-1)]`;
  });

  protected readonly titleClasses = computed(
    () =>
      `truncate text-[length:var(--bridges-size-text-text-size-sm)] [line-height:var(--bridges-size-text-line-height-sm)] ${
        this.selected() && !this.locked()
          ? 'text-[var(--bridges-color-text-action)] [font-weight:var(--bridges-shape-text-label-weight)]'
          : 'text-[var(--bridges-color-text-primary)]'
      }`,
  );
}
