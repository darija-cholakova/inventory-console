export type SortField = 'title' | 'price' | 'stock' | 'rating';
export type SortOrder = 'asc' | 'desc';

/**
 * Everything that defines the visible list. It is mirrored in the URL
 * (?q=&category=&sort=&order=&page=&size=), which is the source of truth.
 */
export interface ProductQuery {
  /** Search text; when set, category is null (the API cannot combine them). */
  q: string;
  category: string | null;
  sortBy: SortField | null;
  order: SortOrder;
  /** 1-based page number */
  page: number;
  pageSize: number;
}

/** Emitted by the table headers and the "Sort by" select. */
export interface SortChange {
  sortBy: SortField | null;
  order: SortOrder;
}

/** One entry of the "Sort by" select on small screens. */
export interface SortOption extends SortChange {
  value: string;
  label: string;
}

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export const DEFAULT_QUERY: ProductQuery = {
  q: '',
  category: null,
  sortBy: null,
  order: 'asc',
  page: 1,
  pageSize: PAGE_SIZE_OPTIONS[0],
};
