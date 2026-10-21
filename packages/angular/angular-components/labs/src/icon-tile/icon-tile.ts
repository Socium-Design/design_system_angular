import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input } from '@angular/core';

/** The kit's accent palettes (`--bridges-color-accent-*`), plus a neutral tile. */
export type LabsIconTileColor = 'blue' | 'indigo' | 'purple' | 'orange' | 'red' | 'green' | 'amber' | 'lime' | 'neutral';
export type LabsIconTileSize = 20 | 28 | 32;

export const LABS_ICON_TILE_COLORS: LabsIconTileColor[] = ['blue', 'indigo', 'purple', 'orange', 'red', 'green', 'amber', 'lime', 'neutral'];

/**
 * `--bridges-color-accent-*-bg` + its text token. Same two contrast exceptions as
 * `soc-labs-chart-type-chip`: amber and lime use `text-warning` / `text-success` (their own accent
 * text token is under 3:1 on their background).
 */
const colorClasses: Record<LabsIconTileColor, string> = {
  blue: 'bg-[var(--bridges-color-accent-blue-bg)] text-[var(--bridges-color-accent-blue-text)]',
  indigo: 'bg-[var(--bridges-color-accent-indigo-bg)] text-[var(--bridges-color-accent-indigo-text)]',
  purple: 'bg-[var(--bridges-color-accent-purple-bg)] text-[var(--bridges-color-accent-purple-text)]',
  orange: 'bg-[var(--bridges-color-accent-orange-bg)] text-[var(--bridges-color-accent-orange-text)]',
  red: 'bg-[var(--bridges-color-accent-red-bg)] text-[var(--bridges-color-accent-red-text)]',
  green: 'bg-[var(--bridges-color-accent-green-bg)] text-[var(--bridges-color-accent-green-text)]',
  amber: 'bg-[var(--bridges-color-accent-amber-bg)] text-[var(--bridges-color-text-warning)]',
  lime: 'bg-[var(--bridges-color-accent-lime-bg)] text-[var(--bridges-color-text-success)]',
  neutral: 'bg-[var(--bridges-color-surface-neutral-default)] text-[var(--bridges-color-text-primary)]',
};

/** 20px = kit icon md, 28px = icon lg + gap-2xs (no token of its own), 32px = icon xl. */
const sizeClasses: Record<LabsIconTileSize, string> = {
  20: 'size-[var(--bridges-size-icon-md)] rounded-[var(--bridges-shape-figure-radius-sm)]',
  28: 'size-[calc(var(--bridges-size-icon-lg)+var(--bridges-position-gap-2xs))] rounded-[var(--bridges-shape-figure-radius-md)]',
  32: 'size-[var(--bridges-size-icon-xl)] rounded-[var(--bridges-shape-figure-radius-md)]',
};
const iconSizeClasses: Record<LabsIconTileSize, string> = {
  20: 'size-[var(--bridges-size-icon-xs)]',
  28: 'size-[var(--bridges-size-icon-sm)]',
  32: 'size-[var(--bridges-size-icon-sm)]',
};

/**
 * ## Rôle
 * Tuile carrée teintée portant une icône : repère visuel devant un libellé (nom d'un tableau de bord
 * dans une liste, entrée de catalogue…). Générique, contrairement à `soc-labs-chart-type-chip` qui
 * ne connaît que les types de graphique : l'icône est projetée et la couleur choisie parmi les
 * accents du kit.
 *
 * L'icône est le contenu par défaut : `<svg lucideLayoutGrid class="size-full">`.
 *
 * ## Accessibilité
 * Par défaut `role="img"` nommé par `label`. À côté d'un texte qui dit déjà la même chose (cas
 * courant : le nom de la ligne), passer `decorative` : la tuile est masquée aux technologies
 * d'assistance. Sans `label` ni `decorative`, la tuile est aussi traitée comme décorative (une image
 * sans nom n'apporte rien à un lecteur d'écran).
 */
@Component({
  selector: 'soc-labs-icon-tile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClasses()',
    '[attr.role]': 'isDecorative() ? null : "img"',
    '[attr.aria-label]': 'isDecorative() ? null : label()',
    '[attr.aria-hidden]': 'isDecorative() ? "true" : null',
    '[attr.data-color]': 'color()',
  },
  template: `<span aria-hidden="true" [class]="iconClass()"><ng-content /></span>`,
})
export class SocLabsIconTile {
  readonly color = input<LabsIconTileColor>('blue');
  readonly size = input<LabsIconTileSize>(32);
  /** Nom accessible ; absent = tuile décorative. */
  readonly label = input<string>();
  readonly decorative = input(false, { transform: booleanAttribute });

  protected readonly isDecorative = computed(() => this.decorative() || !this.label());
  protected readonly hostClasses = computed(
    () => `inline-flex shrink-0 items-center justify-center ${sizeClasses[this.size()]} ${colorClasses[this.color()]}`,
  );
  protected readonly iconClass = computed(() => `inline-flex ${iconSizeClasses[this.size()]}`);
}
