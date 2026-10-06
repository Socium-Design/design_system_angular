import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { SocPopover, SocPopoverTrigger } from '../../primitifs/popover/popover';
import { SocMenu, SocMenuItem } from '../menu/menu';

export interface EnterpriseOption {
  value: string;
  company: string;
  subsidiary: string;
  /** Small trailing meta, e.g. a subsidiary index like "1/12". */
  count?: string;
}

/**
 * Maps 1:1 to "Index/Selection/Select/enterprise-*" tokens — a distinct always-dark trigger for
 * switching between companies/subsidiaries (used in HeaderApp), not a form field. Plain wrapper
 * (`soc-enterprise-select`) built on `soc-popover` + `soc-menu`, same as React. `value`/
 * `defaultValue`/`onChange` -> one `model()` (see `LanguageSelect`); React's `className` targets
 * the trigger button, exposed as `triggerClass` for the same reason (no root element of its own).
 */
@Component({
  selector: 'soc-enterprise-select',
  standalone: true,
  imports: [SocPopover, SocPopoverTrigger, SocMenu, SocMenuItem, LucideChevronDown],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'contents' },
  template: `
    <soc-popover [(open)]="open" panelClass="w-[400px]">
      <!-- justify-between: the chevron must stay flush with the button's right edge and the
           ValueGroup flush with its left edge — a fixed gap would leave slack after the chevron
           whenever the content is narrower than the button's fixed width (matches the current
           Figma spec — see HeaderApp node 439:1253). -->
      <button socPopoverTrigger type="button" [class]="triggerClasses()">
        <span class="flex items-center gap-[var(--index-selection-select-enterprise-gap)] whitespace-nowrap">
          <!-- enterprise-text-color is bound to Bridges/Color/Text/primary in Figma — a
               theme-following (dark-on-light) role — but this trigger's background is always dark,
               and the canvas actually renders it with the mode-invariant "on-primary" light text,
               the same role SideNavigation already uses for its own always-dark chrome. Using
               that here instead of the literal (mismatched) token. -->
          <span class="text-[var(--bridges-color-text-on-primary)]">{{ current()?.company }} - {{ current()?.subsidiary }}</span>
          @if (current()?.count) {
            <span class="text-[var(--index-selection-select-enterprise-meta-color)]">{{ current()?.count }}</span>
          }
        </span>
        <span class="size-4 shrink-0 text-[var(--index-selection-select-enterprise-chevron-color)]">
          <svg lucideChevronDown class="size-full" [strokeWidth]="1.5"></svg>
        </span>
      </button>
      <soc-menu>
        @for (option of options(); track option.value) {
          <button socMenuItem [label]="option.company + ' - ' + option.subsidiary" (click)="selectOption(option.value)"></button>
        }
      </soc-menu>
    </soc-popover>
  `,
  styleUrl: './enterprise-select.css',
})
export class SocEnterpriseSelect {
  readonly options = input.required<EnterpriseOption[]>();
  readonly value = model<string>();
  readonly defaultValue = input<string>();
  readonly triggerClass = input<string>();

  protected readonly open = signal(false);

  private readonly currentValue = computed(() => this.value() ?? this.defaultValue() ?? this.options()[0]?.value);
  protected readonly current = computed(() => this.options().find((option) => option.value === this.currentValue()) ?? this.options()[0]);

  protected readonly triggerClasses = computed(
    () =>
      `flex w-[400px] items-center justify-between rounded-[var(--index-selection-select-enterprise-radius)] bg-[var(--index-selection-select-enterprise-bg)] px-[var(--index-selection-select-enterprise-pad-h)] py-[var(--index-selection-select-enterprise-pad-v)] text-left text-[length:var(--index-selection-select-enterprise-size)] [font-family:var(--index-selection-select-enterprise-font)] [font-weight:var(--index-selection-select-enterprise-weight)] ${this.triggerClass() ?? ''}`,
  );

  protected selectOption(next: string): void {
    this.value.set(next);
    this.open.set(false);
  }
}
