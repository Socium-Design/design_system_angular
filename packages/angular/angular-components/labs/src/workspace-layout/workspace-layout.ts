import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, computed, contentChild, input } from '@angular/core';

/** Barre du haut, à gauche : bouton retour (ex. `soc-labs-icon-button` avec une flèche). */
@Directive({ selector: '[socLabsWorkspaceBack]', standalone: true })
export class SocLabsWorkspaceBack {}

/** Barre du haut : titre (texte, `soc-labs-inline-edit`…). */
@Directive({ selector: '[socLabsWorkspaceTitle]', standalone: true })
export class SocLabsWorkspaceTitle {}

/** Barre du haut, après le titre : badge ou indication (« Brouillon », « Ajoutez des graphes → »). */
@Directive({ selector: '[socLabsWorkspaceHint]', standalone: true })
export class SocLabsWorkspaceHint {}

/** Barre du haut, à droite : actions (Prévisualiser, Enregistrer…). */
@Directive({ selector: '[socLabsWorkspaceActions]', standalone: true })
export class SocLabsWorkspaceActions {}

/** Panneau gauche (optionnel). */
@Directive({ selector: '[socLabsWorkspaceLeft]', standalone: true })
export class SocLabsWorkspaceLeft {}

/** Panneau droit (optionnel). */
@Directive({ selector: '[socLabsWorkspaceRight]', standalone: true })
export class SocLabsWorkspaceRight {}

const panelBase =
  'flex min-h-0 shrink-0 flex-col gap-[var(--bridges-position-gap-md)] overflow-y-auto border-[var(--bridges-color-border-subtle)] bg-[var(--bridges-color-surface-neutral-white)] p-[var(--bridges-position-padding-md)]';

/**
 * ## Rôle
 * **Espace de travail plein écran** sous le bandeau de l'application (composition d'un tableau de
 * bord) : barre du haut, panneau gauche, zone centrale sur le fond gris du kit, panneau droit.
 * Chaque colonne défile indépendamment ; les panneaux sont blancs avec une bordure.
 *
 * ## Slots (tous optionnels)
 * Barre du haut : `socLabsWorkspaceBack`, `socLabsWorkspaceTitle`, `socLabsWorkspaceHint`,
 * `socLabsWorkspaceActions` (la barre n'est rendue que si l'un d'eux est présent). Colonnes :
 * `socLabsWorkspaceLeft`, `socLabsWorkspaceRight` ; le contenu sans marqueur va au centre.
 *
 * ## Mise en page
 * L'hôte prend toute la hauteur de son parent (`h-full`) : le placer dans une zone de hauteur
 * définie (contenu de `soc-app-shell`). Largeurs des panneaux : `leftWidth` (défaut 220px) et
 * `rightWidth` (défaut 240px), toute longueur CSS.
 *
 * ## Accessibilité
 * Panneaux en `<aside>` et centre en `<section>`, nommés par `leftLabel` / `rightLabel` /
 * `centerLabel`.
 */
@Component({
  selector: 'soc-labs-workspace-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex h-full min-h-0 w-full min-w-0 flex-col [font-family:var(--bridges-shape-text-body-font)]' },
  template: `
    @if (hasTopBar()) {
      <div
        data-region="top-bar"
        class="flex shrink-0 items-center gap-[var(--bridges-position-gap-md)] border-b-[length:var(--bridges-shape-line-hairline)] border-[var(--bridges-color-border-subtle)] bg-[var(--bridges-color-surface-neutral-white)] px-[var(--bridges-position-padding-lg)] py-[var(--bridges-position-padding-3xs)]"
      >
        @if (hasBack()) {
          <span class="flex shrink-0 items-center"><ng-content select="[socLabsWorkspaceBack]" /></span>
        }
        <div class="flex min-w-0 flex-1 items-center gap-[var(--bridges-position-gap-sm)]">
          @if (hasTitle()) {
            <span
              class="flex min-w-0 items-center truncate text-[length:var(--bridges-size-text-text-size-lg)] text-[var(--bridges-color-text-primary)] [font-family:var(--bridges-shape-text-label-font)] [font-weight:var(--bridges-shape-text-label-weight)]"
            ><ng-content select="[socLabsWorkspaceTitle]" /></span>
          }
          @if (hasHint()) {
            <span class="flex shrink-0 items-center text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-secondary)]"><ng-content select="[socLabsWorkspaceHint]" /></span>
          }
        </div>
        @if (hasActions()) {
          <span class="flex shrink-0 items-center gap-[var(--bridges-position-gap-sm)]"><ng-content select="[socLabsWorkspaceActions]" /></span>
        }
      </div>
    }
    <div class="flex min-h-0 flex-1">
      @if (hasLeft()) {
        <aside data-region="left" [attr.aria-label]="leftLabel()" [class]="leftClass" [style.width]="leftWidth()">
          <ng-content select="[socLabsWorkspaceLeft]" />
        </aside>
      }
      <section
        data-region="center"
        [attr.aria-label]="centerLabel()"
        class="flex min-h-0 min-w-0 flex-1 flex-col gap-[var(--bridges-position-gap-lg)] overflow-y-auto bg-[var(--bridges-color-background-layer-1)] p-[var(--bridges-position-padding-lg)]"
      >
        <ng-content />
      </section>
      @if (hasRight()) {
        <aside data-region="right" [attr.aria-label]="rightLabel()" [class]="rightClass" [style.width]="rightWidth()">
          <ng-content select="[socLabsWorkspaceRight]" />
        </aside>
      }
    </div>
  `,
})
export class SocLabsWorkspaceLayout {
  /** Largeur du panneau gauche (longueur CSS). */
  readonly leftWidth = input('220px');
  /** Largeur du panneau droit (longueur CSS). */
  readonly rightWidth = input('240px');
  readonly leftLabel = input('Informations');
  readonly rightLabel = input('Bibliothèque');
  readonly centerLabel = input('Espace de travail');

  protected readonly leftClass = `${panelBase} border-r-[length:var(--bridges-shape-line-hairline)]`;
  protected readonly rightClass = `${panelBase} border-l-[length:var(--bridges-shape-line-hairline)]`;

  private readonly back = contentChild(SocLabsWorkspaceBack);
  private readonly title = contentChild(SocLabsWorkspaceTitle);
  private readonly hint = contentChild(SocLabsWorkspaceHint);
  private readonly actions = contentChild(SocLabsWorkspaceActions);
  private readonly left = contentChild(SocLabsWorkspaceLeft);
  private readonly right = contentChild(SocLabsWorkspaceRight);

  protected readonly hasBack = computed(() => !!this.back());
  protected readonly hasTitle = computed(() => !!this.title());
  protected readonly hasHint = computed(() => !!this.hint());
  protected readonly hasActions = computed(() => !!this.actions());
  protected readonly hasLeft = computed(() => !!this.left());
  protected readonly hasRight = computed(() => !!this.right());
  protected readonly hasTopBar = computed(() => this.hasBack() || this.hasTitle() || this.hasHint() || this.hasActions());
}
