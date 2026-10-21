import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';

import { ProductsApi } from '../../../core/api/products-api';
import { Product, ProductQuery, ProductsPage } from '../../../shared/models/interfaces';
import { DEFAULT_QUERY } from '../utils/product-query.constants';
import { LocalChanges } from '../../../core/products/local-changes';
import { ProductsStore } from './products-store';

/** 30 products, ids 1–30; the fake API pages through them like DummyJSON. */
const CATALOG: Product[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: `Product ${i + 1}`,
  category: 'beauty',
  price: 10 + i,
  stock: 20,
  rating: 4,
  thumbnail: '',
}));

function setup() {
  const api = {
    getProducts: vi.fn((query: ProductQuery) => {
      const skip = (query.page - 1) * query.pageSize;
      return of({ items: CATALOG.slice(skip, skip + query.pageSize), total: CATALOG.length });
    }),
    getCategories: vi.fn(() => of([])),
    updateProduct: vi.fn(() => of({})),
  };

  TestBed.configureTestingModule({
    providers: [ProductsStore, { provide: ProductsApi, useValue: api }],
  });

  return {
    api,
    store: TestBed.inject(ProductsStore),
    // Real LocalChanges (sessionStorage in jsdom), so the test covers the store + local layer together
    local: TestBed.inject(LocalChanges),
  };
}

describe('ProductsStore', () => {
  beforeEach(() => sessionStorage.clear());

  it('loads a page from the server', () => {
    const { store, api } = setup();

    store.load({ ...DEFAULT_QUERY, page: 2 });

    expect(api.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 10 }),
    );
    expect(store.status()).toBe('success');
    expect(store.total()).toBe(30);
    expect(store.items().map((p) => p.id)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it('keeps the page full after a local delete and lowers the total', () => {
    const { store, api, local } = setup();
    local.markDeleted(3);

    store.load({ ...DEFAULT_QUERY, page: 2 });

    // The server still counts the deleted product, so the store fetches from the start:
    // limit = page × size + deleted = 2 × 10 + 1, and cuts page 2 itself.
    expect(api.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 21 }),
    );
    expect(store.items().map((p) => p.id)).toEqual([12, 13, 14, 15, 16, 17, 18, 19, 20, 21]);
    expect(store.total()).toBe(29);
  });

  it('applies local edits to the rows', () => {
    const { store, local } = setup();
    // Optimistic edit through the local layer (the fake PATCH succeeds)
    local.update(1, { title: 'Renamed' }).subscribe();

    store.load(DEFAULT_QUERY);

    expect(store.items()[0].title).toBe('Renamed');
  });

  it('reports an error when the request fails', () => {
    const { store, api } = setup();
    api.getProducts.mockReturnValueOnce(throwError(() => new Error('offline')));

    store.load(DEFAULT_QUERY);

    expect(store.status()).toBe('error');
  });

  describe('edge cases', () => {
    it('removes a deleted row at once, before any reload', () => {
      const { store, local } = setup();
      store.load(DEFAULT_QUERY);

      local.markDeleted(2);

      expect(store.items().map((p) => p.id)).not.toContain(2);
      expect(store.total()).toBe(29);
    });

    it('brings the row back on undo (restore)', () => {
      const { store, local } = setup();
      store.load(DEFAULT_QUERY);
      local.markDeleted(2);

      local.restore(2);

      expect(store.items().map((p) => p.id)).toContain(2);
      expect(store.total()).toBe(30);
    });

    it('counts a deletion outside the loaded range in the total (unfiltered list)', () => {
      const { store, local } = setup();
      local.markDeleted(25); // on page 3, not loaded

      store.load(DEFAULT_QUERY);

      expect(store.total()).toBe(29);
      expect(store.items()).toHaveLength(10);
    });

    it('is empty when every product on the last page is deleted', () => {
      const { store, local } = setup();
      [21, 22, 23, 24, 25, 26, 27, 28, 29, 30].forEach((id) => local.markDeleted(id));

      store.load({ ...DEFAULT_QUERY, page: 3 });

      expect(store.items()).toEqual([]);
      expect(store.total()).toBe(20);
    });

    it('never shows a product twice across pages after a delete', () => {
      const { store, local } = setup();
      local.markDeleted(5);

      store.load({ ...DEFAULT_QUERY, page: 1 });
      const page1 = store.items().map((p) => p.id);
      store.load({ ...DEFAULT_QUERY, page: 2 });
      const page2 = store.items().map((p) => p.id);

      expect(page1).toHaveLength(10);
      expect(page2).toHaveLength(10);
      expect(page1.filter((id) => page2.includes(id))).toEqual([]);
      expect([...page1, ...page2]).not.toContain(5);
    });

    it('reports an empty result (no products match)', () => {
      const { store, api } = setup();
      api.getProducts.mockReturnValueOnce(of({ items: [], total: 0 }));

      store.load({ ...DEFAULT_QUERY, q: 'nothing' });

      expect(store.isEmpty()).toBe(true);
      expect(store.status()).toBe('success');
    });

    it('keeps the current rows while the next page loads (refresh, not skeleton)', () => {
      const { store, api } = setup();
      store.load(DEFAULT_QUERY);
      const pending = new Subject<ProductsPage>();
      api.getProducts.mockReturnValueOnce(pending);

      store.load({ ...DEFAULT_QUERY, page: 2 });

      expect(store.isRefreshing()).toBe(true);
      expect(store.isInitialLoading()).toBe(false);
      expect(store.items()).toHaveLength(10);
    });

    it('ignores an older response when a newer query was sent (switchMap)', () => {
      const { store, api } = setup();
      const slow = new Subject<ProductsPage>();
      api.getProducts.mockReturnValueOnce(slow);

      store.load({ ...DEFAULT_QUERY, q: 'old' });
      store.load({ ...DEFAULT_QUERY, page: 2 });
      slow.next({ items: [CATALOG[0]], total: 1 });

      expect(store.query().page).toBe(2);
      expect(store.items()[0].id).toBe(11);
    });

    it('keeps the query after an error, so "Try again" repeats it', () => {
      const { store, api } = setup();
      api.getProducts.mockReturnValueOnce(throwError(() => new Error('offline')));
      const query = { ...DEFAULT_QUERY, q: 'phone', page: 2 };

      store.load(query);
      expect(store.status()).toBe('error');

      store.load(store.query());
      expect(store.status()).toBe('success');
      expect(api.getProducts).toHaveBeenLastCalledWith(query);
    });
  });
});
