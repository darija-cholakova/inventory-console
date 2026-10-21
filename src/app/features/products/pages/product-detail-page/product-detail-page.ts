import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

/** Placeholder until the detail view is built in feature 4. */
@Component({
  selector: 'app-product-detail-page',
  imports: [RouterLink, MatIcon],
  template: `
    <a class="back" routerLink="/products">
      <mat-icon aria-hidden="true">chevron_left</mat-icon>
      Products
    </a>
    <h1 class="page-title">Product #{{ id() }}</h1>
    <p class="page-subtitle">The product detail view is in progress (feature 4).</p>
  `,
  styleUrl: './product-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage {
  /** Route param, bound through withComponentInputBinding(). */
  readonly id = input.required<string>();
}
