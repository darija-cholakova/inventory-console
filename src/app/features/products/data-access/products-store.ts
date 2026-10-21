import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, pipe, switchMap, tap } from 'rxjs';

import { Category, Product } from '../models/product.model';
import { DEFAULT_QUERY, ProductQuery } from '../models/product-query.model';
import { LocalChanges } from './local-changes';
import { ProductsApi } from './products-api';

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

interface ProductsState {
  query: ProductQuery;
  /** Page as the server returned it; local edits and deletions are applied on top. */
  serverItems: Product[];
  serverTotal: number;
  /** Where the visible page starts in serverItems (> 0 only when fetched from the start). */
  windowStart: number;
  status: LoadStatus;
  categories: Category[];
}

const initialState: ProductsState = {
  query: DEFAULT_QUERY,
  serverItems: [],
  serverTotal: 0,
  windowStart: 0,
  status: 'idle',
  categories: [],
};

/**
 * State of the product list. The page feeds it the query read from the URL;
 * the store loads that page and keeps the current rows while a new page loads.
 * Rows are recomputed from LocalChanges, so an edit, delete or undo shows at once
 * without a new request.
 */
export const ProductsStore = signalStore(
  withState(initialState),
  withComputed(({ serverItems, serverTotal, windowStart, query }, local = inject(LocalChanges)) => {
    const visible = computed(() => local.applyToList(serverItems()));
    return {
      items: computed(() => visible().items.slice(windowStart(), windowStart() + query().pageSize)),
      // Deleted rows of this page leave the total too (the server still counts them)
      total: computed(() => Math.max(0, serverTotal() - visible().removed)),
    };
  }),
  withComputed(({ status, items, total }) => ({
    /** First load: nothing to show yet, render the skeleton. */
    isInitialLoading: computed(() => status() === 'loading' && items().length === 0),
    /** Reload: keep the rows on screen, show a thin progress bar. */
    isRefreshing: computed(() => status() === 'loading' && items().length > 0),
    isEmpty: computed(() => status() === 'success' && total() === 0),
  })),
  withMethods((store, api = inject(ProductsApi), local = inject(LocalChanges)) => ({
    /** Loads the page for each new query; a newer query cancels the older request. */
    load: rxMethod<ProductQuery>(
      pipe(
        tap((query) => patchState(store, { query, status: 'loading' })),
        switchMap((query) => {
          // Deleted products still count on the server, so its pages are shifted.
          // Then fetch from the start (enough to cover the deletions) and cut the page here,
          // so every page stays full and no product is skipped or shown twice.
          const deleted = local.deletedCount();
          const request = deleted
            ? { ...query, page: 1, pageSize: query.page * query.pageSize + deleted }
            : query;
          const windowStart = deleted ? (query.page - 1) * query.pageSize : 0;

          return api.getProducts(request).pipe(
            tap(({ items, total }) =>
              patchState(store, {
                serverItems: items,
                serverTotal: total,
                windowStart,
                status: 'success',
              }),
            ),
            catchError(() => {
              patchState(store, { status: 'error' });
              return EMPTY;
            }),
          );
        }),
      ),
    ),
    loadCategories: rxMethod<void>(
      pipe(
        switchMap(() =>
          api.getCategories().pipe(
            tap((categories) => patchState(store, { categories })),
            // The list still works without the category filter
            catchError(() => EMPTY),
          ),
        ),
      ),
    ),
  })),
);
