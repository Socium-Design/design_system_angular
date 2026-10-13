import type { LucideIcon, LucideIconData } from '@lucide/angular';

export interface IconMeta {
  /** Lucide name (kebab-case), e.g. `house`. */
  name: string;
  /** Exported class to import, e.g. `LucideHouse`. */
  className: string;
  /** Attribute selector, e.g. `lucideHouse` (`<svg lucideHouse>`). */
  selector: string;
  /** Former names still accepted by Lucide (searchable). */
  aliases: string[];
}

export interface KitIcon extends IconMeta {
  icon: LucideIcon;
  /** Deprecated aliases the kit imports this icon under (e.g. `LucideMoreHorizontal` for `LucideEllipsis`). */
  importedAs: string[];
  components: { name: string; labs: boolean }[];
}

export interface LibraryIcon extends IconMeta {
  node: LucideIconData['node'];
}
