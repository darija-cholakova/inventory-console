import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, pipe, switchMap, tap } from 'rxjs';

import { Category, Product } from '../models/product.model';
import { DEFAULT_QUERY, ProductQuery } from '../models/product-query.model';
import { ProductsApi } from './products-api';

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

interface ProductsState {
  query: ProductQuery;
  items: Product[];
  total: number;
  status: LoadStatus;
  categories: Category[];
}

const initialState: ProductsState = {
  query: DEFAULT_QUERY,
  items: [],
  total: 0,
  status: 'idle',
  categories: [],
};

/**
 * State of the product list. The page feeds it the query read from the URL;
 * the store loads that page and keeps the current rows while a new page loads.
 */
export const ProductsStore = signalStore(
  withState(initialState),
  withComputed(({ status, items, total }) => ({
    /** First load: nothing to show yet, render the skeleton. */
    isInitialLoading: computed(() => status() === 'loading' && items().length === 0),
    /** Reload: keep the rows on screen, show a thin progress bar. */
    isRefreshing: computed(() => status() === 'loading' && items().length > 0),
    isEmpty: computed(() => status() === 'success' && total() === 0),
  })),
  withMethods((store, api = inject(ProductsApi)) => ({
    /** Loads the page for each new query; a newer query cancels the older request. */
    load: rxMethod<ProductQuery>(
      pipe(
        tap((query) => patchState(store, { query, status: 'loading' })),
        switchMap((query) =>
          api.getProducts(query).pipe(
            tap(({ items, total }) => patchState(store, { items, total, status: 'success' })),
            catchError(() => {
              patchState(store, { status: 'error' });
              return EMPTY;
            }),
          ),
        ),
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
