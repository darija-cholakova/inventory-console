import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Injectable, computed, inject, signal } from '@angular/core';

import { BookmarkTarget } from '../../shared/models/interfaces';
import { I18n } from '../i18n/i18n';
import { LocalChanges } from '../products/local-changes';

const STORAGE_KEY = 'inventory-console.bookmarks';

/**
 * Bookmarked product ids. Kept in localStorage (not sessionStorage like the session and
 * local edits): a bookmark is the user's own working list and should survive closing the tab.
 */
@Injectable({ providedIn: 'root' })
export class Bookmarks {
  private readonly announcer = inject(LiveAnnouncer);
  private readonly i18n = inject(I18n);

  readonly ids = signal<ReadonlySet<number>>(this.read());
  private readonly local = inject(LocalChanges);

  /** Deleted products stay bookmarked (Undo brings them back) but are not counted. */
  readonly count = computed(() => [...this.ids()].filter((id) => !this.local.isDeleted(id)).length);

  isBookmarked(id: number): boolean {
    return this.ids().has(id);
  }

  toggle(product: BookmarkTarget): void {
    const next = new Set(this.ids());
    const added = !next.delete(product.id);
    if (added) next.add(product.id);

    this.ids.set(next);
    this.save();
    void this.announcer.announce(
      this.i18n.t(
        added ? 'validation.success.bookmarkAdded' : 'validation.success.bookmarkRemoved',
      ),
    );
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.ids()]));
    } catch {
      // Storage unavailable (private mode, quota): bookmarks last until reload.
    }
  }

  private read(): ReadonlySet<number> {
    try {
      const ids: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      return new Set(Array.isArray(ids) ? ids.filter((id) => typeof id === 'number') : []);
    } catch {
      return new Set();
    }
  }
}
