import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { SocAvatar, type AvatarColor } from '../../primitifs/avatar/avatar';

/**
 * Maps 1:1 to "Index/Données/ProfileLine/*" tokens — see packages/tokens/tokens/components/données.json
 * in design_system (React reference repo, read only). Plain wrapper (`soc-profile-line`); React's
 * root `<div className>` is this host, so a literal `class` on `<soc-profile-line>` replaces its
 * `className` prop. The avatar is always LG/solid per Figma's component notes. Meta fields not
 * passed are simply omitted from the dot-separated row rather than rendered empty.
 *
 * React's `id` prop is the displayed employee id (e.g. "#123456789"), not a DOM id — kept as `id`
 * for parity, with the host's own `id` attribute cleared so a static `id="..."` isn't also left on
 * the element as a stray DOM id.
 */
@Component({
  selector: 'soc-profile-line',
  standalone: true,
  imports: [SocAvatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex items-center gap-[var(--index-données-profileline-gap)]', '[attr.id]': 'null' },
  template: `
    <soc-avatar [label]="avatarLabel()" [color]="avatarColor()" size="lg" mode="solid" />
    <div class="flex flex-col items-start gap-[var(--index-données-profileline-text-gap)]">
      <p class="whitespace-nowrap text-[length:var(--index-données-profileline-name-size)] text-[var(--index-données-profileline-name-color)] [font-family:var(--index-données-profileline-name-font)] [font-weight:var(--index-données-profileline-name-weight)]">
        {{ name() }}
      </p>
      @if (metaItems().length > 0) {
        <div class="flex flex-wrap items-center gap-[var(--index-données-profileline-meta-gap)]">
          @for (item of metaItems(); track item; let index = $index) {
            <span class="flex items-center gap-[var(--index-données-profileline-meta-gap)]">
              @if (index > 0) {
                <span aria-hidden="true" class="inline-flex size-[var(--index-données-profileline-dot-size)] shrink-0 items-center justify-center">
                  <span class="size-1 rounded-full bg-[var(--index-données-profileline-dot-color)]"></span>
                </span>
              }
              <span class="whitespace-nowrap text-[length:var(--index-données-profileline-meta-size)] text-[var(--index-données-profileline-meta-color)] [font-family:var(--index-données-profileline-meta-font)] [font-weight:var(--index-données-profileline-meta-weight)]">
                {{ item }}
              </span>
            </span>
          }
        </div>
      }
    </div>
  `,
})
export class SocProfileLine {
  /** Initials shown in the avatar circle — 2 characters max. */
  readonly avatarLabel = input.required<string>();
  readonly avatarColor = input<AvatarColor>('blue');
  readonly name = input.required<string>();
  readonly id = input<string>();
  readonly role = input<string>();
  readonly department = input<string>();
  readonly email = input<string>();
  readonly company = input<string>();

  protected readonly metaItems = computed(() =>
    [this.id(), this.role(), this.department(), this.email(), this.company()].filter((item): item is string => Boolean(item)),
  );
}
