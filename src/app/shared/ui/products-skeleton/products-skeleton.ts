import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Placeholder rows shaped like the list, so the layout does not jump when data arrives. */
@Component({
  selector: 'app-products-skeleton',
  template: `
    <span class="visually-hidden">Loading products…</span>
    @for (row of rows(); track row) {
      <div class="row" aria-hidden="true">
        <span class="block thumb"></span>
        <span class="lines">
          <span class="block line-long"></span>
          <span class="block line-short"></span>
        </span>
        <span class="block chip"></span>
      </div>
    }
  `,
  styleUrl: './products-skeleton.scss',
  host: { role: 'status' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsSkeleton {
  readonly count = input(6);
  protected readonly rows = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
