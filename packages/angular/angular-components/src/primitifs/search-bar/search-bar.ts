import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, input, model, output, viewChild } from '@angular/core';
import { LucideSearch, LucideX } from '@lucide/angular';

/** Same structural GAP-DECISION as InputText — its outer element is a `<div>` with a sibling icon
 * before and a sibling clear button after the `<input>`, not the `<input>` itself, so an attribute
 * selector on `<input>` alone couldn't render them (see InputText's own docstring for the full
 * reasoning; not repeated here). Wrapper component (`soc-search-bar`) instead.
 *
 * Maps 1:1 to "Index/Input/SearchBar/*" tokens — see packages/tokens/tokens/components/input.json
 * in design_system (React reference repo, read only). No fixed height of its own on purpose, same
 * as React — see that file's own doc comment: Figma gives this field a different flat height per
 * usage context, so each consumer applies its own height token via `class` rather than this
 * component picking one to hardcode.
 */
@Component({
  selector: 'soc-search-bar',
  standalone: true,
  imports: [LucideSearch, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class:
      'group flex w-full items-center gap-[var(--index-input-searchbar-icon-gap)] rounded-[var(--index-input-searchbar-field-radius)] border-[length:var(--index-input-searchbar-field-stroke-width)] border-[var(--index-input-searchbar-field-stroke)] bg-[var(--index-input-searchbar-field-bg)] px-[var(--index-input-searchbar-field-pad-h)] py-[var(--index-input-searchbar-field-pad-v)] hover:border-[var(--index-input-searchbar-field-stroke-hover)] has-[:focus]:border-[var(--index-input-searchbar-field-stroke-focus)]',
  },
  template: `
    <span class="size-4 shrink-0 text-[var(--index-input-searchbar-icon-search)] group-has-[:focus]:text-[var(--index-input-searchbar-icon-search-focus)]">
      <svg lucideSearch class="size-full" [strokeWidth]="iconThickness"></svg>
    </span>
    <input
      #inputEl
      type="text"
      [placeholder]="placeholder()"
      [value]="value()"
      (input)="value.set($any($event.target).value)"
      class="w-full min-w-0 flex-1 bg-transparent text-[var(--index-input-searchbar-value-color)] outline-none placeholder:text-[var(--index-input-searchbar-placeholder-color)] [font-family:var(--index-input-searchbar-value-font-family)] [font-weight:var(--index-input-searchbar-value-font-weight)] text-[length:var(--index-input-searchbar-value-font-size)]"
    />
    @if (hasValue()) {
      <button type="button" (click)="handleClear()" aria-label="Effacer la recherche" class="size-4 shrink-0 text-[var(--index-input-searchbar-icon-clear)]">
        <svg lucideX class="size-full" [strokeWidth]="iconThickness"></svg>
      </button>
    }
  `,
})
export class SocSearchBar {
  readonly placeholder = input('Rechercher...');
  readonly value = model('');
  readonly clear = output<void>();

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputEl');
  protected readonly iconThickness = 'var(--index-input-searchbar-icon-thickness)';
  protected readonly hasValue = computed(() => this.value().length > 0);

  protected handleClear(): void {
    this.value.set('');
    this.clear.emit();
    this.inputRef()?.nativeElement.focus();
  }
}
