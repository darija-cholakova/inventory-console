import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from './api.config';
import { ProductChanges } from '../../features/products/models/product-changes.model';
import { ProductDetail } from '../../features/products/models/product-detail.model';
import {
  Category,
  Product,
  ProductListResponse,
  ProductsPage,
} from '../../features/products/models/product.model';
import { ProductQuery } from '../../features/products/models/product-query.model';

/** Only the fields the list shows, to keep responses small. */
const LIST_FIELDS = 'title,brand,category,price,stock,rating,thumbnail';

/** HTTP access to DummyJSON products. No state, no UI logic; local edits live in LocalChanges. */
@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  /**
   * Search and category use different endpoints, and the API cannot combine them,
   * so the query holds at most one of the two. Paging and sorting work on all three.
   */
  getProducts(query: ProductQuery): Observable<ProductsPage> {
    let params = new HttpParams()
      .set('limit', query.pageSize)
      .set('skip', (query.page - 1) * query.pageSize)
      .set('select', LIST_FIELDS);

    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy).set('order', query.order);
    }

    let url = `${this.apiUrl}/products`;
    if (query.q) {
      url += '/search';
      params = params.set('q', query.q);
    } else if (query.category) {
      url += `/category/${encodeURIComponent(query.category)}`;
    }

    return this.http
      .get<ProductListResponse>(url, { params })
      .pipe(map(({ products, total }) => ({ items: products, total })));
  }

  /** The whole catalog with list fields only (~194 items); used to resolve bookmarked ids. */
  getAllProducts(): Observable<Product[]> {
    const params = new HttpParams().set('limit', 0).set('select', LIST_FIELDS);
    return this.http
      .get<ProductListResponse>(`${this.apiUrl}/products`, { params })
      .pipe(map(({ products }) => products));
  }

  getProduct(id: number): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${this.apiUrl}/products/${id}`);
  }

  /** DummyJSON simulates the update and does not persist it (see LocalChanges). */
  updateProduct(id: number, changes: ProductChanges): Observable<ProductDetail> {
    return this.http.patch<ProductDetail>(`${this.apiUrl}/products/${id}`, changes);
  }

  /** DummyJSON simulates the delete (returns isDeleted: true) and does not persist it. */
  deleteProduct(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http
      .get<Category[]>(`${this.apiUrl}/products/categories`)
      .pipe(map((categories) => categories.map(({ slug, name }) => ({ slug, name }))));
  }
}
