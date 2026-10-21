import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Injectable, computed, inject, signal } from '@angular/core';

import { BookmarkTarget } from '../../../shared/models/interfaces';

const STORAGE_KEY = 'inventory-console.bookmarks';

/**
 * Bookmarked product ids. Kept in localStorage (not sessionStorage like the session and
 * local edits): a bookmark is the user's own working list and should survive closing the tab.
 */
@Injectable({ providedIn: 'root' })
export class Bookmarks {
  private readonly announcer = inject(LiveAnnouncer);

  readonly ids = signal<ReadonlySet<number>>(this.read());
  readonly count = computed(() => this.ids().size);

  isBookmarked(id: number): boolean {
    return this.ids().has(id);
  }

  toggle(product: BookmarkTarget): void {
    const next = new Set(this.ids());
    const added = !next.delete(product.id);
    if (added) next.add(product.id);

    this.ids.set(next);
    this.save();
    void this.announcer.announce(added ? 'Added to bookmarked' : 'Removed from bookmarked');
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
