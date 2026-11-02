import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { SocLabsTag, type LabsTagColor } from '../tag/tag';

/** Ton d'un événement : couleur de sa pastille et de son tag (tags du kit + neutre). */
export type LabsTimelineTone = 'success' | 'warning' | 'information' | 'error' | 'neutral';

export interface LabsTimelineDetail {
  label: string;
  value: string;
}

export interface LabsTimelineEvent {
  id: string;
  /** Libellé de l'événement, affiché dans un tag (« Ajout validé »). */
  label: string;
  tone: LabsTimelineTone;
  /** Date déjà formatée (« 16/10/2026 · 10:38 »). */
  date: string;
  author?: string;
  /** Rôle de l'auteur (« Admin RH »). */
  role?: string;
  /** Motif saisi, affiché entre guillemets en italique. */
  reason?: string;
  details?: LabsTimelineDetail[];
}

export interface LabsTimelineLegendItem {
  tone: LabsTimelineTone;
  label: string;
  description?: string;
}

const dotClasses: Record<LabsTimelineTone, string> = {
  success: 'bg-[var(--bridges-color-icon-success)]',
  warning: 'bg-[var(--bridges-color-icon-warning)]',
  information: 'bg-[var(--bridges-color-icon-info)]',
  error: 'bg-[var(--bridges-color-icon-danger)]',
  neutral: 'bg-[var(--bridges-color-icon-secondary)]',
};

const tagColors: Record<LabsTimelineTone, LabsTagColor> = {
  success: 'success',
  warning: 'warning',
  information: 'information',
  error: 'error',
  neutral: 'neutral',
};

const text = '[font-family:var(--bridges-shape-text-body-font)] text-[length:var(--bridges-size-text-text-size-sm)]';

/**
 * ## Rôle
 * Chronologie verticale d'événements (historique d'un objet) : pastille de couleur sur une ligne
 * verticale, tag de l'événement, date, « Par {auteur} · {rôle} », motif et paires libellé / valeur.
 * Légende optionnelle au-dessus (couleur → signification).
 *
 * ## Accessibilité
 * Liste ordonnée (`<ol>`), chaque événement est un `<li>` ; les pastilles sont décoratives (le sens est
 * porté par le texte du tag). Détails en liste de définitions (`<dl>`). Textes en couleur primaire /
 * secondaire du kit (contraste ≥ 4,5:1).
 */
@Component({
  selector: 'soc-labs-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [SocLabsTag],
  host: { class: 'flex flex-col gap-[var(--bridges-position-gap-lg)]' },
  template: `
    @if (legend().length) {
      <ul [attr.aria-label]="legendLabel()" class="flex flex-wrap gap-x-[var(--bridges-position-gap-xl)] gap-y-[var(--bridges-position-gap-xs)]">
        @for (item of legend(); track item.label) {
          <li [class]="legendItemClass">
            <span aria-hidden="true" [class]="dotClass(item.tone)"></span>
            <span>{{ item.label }}@if (item.description) { — {{ item.description }}}</span>
          </li>
        }
      </ul>
    }
    @if (events().length === 0) {
      <p [class]="secondaryText">{{ emptyText() }}</p>
    } @else {
      <ol class="flex flex-col">
        @for (event of events(); track event.id; let last = $last) {
          <li [attr.data-event]="event.id" class="relative flex gap-[var(--bridges-position-gap-md)] pb-[var(--bridges-position-padding-lg)]">
            @if (!last) {
              <span aria-hidden="true" class="absolute left-[calc(var(--bridges-size-icon-2xs)/2)] top-[var(--bridges-position-padding-sm)] bottom-0 w-[length:var(--bridges-shape-line-default)] -translate-x-1/2 bg-[var(--bridges-color-border-subtle)]"></span>
            }
            <span aria-hidden="true" [class]="dotClass(event.tone) + ' mt-[var(--bridges-position-padding-xs)]'"></span>
            <div class="flex min-w-0 flex-col gap-[var(--bridges-position-gap-xs)]">
              <div class="flex flex-wrap items-center gap-[var(--bridges-position-gap-sm)]">
                <soc-labs-tag [color]="tagColor(event.tone)">{{ event.label }}</soc-labs-tag>
                <span [class]="secondaryText">{{ event.date }}</span>
              </div>
              @if (event.author) {
                <p [class]="secondaryText">
                  Par <strong class="text-[var(--bridges-color-text-primary)] [font-weight:var(--bridges-shape-text-label-weight)]">{{ event.author }}</strong>@if (event.role) { · {{ event.role }}}
                </p>
              }
              @if (event.reason) {
                <p [class]="secondaryText + ' italic'">Motif : « {{ event.reason }} »</p>
              }
              @if (event.details?.length) {
                <dl class="grid grid-cols-[auto_1fr] gap-x-[var(--bridges-position-gap-xl)] gap-y-[var(--bridges-position-gap-xs)]">
                  @for (detail of event.details; track detail.label) {
                    <dt [class]="primaryText + ' [font-weight:var(--bridges-shape-text-label-weight)]'">{{ detail.label }}</dt>
                    <dd [class]="primaryText">{{ detail.value }}</dd>
                  }
                </dl>
              }
            </div>
          </li>
        }
      </ol>
    }
  `,
})
export class SocLabsTimeline {
  readonly events = input.required<LabsTimelineEvent[]>();
  readonly legend = input<LabsTimelineLegendItem[]>([]);
  readonly legendLabel = input('Légende');
  readonly emptyText = input('Aucun événement.');

  protected readonly primaryText = `${text} text-[var(--bridges-color-text-primary)]`;
  protected readonly secondaryText = `${text} text-[var(--bridges-color-text-secondary)]`;
  protected readonly legendItemClass = `flex items-center gap-[var(--bridges-position-gap-xs)] ${text} text-[var(--bridges-color-text-secondary)]`;

  protected dotClass(tone: LabsTimelineTone): string {
    return `inline-block shrink-0 size-[var(--bridges-size-icon-2xs)] rounded-[var(--bridges-shape-figure-radius-full)] ${dotClasses[tone]}`;
  }

  protected tagColor(tone: LabsTimelineTone): LabsTagColor {
    return tagColors[tone];
  }
}
