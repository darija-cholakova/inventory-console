import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-products-page',
  template: `
    <h1 class="page-title">Products</h1>
    <p class="page-subtitle">The product list arrives in feature 3.</p>
  `,
  styleUrl: '../../../../shared/styles/page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPage {}
