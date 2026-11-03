import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, model } from '@angular/core';
import { LucideTriangleAlert } from '@lucide/angular';
import { SocAvatar, SocMultiSelect, SocTabs, type MultiSelectOption, type TabItem } from '@socium-design/angular-components';
import { nextLabsId } from '../internal/unique-id';

/** Un mode de ciblage (un onglet) : ses options et le libellé du champ de sélection. */
export interface LabsPopulationMode {
  id: string;
  /** Libellé de l'onglet (« Personne nommée »). */
  label: string;
  /** Libellé du champ de sélection multiple (« Employés »). */
  fieldLabel: string;
  placeholder?: string;
  /** Phrase sous les onglets qui explique le mode (« Les sous-structures sont incluses. »). */
  hint?: string;
  options: MultiSelectOption[];
}

/** Une personne de l'aperçu « N employé(s) concerné(s) ». */
export interface LabsPopulationPerson {
  id: string;
  initials: string;
  name: string;
  /** Deuxième ligne (structure, poste…). */
  subtitle?: string;
}

const text = '[font-family:var(--bridges-shape-text-body-font)] text-[length:var(--bridges-size-text-text-size-sm)]';

/**
 * ## Rôle
 * Champ « population » à onglets : on cible des personnes **d'une seule façon à la fois** (personnes
 * nommées, structures, postes…), puis on voit en direct qui est concerné. Les modes sont des données :
 * le composant n'en connaît aucun. Changer d'onglet **vide la sélection** (un seul mode actif).
 *
 * Présentationnel : la page calcule `people` (la population résolue, périmètre de l'utilisateur
 * appliqué) à partir de `mode` et `value`. Sans sélection, l'aperçu est masqué ; avec une sélection qui
 * ne donne personne, `emptyText` s'affiche dans l'aperçu.
 *
 * Compose les composants du kit : `soc-tabs` (pilule), `soc-multi-select`, `soc-avatar`.
 *
 * ## Accessibilité
 * `<fieldset>` + `<legend>` (= `label`, astérisque si `required`). Le compteur est une région
 * `aria-live="polite"` : la mise à jour de la population est annoncée. L'avertissement est relié au
 * champ par `aria-describedby` sur le groupe.
 */
@Component({
  selector: 'soc-labs-population-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [SocTabs, SocMultiSelect, SocAvatar, LucideTriangleAlert],
  host: { class: 'block' },
  template: `
    <fieldset class="flex min-w-0 flex-col gap-[var(--bridges-position-gap-sm)]" [attr.aria-describedby]="warning() ? warningId : null">
      <legend [class]="legendClass">
        {{ label() }}
        @if (required()) {
          <span aria-hidden="true" class="text-[var(--bridges-color-text-danger)]">*</span>
          <span class="sr-only">(obligatoire)</span>
        }
      </legend>
      @if (description()) {
        <p [class]="secondaryText">{{ description() }}</p>
      }
      <soc-tabs variant="pill" [items]="tabs()" [value]="mode()" (change)="selectMode($event)" [attr.aria-label]="label()" />
      @if (activeMode()?.hint) {
        <p [class]="secondaryText">{{ activeMode()!.hint }}</p>
      }
      @if (activeMode(); as m) {
        <soc-multi-select
          [label]="m.fieldLabel"
          [placeholder]="m.placeholder ?? 'Sélectionner'"
          [options]="m.options"
          [value]="value()"
          (valueChange)="value.set($event)"
          [error]="error()"
        />
      }
      @if (warning()) {
        <p [id]="warningId" [class]="warningClass">
          <svg lucideTriangleAlert aria-hidden="true" class="mt-[2px] shrink-0 size-[var(--bridges-size-icon-xs)]"></svg>
          <span>{{ warning() }}</span>
        </p>
      }
      @if (value().length > 0) {
        <section
          data-preview
          class="flex flex-col gap-[var(--bridges-position-gap-md)] rounded-[var(--bridges-shape-figure-radius-md)] border-[length:var(--bridges-shape-line-default)] border-[var(--bridges-color-border-subtle)] bg-[var(--bridges-color-background-layer-1)] p-[var(--bridges-position-padding-md)]"
        >
          <p aria-live="polite" data-count [class]="countClass">{{ countLabel()(people().length) }}</p>
          @if (people().length === 0) {
            <p data-empty [class]="emptyClass">{{ emptyText() }}</p>
          } @else {
            <ul class="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-[var(--bridges-position-gap-md)]">
              @for (person of people(); track person.id) {
                <li [attr.data-person]="person.id">
                  <soc-avatar size="sm" [label]="person.initials" [name]="person.name" [subtitle]="person.subtitle" />
                </li>
              }
            </ul>
          }
        </section>
      }
    </fieldset>
  `,
})
export class SocLabsPopulationPicker {
  readonly label = input.required<string>();
  readonly description = input<string>();
  readonly required = input(false, { transform: booleanAttribute });
  readonly modes = input.required<LabsPopulationMode[]>();
  /** Onglet actif (id d'un mode). */
  readonly mode = model.required<string>();
  /** Valeurs sélectionnées dans le mode actif. */
  readonly value = model<string[]>([]);
  /** Population résolue, calculée par la page. */
  readonly people = input<LabsPopulationPerson[]>([]);
  readonly warning = input<string>();
  readonly error = input(false, { transform: booleanAttribute });
  readonly countLabel = input<(count: number) => string>((n) => `${n} employé(s) concerné(s)`);
  readonly emptyText = input('Aucune personne ne correspond à cette sélection.');

  protected readonly warningId = nextLabsId('population-warning');
  protected readonly tabs = computed<TabItem[]>(() => this.modes().map((m) => ({ id: m.id, label: m.label })));
  protected readonly activeMode = computed(() => this.modes().find((m) => m.id === this.mode()));

  protected readonly legendClass = `mb-[var(--bridges-position-gap-xs)] ${text} text-[var(--bridges-color-text-primary)] [font-weight:var(--bridges-shape-text-label-weight)]`;
  protected readonly secondaryText = `${text} text-[var(--bridges-color-text-secondary)]`;
  protected readonly countClass = `${text} text-[var(--bridges-color-text-primary)] [font-weight:var(--bridges-shape-text-label-weight)]`;
  protected readonly warningClass = `flex items-start gap-[var(--bridges-position-gap-xs)] ${text} text-[var(--bridges-color-text-warning)]`;
  protected readonly emptyClass = `${text} text-[var(--bridges-color-text-danger)]`;

  /** Changer d'onglet vide la sélection : un seul mode de ciblage à la fois. */
  protected selectMode(id: string): void {
    if (id === this.mode()) return;
    this.mode.set(id);
    this.value.set([]);
  }
}
