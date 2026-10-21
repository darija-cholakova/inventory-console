import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';

import { ProductChanges } from '../models/product-changes.model';
import { ProductDetail } from '../models/product-detail.model';
import { Product } from '../models/product.model';
import { ProductsApi } from './products-api';

const STORAGE_KEY = 'inventory-console.local-changes';

interface StoredChanges {
  edits: Record<number, ProductChanges>;
  deleted: number[];
}

/**
 * DummyJSON accepts PATCH and DELETE but never persists them. This layer keeps the user's
 * edits and deletions and applies them on top of every server response (list and detail),
 * so the app behaves as if the API had saved them. Stored for the browser session.
 */
@Injectable({ providedIn: 'root' })
export class LocalChanges {
  private readonly api = inject(ProductsApi);

  private readonly edits = signal<Record<number, ProductChanges>>({});
  private readonly deleted = signal<ReadonlySet<number>>(new Set());

  /** Number of products deleted in this session; the list refills its page when it changes. */
  readonly deletedCount = computed(() => this.deleted().size);

  constructor() {
    const stored = this.read();
    this.edits.set(stored.edits);
    this.deleted.set(new Set(stored.deleted));
  }

  isDeleted(id: number): boolean {
    return this.deleted().has(id);
  }

  apply<T extends Product>(product: T): T {
    return { ...product, ...this.edits()[product.id] };
  }

  /** Removes deleted products and applies edits; returns how many were removed. */
  applyToList(items: Product[]): { items: Product[]; removed: number } {
    const visible = items
      .filter((item) => !this.deleted().has(item.id))
      .map((item) => this.apply(item));
    return { items: visible, removed: items.length - visible.length };
  }

  /** Optimistic update: applied at once, rolled back if the request fails. */
  update(id: number, changes: ProductChanges): Observable<ProductDetail> {
    const previous = this.edits()[id];
    this.setEdits({ ...this.edits(), [id]: { ...previous, ...changes } });

    return this.api.updateProduct(id, changes).pipe(
      catchError((error: unknown) => {
        this.setEdits({ ...this.edits(), [id]: previous ?? {} });
        return throwError(() => error);
      }),
    );
  }

  /** Hides the product immediately (the server call happens after the undo window). */
  markDeleted(id: number): void {
    this.setDeleted(new Set(this.deleted()).add(id));
  }

  restore(id: number): void {
    const next = new Set(this.deleted());
    next.delete(id);
    this.setDeleted(next);
  }

  /** Sends the DELETE; on failure the product comes back. */
  commitDelete(id: number): Observable<unknown> {
    return this.api.deleteProduct(id).pipe(tap({ error: () => this.restore(id) }));
  }

  private setEdits(edits: Record<number, ProductChanges>): void {
    this.edits.set(edits);
    this.save();
  }

  private setDeleted(deleted: ReadonlySet<number>): void {
    this.deleted.set(deleted);
    this.save();
  }

  private save(): void {
    try {
      const value: StoredChanges = { edits: this.edits(), deleted: [...this.deleted()] };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Storage unavailable: changes last until reload.
    }
  }

  private read(): StoredChanges {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StoredChanges) : { edits: {}, deleted: [] };
    } catch {
      return { edits: {}, deleted: [] };
    }
  }
}
