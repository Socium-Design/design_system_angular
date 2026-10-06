import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';

export type AvatarColor = 'blue' | 'green' | 'purple' | 'orange';
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';
export type AvatarMode = 'soft' | 'solid';
export type AvatarNamePosition = 'left' | 'right';

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'size-[var(--index-social-avatar-size-xs)] text-[length:var(--index-social-avatar-text-size-xs)]',
  sm: 'size-[var(--index-social-avatar-size-sm)] text-[length:var(--index-social-avatar-text-size-sm)]',
  md: 'size-[var(--index-social-avatar-size-md)] text-[length:var(--index-social-avatar-text-size-md)]',
  lg: 'size-[var(--index-social-avatar-size-lg)] text-[length:var(--index-social-avatar-text-size-lg)]',
};

const colorClasses: Record<AvatarColor, Record<AvatarMode, string>> = {
  blue: {
    soft: 'bg-[var(--index-social-avatar-blue-bg)] text-[var(--index-social-avatar-blue-text)]',
    solid: 'bg-[var(--index-social-avatar-blue-text)] text-[var(--index-social-avatar-blue-bg)]',
  },
  green: {
    soft: 'bg-[var(--index-social-avatar-green-bg)] text-[var(--index-social-avatar-green-text)]',
    solid: 'bg-[var(--index-social-avatar-green-text)] text-[var(--index-social-avatar-green-bg)]',
  },
  purple: {
    soft: 'bg-[var(--index-social-avatar-purple-bg)] text-[var(--index-social-avatar-purple-text)]',
    solid: 'bg-[var(--index-social-avatar-purple-text)] text-[var(--index-social-avatar-purple-bg)]',
  },
  orange: {
    soft: 'bg-[var(--index-social-avatar-orange-bg)] text-[var(--index-social-avatar-orange-text)]',
    solid: 'bg-[var(--index-social-avatar-orange-text)] text-[var(--index-social-avatar-orange-bg)]',
  },
};

/**
 * No native HTML equivalent and no single element being wrapped — plain standalone wrapper
 * component (`soc-avatar` element selector), not an attribute selector. `label`/`name`/`subtitle`
 * are all plain strings (not ReactNode in the React source), so plain `input()`s, no content
 * projection needed.
 *
 * Maps 1:1 to "Index/Social/Avatar/*" tokens — see packages/tokens/tokens/components/social.json
 * in design_system (React reference repo, read only). Only the "initials" type is implemented —
 * React `Avatar.tsx`'s own doc comment: a photo is a plain image-filled frame, a generic icon is a
 * bare Lucide icon, neither goes through this component.
 */
@Component({
  selector: 'soc-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClasses()',
  },
  template: `
    @if (name() && namePosition() === 'left') {
      <span class="flex flex-col items-start gap-[var(--index-social-avatar-text-gap)] whitespace-nowrap">
        <span class="text-[length:var(--index-social-avatar-label-size)] text-[var(--index-social-avatar-label-color)] [font-family:var(--index-social-avatar-label-font)] [font-weight:var(--index-social-avatar-label-weight)]">
          {{ name() }}
        </span>
        @if (subtitle()) {
          <span class="text-[length:var(--index-social-avatar-subtitle-size)] text-[var(--index-social-avatar-subtitle-color)] [font-family:var(--index-social-avatar-subtitle-font)] [font-weight:var(--index-social-avatar-subtitle-weight)]">
            {{ subtitle() }}
          </span>
        }
      </span>
    }
    <span [class]="circleClass()">{{ label() }}</span>
    @if (name() && namePosition() === 'right') {
      <span class="flex flex-col items-start gap-[var(--index-social-avatar-text-gap)] whitespace-nowrap">
        <span class="text-[length:var(--index-social-avatar-label-size)] text-[var(--index-social-avatar-label-color)] [font-family:var(--index-social-avatar-label-font)] [font-weight:var(--index-social-avatar-label-weight)]">
          {{ name() }}
        </span>
        @if (subtitle()) {
          <span class="text-[length:var(--index-social-avatar-subtitle-size)] text-[var(--index-social-avatar-subtitle-color)] [font-family:var(--index-social-avatar-subtitle-font)] [font-weight:var(--index-social-avatar-subtitle-weight)]">
            {{ subtitle() }}
          </span>
        }
      </span>
    }
  `,
})
export class SocAvatar {
  readonly label = input.required<string>();
  readonly color = input<AvatarColor>('blue');
  readonly size = input<AvatarSize>('md');
  readonly mode = input<AvatarMode>('soft');
  readonly name = input<string>();
  readonly subtitle = input<string>();
  readonly namePosition = input<AvatarNamePosition>('right');

  // React only adds `inline-flex items-center gap-[...]` on the outer wrapper when `name` is
  // given — without it, the wrapper carries no layout classes of its own, just the circle.
  protected readonly hostClasses = computed(() => (this.name() ? 'inline-flex items-center gap-[var(--index-social-avatar-group-gap)]' : ''));

  protected readonly circleClass = computed(
    () =>
      `inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[var(--index-social-avatar-radius)] [font-family:var(--index-social-avatar-text-font)] [font-weight:var(--index-social-avatar-text-weight)] ${sizeClasses[this.size()]} ${colorClasses[this.color()][this.mode()]}`,
  );
}
