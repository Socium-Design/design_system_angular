import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  forwardRef,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { LucideChevronDown } from '@lucide/angular';
import { SocButton, SocSwitch, SocTag } from '@socium-design/angular-components';
import { labsFocusRing } from '../internal/classes';
import { SocLabsSwitchHiddenLabel } from '../switch-hidden-label/switch-hidden-label';
import { nextLabsId } from '../internal/unique-id';

/** Tags de la ligne (offre : `soc-tag` du kit ou `soc-labs-tag`), alignés à droite. */
@Directive({ selector: '[socLabsOptionRowTags]', standalone: true })
export class SocLabsOptionRowTags {}

export type LabsOptionRowAppearance = 'row' | 'tile';
export type LabsOptionRowControl = 'switch' | 'button';

/** Fond teinté d'une option mise en avant : `accent-orange-bg` éclairci à 35 % vers le blanc (text-secondary 4,6:1). */
const highlightBg =
  'bg-[color-mix(in_srgb,var(--bridges-color-accent-orange-bg)_35%,var(--bridges-color-surface-neutral-white))]';

/**
 * ## Rôle
 * Ligne d'une **liste d'options activables** (fonctionnalités d'un client, réglages) : interrupteur du kit,
 * libellé cliquable (ouvre un détail : `(labelClick)`), description sur **une ligne** (tronquée par « … »),
 * tags à droite (slot `socLabsOptionRowTags`) et badge « Nouveau » (`isNew`).
 *
 * ## Sous-options
 * Des `soc-labs-option-row` projetées dans une ligne forment une liste imbriquée, en retrait sous leur parent
 * (filet à gauche). Le parent ne pilote pas leurs états : c'est au consommateur de passer `disabled` aux
 * sous-options tant que le parent est coupé, avec `disabledReason` (« Activez d'abord … »), affichée sous la
 * description.
 *
 * ## Confirmation dans la ligne (`confirmMessage`)
 * Si `confirmMessage` est fourni, **activer** l'option ne la change pas tout de suite : l'interrupteur passe
 * à « activé » en attente et une zone de confirmation s'ouvre sous la ligne (message + « Confirmer » /
 * « Annuler »), sans modale. Le focus va sur « Confirmer ». Confirmer : `checked` passe à `true` (émis par
 * `checkedChange`). Annuler (ou Échap dans la zone) : l'interrupteur revient à « désactivé », rien n'est
 * émis. Dans les deux cas, le focus revient sur l'interrupteur. Désactiver ne demande jamais de confirmation.
 *
 * ## Accessibilité
 * Hôte `role="listitem"` : placer les lignes dans un conteneur `role="list"` (les sous-options y sont déjà).
 * L'interrupteur (`role="switch"` du kit) est nommé par le libellé de l'option — le libellé de `soc-switch`
 * est masqué visuellement, le libellé visible étant un bouton (`aria-haspopup="dialog"`). La description
 * tronquée reste lue en entier. La zone de confirmation est un `role="group"` nommé par son message.
 * `data-state` sur l'hôte : `on` | `off` | `confirming` | `disabled`.
 *
 * ## Apparence (`appearance`)
 * - **`row`** (défaut) : ligne de liste, description sur une ligne.
 * - **`tile`** : tuile de catalogue (bloc arrondi, fond blanc, filet) — libellé et interrupteur en haut, description sur
 *   deux lignes, tags en bas. Un clic n'importe où sur la tuile (hors interrupteur, boutons, confirmation et
 *   sous-options) émet `(labelClick)` comme le libellé ; au clavier, le libellé reste le bouton à atteindre.
 *
 * ## Mise en avant (`highlight`)
 * Option à distinguer (option payante) sans reposer sur le seul tag : liseré à gauche (`accent-orange-text`, 7,1:1)
 * et, en tuile, fond légèrement teinté (`accent-orange-bg` à 35 % : `text-secondary` y reste à 4,6:1).
 *
 * ## Contrôle (`control`)
 * - **`switch`** (défaut) : interrupteur du kit.
 * - **`button`** : bouton du kit « Activer » / « Désactiver » (`actionLabel`, `deactivateLabel`), nommé avec le libellé
 *   de l'option (« Activer Intranet »). Même confirmation dans la ligne avant activation ; le focus revient ensuite sur
 *   le bouton (`[data-part="action"]`).
 *
 * ## Sous-options repliables (`collapsible`)
 * Les sous-options sont repliées sous un bouton « Afficher les N sous-options » (`aria-expanded`, `aria-controls`).
 * `expanded` (↔) pilote l'état ; le consommateur peut le forcer (résultat de recherche dans une sous-option).
 */
@Component({
  selector: 'soc-labs-option-row',
  standalone: true,
  imports: [NgTemplateOutlet, LucideChevronDown, SocSwitch, SocLabsSwitchHiddenLabel, SocTag, SocButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClass()',
    role: 'listitem',
    '[attr.data-state]': 'state()',
    '[attr.data-appearance]': 'appearance()',
    '[attr.data-highlight]': 'highlight() ? "" : null',
    '[attr.title]': 'null',
    '(click)': 'onHostClick($event)',
  },
  template: `
    <ng-template #labelTpl>
      <button type="button" aria-haspopup="dialog" [class]="labelClass()" (click)="labelClick.emit()" data-part="label">
        {{ label() }}
      </button>
      @if (description()) {
        <p [class]="descriptionClass()" data-part="description">{{ description() }}</p>
      }
      @if (disabled() && disabledReason()) {
        <p
          class="text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-secondary)] [font-family:var(--bridges-shape-text-body-font)] italic"
          data-part="disabled-reason"
        >
          {{ disabledReason() }}
        </p>
      }
    </ng-template>

    <ng-template #controlTpl>
      @if (control() === 'switch') {
        <div class="shrink-0 pt-[var(--bridges-position-gap-2xs)]" data-part="switch">
          <soc-switch socLabsSwitchHiddenLabel [id]="controlId" [label]="label()" [checked]="switchOn()" [disabled]="disabled()" (checkedChange)="onToggle($event)" />
        </div>
      } @else {
        <button
          socButton
          type="button"
          size="sm"
          [variant]="checked() ? 'tertiary' : 'secondary'"
          [id]="controlId"
          [disabled]="disabled()"
          [attr.aria-label]="(checked() ? deactivateLabel() : actionLabel()) + ' ' + label()"
          (click)="onToggle(!checked())"
          data-part="action"
        >
          {{ checked() ? deactivateLabel() : actionLabel() }}
        </button>
      }
    </ng-template>

    <ng-template #tagsTpl>
      @if (isNew()) {
        <soc-tag color="information" data-part="new">{{ newLabel() }}</soc-tag>
      }
      <ng-content select="[socLabsOptionRowTags]" />
    </ng-template>

    <ng-template #childrenTpl><ng-content /></ng-template>

    @if (appearance() === 'tile') {
      <div class="flex min-w-0 items-start gap-[var(--bridges-position-gap-md)]" data-part="row">
        <div class="flex min-w-0 flex-1 flex-col gap-[var(--bridges-position-gap-2xs)]"><ng-container [ngTemplateOutlet]="labelTpl" /></div>
        <ng-container [ngTemplateOutlet]="controlTpl" />
      </div>
      @if (hasTags() || isNew() || (collapsible() && hasChildren())) {
        <div class="flex min-w-0 flex-wrap items-center justify-between gap-[var(--bridges-position-gap-sm)]" data-part="footer">
          <div class="flex flex-wrap items-center gap-[var(--bridges-position-gap-sm)]" data-part="tags"><ng-container [ngTemplateOutlet]="tagsTpl" /></div>
          @if (collapsible() && hasChildren()) {
            <ng-container [ngTemplateOutlet]="toggleTpl" />
          }
        </div>
      }
    } @else {
      <div class="flex min-w-0 items-start gap-[var(--bridges-position-gap-md)] py-[var(--bridges-position-padding-sm)]" data-part="row">
        @if (control() === 'switch') {
          <ng-container [ngTemplateOutlet]="controlTpl" />
        }
        <div class="flex min-w-0 flex-1 flex-col gap-[var(--bridges-position-gap-2xs)]"><ng-container [ngTemplateOutlet]="labelTpl" /></div>
        @if (hasTags() || isNew()) {
          <div class="flex shrink-0 flex-wrap items-center justify-end gap-[var(--bridges-position-gap-sm)] pt-[var(--bridges-position-gap-2xs)]" data-part="tags">
            <ng-container [ngTemplateOutlet]="tagsTpl" />
          </div>
        }
        @if (control() === 'button') {
          <ng-container [ngTemplateOutlet]="controlTpl" />
        }
      </div>
      @if (collapsible() && hasChildren()) {
        <ng-container [ngTemplateOutlet]="toggleTpl" />
      }
    }

    <ng-template #toggleTpl>
      <button
        type="button"
        [class]="toggleClass"
        [attr.aria-expanded]="expanded()"
        [attr.aria-controls]="childrenId"
        (click)="expanded.set(!expanded())"
        data-part="children-toggle"
      >
        <svg lucideChevronDown [class]="chevronClass()" [strokeWidth]="2" aria-hidden="true"></svg>
        {{ (expanded() ? hideChildrenLabel() : showChildrenLabel()).replace('{n}', '' + childCount()) }}
      </button>
    </ng-template>

    @if (confirming()) {
      <div
        role="group"
        [attr.aria-labelledby]="confirmMessageId"
        class="mb-[var(--bridges-position-padding-sm)] flex flex-wrap items-center gap-[var(--bridges-position-gap-md)] rounded-[var(--bridges-shape-figure-radius-md)] border-[length:var(--bridges-shape-figure-border-stroke-default)] border-[var(--bridges-color-accent-amber-text)] bg-[var(--bridges-color-accent-amber-bg)] px-[var(--bridges-position-padding-lg)] py-[var(--bridges-position-padding-sm)]"
        (keydown.escape)="cancelConfirm()"
        data-part="confirm"
      >
        <p
          [id]="confirmMessageId"
          class="min-w-0 flex-1 text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-primary)] [font-family:var(--bridges-shape-text-body-font)] [font-weight:var(--bridges-shape-text-label-weight)]"
        >
          {{ confirmMessage() }}
        </p>
        <div class="flex shrink-0 gap-[var(--bridges-position-gap-sm)]">
          <button socButton type="button" size="sm" variant="primary" (click)="confirm()" data-part="confirm-ok">{{ confirmLabel() }}</button>
          <button socButton type="button" size="sm" variant="secondary" (click)="cancelConfirm()" data-part="confirm-cancel">{{ cancelLabel() }}</button>
        </div>
      </div>
    }
    @if (hasChildren()) {
      <div
        role="list"
        [id]="childrenId"
        [hidden]="collapsible() && !expanded()"
        [class]="childrenClass()"
        data-part="children"
      >
        <ng-container [ngTemplateOutlet]="childrenTpl" />
      </div>
    }
  `,
})
export class SocLabsOptionRow {
  readonly label = input.required<string>();
  readonly description = input<string>();
  /** Option activée (↔). Avec `confirmMessage`, ne passe à `true` qu'après « Confirmer ». */
  readonly checked = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Pourquoi l'option est désactivée (« Activez d'abord … »), affiché sous la description. */
  readonly disabledReason = input<string>();
  /** Badge « Nouveau » (tag `information` du kit, 5,9:1). */
  readonly isNew = input(false, { transform: booleanAttribute });
  readonly newLabel = input('Nouveau');
  /** Message de la confirmation dans la ligne avant activation ; absent = activation directe. */
  readonly confirmMessage = input<string>();
  readonly confirmLabel = input('Confirmer');
  readonly cancelLabel = input('Annuler');
  /** `row` (ligne de liste, défaut) ou `tile` (tuile de catalogue). */
  readonly appearance = input<LabsOptionRowAppearance>('row');
  /** Option mise en avant (liseré + fond teinté en tuile), en plus de son tag. */
  readonly highlight = input(false, { transform: booleanAttribute });
  /** `switch` (interrupteur, défaut) ou `button` (« Activer » / « Désactiver »). */
  readonly control = input<LabsOptionRowControl>('switch');
  readonly actionLabel = input('Activer');
  readonly deactivateLabel = input('Désactiver');
  /** Sous-options repliables sous un bouton « Afficher les N sous-options ». */
  readonly collapsible = input(false, { transform: booleanAttribute });
  /** Sous-options dépliées (↔), avec `collapsible`. */
  readonly expanded = model(false);
  /** `{n}` = nombre de sous-options. */
  readonly showChildrenLabel = input('Afficher les {n} sous-options');
  readonly hideChildrenLabel = input('Masquer les {n} sous-options');

  /** Clic sur le libellé (ou, en tuile, sur la tuile) : ouvrir un panneau de détail. */
  readonly labelClick = output<void>();

  protected readonly controlId = nextLabsId('soc-labs-option-row-control');
  protected readonly confirmMessageId = nextLabsId('soc-labs-option-row-confirm');
  protected readonly childrenId = nextLabsId('soc-labs-option-row-children');
  protected readonly toggleClass = `inline-flex items-center gap-[var(--bridges-position-gap-2xs)] self-start rounded-[var(--bridges-shape-figure-radius-sm)] text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-action)] [font-family:var(--bridges-shape-text-body-font)] [font-weight:var(--bridges-shape-text-label-weight)] hover:underline ${labsFocusRing}`;

  /** État affiché par l'interrupteur : suit `checked`, sauf pendant une confirmation (activé en attente). */
  protected readonly switchOn = linkedSignal(() => this.checked());
  protected readonly confirming = signal(false);

  private readonly tags = contentChild(SocLabsOptionRowTags);
  private readonly children = contentChildren(forwardRef(() => SocLabsOptionRow));
  protected readonly hasTags = computed(() => !!this.tags());
  protected readonly hasChildren = computed(() => this.children().length > 0);
  protected readonly childCount = computed(() => this.children().length);

  protected readonly state = computed(() =>
    this.disabled() ? 'disabled' : this.confirming() ? 'confirming' : this.checked() ? 'on' : 'off',
  );

  protected readonly hostClass = computed(() => {
    const liseré = this.highlight()
      ? 'border-l-[length:calc(var(--bridges-shape-line-thick)*2)] border-l-[var(--bridges-color-accent-orange-text)]'
      : '';
    if (this.appearance() === 'tile') {
      return `relative flex min-w-0 cursor-pointer flex-col gap-[var(--bridges-position-gap-md)] rounded-[var(--bridges-shape-figure-radius-md)] border-[length:var(--bridges-shape-figure-border-stroke-default)] border-[var(--bridges-color-border-subtle)] p-[var(--bridges-position-padding-lg)] transition-colors hover:border-[var(--bridges-color-border-primary)] ${
        this.highlight() ? highlightBg : 'bg-[var(--bridges-color-surface-neutral-white)]'
      } ${liseré}`;
    }
    return `relative block min-w-0 ${this.highlight() ? `${liseré} pl-[var(--bridges-position-padding-md)]` : ''}`;
  });

  protected readonly labelClass = computed(
    () =>
      `self-start rounded-[var(--bridges-shape-figure-radius-sm)] text-left ${
        this.appearance() === 'tile' ? 'text-[length:var(--bridges-size-text-text-size-md)]' : 'text-[length:var(--bridges-size-text-text-size-sm)]'
      } text-[var(--bridges-color-text-primary)] [font-family:var(--bridges-shape-text-body-font)] [font-weight:var(--bridges-shape-text-label-weight)] hover:text-[var(--bridges-color-text-action)] hover:underline ${labsFocusRing}`,
  );

  protected readonly descriptionClass = computed(
    () =>
      `${
        this.appearance() === 'tile' ? 'line-clamp-2' : 'truncate'
      } text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-secondary)] [font-family:var(--bridges-shape-text-body-font)]`,
  );

  protected readonly chevronClass = computed(
    () => `size-[var(--bridges-size-icon-sm)] transition-transform duration-200 motion-reduce:transition-none ${this.expanded() ? 'rotate-180' : ''}`,
  );

  protected readonly childrenClass = computed(() =>
    this.appearance() === 'tile'
      ? 'cursor-default border-t-[length:var(--bridges-shape-figure-border-stroke-default)] border-[var(--bridges-color-border-subtle)] pt-[var(--bridges-position-gap-2xs)]'
      : 'ml-[var(--bridges-position-padding-lg)] border-l-[length:var(--bridges-shape-line-thick)] border-[var(--bridges-color-border-subtle)] pl-[var(--bridges-position-padding-lg)]',
  );

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** Tuile : un clic hors des contrôles ouvre le détail, comme le libellé. */
  protected onHostClick(event: MouseEvent): void {
    if (this.appearance() !== 'tile') return;
    const target = event.target as Element | null;
    if (!target || target.closest('button, a, input, label, [role="switch"], [data-part="confirm"], [data-part="children"]')) return;
    if (target.closest('soc-labs-option-row') !== this.host.nativeElement) return;
    this.labelClick.emit();
  }

  protected onToggle(on: boolean): void {
    this.switchOn.set(on);
    if (on && this.confirmMessage() && !this.checked()) {
      this.confirming.set(true);
      this.focusAfterRender('[data-part="confirm-ok"]');
      return;
    }
    this.confirming.set(false);
    this.checked.set(on);
  }

  protected confirm(): void {
    this.confirming.set(false);
    this.checked.set(true);
    this.switchOn.set(true);
    this.focusAfterRender(`#${this.controlId}`);
  }

  protected cancelConfirm(): void {
    this.confirming.set(false);
    this.switchOn.set(false);
    this.focusAfterRender(`#${this.controlId}`);
  }

  private focusAfterRender(selector: string): void {
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus(), { injector: this.injector });
  }
}
