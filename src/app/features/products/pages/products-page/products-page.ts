import { LiveAnnouncer } from '@angular/cdk/a11y';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { StateMessage } from '../../../../shared/ui/state-message/state-message';
import { paramsFromQuery, queryFromParams } from '../../data-access/product-query-params';
import { ProductsListUrl } from '../../data-access/products-list-url';
import { ProductsStore } from '../../data-access/products-store';
import { PAGE_SIZE_OPTIONS, ProductQuery } from '../../models/product-query.model';
import { ProductCards } from '../../ui/product-cards/product-cards';
import { ProductsSkeleton } from '../../ui/products-skeleton/products-skeleton';
import { ProductsTable } from '../../ui/products-table/products-table';
import { ProductsToolbar, SortChange } from '../../ui/products-toolbar/products-toolbar';

/** The table needs room for seven columns next to the side nav. */
const TABLE_QUERY = '(min-width: 1024px)';

@Component({
  selector: 'app-products-page',
  imports: [
    ProductsToolbar,
    ProductsTable,
    ProductCards,
    ProductsSkeleton,
    StateMessage,
    MatPaginator,
    MatProgressBar,
    MatButton,
  ],
  templateUrl: './products-page.html',
  styleUrl: './products-page.scss',
  providers: [ProductsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPage {
  protected readonly store = inject(ProductsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly announcer = inject(LiveAnnouncer);

  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly showTable = toSignal(
    inject(BreakpointObserver)
      .observe(TABLE_QUERY)
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  protected readonly summary = computed(() => {
    const { q } = this.store.query();
    const total = this.store.total();
    if (q) return `${total} ${total === 1 ? 'result' : 'results'} for “${q}”`;
    return `${total} ${total === 1 ? 'product' : 'products'}`;
  });

  protected readonly emptyTitle = computed(() => {
    const { q } = this.store.query();
    return q ? `No products match “${q}”` : 'No products in this category';
  });

  constructor() {
    // The URL is the source of truth: every change of its query params loads that page.
    this.store.load(this.route.queryParams.pipe(map(queryFromParams)));
    this.store.loadCategories();

    // Remember the list URL with its filters for the "Back to products" link
    const listUrl = inject(ProductsListUrl);
    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe((queryParams) =>
        listUrl.url.set(this.router.createUrlTree(['/products'], { queryParams })),
      );

    // Tell screen reader users the result of each load.
    effect(() => {
      const status = this.store.status();
      if (status === 'success') {
        void this.announcer.announce(this.store.isEmpty() ? this.emptyTitle() : this.summary());
      } else if (status === 'error') {
        void this.announcer.announce("Couldn't load products");
      }
    });
  }

  protected onSearch(q: string): void {
    // Starting a search adds a history entry; refining it replaces that entry,
    // so Back returns to the list before the search, not to every typing pause.
    const refining = !!this.store.query().q && !!q;
    this.updateQuery({ q, category: null, page: 1 }, refining);
  }

  protected onCategory(category: string | null): void {
    this.updateQuery({ category, q: '', page: 1 });
  }

  protected onSort({ sortBy, order }: SortChange): void {
    this.updateQuery({ sortBy, order, page: 1 });
  }

  protected onPage({ pageIndex, pageSize }: PageEvent): void {
    const sizeChanged = pageSize !== this.store.query().pageSize;
    this.updateQuery({ page: sizeChanged ? 1 : pageIndex + 1, pageSize });
  }

  protected clearFilters(): void {
    this.updateQuery({ q: '', category: null, page: 1 });
  }

  protected retry(): void {
    this.store.load(this.store.query());
  }

  private updateQuery(changes: Partial<ProductQuery>, replaceUrl = false): void {
    const next = { ...this.store.query(), ...changes };
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: paramsFromQuery(next),
      replaceUrl,
    });
  }
}
