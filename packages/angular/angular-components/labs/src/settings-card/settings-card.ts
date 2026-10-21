import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, booleanAttribute, computed, contentChild, input, model } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { SocTag, type TagColor } from '@socium-design/angular-components';
import { labsFocusRing, labsOverlineText } from '../internal/classes';
import { nextLabsId } from '../internal/unique-id';

/** Contrôle à droite du titre (typiquement un `soc-switch` qui active la carte). Jamais grisé. */
@Directive({ selector: '[socLabsSettingsCardAction]', standalone: true })
export class SocLabsSettingsCardAction {}

/** Note de bas de carte dans un encadré pointillé (règle de calcul, remarque). Grisée avec le corps. */
@Directive({ selector: '[socLabsSettingsCardFootnote]', standalone: true })
export class SocLabsSettingsCardFootnote {}

/**
 * ## Rôle
 * Carte d'un **bloc de réglages** dans une page de configuration : sur-titre en petites capitales
 * (« BARÈME »), titre, contrôle à droite du titre (interrupteur), corps libre (champs du kit), puis une
 * note optionnelle dans un encadré pointillé (« Règle de calcul »), sur le fond de la carte : `text-secondary` y garde
 * 4,8:1 (sur `background-layer-1`, il tomberait à 4,4:1).
 *
 * Diffère de `soc-card` du kit : sur-titre, titre jamais tronqué, pas de bouton « ••• » (#15), état
 * **désactivé** (#11) et encadré de note.
 *
 * ## État désactivé (`disabled`)
 * Le corps et la note sont grisés (`--bridges-texture-opacity-disabled`) et **inertes** (`inert` :
 * ni clic, ni saisie, ni focus clavier, quel que soit le contrôle du kit qu'ils contiennent). Le
 * contrôle d'en-tête reste actif — c'est lui qui réactive la carte — et `disabledNote`, s'il est
 * fourni, s'affiche sous l'en-tête en couleur normale (contraste ≥ 4,5:1) pour dire pourquoi.
 *
 * ## Accessibilité
 * `role="group"` nommé par le titre (`aria-labelledby`). Le corps inerte est retiré de l'arbre
 * d'accessibilité : `disabledNote` est l'information lue à la place.
 *
 * ## Carte repliable (`collapsible`, désactivé par défaut)
 * - `expanded` (↔, `[(expanded)]`) : ouverte ou fermée. Carte fermée : seul l'en-tête reste, avec
 *   `summary` sous le titre (« /20 · 2 décimales · … »).
 * - Un clic sur l'en-tête ouvre ou ferme la carte, **sauf** sur le contrôle d'en-tête (l'interrupteur
 *   reste utilisable carte fermée et ne la replie jamais). Au clavier : le bouton chevron à droite
 *   (`aria-expanded`, `aria-controls` vers le corps, nommé par le titre), Entrée / Espace, focus visible.
 * - `lockExpanded` : la carte ne peut pas être refermée (ex. une valeur invalide à corriger) — le
 *   chevron passe en `aria-disabled`. Il faut une entrée dédiée : avec la seule liaison
 *   `[(expanded)]`, un parent qui remet `true` juste après une fermeture ne change pas la valeur liée
 *   et Angular ne la renvoie pas.
 * - Ouverture animée (hauteur, ~200 ms), sans animation si `prefers-reduced-motion`.
 * - Le corps replié est `inert` (ni focus, ni lecture par les lecteurs d'écran).
 *
 * ## Badge (`badge`, `badgeTone`)
 * Pastille dans l'en-tête (« Modifié », « Erreur »), visible carte ouverte ou fermée : `soc-tag` du kit,
 * ton = une couleur de `TagColor` (`information` par défaut, `error`, `warning`, `success`…).
 *
 * ## Slots
 * - `socLabsSettingsCardAction` (optionnel) : à droite du titre, aligné en haut, jamais rétréci.
 * - contenu sans marqueur : le corps (colonne, espacement `gap-lg`).
 * - `socLabsSettingsCardFootnote` (optionnel) : encadré pointillé en bas de carte.
 */
@Component({
  selector: 'soc-labs-settings-card',
  standalone: true,
  imports: [SocTag, LucideChevronDown],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class:
      'flex min-w-0 flex-col rounded-[var(--index-conteneur-card-radius)] border-[length:var(--index-conteneur-card-border-width)] border-[var(--index-conteneur-card-border)] bg-[var(--index-conteneur-card-bg)] p-[var(--bridges-position-padding-xl)]',
    role: 'group',
    '[attr.aria-labelledby]': 'titleId',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-expanded]': 'collapsible() ? (isExpanded() ? "true" : "false") : null',
    '[attr.title]': 'null',
  },
  template: `
    <div [class]="headerClass()" (click)="onHeaderClick($event)" data-region="header">
      <div class="flex min-w-0 flex-1 flex-col gap-[var(--bridges-position-gap-2xs)]">
        @if (overline()) {
          <p [class]="overlineClass" data-region="overline">{{ overline() }}</p>
        }
        <p
          [id]="titleId"
          class="text-[length:var(--bridges-size-text-text-size-lg)] leading-[var(--bridges-size-text-line-height-lg)] text-[var(--bridges-color-text-primary)] [font-family:var(--bridges-shape-text-heading-2-font)] [font-weight:var(--bridges-shape-text-heading-2-weight)]"
          data-region="title"
        >
          {{ title() }}
        </p>
        @if (collapsible() && !isExpanded() && summary()) {
          <p [id]="summaryId" class="text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-secondary)] [font-family:var(--bridges-shape-text-body-font)]" data-region="summary">
            {{ summary() }}
          </p>
        }
      </div>
      @if (badge()) {
        <soc-tag class="shrink-0" [color]="badgeTone()" data-region="badge">{{ badge() }}</soc-tag>
      }
      @if (hasAction()) {
        <div class="shrink-0" data-region="action"><ng-content select="[socLabsSettingsCardAction]" /></div>
      }
      @if (collapsible()) {
        <button
          type="button"
          [class]="toggleClass"
          [attr.aria-expanded]="isExpanded()"
          [attr.aria-controls]="panelId"
          [attr.aria-labelledby]="titleId"
          [attr.aria-describedby]="!isExpanded() && summary() ? summaryId : null"
          [attr.aria-disabled]="isExpanded() && lockExpanded() ? 'true' : null"
          data-region="toggle"
        >
          <svg lucideChevronDown [class]="chevronClass()" [strokeWidth]="2" aria-hidden="true"></svg>
        </button>
      }
    </div>
    <div [id]="panelId" [class]="panelClass()" [attr.inert]="isExpanded() ? null : ''" data-part="panel">
      <div class="min-h-0 overflow-hidden">
        <div class="flex min-w-0 flex-col gap-[var(--bridges-position-gap-lg)] pt-[var(--bridges-position-gap-lg)]">
          @if (disabled() && disabledNote()) {
            <p class="text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-secondary)] [font-family:var(--bridges-shape-text-body-font)]" data-region="disabled-note">
              {{ disabledNote() }}
            </p>
          }
          <div [class]="bodyClass()" [attr.inert]="disabled() ? '' : null" [attr.aria-disabled]="disabled() ? 'true' : null" data-region="body">
            <ng-content />
            @if (hasFootnote()) {
              <div
                class="rounded-[var(--bridges-shape-figure-radius-md)] border-[length:var(--bridges-shape-figure-border-stroke-default)] border-dashed border-[var(--bridges-color-border-secondary)] px-[var(--bridges-position-padding-lg)] py-[var(--bridges-position-padding-md)] text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-secondary)] [font-family:var(--bridges-shape-text-body-font)]"
                data-region="footnote"
              >
                <ng-content select="[socLabsSettingsCardFootnote]" />
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SocLabsSettingsCard {
  readonly title = input.required<string>();
  /** Sur-titre en petites capitales au-dessus du titre (« BARÈME »). */
  readonly overline = input<string>();
  /** Corps et note grisés et inertes ; le contrôle d'en-tête reste actif. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Mention affichée sous l'en-tête quand la carte est désactivée (« Barème désactivé : … »). */
  readonly disabledNote = input<string>();
  /** Carte repliable (en-tête cliquable + chevron). Faux par défaut : la carte est toujours ouverte. */
  readonly collapsible = input(false, { transform: booleanAttribute });
  /** Ouverte (↔). Ignoré si la carte n'est pas repliable. */
  readonly expanded = model(true);
  /** Résumé sous le titre quand la carte repliable est fermée. */
  readonly summary = input<string>();
  /** Empêche de refermer la carte (valeur à corriger) ; le chevron est `aria-disabled`. */
  readonly lockExpanded = input(false, { transform: booleanAttribute });
  /** Pastille de l'en-tête (« Modifié », « Erreur ») ; absente si vide. */
  readonly badge = input<string>();
  readonly badgeTone = input<TagColor>('information');

  protected readonly titleId = nextLabsId('soc-labs-settings-card-title');
  protected readonly summaryId = nextLabsId('soc-labs-settings-card-summary');
  protected readonly panelId = nextLabsId('soc-labs-settings-card-panel');
  protected readonly toggleClass = `flex size-[calc(var(--bridges-size-icon-lg)+var(--bridges-position-gap-2xs))] shrink-0 items-center justify-center rounded-[var(--bridges-shape-figure-radius-sm)] text-[var(--bridges-color-icon-secondary)] hover:bg-[var(--bridges-color-background-layer-1)] aria-disabled:cursor-not-allowed aria-disabled:text-[var(--bridges-color-icon-disabled)] aria-disabled:hover:bg-transparent ${labsFocusRing}`;
  protected readonly overlineClass = labsOverlineText;

  private readonly action = contentChild(SocLabsSettingsCardAction);
  private readonly footnote = contentChild(SocLabsSettingsCardFootnote);
  protected readonly hasAction = computed(() => !!this.action());
  protected readonly hasFootnote = computed(() => !!this.footnote());

  protected readonly isExpanded = computed(() => !this.collapsible() || this.expanded() || this.lockExpanded());

  protected readonly headerClass = computed(
    () => `flex items-start justify-between gap-[var(--bridges-position-gap-lg)] ${this.collapsible() ? 'cursor-pointer' : ''}`,
  );
  protected readonly chevronClass = computed(
    () =>
      `size-[var(--bridges-size-icon-sm)] transition-transform duration-200 motion-reduce:transition-none ${this.isExpanded() ? 'rotate-180' : ''}`,
  );
  /** Hauteur animée par `grid-template-rows` (0fr → 1fr) : pas de hauteur à mesurer. */
  protected readonly panelClass = computed(
    () =>
      `grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${this.isExpanded() ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`,
  );

  /** Clic n'importe où dans l'en-tête (y compris Entrée / Espace sur le chevron), sauf sur le contrôle d'en-tête. */
  protected onHeaderClick(event: MouseEvent): void {
    if (!this.collapsible()) return;
    const target = event.target as Element | null;
    if (target?.closest('[data-region="action"]')) return;
    if (this.isExpanded() && this.lockExpanded()) return;
    this.expanded.set(!this.isExpanded());
  }

  protected readonly bodyClass = computed(
    () =>
      `flex min-w-0 flex-col gap-[var(--bridges-position-gap-lg)] ${this.disabled() ? 'pointer-events-none select-none opacity-[var(--bridges-texture-opacity-disabled)]' : ''}`,
  );
}
