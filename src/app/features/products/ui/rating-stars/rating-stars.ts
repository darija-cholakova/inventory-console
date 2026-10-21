import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { I18n } from '../../../../core/i18n/i18n';

/** Five stars rounded to the nearest whole star; the exact value is read out and shown as text. */
@Component({
  selector: 'app-rating-stars',
  imports: [DecimalPipe],
  template: `
    <span class="stars" aria-hidden="true">
      @for (filled of stars(); track $index) {
        <span [class.filled]="filled">{{ filled ? '★' : '☆' }}</span>
      }
    </span>
    <span class="value">{{ rating() | number: '1.1-1' }}</span>
  `,
  styleUrl: './rating-stars.scss',
  host: { role: 'img', '[attr.aria-label]': 'label()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingStars {
  private readonly i18n = inject(I18n);

  readonly rating = input.required<number>();

  protected readonly stars = computed(() => {
    const full = Math.round(this.rating());
    return Array.from({ length: 5 }, (_, i) => i < full);
  });
  protected readonly label = computed(() =>
    this.i18n.t('products.rating.label', { value: this.rating().toFixed(1) }),
  );
}
