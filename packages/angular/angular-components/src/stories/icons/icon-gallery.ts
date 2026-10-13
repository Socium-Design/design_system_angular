import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, ViewEncapsulation, computed, inject, model, signal } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { SocSearchBar } from '../../primitifs/search-bar/search-bar';
import { SocTabs, type TabItem } from '../../primitifs/tabs/tabs';
import { KIT_ICONS } from './generated/kit-icons.generated';
import type { IconMeta, KitIcon, LibraryIcon } from './icon-types';

export type IconTab = 'kit' | 'library';
export type IconSize = 16 | 20 | 24;
export type IconColor = 'primary' | 'secondary' | 'action';

export const ICON_SIZES: IconSize[] = [16, 20, 24];

/** Kit text tokens only — no raw colour. The Tailwind class is used both on the page and in the snippet. */
export const ICON_COLORS: { id: IconColor; label: string; token: string; class: string }[] = [
  { id: 'primary', label: 'Texte principal', token: '--bridges-color-text-primary', class: 'text-[var(--bridges-color-text-primary)]' },
  { id: 'secondary', label: 'Texte secondaire', token: '--bridges-color-text-secondary', class: 'text-[var(--bridges-color-text-secondary)]' },
  { id: 'action', label: 'Primaire', token: '--bridges-color-text-action', class: 'text-[var(--bridges-color-text-action)]' },
];

/** Stroke used throughout the kit (`[strokeWidth]="1.5"`), within the 1.5–2 px rule. */
const STROKE_WIDTH = 1.5;

/** What a click on a tile copies: the import and the template line, as written in the kit's own components. */
export function iconSnippet(icon: IconMeta, size: IconSize, color: IconColor): string {
  const colorClass = ICON_COLORS.find((c) => c.id === color)!.class;
  return [
    `import { ${icon.className} } from '@lucide/angular';`,
    '',
    `<svg ${icon.selector} [size]="${size}" [strokeWidth]="${STROKE_WIDTH}" class="${colorClass}"></svg>`,
  ].join('\n');
}

const normalize = (s: string) => s.toLowerCase().replace(/[\s_-]+/g, '');

function matches(icon: IconMeta, query: string): boolean {
  if (!query) return true;
  return [icon.name, icon.className, ...icon.aliases].some((n) => normalize(n).includes(query));
}

/** Loads the full library on demand: a separate chunk, only fetched when its tab is opened. */
export const loadLucideLibrary = () => import('./generated/lucide-library.generated');

/**
 * Storybook-only page ("Fondations/Icônes") — not exported by the library. Lists the Lucide icons the kit
 * really uses (generated from the sources by scripts/generate-icons.mjs) and the whole installed library.
 */
@Component({
  selector: 'story-icon-gallery',
  standalone: true,
  imports: [LucideDynamicIcon, SocSearchBar, SocTabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'block' },
  template: `
    <div
      class="flex max-w-[1120px] flex-col gap-[var(--bridges-position-gap-xl)] text-[var(--bridges-color-text-primary)] [font-family:var(--bridges-shape-text-body-font)]"
    >
      <header class="flex flex-col gap-[var(--bridges-position-gap-sm)]">
        <h1 class="text-[length:var(--bridges-size-text-text-size-2xl)] [font-family:var(--bridges-shape-text-heading-1-font)] [font-weight:var(--bridges-shape-text-heading-1-weight)]">
          Icônes
        </h1>
        <p class="text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-secondary)]">
          Cliquez sur une icône pour copier le code à coller dans un composant Angular.
        </p>
      </header>

      <section
        aria-labelledby="icon-rules-title"
        class="flex flex-col gap-[var(--bridges-position-gap-sm)] rounded-[var(--bridges-shape-figure-radius-lg)] border-[length:var(--bridges-shape-figure-border-stroke-default)] border-[var(--bridges-color-border-subtle)] bg-[var(--bridges-color-surface-neutral-first)] px-[var(--bridges-position-padding-lg)] py-[var(--bridges-position-padding-md)] text-[length:var(--bridges-size-text-text-size-sm)]"
      >
        <h2 id="icon-rules-title" class="[font-weight:var(--bridges-shape-text-label-weight)]">Règle d'usage</h2>
        <ul class="flex list-disc flex-col gap-[var(--bridges-position-gap-xs)] pl-[var(--bridges-position-padding-lg)]">
          <li><strong>Lucide uniquement</strong> (<code>&#64;lucide/angular</code>) : pas d'autre jeu d'icônes ni de SVG maison.</li>
          <li><strong>16 px</strong> dans les boutons, <strong>20 px</strong> dans les champs, <strong>24 px</strong> pour une icône seule.</li>
          <li>Épaisseur de trait de <strong>1,5 à 2 px</strong> (<code>[strokeWidth]="1.5"</code> dans le kit).</li>
        </ul>
      </section>

      <soc-tabs [items]="tabs" [value]="tab()" (change)="selectTab($any($event))" variant="underline" />

      <div class="flex flex-wrap items-end gap-[var(--bridges-position-gap-lg)]">
        <div class="w-[320px] max-w-full">
          <soc-search-bar [(value)]="query" placeholder="Rechercher par nom (ex. : chevron, user)" />
        </div>

        <div class="flex flex-col gap-[var(--bridges-position-gap-xs)]">
          <span id="icon-size-label" class="text-[length:var(--bridges-size-text-text-size-xs)] text-[var(--bridges-color-text-secondary)]">Taille</span>
          <div role="radiogroup" aria-labelledby="icon-size-label" class="flex">
            @for (s of sizes; track s; let first = $first; let last = $last) {
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="size() === s"
                (click)="size.set(s)"
                [class]="segmentClass(size() === s, first, last)"
              >
                {{ s }} px
              </button>
            }
          </div>
        </div>

        <div class="flex flex-col gap-[var(--bridges-position-gap-xs)]">
          <span id="icon-color-label" class="text-[length:var(--bridges-size-text-text-size-xs)] text-[var(--bridges-color-text-secondary)]">Couleur</span>
          <div role="radiogroup" aria-labelledby="icon-color-label" class="flex">
            @for (c of colors; track c.id; let first = $first; let last = $last) {
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="color() === c.id"
                [title]="c.token"
                (click)="color.set(c.id)"
                [class]="segmentClass(color() === c.id, first, last)"
              >
                <span aria-hidden="true" [class]="'size-3 rounded-full bg-current ' + c.class"></span>
                {{ c.label }}
              </button>
            }
          </div>
        </div>
      </div>

      @if (tab() === 'kit') {
        <p class="text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-secondary)]">
          {{ kitResults().length }} sur {{ kitIcons.length }} icônes importées par les composants du kit (src et Labs),
          relevées automatiquement dans le code.
        </p>
        <ul class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[var(--bridges-position-gap-md)]">
          @for (icon of kitResults(); track icon.className) {
            <li>
              <button type="button" [class]="tileClass" (click)="copy(icon)" [attr.aria-label]="'Copier le code de ' + icon.className">
                <span class="flex h-6 items-center" [class]="colorClass()">
                  <svg [lucideIcon]="icon.icon" [size]="size()" [strokeWidth]="strokeWidth"></svg>
                </span>
                <span class="font-mono text-[length:var(--bridges-size-text-text-size-xs)] [font-family:var(--bridges-shape-text-code-font)]">
                  {{ icon.className }}
                </span>
                @if (icon.importedAs.length) {
                  <span class="text-[length:var(--bridges-size-text-text-size-xs)] text-[var(--bridges-color-text-tertiary)]">
                    importée sous {{ icon.importedAs.join(', ') }} (ancien nom)
                  </span>
                }
                <span class="text-[length:var(--bridges-size-text-text-size-xs)] text-[var(--bridges-color-text-secondary)]">
                  @for (c of icon.components; track c.name; let last = $last) {
                    {{ c.name }}{{ c.labs ? ' (Labs)' : '' }}{{ last ? '' : ', ' }}
                  }
                </span>
                @if (copied() === icon.className) {
                  <span aria-hidden="true" [class]="copiedBadgeClass">Copié</span>
                }
              </button>
            </li>
          } @empty {
            <li class="text-[var(--bridges-color-text-secondary)]">Aucune icône du kit ne correspond à « {{ query() }} ».</li>
          }
        </ul>
      } @else {
        @if (library(); as lib) {
          <p class="text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-secondary)]">
            {{ fr(libraryResults().length) }} sur {{ fr(lib.length) }} icônes disponibles dans
            &#64;lucide/angular {{ libraryVersion() }} (paquet installé).
          </p>
          <ul class="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-[var(--bridges-position-gap-sm)]">
            @for (icon of visibleLibrary(); track icon.className) {
              <li>
                <button type="button" [class]="tileClass" (click)="copy(icon)" [attr.aria-label]="'Copier le code de ' + icon.className" [title]="icon.className">
                  <span class="flex h-6 items-center" [class]="colorClass()">
                    <svg [lucideIcon]="icon" [size]="size()" [strokeWidth]="strokeWidth"></svg>
                  </span>
                  <span class="w-full truncate text-[length:var(--bridges-size-text-text-size-xs)] [font-family:var(--bridges-shape-text-code-font)]">
                    {{ icon.name }}
                  </span>
                  @if (copied() === icon.className) {
                    <span aria-hidden="true" [class]="copiedBadgeClass">Copié</span>
                  }
                </button>
              </li>
            } @empty {
              <li class="text-[var(--bridges-color-text-secondary)]">Aucune icône ne correspond à « {{ query() }} ».</li>
            }
          </ul>
          @if (libraryResults().length > visibleLibrary().length) {
            <button type="button" (click)="limit.set(limit() + PAGE)" [class]="moreClass">
              Afficher plus ({{ fr(libraryResults().length - visibleLibrary().length) }} restantes)
            </button>
          }
        } @else if (libraryError()) {
          <p role="alert" class="text-[var(--bridges-color-text-danger)]">La bibliothèque n'a pas pu être chargée.</p>
        } @else {
          <p class="text-[var(--bridges-color-text-secondary)]">Chargement de la bibliothèque Lucide…</p>
        }
      }

      <p aria-live="polite" class="sr-only">{{ announcement() }}</p>
    </div>
  `,
})
export class SocIconGallery implements OnInit {
  readonly tab = model<IconTab>('kit');
  readonly query = model('');
  readonly size = model<IconSize>(20);
  readonly color = model<IconColor>('primary');

  protected readonly tabs: TabItem[] = [
    { id: 'kit', label: 'Utilisées dans le kit' },
    { id: 'library', label: 'Bibliothèque Lucide' },
  ];
  protected readonly sizes = ICON_SIZES;
  protected readonly colors = ICON_COLORS;
  protected readonly strokeWidth = STROKE_WIDTH;
  protected readonly kitIcons: KitIcon[] = KIT_ICONS;
  /** Tiles rendered at once in the library tab (≈1 900 icons): the rest comes with "Afficher plus". */
  protected readonly PAGE = 300;

  protected readonly library = signal<LibraryIcon[] | null>(null);
  protected readonly libraryVersion = signal('');
  protected readonly libraryError = signal(false);
  protected readonly limit = signal(this.PAGE);
  protected readonly copied = signal<string | null>(null);
  protected readonly announcement = signal('');

  private readonly normalizedQuery = computed(() => normalize(this.query().trim()));
  protected readonly kitResults = computed(() => this.kitIcons.filter((i) => matches(i, this.normalizedQuery())));
  protected readonly libraryResults = computed(() => (this.library() ?? []).filter((i) => matches(i, this.normalizedQuery())));
  protected readonly visibleLibrary = computed(() => this.libraryResults().slice(0, this.limit()));
  protected readonly colorClass = computed(() => ICON_COLORS.find((c) => c.id === this.color())!.class);

  protected readonly tileClass =
    'relative flex h-full w-full cursor-pointer flex-col items-start gap-[var(--bridges-position-gap-sm)] rounded-[var(--bridges-shape-figure-radius-lg)] border-[length:var(--bridges-shape-figure-border-stroke-default)] border-[var(--bridges-color-border-subtle)] bg-[var(--bridges-color-surface-neutral-white)] p-[var(--bridges-position-padding-md)] text-left hover:border-[var(--bridges-color-border-tertiary)] hover:bg-[var(--bridges-color-surface-neutral-first)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bridges-color-border-focus)]';
  protected readonly copiedBadgeClass =
    'absolute right-[var(--bridges-position-padding-xs)] top-[var(--bridges-position-padding-xs)] rounded-[var(--bridges-shape-figure-radius-sm)] bg-[var(--bridges-color-surface-success-default)] px-[var(--bridges-position-padding-2xs)] text-[length:var(--bridges-size-text-text-size-xs)] text-[var(--bridges-color-text-on-success)]';
  protected readonly moreClass =
    'self-center rounded-[var(--bridges-shape-figure-radius-md)] border-[length:var(--bridges-shape-figure-border-stroke-default)] border-[var(--bridges-color-border-tertiary)] px-[var(--bridges-position-padding-lg)] py-[var(--bridges-position-padding-3xs)] text-[length:var(--bridges-size-text-text-size-sm)] hover:bg-[var(--bridges-color-surface-neutral-first)]';

  private copiedTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copiedTimer));
  }

  ngOnInit(): void {
    // A story can open straight on the library tab.
    if (this.tab() === 'library') this.loadLibrary();
  }

  protected fr(n: number): string {
    return n.toLocaleString('fr-FR');
  }

  protected segmentClass(active: boolean, first: boolean, last: boolean): string {
    return [
      'flex items-center gap-[var(--bridges-position-gap-xs)] border-[length:var(--bridges-shape-figure-border-stroke-default)] px-[var(--bridges-position-padding-sm)] py-[var(--bridges-position-padding-2xs)] text-[length:var(--bridges-size-text-text-size-sm)] focus-visible:relative focus-visible:outline-2 focus-visible:outline-[var(--bridges-color-border-focus)]',
      active
        ? 'z-[1] border-[var(--bridges-color-border-focus)] bg-[var(--bridges-color-surface-selected)]'
        : 'border-[var(--bridges-color-border-tertiary)] bg-[var(--bridges-color-surface-neutral-white)] hover:bg-[var(--bridges-color-surface-neutral-first)]',
      first ? 'rounded-l-[var(--bridges-shape-figure-radius-md)]' : '-ml-px',
      last ? 'rounded-r-[var(--bridges-shape-figure-radius-md)]' : '',
    ].join(' ');
  }

  selectTab(tab: IconTab): void {
    this.tab.set(tab);
    if (tab === 'library') this.loadLibrary();
  }

  async copy(icon: IconMeta): Promise<void> {
    await writeToClipboard(iconSnippet(icon, this.size(), this.color()));
    this.copied.set(icon.className);
    this.announcement.set(`Code de ${icon.className} copié dans le presse-papiers`);
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => {
      this.copied.set(null);
      this.announcement.set('');
    }, 1500);
  }

  private async loadLibrary(): Promise<void> {
    if (this.library()) return;
    try {
      const { LUCIDE_LIBRARY, LUCIDE_VERSION } = await loadLucideLibrary();
      this.libraryVersion.set(LUCIDE_VERSION);
      this.library.set(LUCIDE_LIBRARY);
    } catch {
      this.libraryError.set(true);
    }
  }
}

/** `navigator.clipboard` can be refused inside Storybook's iframe: fall back to a hidden textarea. */
async function writeToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
}
