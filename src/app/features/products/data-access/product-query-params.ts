import { Params } from '@angular/router';

import { DEFAULT_QUERY, PAGE_SIZE_OPTIONS } from '../utils/product-query.constants';
import { ProductQuery } from '../../../shared/models/interfaces';
import { SortField, SortOrder } from '../../../shared/models/types';

const SORT_FIELDS: readonly SortField[] = ['title', 'price', 'stock', 'rating'];

/** Reads the list query from URL params; anything invalid falls back to the default. */
export function queryFromParams(params: Params): ProductQuery {
  const q = typeof params['q'] === 'string' ? params['q'].trim() : '';
  const sort = params['sort'] as SortField;
  const size = Number(params['size']);
  const page = Number(params['page']);

  return {
    q,
    // Search and category are exclusive: a search ignores the category
    category: !q && params['category'] ? String(params['category']) : null,
    sortBy: SORT_FIELDS.includes(sort) ? sort : null,
    order: (params['order'] as SortOrder) === 'desc' ? 'desc' : 'asc',
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_QUERY.page,
    pageSize: (PAGE_SIZE_OPTIONS as readonly number[]).includes(size)
      ? size
      : DEFAULT_QUERY.pageSize,
  };
}

/** Writes only non-default values, so URLs stay short and shareable. */
export function paramsFromQuery(query: ProductQuery): Params {
  return {
    q: query.q || null,
    category: query.category,
    sort: query.sortBy,
    order: query.sortBy && query.order === 'desc' ? 'desc' : null,
    page: query.page > 1 ? query.page : null,
    size: query.pageSize !== DEFAULT_QUERY.pageSize ? query.pageSize : null,
  };
}
