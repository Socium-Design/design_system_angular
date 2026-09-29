import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { LucideFileText } from '@lucide/angular';

/**
 * No native HTML equivalent — plain wrapper (`soc-document-line`). All three props are plain
 * strings in React (`title`/`date`/`fileSize`), no ReactNode anywhere, so plain `input()`s, no
 * content projection. The file icon is self-drawn (`LucideFileText`), same as React's own
 * `<FileText />` — not a consumer-supplied slot.
 *
 * Maps 1:1 to "Index/Données/DocumentLine/*" tokens — see packages/tokens/tokens/components/données.json
 * in design_system (React reference repo, read only).
 */
@Component({
  selector: 'soc-document-line',
  standalone: true,
  imports: [LucideFileText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'flex items-center gap-[var(--index-données-documentline-gap)]',
  },
  template: `
    <div class="flex size-[var(--index-données-documentline-icon-size)] shrink-0 items-center justify-center rounded bg-[var(--bridges-color-surface-neutral-first)] text-[var(--bridges-color-icon-secondary)]">
      <svg lucideFileText class="size-1/2" [strokeWidth]="1.5"></svg>
    </div>
    <div class="flex flex-col gap-[var(--index-données-documentline-text-gap)]">
      <p class="whitespace-nowrap text-[length:var(--index-données-documentline-title-size)] text-[var(--index-données-documentline-title-color)] [font-family:var(--index-données-documentline-title-font)] [font-weight:var(--index-données-documentline-title-weight)]">
        {{ title() }}
      </p>
      <div class="flex items-center gap-[var(--index-données-documentline-meta-gap)]">
        <p class="whitespace-nowrap text-[length:var(--index-données-documentline-meta-size)] text-[var(--index-données-documentline-meta-color)] [font-family:var(--index-données-documentline-meta-font)] [font-weight:var(--index-données-documentline-meta-weight)]">
          {{ date() }}
        </p>
        <span class="h-3 w-px shrink-0 bg-[var(--index-données-documentline-separator-color)]"></span>
        <p class="whitespace-nowrap text-[length:var(--index-données-documentline-meta-size)] text-[var(--index-données-documentline-meta-color)] [font-family:var(--index-données-documentline-meta-font)] [font-weight:var(--index-données-documentline-meta-weight)]">
          {{ fileSize() }}
        </p>
      </div>
    </div>
  `,
  styleUrl: './document-line.css',
})
export class SocDocumentLine {
  readonly title = input.required<string>();
  readonly date = input.required<string>();
  readonly fileSize = input.required<string>();
}
