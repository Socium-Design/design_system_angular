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
import { SocButton, SocSwitch, SocTag } from '@socium-design/angular-components';
import { labsFocusRing } from '../internal/classes';
import { SocLabsSwitchHiddenLabel } from '../switch-hidden-label/switch-hidden-label';
import { nextLabsId } from '../internal/unique-id';

/** Tags de la ligne (offre : `soc-tag` du kit ou `soc-labs-tag`), alignés à droite. */
@Directive({ selector: '[socLabsOptionRowTags]', standalone: true })
export class SocLabsOptionRowTags {}

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
 */
@Component({
  selector: 'soc-labs-option-row',
  standalone: true,
  imports: [SocSwitch, SocLabsSwitchHiddenLabel, SocTag, SocButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'relative block min-w-0',
    role: 'listitem',
    '[attr.data-state]': 'state()',
    '[attr.title]': 'null',
  },
  template: `
    <div class="flex min-w-0 items-start gap-[var(--bridges-position-gap-md)] py-[var(--bridges-position-padding-sm)]" data-part="row">
      <div class="shrink-0 pt-[var(--bridges-position-gap-2xs)]" data-part="switch">
        <soc-switch socLabsSwitchHiddenLabel [id]="switchId" [label]="label()" [checked]="switchOn()" [disabled]="disabled()" (checkedChange)="onToggle($event)" />
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-[var(--bridges-position-gap-2xs)]">
        <button type="button" aria-haspopup="dialog" [class]="labelClass" (click)="labelClick.emit()" data-part="label">
          {{ label() }}
        </button>
        @if (description()) {
          <p
            class="truncate text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-secondary)] [font-family:var(--bridges-shape-text-body-font)]"
            data-part="description"
          >
            {{ description() }}
          </p>
        }
        @if (disabled() && disabledReason()) {
          <p
            class="text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-secondary)] [font-family:var(--bridges-shape-text-body-font)] italic"
            data-part="disabled-reason"
          >
            {{ disabledReason() }}
          </p>
        }
      </div>
      @if (hasTags() || isNew()) {
        <div class="flex shrink-0 flex-wrap items-center justify-end gap-[var(--bridges-position-gap-sm)] pt-[var(--bridges-position-gap-2xs)]" data-part="tags">
          @if (isNew()) {
            <soc-tag color="information" data-part="new">{{ newLabel() }}</soc-tag>
          }
          <ng-content select="[socLabsOptionRowTags]" />
        </div>
      }
    </div>
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
        class="ml-[var(--bridges-position-padding-lg)] border-l-[length:var(--bridges-shape-line-thick)] border-[var(--bridges-color-border-subtle)] pl-[var(--bridges-position-padding-lg)]"
        data-part="children"
      >
        <ng-content />
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

  /** Clic sur le libellé (ouvrir un panneau de détail). */
  readonly labelClick = output<void>();

  protected readonly switchId = nextLabsId('soc-labs-option-row-switch');
  protected readonly confirmMessageId = nextLabsId('soc-labs-option-row-confirm');
  protected readonly labelClass = `self-start rounded-[var(--bridges-shape-figure-radius-sm)] text-left text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-primary)] [font-family:var(--bridges-shape-text-body-font)] [font-weight:var(--bridges-shape-text-label-weight)] hover:text-[var(--bridges-color-text-action)] hover:underline ${labsFocusRing}`;

  /** État affiché par l'interrupteur : suit `checked`, sauf pendant une confirmation (activé en attente). */
  protected readonly switchOn = linkedSignal(() => this.checked());
  protected readonly confirming = signal(false);

  private readonly tags = contentChild(SocLabsOptionRowTags);
  private readonly children = contentChildren(forwardRef(() => SocLabsOptionRow));
  protected readonly hasTags = computed(() => !!this.tags());
  protected readonly hasChildren = computed(() => this.children().length > 0);

  protected readonly state = computed(() =>
    this.disabled() ? 'disabled' : this.confirming() ? 'confirming' : this.checked() ? 'on' : 'off',
  );

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

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
    this.focusAfterRender(`#${this.switchId}`);
  }

  protected cancelConfirm(): void {
    this.confirming.set(false);
    this.switchOn.set(false);
    this.focusAfterRender(`#${this.switchId}`);
  }

  private focusAfterRender(selector: string): void {
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus(), { injector: this.injector });
  }
}
