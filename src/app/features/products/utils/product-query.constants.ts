import { ProductQuery } from '../../../shared/models/interfaces';

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export const DEFAULT_QUERY: ProductQuery = {
  q: '',
  category: null,
  sortBy: null,
  order: 'asc',
  page: 1,
  pageSize: PAGE_SIZE_OPTIONS[0],
};
