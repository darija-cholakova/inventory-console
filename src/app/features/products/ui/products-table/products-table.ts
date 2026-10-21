import { CurrencyPipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

import { StockChip } from '../../../../shared/ui/stock-chip/stock-chip';
import { Product } from '../../models/product.model';
import { ProductQuery, SortField } from '../../models/product-query.model';
import { SortChange } from '../products-toolbar/products-toolbar';

/** Desktop list: sorting happens on the server, so MatSort only reports header clicks. */
@Component({
  selector: 'app-products-table',
  imports: [
    MatTableModule,
    MatSort,
    MatSortHeader,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatIcon,
    MatIconButton,
    RouterLink,
    NgOptimizedImage,
    CurrencyPipe,
    DecimalPipe,
    StockChip,
  ],
  templateUrl: './products-table.html',
  styleUrl: './products-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsTable {
  readonly items = input.required<Product[]>();
  readonly query = input.required<ProductQuery>();

  readonly sortChange = output<SortChange>();

  protected readonly columns = [
    'thumbnail',
    'title',
    'category',
    'price',
    'stock',
    'rating',
    'actions',
  ];
  protected readonly activeSort = computed(() => this.query().sortBy ?? '');
  protected readonly direction = computed(() => (this.query().sortBy ? this.query().order : ''));

  protected onSort({ active, direction }: Sort): void {
    this.sortChange.emit(
      direction
        ? { sortBy: active as SortField, order: direction }
        : { sortBy: null, order: 'asc' },
    );
  }
}
