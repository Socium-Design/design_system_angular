import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input } from '@angular/core';

/**
 * Real vector glyphs exported from the Figma "AppIcon" component (Index/Navigation/AppIcon), one
 * per named app. Fill colors mirror the exact bindings used on the Figma instances: Default ->
 * Index/Button/Button/icon-default, Hover -> Index/Navigation/AppIcon/icon-hover, Selected -> a
 * mix of Index/Navigation/AppIcon/icon-selected (white parts) and icon-accent (green parts, same
 * token for every app including BAAS). Path data ported verbatim from design_system (React)'s own
 * appIcons.tsx — read-only reference, not re-derived.
 */
export type AppIconName = 'workspace' | 'job' | 'workflow' | 'performance' | 'doc' | 'payroll' | 'time' | 'baas';

const DEFAULT_HOVER_CLASS = 'fill-[var(--index-button-button-icon-default)] group-hover:fill-[var(--index-navigation-appicon-icon-hover)]';
const SELECTED_WHITE_CLASS = 'fill-[var(--index-navigation-appicon-icon-selected)]';
const SELECTED_ACCENT_CLASS = 'fill-[var(--index-navigation-appicon-icon-accent)]';

/**
 * Renders one named glyph via a `@switch`, each shape's fill picked by `selected()` + whether that
 * particular shape is an "accent" one — same three-class logic as React's own `renderShapes`
 * helper, just inlined per shape here instead of mapped over a shape-description array (Angular
 * templates can't easily interpolate arbitrary SVG element types — `<path>` vs `<circle>` vs
 * `<ellipse>` — the way a single JS `.map()` callback can, so this stays closer to hand-written SVG
 * markup per icon rather than porting `renderShapes`/`GlyphShape` as data).
 */
@Component({
  selector: 'soc-app-icon-glyph',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @switch (name()) {
      @case ('workspace') {
        <svg viewBox="0 0 21.2731 18" width="18" height="15" fill="none">
          <path
            d="M10.6367 10.6367C8.37743 10.6367 6.54599 13.3836 6.5459 16.7725C6.5459 17.3119 6.59255 17.7107 6.67969 18H3.27246L0 8.52637L10.6367 0V10.6367Z"
            [class]="shapeClass(false)"
          />
          <path
            d="M21.2731 8.52637L17.9996 18H14.5934C14.6805 17.7107 14.7272 17.3118 14.7272 16.7725C14.7271 13.4897 13.0086 10.8092 10.8473 10.6445L10.6364 10.6367V0L21.2731 8.52637Z"
            [class]="shapeClass(true)"
          />
        </svg>
      }
      @case ('job') {
        <svg viewBox="0 0 22.3981 24.1707" width="17" height="18" fill="none">
          <circle cx="17.2417" cy="12.0855" r="5.1564" transform="rotate(90 17.2417 12.0855)" [class]="shapeClass(true)" />
          <circle cx="5.1564" cy="5.1564" r="5.1564" transform="rotate(90 5.1564 5.1564)" [class]="shapeClass(false)" />
          <ellipse cx="5.1564" cy="19.0546" rx="5.11611" ry="5.1564" transform="rotate(90 5.1564 19.0546)" [class]="shapeClass(false)" />
        </svg>
      }
      @case ('workflow') {
        <svg viewBox="0 0 22.4788 19.4979" width="18" height="16" fill="none">
          <path d="M5.3212 14.0191L22.4788 14.0191V19.4977H0.000157928L5.3212 14.0191Z" [class]="shapeClass(true)" />
          <path d="M17.1576 5.47867L-3.57628e-07 5.47867V1.41561e-07H22.4787L17.1576 5.47867Z" [class]="shapeClass(false)" />
          <path d="M9.10442 9.34601L0.000157928 19.4977H9.10442V9.34601Z" [class]="shapeClass(true)" />
          <path d="M13.3744 10.1517L22.4787 7.77245e-05H13.3744V10.1517Z" [class]="shapeClass(false)" />
        </svg>
      }
      @case ('doc') {
        <svg viewBox="0 0 22.4787 16.5168" width="18" height="13" fill="none">
          <path d="M2.90049 6.20392H19.5782V10.3129H2.90049V6.20392Z" [class]="shapeClass(true)" />
          <path d="M0 0H22.4787L19.5427 4.109H2.84424L0 0Z" [class]="shapeClass(false)" />
          <path d="M22.4787 16.5168L4.36381e-05 16.5168L2.93603 12.4078L19.5427 12.4078L22.4787 16.5168Z" [class]="shapeClass(false)" />
        </svg>
      }
      @case ('payroll') {
        <svg viewBox="0 0 22.4453 20.2226" width="18" height="16" fill="none">
          <path d="M22.4453 4.55176V9.10449L11.2227 4.55176L0 9.10449V4.55176L11.2227 0L22.4453 4.55176Z" [class]="shapeClass(false)" />
          <path d="M22.4453 15.6709V11.1181L11.2227 15.6709L0 11.1181V15.6709L11.2227 20.2226L22.4453 15.6709Z" [class]="shapeClass(true)" />
        </svg>
      }
      @case ('time') {
        <svg viewBox="0 0 22.2725 23.2642" width="17" height="18" fill="none">
          <path d="M11.136 9.97038L16.8575 19.9408H5.41444L11.136 9.97038Z" [class]="shapeClass(false)" />
          <path d="M11.1359 9.97038L16.8574 2.79397e-07H5.41439L11.1359 9.97038Z" [class]="shapeClass(false)" />
          <path
            d="M11.1357 9.97043L2.96777 18.0945L0 7.01926L11.1357 9.97043ZM22.2725 12.9216L11.1357 9.97043L19.3047 1.8464L22.2725 12.9216Z"
            [class]="shapeClass(true)"
          />
        </svg>
      }
      @case ('baas') {
        <svg viewBox="0 0 13.2133 23.2642" width="10" height="18" fill="none">
          <path d="M6.60663 9.97041L12.3281 19.9408H0.885115L6.60663 9.97041Z" [class]="shapeClass(false)" />
          <path d="M6.60658 9.97041L12.3281 3.46117e-05H0.885064L6.60658 9.97041Z" [class]="shapeClass(true)" />
        </svg>
      }
      @case ('performance') {
        <!-- Two overlapping groups in Figma (a small diamond above a mountain/zigzag base)
             recomposed into one viewBox — matches React's own comment. -->
        <svg viewBox="0 0 22.3175 20.789" width="18" height="17" fill="none">
          <g transform="translate(6.5366, 0)">
            <path d="M4.62231 8.13802e-05V9.27594L0 4.65362L4.62231 8.13802e-05Z" [class]="shapeClass(true)" />
            <path d="M9.24435 4.65354L4.62204 9.27585V0L9.24435 4.65354Z" [class]="shapeClass(false)" />
          </g>
          <g transform="translate(0, 10.476)">
            <path d="M4.27014 1.6276e-05L0 10.3128H11.1588V1.6276e-05H4.27014Z" [class]="shapeClass(false)" />
            <path d="M18.0473 0L22.3175 10.3128H11.1587V0H18.0473Z" [class]="shapeClass(true)" />
          </g>
        </svg>
      }
    }
  `,
})
export class SocAppIconGlyph {
  readonly name = input.required<AppIconName>();
  readonly selected = input(false, { transform: booleanAttribute });

  protected shapeClass(accent: boolean): string {
    if (!this.selected()) return DEFAULT_HOVER_CLASS;
    return accent ? SELECTED_ACCENT_CLASS : SELECTED_WHITE_CLASS;
  }
}

/** Real vector mark exported from the Figma "Logo" node (rendered above the icon list in
 * AppSwitch). Ported verbatim from React's own `SwitchLogo`. */
@Component({
  selector: 'soc-switch-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <svg viewBox="0 0 25.3047 25.3047" width="25" height="25" fill="none">
      <path
        d="M20.998 22.1582C18.7705 24.1153 15.8513 25.3044 12.6533 25.3047C9.45499 25.3047 6.53531 24.1154 4.30762 22.1582H20.998ZM22.8867 5.21777C23.659 6.27899 24.2695 7.46504 24.6846 8.73926H4.40234C4.07164 9.43435 3.82615 10.1776 3.67969 10.9561H24.3916V10.957H25.1895C25.2639 11.5115 25.3047 12.0774 25.3047 12.6523C25.3046 15.4311 24.4064 17.9996 22.8877 20.0869H2.41699C1.6449 19.0257 1.03401 17.8397 0.619141 16.5654H20.9023C21.2146 15.9092 21.4499 15.2098 21.5986 14.4785H0.133789C0.0473588 13.8822 2.18098e-05 13.2726 0 12.6523C8.48653e-05 9.87329 0.898986 7.30516 2.41797 5.21777H22.8867ZM12.6533 0C15.8871 0.000250383 18.8365 1.21554 21.0732 3.21191H4.23242C6.46928 1.21546 9.41923 0 12.6533 0Z"
        fill="var(--index-navigation-appswitch-logo-color)"
      />
    </svg>
  `,
})
export class SocSwitchLogo {}
