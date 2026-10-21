import { DEFAULT_QUERY } from '../utils/product-query.constants';
import { paramsFromQuery, queryFromParams } from './product-query-params';

describe('product list URL params', () => {
  it('reads a full query from the URL', () => {
    expect(
      queryFromParams({ q: ' phone ', sort: 'price', order: 'desc', page: '2', size: '25' }),
    ).toEqual({
      q: 'phone',
      category: null,
      sortBy: 'price',
      order: 'desc',
      page: 2,
      pageSize: 25,
    });
  });

  it('falls back to defaults for invalid values (hand-edited or old links)', () => {
    expect(queryFromParams({ sort: 'hack', order: 'up', page: '-3', size: '7' })).toEqual(
      DEFAULT_QUERY,
    );
    expect(queryFromParams({ page: 'abc' }).page).toBe(1);
    expect(queryFromParams({ page: '1.5' }).page).toBe(1);
  });

  it('ignores the category when there is a search (the API cannot combine them)', () => {
    expect(queryFromParams({ q: 'red', category: 'beauty' }).category).toBeNull();
    expect(queryFromParams({ category: 'beauty' }).category).toBe('beauty');
  });

  it('treats a search of only spaces as no search', () => {
    expect(queryFromParams({ q: '   ' }).q).toBe('');
  });

  it('writes only non-default values, so URLs stay short', () => {
    expect(paramsFromQuery(DEFAULT_QUERY)).toEqual({
      q: null,
      category: null,
      sort: null,
      order: null,
      page: null,
      size: null,
    });
    // "asc" is the default order, so it is left out
    expect(
      paramsFromQuery({ ...DEFAULT_QUERY, sortBy: 'title', order: 'asc' })['order'],
    ).toBeNull();
  });

  it('round-trips: URL → query → URL', () => {
    const query = { ...DEFAULT_QUERY, category: 'beauty', sortBy: 'stock' as const, page: 3 };
    expect(queryFromParams(paramsFromQuery(query))).toEqual(query);
  });
});
