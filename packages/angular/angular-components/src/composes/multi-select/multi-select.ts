import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, output } from '@angular/core';
import { LucideChevronDown, LucideInfo } from '@lucide/angular';
import { nextUniqueId } from '../../internal/unique-id';
import { SocInputChip } from '../../primitifs/chips/chips';
import { SocPopover, SocPopoverTrigger } from '../../primitifs/popover/popover';
import { SocMenu, SocMenuItem } from '../menu/menu';

export interface MultiSelectOption {
  value: string;
  label: string;
}

/**
 * Maps 1:1 to "Index/Selection/Select/*" tokens for the field box (Multi-select has no dedicated
 * field tokens of its own — its Figma dependency is Select + Chips) plus "Index/Selection/Chips/*"
 * (type=Input) for the selected-value tags — see packages/tokens/tokens/components/selection.json
 * in design_system (React reference repo, read only). Plain wrapper (`soc-multi-select`) built on
 * `soc-popover` + `soc-menu` (checkbox mode), same as React.
 *
 * `value`/`onChange` are both required in React (purely controlled, no internal fallback) — plain
 * `input()` + `output()` (`valueChange`), not `model()`, same as `RadioButton`/`SideNavigation`;
 * `[(value)]` two-way binding still works on such a pair.
 */
@Component({
  selector: 'soc-multi-select',
  standalone: true,
  imports: [SocPopover, SocPopoverTrigger, SocMenu, SocMenuItem, SocInputChip, LucideChevronDown, LucideInfo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // `id` is forwarded to the inner trigger button (label `for` target), like React — a static
  // `id="..."` on <soc-*> would otherwise also land on this host element as a duplicate DOM id,
  // and `<label for>` would resolve to the host (not labelable) instead of the button.
  host: { class: 'flex w-full flex-col gap-[var(--index-selection-select-label-gap)]', '[attr.id]': 'null' },
  template: `
    @if (label()) {
      <label [for]="fieldId" [class]="labelClass()">
        {{ label() }}
        @if (required()) {
          <span class="text-[var(--index-selection-select-required-color)]"> *</span>
        }
      </label>
    }
    <soc-popover [matchTriggerWidth]="true">
      <button socPopoverTrigger type="button" [id]="fieldId" [disabled]="disabled()" [class]="fieldClass()">
        @if (value().length === 0) {
          <span class="text-[length:var(--index-selection-select-value-size)] text-[var(--index-selection-select-placeholder-color)]">
            {{ placeholder() }}
          </span>
        }
        @for (option of selectedOptions(); track option.value) {
          <soc-input-chip [label]="option.label" [removable]="true" (remove)="toggle(option.value)" />
        }
        <span class="ml-auto size-[var(--index-selection-select-icon-field-size)] shrink-0 text-[var(--index-selection-select-icon-chevron)]">
          <svg lucideChevronDown class="size-full" [strokeWidth]="iconThickness"></svg>
        </span>
      </button>
      <soc-menu class="min-w-[var(--index-selection-select-field-radius)]">
        @for (option of options(); track option.value) {
          <button socMenuItem [label]="option.label" mode="checkbox" [checked]="value().includes(option.value)" (click)="toggle(option.value)"></button>
        }
      </soc-menu>
    </soc-popover>
    @if (helperText()) {
      <div class="flex items-center gap-[var(--index-selection-select-helper-gap)]">
        <span [class]="'size-[var(--index-selection-select-icon-help-size)] shrink-0 ' + helperIconColorClass()">
          <svg lucideInfo class="size-full" [strokeWidth]="helpIconThickness"></svg>
        </span>
        <span [class]="'[font-family:var(--index-selection-select-help-font)] [font-weight:var(--index-selection-select-help-weight)] text-[length:var(--index-selection-select-help-size)] ' + helperTextColorClass()">
          {{ helperText() }}
        </span>
      </div>
    }
  `,
  styleUrl: './multi-select.css',
})
export class SocMultiSelect {
  readonly label = input<string>();
  readonly required = input(false);
  readonly error = input(false);
  readonly warning = input(false);
  readonly helperText = input<string>();
  readonly placeholder = input('Select options');
  readonly options = input.required<MultiSelectOption[]>();
  readonly value = input.required<string[]>();
  readonly valueChange = output<string[]>();
  readonly disabled = input(false);
  readonly id = input<string>();

  protected readonly iconThickness = 'var(--index-selection-select-icon-thickness)';
  protected readonly helpIconThickness = 'var(--index-selection-select-icon-help-thickness)';

  private readonly generatedId = nextUniqueId('soc-multi-select');
  protected get fieldId(): string {
    return this.id() ?? this.generatedId;
  }

  protected readonly selectedOptions = computed(() => this.options().filter((option) => this.value().includes(option.value)));

  protected toggle(optionValue: string): void {
    const current = this.value();
    this.valueChange.emit(current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue]);
  }

  protected readonly labelClass = computed(
    () =>
      `[font-family:var(--index-selection-select-label-font)] [font-weight:var(--index-selection-select-label-weight)] text-[length:var(--index-selection-select-label-size)] ${
        this.disabled() ? 'text-[var(--index-selection-select-label-disabled)]' : 'text-[var(--index-selection-select-label-color)]'
      }`,
  );

  protected readonly fieldClass = computed(() => {
    const base =
      'flex w-full flex-wrap items-center gap-1.5 rounded-[var(--index-selection-select-field-radius)] border-[length:var(--index-selection-select-field-stroke-width)] bg-[var(--index-selection-select-field-bg)] px-[var(--index-selection-select-field-pad-h)] py-[var(--index-selection-select-field-pad-v)] text-left disabled:cursor-not-allowed disabled:bg-[var(--index-selection-select-field-bg-disabled)]';
    const stroke = this.error()
      ? 'border-[var(--index-selection-select-field-stroke-error)]'
      : this.warning()
        ? 'border-[var(--index-selection-select-field-stroke-warning)]'
        : 'border-[var(--index-selection-select-field-stroke)] hover:border-[var(--index-selection-select-field-stroke-hover)] focus-visible:border-[var(--index-selection-select-field-stroke-focus)] disabled:border-[var(--index-selection-select-field-stroke-disabled)]';
    return `${base} ${stroke}`;
  });

  protected readonly helperIconColorClass = computed(() =>
    this.error()
      ? 'text-[var(--index-selection-select-icon-help-error)]'
      : this.warning()
        ? 'text-[var(--index-selection-select-icon-help-warning)]'
        : 'text-[var(--index-selection-select-icon-help)]',
  );

  protected readonly helperTextColorClass = computed(() =>
    this.error()
      ? 'text-[var(--index-selection-select-help-color-error)]'
      : this.warning()
        ? 'text-[var(--index-selection-select-help-color-warning)]'
        : 'text-[var(--index-selection-select-help-color)]',
  );
}
