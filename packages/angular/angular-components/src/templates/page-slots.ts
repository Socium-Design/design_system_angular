import { Directive } from '@angular/core';

/**
 * Content-slot markers shared by the page templates (`PageList`, `PageDetails`, `PageForm`,
 * `PageProfile`, `PageHome`) — React's `ReactNode` props (`breadcrumb`, `badge`, `actions`, `tabs`, …)
 * become named `<ng-content>` slots, selected by these attributes. One set for all templates: the same
 * slot reads the same everywhere (`<soc-breadcrumb socPageBreadcrumb>`, `<div socPageActions>`), and
 * each template simply ignores the markers it has no slot for. The default (unnamed) slot is always
 * React's `children`.
 */
@Directive({ selector: '[socPageBreadcrumb]', standalone: true })
export class SocPageBreadcrumb {}

/** Secondary tab row above the page header (`PageList`) — typically a pill `soc-tabs`. */
@Directive({ selector: '[socPageSecondaryTabs]', standalone: true })
export class SocPageSecondaryTabs {}

/** Badge next to the title (`PageList`, `PageDetails`). */
@Directive({ selector: '[socPageBadge]', standalone: true })
export class SocPageBadge {}

/** Tag next to the title (`PageDetails`, `PageProfile`). */
@Directive({ selector: '[socPageTag]', standalone: true })
export class SocPageTag {}

/** Buttons rendered top-right of the header (`PageList`, `PageDetails`) or under the form (`PageForm`). */
@Directive({ selector: '[socPageActions]', standalone: true })
export class SocPageActions {}

/** Tab row below the header — typically a `soc-tabs`. */
@Directive({ selector: '[socPageTabs]', standalone: true })
export class SocPageTabs {}

/** Identity block (`PageProfile`) — typically a `soc-profile-line`. */
@Directive({ selector: '[socPageHeader]', standalone: true })
export class SocPageHeader {}

/** Stepper zone (`PageForm`). */
@Directive({ selector: '[socPageStepper]', standalone: true })
export class SocPageStepper {}

/** Message zone (`PageForm`, `PageProfile`) — typically a `soc-message`. */
@Directive({ selector: '[socPageMessage]', standalone: true })
export class SocPageMessage {}

/** Second content block with its own section title (`PageForm`). */
@Directive({ selector: '[socPageSecondContent]', standalone: true })
export class SocPageSecondContent {}

/** Buttons next to the section title (`PageHome`). */
@Directive({ selector: '[socPageSectionActions]', standalone: true })
export class SocPageSectionActions {}
