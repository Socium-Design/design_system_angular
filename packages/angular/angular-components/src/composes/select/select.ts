import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, model, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideInfo } from '@lucide/angular';
import { SocFormControl, provideFormControl } from '../../internal/form-control';
import { nextUniqueId } from '../../internal/unique-id';
import { SocPopover, SocPopoverTrigger } from '../../primitifs/popover/popover';
import { SocMenu, SocMenuItem, SocMenuItemIcon } from '../menu/menu';

export interface SelectOption {
  value: string;
  label: string;
}

export type SelectMode = 'formulaire' | 'labelHeader';

export const SELECT_DEFAULT_PLACEHOLDER = 'Select an option';

/**
 * No native HTML equivalent (label + custom trigger + popover list + helper row) — plain wrapper
 * (`soc-select`). Maps 1:1 to "Index/Selection/Select/*" tokens — see
 * packages/tokens/tokens/components/selection.json in design_system (React reference repo, read
 * only). Built on `soc-popover` + `soc-menu`, same as React.
 *
 * "formulaire" (default): label above the field. "labelHeader": no label above — `label` renders as
 * a small uppercase title inside the field, stacked above the value (compact inline filters).
 *
 * React's `value` (controlled) / `defaultValue` (uncontrolled) / `onChange` collapse to one `model()`
 * (`[(value)]`), same pattern as `Checkbox`/`Switch`; `defaultValue` is kept as its own input and
 * only used while `value` is still undefined, so an uncontrolled `defaultValue` behaves as in React
 * (first selection takes over).
 */
@Component({
  selector: 'soc-select',
  standalone: true,
  imports: [SocPopover, SocPopoverTrigger, SocMenu, SocMenuItem, SocMenuItemIcon, LucideCheck, LucideChevronDown, LucideInfo],
  providers: [provideFormControl(() => SocSelect)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // `id` is forwarded to the inner trigger button (label `for` target), like React — a static
  // `id="..."` on <soc-*> would otherwise also land on this host element as a duplicate DOM id,
  // and `<label for>` would resolve to the host (not labelable) instead of the button.
  host: { class: 'flex w-full flex-col gap-[var(--index-selection-select-label-gap)]', '[attr.id]': 'null' },
  template: `
    @if (mode() === 'formulaire' && label()) {
      <label [for]="selectId" [class]="labelClass()">
        {{ label() }}
        @if (required()) {
          <span class="text-[var(--index-selection-select-required-color)]"> *</span>
        }
      </label>
    }
    <soc-popover [matchTriggerWidth]="true" [open]="isOpen()" (openChange)="onOpenChange($event)">
      <button socPopoverTrigger type="button" [id]="selectId" [disabled]="isDisabled()" [class]="fieldClass()">
        @if (mode() === 'labelHeader') {
          <span class="flex min-w-0 flex-1 flex-col items-start">
            @if (label()) {
              <span class="w-full truncate uppercase [font-family:var(--index-selection-select-title-header-font)] [font-weight:var(--index-selection-select-title-header-weight)] text-[length:var(--index-selection-select-title-header-size)] text-[var(--index-selection-select-title-header-color)]">
                {{ label() }}
                @if (required()) {
                  <span class="text-[var(--index-selection-select-required-color)]"> *</span>
                }
              </span>
            }
            <span [class]="'w-full truncate [font-family:var(--index-selection-select-value-font)] [font-weight:var(--index-selection-select-value-weight)] text-[length:var(--index-selection-select-value-size)] ' + valueColorClass(true)">
              {{ selectedOption()?.label ?? placeholder() }}
            </span>
          </span>
        } @else {
          <span [class]="'min-w-0 flex-1 truncate [font-family:var(--index-selection-select-value-font)] [font-weight:var(--index-selection-select-value-weight)] text-[length:var(--index-selection-select-value-size)] ' + valueColorClass(false)">
            {{ selectedOption()?.label ?? placeholder() }}
          </span>
        }
        <span [class]="'size-[var(--index-selection-select-icon-field-size)] shrink-0 ' + (isDisabled() ? 'text-[var(--index-selection-select-icon-chevron-disabled)]' : 'text-[var(--index-selection-select-icon-chevron)]')">
          <svg lucideChevronDown class="size-full" [strokeWidth]="iconThickness"></svg>
        </span>
      </button>
      <soc-menu>
        @for (option of options(); track option.value) {
          <button socMenuItem [label]="option.label" (click)="selectOption(option.value)">
            @if (option.value === currentValue()) {
              <svg lucideCheck socMenuItemIcon class="size-full" [strokeWidth]="iconThickness"></svg>
            } @else {
              <span socMenuItemIcon aria-hidden="true" class="block size-full"></span>
            }
          </button>
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
})
export class SocSelect extends SocFormControl<string | undefined> {
  readonly label = input<string>();
  readonly mode = input<SelectMode>('formulaire');
  readonly required = input(false, { transform: booleanAttribute });
  readonly error = input(false, { transform: booleanAttribute });
  readonly warning = input(false, { transform: booleanAttribute });
  readonly helperText = input<string>();
  readonly placeholder = input(SELECT_DEFAULT_PLACEHOLDER);
  readonly options = input.required<SelectOption[]>();
  readonly value = model<string>();

  protected readonly valueModel = this.value;
  protected coerce(value: unknown): string | undefined {
    return value == null || value === '' ? undefined : String(value);
  }
  readonly defaultValue = input<string>();
  readonly id = input<string>();

  protected readonly iconThickness = 'var(--index-selection-select-icon-thickness)';
  protected readonly helpIconThickness = 'var(--index-selection-select-icon-help-thickness)';

  private readonly generatedId = nextUniqueId('soc-select');
  protected get selectId(): string {
    return this.id() ?? this.generatedId;
  }

  protected readonly open = signal(false);
  protected readonly isOpen = computed(() => this.open() && !this.isDisabled());

  protected readonly currentValue = computed(() => this.value() ?? this.defaultValue());
  protected readonly selectedOption = computed(() => this.options().find((option) => option.value === this.currentValue()));

  private readonly helperIsError = computed(() => this.error());
  private readonly helperIsWarning = computed(() => !this.error() && this.warning());

  protected onOpenChange(open: boolean): void {
    this.open.set(open);
    if (!open) this.onTouched();
  }

  protected selectOption(optionValue: string): void {
    this.value.set(optionValue);
    this.open.set(false);
  }

  protected readonly labelClass = computed(
    () =>
      `[font-family:var(--index-selection-select-label-font)] [font-weight:var(--index-selection-select-label-weight)] text-[length:var(--index-selection-select-label-size)] ${
        this.isDisabled() ? 'text-[var(--index-selection-select-label-disabled)]' : 'text-[var(--index-selection-select-label-color)]'
      }`,
  );

  protected readonly fieldClass = computed(() => {
    const base =
      'flex w-full items-center gap-[var(--index-selection-select-icon-gap)] rounded-[var(--index-selection-select-field-radius)] border-[length:var(--index-selection-select-field-stroke-width)] bg-[var(--index-selection-select-field-bg)] px-[var(--index-selection-select-field-pad-h)] text-left disabled:cursor-not-allowed disabled:bg-[var(--index-selection-select-field-bg-disabled)]';
    // "labelHeader" stacks two text lines (title + value) — Figma fixes that field to a flat height
    // (matching TableFilterSelect to SearchBar in a DataTable filter row) instead of letting
    // padding + the two lines' natural line-height determine it.
    const height = this.mode() === 'labelHeader' ? 'h-[var(--index-selection-select-field-height-label-header)]' : 'py-[var(--index-selection-select-field-pad-v)]';
    const stroke = this.error()
      ? 'border-[var(--index-selection-select-field-stroke-error)]'
      : this.warning()
        ? 'border-[var(--index-selection-select-field-stroke-warning)]'
        : 'border-[var(--index-selection-select-field-stroke)] hover:border-[var(--index-selection-select-field-stroke-hover)] focus-visible:border-[var(--index-selection-select-field-stroke-focus)] disabled:border-[var(--index-selection-select-field-stroke-disabled)]';
    return `${base} ${height} ${stroke}`;
  });

  // React uses a different "has value" color in labelHeader mode (label-color) than in formulaire
  // mode (value-color) — preserved as-is.
  protected valueColorClass(labelHeader: boolean): string {
    if (this.selectedOption()) {
      return labelHeader ? 'text-[var(--index-selection-select-label-color)]' : 'text-[var(--index-selection-select-value-color)]';
    }
    return this.isDisabled() ? 'text-[var(--index-selection-select-placeholder-color-disabled)]' : 'text-[var(--index-selection-select-placeholder-color)]';
  }

  protected readonly helperIconColorClass = computed(() =>
    this.helperIsError()
      ? 'text-[var(--index-selection-select-icon-help-error)]'
      : this.helperIsWarning()
        ? 'text-[var(--index-selection-select-icon-help-warning)]'
        : 'text-[var(--index-selection-select-icon-help)]',
  );

  protected readonly helperTextColorClass = computed(() =>
    this.helperIsError()
      ? 'text-[var(--index-selection-select-help-color-error)]'
      : this.helperIsWarning()
        ? 'text-[var(--index-selection-select-help-color-warning)]'
        : 'text-[var(--index-selection-select-help-color)]',
  );
}
