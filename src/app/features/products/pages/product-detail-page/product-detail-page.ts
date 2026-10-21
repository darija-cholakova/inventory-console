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
import { MatIcon } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { StateMessage } from '../../../../shared/ui/state-message/state-message';
import { StockChip } from '../../../../shared/ui/stock-chip/stock-chip';
import { ProductsApi } from '../../data-access/products-api';
import { ProductsListUrl } from '../../data-access/products-list-url';
import { ProductGallery } from '../../ui/product-gallery/product-gallery';
import { RatingStars } from '../../ui/rating-stars/rating-stars';

@Component({
  selector: 'app-product-detail-page',
  imports: [
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
  ],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage {
  private readonly api = inject(ProductsApi);
  private readonly title = inject(Title);
  private readonly injector = inject(Injector);

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

  protected readonly notFound = computed(() => {
    const error = this.product.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });

  private readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('heading');

  constructor() {
    effect(() => {
      const product = this.product.hasValue() ? this.product.value() : null;
      if (!product) return;
      this.title.setTitle(`${product.title} · Inventory Console`);
      // Move focus to the heading so screen reader users hear which product opened
      afterNextRender(() => this.heading()?.nativeElement.focus(), { injector: this.injector });
    });
  }
}
