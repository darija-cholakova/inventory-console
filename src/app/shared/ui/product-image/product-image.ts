import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  linkedSignal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';

const NO_IMAGE_TEXT = 'No image to display';

/**
 * Product image with a fallback: when the URL is missing or fails to load,
 * a placeholder with an icon (and text, if there is room) is shown instead of a broken image.
 */
@Component({
  selector: 'app-product-image',
  imports: [NgOptimizedImage, MatIcon],
  template: `
    @if (src() && !failed()) {
      @if (fill()) {
        <img
          [ngSrc]="src()!"
          fill
          [priority]="priority()"
          [alt]="alt()"
          (error)="failed.set(true)"
        />
      } @else {
        <img
          [ngSrc]="src()!"
          [width]="size()"
          [height]="size()"
          [alt]="alt()"
          (error)="failed.set(true)"
        />
      }
    } @else {
      <div class="placeholder" role="img" [attr.aria-label]="noImageText">
        <mat-icon aria-hidden="true">image_not_supported</mat-icon>
        @if (showText()) {
          <span aria-hidden="true">{{ noImageText }}</span>
        }
      </div>
    }
  `,
  styleUrl: './product-image.scss',
  host: { '[class.fill]': 'fill()', '[style.--image-size.px]': 'fill() ? null : size()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductImage {
  readonly src = input<string | undefined>();
  readonly alt = input('');
  /** Square size in px; ignored when `fill` is set. */
  readonly size = input(40);
  /** Fill the parent (which must be positioned and sized). */
  readonly fill = input(false, { transform: booleanAttribute });
  readonly priority = input(false, { transform: booleanAttribute });
  /** Show the "No image to display" text next to the icon (for large images). */
  readonly showText = input(false, { transform: booleanAttribute });

  protected readonly noImageText = NO_IMAGE_TEXT;
  /** Resets when a new URL comes in. */
  protected readonly failed = linkedSignal({ source: this.src, computation: () => false });
}
