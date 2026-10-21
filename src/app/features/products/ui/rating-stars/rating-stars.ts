import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

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
  readonly rating = input.required<number>();

  protected readonly stars = computed(() => {
    const full = Math.round(this.rating());
    return Array.from({ length: 5 }, (_, i) => i < full);
  });
  protected readonly label = computed(() => `Rating ${this.rating().toFixed(1)} out of 5`);
}
