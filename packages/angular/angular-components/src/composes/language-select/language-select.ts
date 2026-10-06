import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { SocPopover, SocPopoverTrigger } from '../../primitifs/popover/popover';
import { SocMenu, SocMenuItem } from '../menu/menu';

export interface LanguageOption {
  value: string;
  label: string;
}

/**
 * Sélecteur de langue toujours affiché dans `HeaderApp` — un déclencheur compact (ex. "EN" +
 * chevron) qui ouvre un menu contextuel de choix. Plain wrapper (`soc-language-select`), built on
 * `soc-popover` + `soc-menu` like React. Uses `Index/Selection/Select/field-light-*` tokens (white
 * text/border) since it sits on HeaderApp's always-dark background.
 *
 * React's `value`/`defaultValue`/`onChange` collapse to one `model()` (`[(value)]`), same pattern
 * as `Select`; the fallback chain `defaultValue ?? options[0]` is kept. React's `className` targets
 * the *trigger button* (this component has no root element of its own — `Popover` is a fragment),
 * so it can't be a plain `class` on `<soc-language-select>`: exposed as `triggerClass` instead.
 */
@Component({
  selector: 'soc-language-select',
  standalone: true,
  imports: [SocPopover, SocPopoverTrigger, SocMenu, SocMenuItem, LucideChevronDown],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'contents' },
  template: `
    <soc-popover [(open)]="open">
      <button socPopoverTrigger type="button" [class]="triggerClasses()">
        <!-- Grid stack: every option's label shares the same cell, so the track's intrinsic width
             is the widest option — not just the currently selected one. Sizes to content (no
             hardcoded width), never truncates, and picking a shorter/longer option never shifts
             the trigger's width since the reserved space already accounts for all of them. -->
        <span class="grid">
          @for (option of options(); track option.value) {
            <span
              [attr.aria-hidden]="option.value !== current()?.value"
              [class]="'[grid-area:1/1] whitespace-nowrap [font-family:var(--index-selection-select-value-font)] [font-weight:var(--index-selection-select-value-weight)] text-[length:var(--index-selection-select-value-size)] text-[var(--index-selection-select-value-light-color)] ' + (option.value === current()?.value ? '' : 'invisible')"
            >
              {{ option.label }}
            </span>
          }
        </span>
        <span class="size-[18px] shrink-0 text-[var(--index-selection-select-icon-light-chevron)]">
          <svg lucideChevronDown class="size-full" [strokeWidth]="iconThickness"></svg>
        </span>
      </button>
      <soc-menu>
        @for (option of options(); track option.value) {
          <button socMenuItem [label]="option.label" (click)="selectOption(option.value)"></button>
        }
      </soc-menu>
    </soc-popover>
  `,
})
export class SocLanguageSelect {
  readonly options = input.required<LanguageOption[]>();
  readonly value = model<string>();
  readonly defaultValue = input<string>();
  readonly triggerClass = input<string>();

  protected readonly iconThickness = 'var(--index-selection-select-icon-thickness)';
  protected readonly open = signal(false);

  private readonly currentValue = computed(() => this.value() ?? this.defaultValue() ?? this.options()[0]?.value);
  protected readonly current = computed(() => this.options().find((option) => option.value === this.currentValue()) ?? this.options()[0]);

  protected readonly triggerClasses = computed(
    () =>
      `flex w-fit items-center gap-[var(--index-selection-select-icon-gap)] rounded-[var(--index-selection-select-field-radius)] border-[length:var(--index-selection-select-field-stroke-width)] border-[var(--index-selection-select-field-light-stroke)] px-[var(--index-selection-select-field-pad-h)] py-[var(--index-selection-select-field-pad-v)] text-left ${this.triggerClass() ?? ''}`,
  );

  protected selectOption(next: string): void {
    this.value.set(next);
    this.open.set(false);
  }
}
