import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  linkedSignal,
  viewChildren,
} from '@angular/core';

import { ProductImage } from '../../../../shared/ui/product-image/product-image';

/**
 * Main image with thumbnail buttons. Thumbnails are a single tab stop:
 * arrow keys move between them, Enter/Space or click selects (WAI-ARIA toolbar pattern).
 */
@Component({
  selector: 'app-product-gallery',
  imports: [ProductImage],
  templateUrl: './product-gallery.html',
  styleUrl: './product-gallery.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGallery {
  readonly images = input.required<string[]>();
  readonly title = input.required<string>();

  /** Resets to the first image whenever a different product is shown. */
  protected readonly selected = linkedSignal({ source: this.images, computation: () => 0 });
  protected readonly current = computed(() => this.images()[this.selected()]);

  private readonly thumbs = viewChildren<ElementRef<HTMLButtonElement>>('thumb');

  protected select(index: number): void {
    this.selected.set(index);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const count = this.images().length;
    const next = (index + step + count) % count;
    this.selected.set(next);
    this.thumbs()[next]?.nativeElement.focus();
  }
}
