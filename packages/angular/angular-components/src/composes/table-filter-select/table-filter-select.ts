import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, model } from '@angular/core';
import { SELECT_DEFAULT_PLACEHOLDER, SocSelect, type SelectOption } from '../select/select';

/**
 * `soc-select` locked to `mode="labelHeader"` — the compact filter style (title stacked above the
 * value inside the field, no separate label row) used for filters above a `DataTable`/`PageList`.
 * `mode` isn't exposed here on purpose, same reasoning as React: use `soc-table-filter-select` for
 * every table filter and that choice is made once, here, not re-decided at each call site.
 *
 * Same inputs as `SocSelect` otherwise (React: `Omit<SelectProps, 'mode'>`), forwarded one by one —
 * Angular has no "spread the props" equivalent for a component. Like React (which returns `Select`
 * directly), no root element of its own: host is `display: contents`.
 */
@Component({
  selector: 'soc-table-filter-select',
  standalone: true,
  imports: [SocSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'contents' },
  template: `
    <soc-select
      mode="labelHeader"
      [label]="label()"
      [required]="required()"
      [error]="error()"
      [warning]="warning()"
      [helperText]="helperText()"
      [placeholder]="placeholder()"
      [options]="options()"
      [(value)]="value"
      [defaultValue]="defaultValue()"
      [disabled]="disabled()"
      [id]="id()"
    />
  `,
  styleUrl: './table-filter-select.css',
})
export class SocTableFilterSelect {
  readonly label = input<string>();
  readonly required = input(false);
  readonly error = input(false);
  readonly warning = input(false);
  readonly helperText = input<string>();
  readonly placeholder = input(SELECT_DEFAULT_PLACEHOLDER);
  readonly options = input.required<SelectOption[]>();
  readonly value = model<string>();
  readonly defaultValue = input<string>();
  readonly disabled = input(false);
  readonly id = input<string>();
}
