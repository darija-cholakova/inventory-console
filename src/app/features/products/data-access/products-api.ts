import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../../core/api/api.config';
import { ProductDetail } from '../models/product-detail.model';
import { Category, ProductListResponse, ProductsPage } from '../models/product.model';
import { ProductQuery } from '../models/product-query.model';

/** Only the fields the list shows, to keep responses small. */
const LIST_FIELDS = 'title,brand,category,price,stock,rating,thumbnail';

/** HTTP access to DummyJSON products. No state, no UI logic. */
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

  getProduct(id: number): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${this.apiUrl}/products/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http
      .get<Category[]>(`${this.apiUrl}/products/categories`)
      .pipe(map((categories) => categories.map(({ slug, name }) => ({ slug, name }))));
  }
}
