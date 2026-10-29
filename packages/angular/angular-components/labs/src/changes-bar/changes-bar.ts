import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, output } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import { SocButton } from '@socium-design/angular-components';

/**
 * ## Rôle
 * Barre **fixe en bas** de la zone de contenu pour une page qui n'applique pas ses changements tout de suite
 * (page de réglages) : « N modifications non enregistrées », « Annuler », « Enregistrer ». Après
 * l'enregistrement, `saved` affiche « Enregistré ✓ » à la place, sans boutons.
 *
 * ## Visibilité
 * Rendue seulement quand `count > 0` ou `saved` : rien à afficher sinon (l'hôte est vide). C'est le parent
 * qui remet `saved` à `false` (après quelques secondes, ou à la modification suivante).
 *
 * ## Mise en page
 * `position: sticky; bottom: 0` : placer `soc-labs-changes-bar` en **dernier enfant** du conteneur qui défile
 * (la zone de contenu du shell) — elle reste visible en bas pendant le défilement et ne masque jamais la fin
 * du contenu. Fond blanc, filet en haut. Les templates de page du kit (`soc-page-list`, `soc-page-details`…) donnent à
 * ce conteneur un padding-bottom fixe de 120px, qui réduit la zone de collage : `insetBottom` (120px par défaut) le
 * compense pour que la barre touche le bas de l'écran. Hors de ces templates, passer `insetBottom="0px"`.
 *
 * ## Accessibilité
 * `role="region"` nommée (`ariaLabel`, « Modifications non enregistrées » par défaut). Le message est dans une
 * zone `aria-live="polite"` toujours présente (masquée visuellement, hors de la barre qui apparaît et disparaît) : le nombre de modifications puis « Enregistré » sont annoncés sans déplacer le
 * focus. Boutons du kit (`secondary` / `primary`).
 */
@Component({
  selector: 'soc-labs-changes-bar',
  standalone: true,
  imports: [SocButton, LucideCheck],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'sticky z-10 block',
    '[style.bottom]': '"calc(-1 * " + insetBottom() + ")"',
    '[attr.data-state]': 'state()',
  },
  template: `
    <p class="sr-only" aria-live="polite" data-part="live">{{ announcement() }}</p>
    <div role="region" [attr.aria-label]="ariaLabel()" [class]="barClass()">
      <p
        class="flex min-w-0 flex-1 items-center gap-[var(--bridges-position-gap-xs)] text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-primary)] [font-family:var(--bridges-shape-text-body-font)] [font-weight:var(--bridges-shape-text-label-weight)]"
        data-part="message"
      >
        @if (state() === 'saved') {
          <svg lucideCheck class="size-[var(--bridges-size-icon-sm)] shrink-0 text-[var(--bridges-color-text-success)]" aria-hidden="true"></svg>
          {{ savedLabel() }}
        } @else if (state() === 'dirty') {
          {{ message() }}
        }
      </p>
      @if (state() === 'dirty') {
        <div class="flex shrink-0 gap-[var(--bridges-position-gap-sm)]">
          <button socButton type="button" variant="secondary" (click)="cancel.emit()" data-part="cancel">{{ cancelLabel() }}</button>
          <button socButton type="button" variant="primary" [disabled]="saving()" (click)="save.emit()" data-part="save">{{ saveLabel() }}</button>
        </div>
      }
    </div>
  `,
})
export class SocLabsChangesBar {
  /** Nombre de modifications non enregistrées. */
  readonly count = input(0);
  /** Affiche « Enregistré ✓ » (prioritaire sur `count`). */
  readonly saved = input(false, { transform: booleanAttribute });
  /** Désactive « Enregistrer » pendant l'enregistrement. */
  readonly saving = input(false, { transform: booleanAttribute });
  readonly saveLabel = input('Enregistrer');
  readonly cancelLabel = input('Annuler');
  readonly savedLabel = input('Enregistré');
  readonly ariaLabel = input('Modifications non enregistrées');
  /** Padding-bottom du conteneur qui défile, à compenser (120px fixes dans les templates `soc-page-*` du kit). */
  readonly insetBottom = input('120px');
  /** Remplace le message par défaut (« 1 modification non enregistrée », « N modifications non enregistrées »). */
  readonly label = input<string>();

  readonly save = output<void>();
  readonly cancel = output<void>();

  protected readonly state = computed<'saved' | 'dirty' | 'idle'>(() =>
    this.saved() ? 'saved' : this.count() > 0 ? 'dirty' : 'idle',
  );

  protected readonly message = computed(() => {
    const n = this.count();
    return this.label() ?? (n > 1 ? `${n} modifications non enregistrées` : `${n} modification non enregistrée`);
  });

  protected readonly announcement = computed(() =>
    this.state() === 'saved' ? this.savedLabel() : this.state() === 'dirty' ? this.message() : '',
  );

  protected readonly barClass = computed(
    () =>
      `${this.state() === 'idle' ? 'hidden' : 'flex'} min-h-[calc(var(--bridges-size-icon-lg)*2)] flex-wrap items-center gap-[var(--bridges-position-gap-md)] border-t-[length:var(--bridges-shape-figure-border-stroke-default)] border-[var(--bridges-color-border-subtle)] bg-[var(--bridges-color-surface-neutral-white)] px-[var(--bridges-position-padding-xl)] py-[var(--bridges-position-padding-md)]`,
  );
}
