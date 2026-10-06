import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';

export type StepperItemStatus = 'completed' | 'current' | 'upcoming';

export interface StepperItemData {
  label: string;
  status: StepperItemStatus;
}

export type StepperOrientation = 'horizontal' | 'vertical';

/**
 * No native HTML equivalent — plain wrapper (`soc-stepper`). `items: StepperItemData[]` is plain
 * data, a straight `input()`. Maps 1:1 to "Index/Navigation/Stepper/*" tokens — see
 * packages/tokens/tokens/components/navigation.json in design_system (React reference repo, read
 * only).
 */
@Component({
  selector: 'soc-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClasses()',
  },
  template: `
    @for (item of items(); track item.label + $index; let index = $index, isLast = $last) {
      <div [class]="vertical() ? 'flex flex-col items-start' : 'flex items-center gap-[var(--index-navigation-stepper-separator-gap)]'">
        @if (index > 0 && !vertical()) {
          <span [class]="horizontalSeparatorClass(item.status)"></span>
        }
        <div class="flex items-center gap-[var(--index-navigation-stepper-circle-label-gap)]">
          <span [class]="circleClass(item.status)">{{ index + 1 }}</span>
          <span [class]="labelClass(item.status)">{{ item.label }}</span>
        </div>
        @if (vertical() && !isLast) {
          <span [class]="verticalSeparatorClass(item.status)"></span>
        }
      </div>
    }
  `,
})
export class SocStepper {
  readonly items = input.required<StepperItemData[]>();
  readonly orientation = input<StepperOrientation>('horizontal');

  protected readonly vertical = computed(() => this.orientation() === 'vertical');

  protected readonly hostClasses = computed(
    () => `flex ${this.vertical() ? 'flex-col items-start gap-0' : 'items-center gap-[var(--index-navigation-stepper-item-gap)]'}`,
  );

  private active(status: StepperItemStatus): boolean {
    return status !== 'upcoming';
  }

  protected horizontalSeparatorClass(status: StepperItemStatus): string {
    return `h-[var(--index-navigation-stepper-separator-thickness)] w-[var(--index-navigation-stepper-separator-length)] ${
      this.active(status) ? 'bg-[var(--index-navigation-stepper-separator-color-activated)]' : 'bg-[var(--index-navigation-stepper-separator-color-default)]'
    }`;
  }

  protected verticalSeparatorClass(status: StepperItemStatus): string {
    return `ml-[calc(var(--index-navigation-stepper-circle-size)/2-1px)] my-1 w-[var(--index-navigation-stepper-separator-thickness)] h-[var(--index-navigation-stepper-separator-length)] ${
      this.active(status) ? 'bg-[var(--index-navigation-stepper-separator-color-activated)]' : 'bg-[var(--index-navigation-stepper-separator-color-default)]'
    }`;
  }

  protected circleClass(status: StepperItemStatus): string {
    const base =
      'flex size-[var(--index-navigation-stepper-circle-size)] shrink-0 items-center justify-center rounded-[var(--index-navigation-stepper-circle-radius)] text-center text-[length:var(--index-navigation-stepper-font-size)] [font-family:var(--index-navigation-stepper-font-family)]';
    return `${base} ${
      this.active(status)
        ? 'bg-[var(--index-navigation-stepper-circle-bg-activated)] text-[var(--index-navigation-stepper-circle-text-activated)] [font-weight:var(--index-navigation-stepper-font-weight-activated)]'
        : 'bg-[var(--index-navigation-stepper-circle-bg-default)] text-[var(--index-navigation-stepper-circle-text-default)] [font-weight:var(--index-navigation-stepper-font-weight)]'
    }`;
  }

  protected labelClass(status: StepperItemStatus): string {
    const base = 'whitespace-nowrap text-[length:var(--index-navigation-stepper-font-size)] [font-family:var(--index-navigation-stepper-font-family)]';
    return `${base} ${
      this.active(status)
        ? 'text-[var(--index-navigation-stepper-label-activated)] [font-weight:var(--index-navigation-stepper-font-weight-activated)]'
        : 'text-[var(--index-navigation-stepper-label-default)] [font-weight:var(--index-navigation-stepper-font-weight)]'
    }`;
  }
}
