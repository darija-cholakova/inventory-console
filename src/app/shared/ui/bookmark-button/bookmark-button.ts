import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { Bookmarks } from '../../../core/bookmarks/bookmarks';
import { BookmarkTarget } from '../../models/interfaces';

/** Toggle button used in the table, the cards and the detail page. State = filled icon + aria-pressed. */
@Component({
  selector: 'app-bookmark-button',
  imports: [MatIconButton, MatIcon, MatTooltip],
  template: `
    <button
      matIconButton
      type="button"
      [class.active]="bookmarked()"
      [attr.aria-pressed]="bookmarked()"
      [attr.aria-label]="label()"
      [matTooltip]="bookmarked() ? 'Remove bookmark' : 'Bookmark'"
      (click)="bookmarks.toggle(product())"
    >
      <mat-icon [class.filled]="bookmarked()">bookmark</mat-icon>
    </button>
  `,
  styles: `
    .active {
      color: var(--mat-sys-primary);
    }

    // Material Symbols: filled variant for the "on" state, outlined for "off"
    .filled {
      font-variation-settings: 'FILL' 1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkButton {
  protected readonly bookmarks = inject(Bookmarks);

  readonly product = input.required<BookmarkTarget>();

  protected readonly bookmarked = computed(() => this.bookmarks.isBookmarked(this.product().id));
  protected readonly label = computed(() =>
    this.bookmarked()
      ? `Remove bookmark ${this.product().title}`
      : `Bookmark ${this.product().title}`,
  );
}
