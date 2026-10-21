import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { TABLE_VIEW_QUERY } from '../../../../shared/utils/breakpoints';
import { focusRowAfterDelete } from '../../../../shared/utils/focus-after-delete';
import { StateMessage } from '../../../../shared/ui/state-message/state-message';
import { LocalChanges } from '../../../../core/products/local-changes';
import { ProductDeletion } from '../../../products/data-access/product-deletion';
import { ProductsApi } from '../../../../core/api/products-api';
import { ProductCards } from '../../../../shared/ui/product-cards/product-cards';
import { ProductEditDialog } from '../../../products/dialogs/product-edit-dialog/product-edit-dialog';
import { ProductsSkeleton } from '../../../../shared/ui/products-skeleton/products-skeleton';
import { ProductsTable } from '../../../../shared/ui/products-table/products-table';
import { Bookmarks } from '../../../../core/bookmarks/bookmarks';
import { DEFAULT_QUERY, PAGE_SIZE_OPTIONS } from '../../../products/utils/product-query.constants';
import { Product, ProductQuery, SortChange } from '../../../../shared/models/interfaces';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * Bookmarked products. DummyJSON cannot fetch several ids at once, so the page loads the
 * catalog once (list fields only) and keeps the bookmarked ones. The list is short,
 * so search, sorting and paging run in the browser.
 */
@Component({
  selector: 'app-bookmarks-page',
  imports: [
    TranslocoPipe,
    RouterLink,
    ProductsTable,
    ProductCards,
    ProductsSkeleton,
    StateMessage,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatSuffix,
    MatInput,
    MatIcon,
    MatButton,
    MatIconButton,
    MatPaginator,
  ],
  templateUrl: './bookmarks-page.html',
  styleUrl: './bookmarks-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarksPage {
  private readonly api = inject(ProductsApi);
  private readonly local = inject(LocalChanges);
  private readonly deletion = inject(ProductDeletion);
  private readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly bookmarks = inject(Bookmarks);

  protected readonly showTable = toSignal(
    inject(BreakpointObserver)
      .observe(TABLE_VIEW_QUERY)
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  /** No request while nothing is bookmarked (params undefined = idle). */
  protected readonly catalog = rxResource({
    params: () => (this.bookmarks.count() > 0 ? true : undefined),
    stream: () => this.api.getAllProducts(),
  });

  protected readonly search = signal('');
  private readonly sort = signal<SortChange>({ sortBy: null, order: 'asc' });
  /** The table reads its sort state from a list query. */
  protected readonly query = computed<ProductQuery>(() => ({ ...DEFAULT_QUERY, ...this.sort() }));

  /** Bookmarked, not deleted, with local edits applied. */
  private readonly bookmarked = computed(() => {
    const ids = this.bookmarks.ids();
    const all = this.catalog.hasValue() ? this.catalog.value() : [];
    return this.local.applyToList(all.filter((p) => ids.has(p.id))).items;
  });

  /** Bookmarked products after search and sort (all pages). */
  protected readonly results = computed(() => {
    const q = this.search().trim().toLowerCase();
    const { sortBy, order } = this.sort();
    const found = q
      ? this.bookmarked().filter((p) => `${p.title} ${p.brand ?? ''}`.toLowerCase().includes(q))
      : this.bookmarked();
    if (!sortBy) return found;
    const dir = order === 'asc' ? 1 : -1;
    return [...found].sort((a, b) =>
      sortBy === 'title' ? a.title.localeCompare(b.title) * dir : (a[sortBy] - b[sortBy]) * dir,
    );
  });

  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly pageSize = signal<number>(PAGE_SIZE_OPTIONS[0]);
  private readonly requestedPage = signal(0);

  /** Stays valid when the list shrinks (unbookmark, delete, search): never past the last page. */
  protected readonly pageIndex = computed(() => {
    const lastPage = Math.max(0, Math.ceil(this.results().length / this.pageSize()) - 1);
    return Math.min(this.requestedPage(), lastPage);
  });

  protected readonly items = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.results().slice(start, start + this.pageSize());
  });

  protected readonly skeletonRows = computed(() => Math.min(this.bookmarks.count(), 6));

  protected readonly isLoading = computed(
    () => this.catalog.isLoading() && !this.catalog.hasValue(),
  );
  protected readonly isEmpty = computed(
    () => this.bookmarks.count() === 0 || (this.catalog.hasValue() && !this.bookmarked().length),
  );

  protected onSearch(event: Event): void {
    this.setSearch((event.target as HTMLInputElement).value);
  }

  protected setSearch(value: string): void {
    this.search.set(value);
    this.requestedPage.set(0);
  }

  protected onSort(sort: SortChange): void {
    this.sort.set(sort);
    this.requestedPage.set(0);
  }

  protected onPage({ pageIndex, pageSize }: PageEvent): void {
    const sizeChanged = pageSize !== this.pageSize();
    this.pageSize.set(pageSize);
    this.requestedPage.set(sizeChanged ? 0 : pageIndex);
  }

  protected onEdit(product: Product): void {
    ProductEditDialog.open(this.dialog, product.id);
  }

  protected async onDelete(product: Product): Promise<void> {
    if (!(await this.deletion.confirm(product))) return;
    const index = this.items().findIndex((item) => item.id === product.id);
    this.deletion.delete(product);
    // Keep the place in the list: focus the row that moves into the same position
    afterNextRender(() => focusRowAfterDelete(this.host.nativeElement, index), {
      injector: this.injector,
    });
  }
}
