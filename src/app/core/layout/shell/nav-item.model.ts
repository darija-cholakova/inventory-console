export interface NavItem {
  label: string;
  path: string;
  /** Material Symbols ligature name */
  icon: string;
  /** Optional count shown next to the label, e.g. bookmarked products. */
  count?: () => number;
  /** What the count means, for screen readers ("3 products"). */
  countLabel?: string;
}
