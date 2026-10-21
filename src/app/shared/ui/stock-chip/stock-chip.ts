import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { StockStatus, getStockStatus } from './stock-status.model';

const STATUS_VIEW: Record<StockStatus, { label: string; icon: string }> = {
  'in-stock': { label: 'In stock', icon: 'check' },
  'low-stock': { label: 'Low stock', icon: 'warning' },
  'out-of-stock': { label: 'Out of stock', icon: 'cancel' },
};

/** Stock level as text + icon + color, so it never relies on color alone. */
@Component({
  selector: 'app-stock-chip',
  imports: [MatIcon],
  template: `
    <mat-icon aria-hidden="true">{{ view().icon }}</mat-icon>
    <span
      >{{ view().label }}
      @if (stock() > 0) {
        · {{ stock() }}
      }
    </span>
  `,
  styleUrl: './stock-chip.scss',
  host: { '[attr.data-status]': 'status()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockChip {
  readonly stock = input.required<number>();

  protected readonly status = computed(() => getStockStatus(this.stock()));
  protected readonly view = computed(() => STATUS_VIEW[this.status()]);
}
