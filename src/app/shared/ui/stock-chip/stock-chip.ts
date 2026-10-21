import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { StockStatus } from '../../models/types';
import { getStockStatus } from '../../utils/stock-status';

const STATUS_VIEW: Record<StockStatus, { label: string; icon: string }> = {
  'in-stock': { label: 'In stock', icon: 'check' },
  'low-stock': { label: 'Low stock', icon: 'warning' },
  'out-of-stock': { label: 'Out of stock', icon: 'cancel' },
};

/** Stock level as text + icon + color, so it never relies on color alone; optionally with the count. */
@Component({
  selector: 'app-stock-chip',
  imports: [MatIcon],
  template: `
    <mat-icon aria-hidden="true">{{ view().icon }}</mat-icon>
    <span
      >{{ view().label }}
      @if (showCount() && stock() > 0) {
        · {{ stock() }}
      }
    </span>
  `,
  styleUrl: './stock-chip.scss',
  host: { '[attr.data-status]': 'status()', '[class.compact]': '!showCount()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockChip {
  readonly stock = input.required<number>();
  /** Off where the quantity has its own column (product table). */
  readonly showCount = input(true);

  protected readonly status = computed(() => getStockStatus(this.stock()));
  protected readonly view = computed(() => STATUS_VIEW[this.status()]);
}
