import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, computed, contentChild, effect, input, model, signal, untracked } from '@angular/core';
import { LucidePanelLeftClose, LucidePanelLeftOpen, LucidePanelRightClose, LucidePanelRightOpen } from '@lucide/angular';
import { SocLabsIconButton } from '../icon-button/icon-button';
import { nextLabsId } from '../internal/unique-id';

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

/** Panneau replié : rail étroit = bouton `sm` (icône lg) + padding xs de chaque côté + bordure. */
const railBase =
  'flex min-h-0 shrink-0 flex-col items-center gap-[var(--bridges-position-gap-sm)] overflow-hidden border-[var(--bridges-color-border-subtle)] bg-[var(--bridges-color-surface-neutral-white)] py-[var(--bridges-position-padding-xs)] w-[calc(var(--bridges-size-icon-lg)+2*var(--bridges-position-padding-xs)+var(--bridges-shape-line-hairline))]';

const railLabel =
  'whitespace-nowrap [writing-mode:vertical-rl] text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-secondary)] [font-family:var(--bridges-shape-text-label-font)] [font-weight:var(--bridges-shape-text-label-weight)]';

/** Contenu projeté d'un panneau (déplié). Jamais détruit : masqué par `hidden` quand le panneau est replié. */
const panelContent = 'flex shrink-0 flex-col gap-[var(--bridges-position-gap-md)]';

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
 * **Panneaux repliables** (écrans de PC portables) : `collapsibleBelow` (px, défaut `null` = jamais)
 * fixe la largeur de fenêtre sous laquelle la mise en page passe en mode « étroit » (`matchMedia`,
 * suivi en direct). En entrant dans ce mode, les deux panneaux se replient ; en le quittant, ils se
 * déplient et les boutons disparaissent. Dans ce mode, chaque panneau présent porte un bouton
 * (`soc-labs-icon-button`) : déplié, en haut du panneau ; replié, le panneau devient un rail étroit
 * (largeur dérivée des tokens) avec le bouton et son libellé écrit verticalement. L'état est exposé
 * par `leftCollapsed` / `rightCollapsed` (`model`, liables en `[(leftCollapsed)]`) ; hors mode
 * étroit, les panneaux sont toujours dépliés quelle que soit leur valeur. Chaque `<aside>` porte
 * `data-state="collapsed|expanded"`.
 *
 * Le contenu d'un panneau replié reste dans le DOM (masqué par `hidden`) : son état (saisie,
 * recherche, composants) est conservé au dépliage.
 *
 * ## Accessibilité
 * Panneaux en `<aside>` et centre en `<section>`, nommés par `leftLabel` / `rightLabel` /
 * `centerLabel`. Boutons de repli : « Replier le panneau {libellé} » / « Déplier le panneau
 * {libellé} », avec `aria-expanded` et `aria-controls` vers le contenu du panneau ; le libellé
 * vertical du rail est décoratif (`aria-hidden`), l'`<aside>` restant nommé.
 */
@Component({
  selector: 'soc-labs-workspace-layout',
  standalone: true,
  imports: [SocLabsIconButton, LucidePanelLeftClose, LucidePanelLeftOpen, LucidePanelRightClose, LucidePanelRightOpen],
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
        <aside
          data-region="left"
          [attr.aria-label]="leftLabel()"
          [attr.data-state]="leftIsCollapsed() ? 'collapsed' : 'expanded'"
          [class]="leftIsCollapsed() ? leftRailClass : leftClass"
          [style.width]="leftIsCollapsed() ? null : leftWidth()"
        >
          @if (narrow()) {
            @if (leftIsCollapsed()) {
              <soc-labs-icon-button data-toggle="left" [ariaLabel]="'Déplier le panneau ' + leftLabel()" [ariaExpanded]="false" [ariaControls]="leftContentId" (click)="leftCollapsed.set(false)">
                <svg lucidePanelLeftOpen class="size-full" [strokeWidth]="1.5"></svg>
              </soc-labs-icon-button>
              <span aria-hidden="true" [class]="railLabelClass">{{ leftLabel() }}</span>
            } @else {
              <div class="flex shrink-0 justify-end">
                <soc-labs-icon-button data-toggle="left" [ariaLabel]="'Replier le panneau ' + leftLabel()" [ariaExpanded]="true" [ariaControls]="leftContentId" (click)="leftCollapsed.set(true)">
                  <svg lucidePanelLeftClose class="size-full" [strokeWidth]="1.5"></svg>
                </soc-labs-icon-button>
              </div>
            }
          }
          <div data-panel-content [id]="leftContentId" [hidden]="leftIsCollapsed()" [class]="leftIsCollapsed() ? 'hidden' : contentClass">
            <ng-content select="[socLabsWorkspaceLeft]" />
          </div>
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
        <aside
          data-region="right"
          [attr.aria-label]="rightLabel()"
          [attr.data-state]="rightIsCollapsed() ? 'collapsed' : 'expanded'"
          [class]="rightIsCollapsed() ? rightRailClass : rightClass"
          [style.width]="rightIsCollapsed() ? null : rightWidth()"
        >
          @if (narrow()) {
            @if (rightIsCollapsed()) {
              <soc-labs-icon-button data-toggle="right" [ariaLabel]="'Déplier le panneau ' + rightLabel()" [ariaExpanded]="false" [ariaControls]="rightContentId" (click)="rightCollapsed.set(false)">
                <svg lucidePanelRightOpen class="size-full" [strokeWidth]="1.5"></svg>
              </soc-labs-icon-button>
              <span aria-hidden="true" [class]="railLabelClass">{{ rightLabel() }}</span>
            } @else {
              <div class="flex shrink-0 justify-start">
                <soc-labs-icon-button data-toggle="right" [ariaLabel]="'Replier le panneau ' + rightLabel()" [ariaExpanded]="true" [ariaControls]="rightContentId" (click)="rightCollapsed.set(true)">
                  <svg lucidePanelRightClose class="size-full" [strokeWidth]="1.5"></svg>
                </soc-labs-icon-button>
              </div>
            }
          }
          <div data-panel-content [id]="rightContentId" [hidden]="rightIsCollapsed()" [class]="rightIsCollapsed() ? 'hidden' : contentClass">
            <ng-content select="[socLabsWorkspaceRight]" />
          </div>
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
  /**
   * Largeur de fenêtre (px) sous laquelle les panneaux deviennent repliables (mode « étroit »).
   * `null` (défaut) = jamais : panneaux toujours dépliés, aucun bouton.
   */
  readonly collapsibleBelow = input<number | null>(null);
  /** Panneau gauche replié (effectif seulement en mode étroit). Mis à `true` en entrant dans ce mode. */
  readonly leftCollapsed = model(false);
  /** Panneau droit replié (effectif seulement en mode étroit). Mis à `true` en entrant dans ce mode. */
  readonly rightCollapsed = model(false);

  protected readonly leftClass = `${panelBase} border-r-[length:var(--bridges-shape-line-hairline)]`;
  protected readonly rightClass = `${panelBase} border-l-[length:var(--bridges-shape-line-hairline)]`;
  protected readonly leftRailClass = `${railBase} border-r-[length:var(--bridges-shape-line-hairline)]`;
  protected readonly rightRailClass = `${railBase} border-l-[length:var(--bridges-shape-line-hairline)]`;
  protected readonly contentClass = panelContent;
  protected readonly railLabelClass = railLabel;
  protected readonly leftContentId = nextLabsId('soc-labs-workspace-left');
  protected readonly rightContentId = nextLabsId('soc-labs-workspace-right');

  /** Fenêtre plus étroite que `collapsibleBelow`. */
  protected readonly narrow = signal(false);
  protected readonly leftIsCollapsed = computed(() => this.narrow() && this.leftCollapsed());
  protected readonly rightIsCollapsed = computed(() => this.narrow() && this.rightCollapsed());

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

  constructor() {
    effect((onCleanup) => {
      const below = this.collapsibleBelow();
      const canMatch = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
      const query = below == null || !canMatch ? null : window.matchMedia(`(max-width: ${below - 0.02}px)`);
      untracked(() => this.setNarrow(!!query?.matches));
      if (!query) return;
      const onChange = (event: MediaQueryListEvent) => this.setNarrow(event.matches);
      query.addEventListener('change', onChange);
      onCleanup(() => query.removeEventListener('change', onChange));
    });
  }

  /** Entrer en mode étroit replie les deux panneaux ; en sortir les déplie. */
  private setNarrow(narrow: boolean): void {
    if (narrow === this.narrow()) return;
    this.narrow.set(narrow);
    this.leftCollapsed.set(narrow);
    this.rightCollapsed.set(narrow);
  }
}
