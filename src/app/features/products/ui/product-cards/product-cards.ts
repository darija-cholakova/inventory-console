import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { RouterLink } from '@angular/router';

import { BookmarkButton } from '../../../bookmarks/ui/bookmark-button/bookmark-button';
import { ProductImage } from '../../../../shared/ui/product-image/product-image';
import { StockChip } from '../../../../shared/ui/stock-chip/stock-chip';
import { Product } from '../../../../shared/models/interfaces';

/**
 * Small-screen list: same data as the table, laid out as cards.
 * The title link stretches over the whole card, so the card is one tap target;
 * the actions button sits above that layer.
 */
@Component({
  selector: 'app-product-cards',
  imports: [
    RouterLink,
    ProductImage,
    CurrencyPipe,
    DecimalPipe,
    StockChip,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    BookmarkButton,
  ],
  templateUrl: './product-cards.html',
  styleUrl: './product-cards.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCards {
  readonly items = input.required<Product[]>();
  readonly edit = output<Product>();
  readonly delete = output<Product>();
}
