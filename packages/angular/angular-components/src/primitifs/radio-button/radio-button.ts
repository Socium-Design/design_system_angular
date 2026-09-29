import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, output } from '@angular/core';

/** Same structural GAP-DECISION as Checkbox — see that component's own docstring, not repeated
 * here. Maps 1:1 to "Index/Contrôleur/Radio/*" tokens — see
 * packages/tokens/tokens/components/contrôleur.json in design_system (React reference repo, read
 * only). Unlike Checkbox/Switch, React's `RadioButton` has no internal `useState`/`defaultSelected`
 * at all — purely controlled (`selected` prop + `onSelect` callback) — so this is a plain
 * `input()` + `output()` pair, no `model()`/uncontrolled-fallback needed.
 */
@Component({
  selector: 'soc-radio-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <label [for]="id()" [class]="hostClass()">
      <button
        [id]="id()"
        type="button"
        role="radio"
        [name]="name()"
        [attr.aria-checked]="selected()"
        [disabled]="disabled()"
        (click)="handleClick()"
        [class]="buttonClass()"
      >
        @if (selected()) {
          <span [class]="dotClass()"></span>
        }
      </button>
      @if (label()) {
        <span class="text-[var(--bridges-color-text-primary)]">{{ label() }}</span>
      }
    </label>
  `,
  styleUrl: './radio-button.css',
})
export class SocRadioButton {
  readonly selected = input(false);
  readonly disabled = input(false);
  readonly label = input<string>();
  readonly name = input<string>();
  readonly id = input<string>();
  readonly select = output<void>();

  protected handleClick(): void {
    if (!this.disabled()) this.select.emit();
  }

  protected readonly hostClass = computed(() => `inline-flex items-center gap-2 ${this.disabled() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`);

  protected readonly buttonClass = computed(() => {
    const base = 'group flex size-[var(--index-contrôleur-radio-size)] shrink-0 items-center justify-center rounded-full border-[length:var(--index-contrôleur-radio-stroke-weight)] transition-colors disabled:cursor-not-allowed';
    if (this.disabled()) {
      return `${base} ${this.selected() ? 'border-[var(--index-contrôleur-radio-dot-selected-disabled)]' : 'border-[var(--index-contrôleur-radio-dot-disabled)]'}`;
    }
    return `${base} ${
      this.selected()
        ? 'border-[var(--index-contrôleur-radio-dot-selected)] hover:border-[var(--index-contrôleur-radio-dot-selected-hover)] active:border-[var(--index-contrôleur-radio-dot-selected-pressed)]'
        : 'border-[var(--index-contrôleur-radio-dot-default)] hover:border-[var(--index-contrôleur-radio-dot-hover)] active:border-[var(--index-contrôleur-radio-dot-pressed)]'
    }`;
  });

  protected readonly dotClass = computed(
    () =>
      `size-[var(--index-contrôleur-radio-dot-size)] rounded-full transition-colors ${
        this.disabled()
          ? 'bg-[var(--index-contrôleur-radio-dot-selected-disabled)]'
          : 'bg-[var(--index-contrôleur-radio-dot-selected)] group-hover:bg-[var(--index-contrôleur-radio-dot-selected-hover)] group-active:bg-[var(--index-contrôleur-radio-dot-selected-pressed)]'
      }`,
  );
}
