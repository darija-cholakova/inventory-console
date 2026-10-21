import { Category, Product } from './product.model';
import { ProductQuery } from './product-query.model';

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

/** State of ProductsStore. */
export interface ProductsState {
  query: ProductQuery;
  /** Page as the server returned it; local edits and deletions are applied on top. */
  serverItems: Product[];
  serverTotal: number;
  /** Where the visible page starts in serverItems (> 0 only when fetched from the start). */
  windowStart: number;
  status: LoadStatus;
  categories: Category[];
}
