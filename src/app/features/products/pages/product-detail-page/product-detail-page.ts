import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';

import { BookmarkButton } from '../../../../shared/ui/bookmark-button/bookmark-button';
import { BackLink } from '../../../../shared/ui/back-link/back-link';
import { StateMessage } from '../../../../shared/ui/state-message/state-message';
import { StockChip } from '../../../../shared/ui/stock-chip/stock-chip';
import { LocalChanges } from '../../../../core/products/local-changes';
import { ProductDeletion } from '../../data-access/product-deletion';
import { ProductsApi } from '../../../../core/api/products-api';
import { ProductsListUrl } from '../../data-access/products-list-url';
import { ProductEditDialog } from '../../dialogs/product-edit-dialog/product-edit-dialog';
import { ProductGallery } from '../../ui/product-gallery/product-gallery';
import { RatingStars } from '../../ui/rating-stars/rating-stars';
import { ProductDetail } from '../../../../shared/models/interfaces';

@Component({
  selector: 'app-product-detail-page',
  imports: [
    BackLink,
    RouterLink,
    MatIcon,
    MatButton,
    CurrencyPipe,
    DecimalPipe,
    DatePipe,
    StateMessage,
    StockChip,
    ProductGallery,
    RatingStars,
    BookmarkButton,
  ],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage {
  private readonly api = inject(ProductsApi);
  private readonly title = inject(Title);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly local = inject(LocalChanges);
  private readonly deletion = inject(ProductDeletion);
  private readonly dialog = inject(MatDialog);

  /** Route param, bound through withComponentInputBinding(). */
  readonly id = input.required<string>();

  /** Back link returns to the list with the filters the user left it with. */
  protected readonly listUrl = inject(ProductsListUrl).url;

  /**
   * rxResource (stable in Angular 22) keeps the loading / value / error state of one request
   * as signals and refetches when the id changes. A full store would be overkill for a single read.
   */
  protected readonly product = rxResource({
    params: () => Number(this.id()),
    stream: ({ params: id }) => this.api.getProduct(id),
  });

  /** Server data with the user's local edits applied; null while loading or after an error. */
  protected readonly view = computed(() =>
    this.product.hasValue() && !this.isDeleted() ? this.local.apply(this.product.value()) : null,
  );

  private readonly isDeleted = computed(() => this.local.isDeleted(Number(this.id())));

  /** A product deleted in this session is treated like a 404. */
  protected readonly notFound = computed(() => {
    const error = this.product.error();
    return this.isDeleted() || (error instanceof HttpErrorResponse && error.status === 404);
  });

  private readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('heading');

  constructor() {
    // Tab title follows the shown title, including a local edit
    effect(() => {
      const product = this.view();
      if (product) this.title.setTitle(`${product.title} · Inventory Console`);
    });
    // Move focus to the heading when a product loads (not after an edit, when focus
    // goes back to the Edit button), so screen reader users hear which product opened
    effect(() => {
      if (!this.product.hasValue()) return;
      this.product.value();
      afterNextRender(() => this.heading()?.nativeElement.focus(), { injector: this.injector });
    });
  }

  /** Saved edits show here at once through LocalChanges. */
  protected edit(product: ProductDetail): void {
    ProductEditDialog.open(this.dialog, product.id);
  }

  /** After confirming, leave first so the page doesn't flash "not found", then delete. */
  protected async delete(product: ProductDetail): Promise<void> {
    if (!(await this.deletion.confirm(product))) return;
    await this.router.navigateByUrl(this.listUrl());
    this.deletion.delete(product);
  }
}
