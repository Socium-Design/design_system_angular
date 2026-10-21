import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, booleanAttribute, computed, contentChild, input } from '@angular/core';
import { labsOverlineText } from '../internal/classes';
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
 * ## Slots
 * - `socLabsSettingsCardAction` (optionnel) : à droite du titre, aligné en haut, jamais rétréci.
 * - contenu sans marqueur : le corps (colonne, espacement `gap-lg`).
 * - `socLabsSettingsCardFootnote` (optionnel) : encadré pointillé en bas de carte.
 */
@Component({
  selector: 'soc-labs-settings-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class:
      'flex min-w-0 flex-col gap-[var(--bridges-position-gap-lg)] rounded-[var(--index-conteneur-card-radius)] border-[length:var(--index-conteneur-card-border-width)] border-[var(--index-conteneur-card-border)] bg-[var(--index-conteneur-card-bg)] p-[var(--bridges-position-padding-xl)]',
    role: 'group',
    '[attr.aria-labelledby]': 'titleId',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.title]': 'null',
  },
  template: `
    <div class="flex items-start justify-between gap-[var(--bridges-position-gap-lg)]" data-region="header">
      <div class="flex min-w-0 flex-col gap-[var(--bridges-position-gap-2xs)]">
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
      </div>
      @if (hasAction()) {
        <div class="shrink-0" data-region="action"><ng-content select="[socLabsSettingsCardAction]" /></div>
      }
    </div>
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

  protected readonly titleId = nextLabsId('soc-labs-settings-card-title');
  protected readonly overlineClass = labsOverlineText;

  private readonly action = contentChild(SocLabsSettingsCardAction);
  private readonly footnote = contentChild(SocLabsSettingsCardFootnote);
  protected readonly hasAction = computed(() => !!this.action());
  protected readonly hasFootnote = computed(() => !!this.footnote());

  protected readonly bodyClass = computed(
    () =>
      `flex min-w-0 flex-col gap-[var(--bridges-position-gap-lg)] ${this.disabled() ? 'pointer-events-none select-none opacity-[var(--bridges-texture-opacity-disabled)]' : ''}`,
  );
}
