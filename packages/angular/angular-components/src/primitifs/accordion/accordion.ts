import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, computed, contentChild, input, model } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';

/** React `Accordion`'s `rightSlot?: ReactNode` — extra content next to the label (info text, a
 * Tag, row actions, …). */
@Directive({ selector: '[socAccordionRightSlot]', standalone: true })
export class SocAccordionRightSlot {}

/**
 * No native HTML equivalent (the disclosure triangle is hand-rolled with a `<button>` + rotating
 * chevron, same as React — no `<details>`/`<summary>`) — plain wrapper (`soc-accordion`). Maps 1:1
 * to "Index/Conteneur/Accordion/*" tokens — see packages/tokens/tokens/components/conteneur.json
 * in design_system (React reference repo, read only). React's controlled-vs-uncontrolled
 * `open`/`defaultOpen` collapses to one `model()`, same reasoning as `Checkbox`/`Switch`.
 */
@Component({
  selector: 'soc-accordion',
  standalone: true,
  imports: [LucideChevronDown],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClasses()',
  },
  template: `
    <button type="button" (click)="toggle()" [attr.aria-expanded]="open()" [class]="headerClasses()">
      <span class="flex items-center gap-[var(--index-conteneur-accordion-label-group-gap)]">
        <span class="whitespace-nowrap text-[length:var(--index-conteneur-accordion-label-size)] text-[var(--index-conteneur-accordion-label-color)] [font-family:var(--index-conteneur-accordion-label-font)] [font-weight:var(--index-conteneur-accordion-label-weight)]">
          {{ label() }}
        </span>
        <ng-content select="[socAccordionRightSlot]" />
      </span>
      <span [class]="chevronClasses()">
        <svg lucideChevronDown class="size-full" [strokeWidth]="iconThickness"></svg>
      </span>
    </button>
    @if (open()) {
      <div class="w-full bg-[var(--index-conteneur-accordion-content-bg)] p-[var(--index-conteneur-accordion-content-slot-pad)] border-t-[length:var(--index-conteneur-accordion-header-stroke-width)] border-[var(--index-conteneur-accordion-content-border)]">
        <ng-content />
      </div>
    }
  `,
})
export class SocAccordion {
  readonly label = input.required<string>();
  readonly error = input(false);
  readonly warning = input(false);
  readonly open = model(false);

  protected readonly iconThickness = 'var(--index-conteneur-accordion-icon-thickness)';

  private readonly rightSlotContent = contentChild(SocAccordionRightSlot);
  protected readonly hasRightSlot = computed(() => !!this.rightSlotContent());

  protected toggle(): void {
    this.open.set(!this.open());
  }

  protected readonly hostClasses = computed(() => {
    const border = this.error()
      ? 'border-[var(--index-conteneur-accordion-header-stroke-error)]'
      : this.warning()
        ? 'border-[var(--index-conteneur-accordion-header-stroke-warning)]'
        : this.open()
          ? 'border-[var(--index-conteneur-accordion-header-stroke-open)]'
          : 'border-[var(--index-conteneur-accordion-header-stroke)] hover:border-[var(--index-conteneur-accordion-header-stroke-hover)] focus-within:border-[var(--index-conteneur-accordion-header-stroke-focus)]';
    return `w-full overflow-hidden rounded-[var(--index-conteneur-accordion-header-radius)] border-[length:var(--index-conteneur-accordion-header-stroke-width)] ${border}`;
  });

  protected readonly headerClasses = computed(() => {
    const bg = this.error()
      ? 'bg-[var(--index-conteneur-accordion-header-bg-error)]'
      : this.warning()
        ? 'bg-[var(--index-conteneur-accordion-header-bg-warning)]'
        : this.open()
          ? 'bg-[var(--index-conteneur-accordion-header-bg-open)]'
          : 'bg-[var(--index-conteneur-accordion-header-bg)] hover:bg-[var(--index-conteneur-accordion-header-bg-hover)] active:bg-[var(--index-conteneur-accordion-header-bg-pressed)]';
    return `flex w-full items-center justify-between gap-[var(--index-conteneur-accordion-label-group-gap)] px-[var(--index-conteneur-accordion-header-pad-h)] py-[var(--index-conteneur-accordion-header-pad-v)] ${bg}`;
  });

  protected readonly chevronClasses = computed(
    () =>
      `size-[var(--index-conteneur-accordion-icon-size)] shrink-0 transition-transform ${this.open() ? 'rotate-180 text-[var(--index-conteneur-accordion-icon-chevron-open)]' : 'text-[var(--index-conteneur-accordion-icon-chevron)] group-hover:text-[var(--index-conteneur-accordion-icon-chevron-hover)]'}`,
  );
}
