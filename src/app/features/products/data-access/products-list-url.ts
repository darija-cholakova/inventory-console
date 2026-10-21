import { Injectable, inject, signal } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

/**
 * Remembers the last product list URL (with its filters), so "Back to products"
 * on the detail page returns to the same search, sort and page.
 * Kept as a UrlTree so routerLink does not encode the query string.
 */
@Injectable({ providedIn: 'root' })
export class ProductsListUrl {
  readonly url = signal<UrlTree>(inject(Router).createUrlTree(['/products']));
}
