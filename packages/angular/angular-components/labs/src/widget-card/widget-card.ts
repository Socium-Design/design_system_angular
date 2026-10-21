import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, computed, contentChild, input } from '@angular/core';

/**
 * Line clamp driven by the `--soc-labs-widget-card-lines` custom property set on the element (Tailwind
 * can't generate a class per dynamic line count). Literal string — Tailwind scans the source.
 */
const clamp =
  'overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:var(--soc-labs-widget-card-lines)]';

/** Icône à gauche du titre (≈ 28 px, pastille du kit). Optionnel. */
@Directive({ selector: '[socLabsWidgetCardIcon]', standalone: true })
export class SocLabsWidgetCardIcon {}

/** Actions à droite du titre (menu, bouton…), alignées en haut, jamais rétrécies. */
@Directive({ selector: '[socLabsWidgetCardActions]', standalone: true })
export class SocLabsWidgetCardActions {}

/**
 * Rangée de filtres sous le titre / la description, au-dessus du corps : les contrôles passent à la
 * ligne suivante plutôt que de déborder.
 */
@Directive({ selector: '[socLabsWidgetCardFilters]', standalone: true })
export class SocLabsWidgetCardFilters {}

/** Pied de carte (hauteur automatique), sous le corps. Optionnel. */
@Directive({ selector: '[socLabsWidgetCardFooter]', standalone: true })
export class SocLabsWidgetCardFooter {}

/**
 * ## Rôle
 * Carte d'un **widget de tableau de bord** (indicateur ou graphique) pour les grilles denses. Diffère
 * de `soc-card` du kit : titre sur plusieurs lignes (`titleLines`, 2 par défaut) puis « … », pied de
 * hauteur automatique, rangée de filtres, et aucun débordement horizontal.
 *
 * ## Slots
 * - `socLabsWidgetCardIcon` (optionnel) : icône à gauche du titre, dans la pastille du kit (28 px).
 * - `socLabsWidgetCardActions` (optionnel) : à droite du titre, alignées en haut, jamais rétrécies.
 * - `socLabsWidgetCardFilters` (optionnel) : rangée `flex-wrap` sous le titre et la description.
 * - contenu sans marqueur : le **corps** (valeur d'indicateur, graphique) — `flex-1`, `min-w-0`.
 * - `socLabsWidgetCardFooter` (optionnel) : pied, hauteur automatique.
 * Chaque région n'est rendue que si son slot est présent (`data-region` sur chacune).
 *
 * ## Mise en page
 * L'hôte est une colonne `flex h-full min-w-0` avec la surface de carte du kit (tokens
 * `--index-conteneur-card-*`) : dans une grille CSS, toutes les cartes d'une rangée prennent la même
 * hauteur et grandissent avec leur contenu. Rien ne déborde horizontalement (`min-w-0` partout).
 *
 * ## Typographie
 * Titre 13 px (dérivé : moyenne des tailles `xs` et `sm`), demi-gras
 * (`--bridges-shape-text-heading-2-weight`), couleur primaire, tronqué à `titleLines` lignes ; le titre
 * complet est dans l'attribut `title`. Description 12 px, couleur secondaire, tronquée à
 * `descriptionLines` lignes.
 *
 * ## Accessibilité
 * L'hôte porte `role="group"` et `aria-label` = titre. Le titre est un `<p>` (pas de niveau de titre
 * imposé : la page décide de sa hiérarchie).
 */
@Component({
  selector: 'soc-labs-widget-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    role: 'group',
    '[attr.aria-label]': 'title()',
    // `title` is an input: keep the native attribute off the host (no tooltip over the whole card).
    '[attr.title]': 'null',
    class:
      'flex h-full min-w-0 flex-col gap-[var(--bridges-position-gap-sm)] rounded-[var(--index-conteneur-card-radius)] border-[length:var(--index-conteneur-card-border-width)] border-[var(--index-conteneur-card-border)] bg-[var(--index-conteneur-card-bg)] p-[var(--bridges-position-padding-md)] [font-family:var(--bridges-shape-text-body-font)]',
  },
  template: `
    <div data-region="header" class="flex w-full min-w-0 items-start gap-[var(--bridges-position-gap-sm)]">
      @if (hasIcon()) {
        <span
          data-region="icon"
          class="flex size-[calc(var(--bridges-size-icon-lg)+var(--bridges-position-gap-2xs))] shrink-0 items-center justify-center rounded-[var(--index-conteneur-card-iconarea-bg-radius)] bg-[var(--index-conteneur-card-iconarea-bg)] text-[var(--index-conteneur-card-iconarea-icon-color)] [&>*]:size-[var(--index-conteneur-card-iconarea-icon-size)]"
        ><ng-content select="[socLabsWidgetCardIcon]" /></span>
      }
      <div class="flex min-w-0 flex-1 flex-col gap-[var(--bridges-position-gap-xs)]">
        <p
          data-region="title"
          class="${clamp} min-w-0 break-words text-[length:calc((var(--bridges-size-text-text-size-xs)+var(--bridges-size-text-text-size-sm))/2)] text-[var(--bridges-color-text-primary)] [font-family:var(--bridges-shape-text-label-font)] [font-weight:var(--bridges-shape-text-heading-2-weight)] [line-height:var(--bridges-size-text-line-height-xl)]"
          [style.--soc-labs-widget-card-lines]="titleLines()"
          [attr.title]="title()"
        >{{ title() }}</p>
        @if (description()) {
          <p
            data-region="description"
            class="${clamp} min-w-0 break-words text-[length:var(--bridges-size-text-text-size-xs)] text-[var(--bridges-color-text-secondary)] [line-height:var(--bridges-size-text-line-height-xs)]"
            [style.--soc-labs-widget-card-lines]="descriptionLines()"
            [attr.title]="description()"
          >{{ description() }}</p>
        }
      </div>
      @if (hasActions()) {
        <span data-region="actions" class="flex shrink-0 items-center gap-[var(--bridges-position-gap-2xs)] self-start"
          ><ng-content select="[socLabsWidgetCardActions]"
        /></span>
      }
    </div>
    @if (hasFilters()) {
      <div data-region="filters" class="flex w-full min-w-0 flex-wrap items-center gap-[var(--bridges-position-gap-xs)] [&>*]:min-w-0 [&>*]:max-w-full">
        <ng-content select="[socLabsWidgetCardFilters]" />
      </div>
    }
    <div data-region="body" class="flex w-full min-w-0 flex-1 flex-col">
      <ng-content />
    </div>
    @if (hasFooter()) {
      <div data-region="footer" class="flex w-full min-w-0 shrink-0 flex-col">
        <ng-content select="[socLabsWidgetCardFooter]" />
      </div>
    }
  `,
})
export class SocLabsWidgetCard {
  readonly title = input.required<string>();
  readonly description = input<string>();
  /** Nombre de lignes du titre avant « … ». */
  readonly titleLines = input(2);
  /** Nombre de lignes de la description avant « … ». */
  readonly descriptionLines = input(2);

  private readonly icon = contentChild(SocLabsWidgetCardIcon);
  private readonly actions = contentChild(SocLabsWidgetCardActions);
  private readonly filters = contentChild(SocLabsWidgetCardFilters);
  private readonly footer = contentChild(SocLabsWidgetCardFooter);
  protected readonly hasIcon = computed(() => !!this.icon());
  protected readonly hasActions = computed(() => !!this.actions());
  protected readonly hasFilters = computed(() => !!this.filters());
  protected readonly hasFooter = computed(() => !!this.footer());
}
