import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { ConfirmDialog } from '../../../shared/ui/dialogs/confirm-dialog/confirm-dialog';

import { UndoSnackbar } from '../../../shared/ui/undo-snackbar/undo-snackbar';
import { LocalChanges } from './local-changes';
import { ConfirmDialogData, Product, UndoSnackbarData } from '../../../shared/models/interfaces';

/** Undo window; long enough to reach the button with a keyboard or screen reader. */
const UNDO_MS = 8000;

/**
 * Delete flow used by the list and the detail page: the user confirms, the product
 * disappears at once, a snackbar still offers Undo, and DELETE is sent only when the
 * snackbar closes without Undo (timeout, or replaced by another snackbar).
 */
@Injectable({ providedIn: 'root' })
export class ProductDeletion {
  private readonly local = inject(LocalChanges);
  private readonly snackBar = inject(MatSnackBar);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly dialog = inject(MatDialog);

  /** "Delete …?" dialog; resolves to true when the user confirms. Cancel has the initial focus. */
  async confirm(product: Pick<Product, 'id' | 'title'>): Promise<boolean> {
    const confirmed = await firstValueFrom(
      this.dialog
        .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
          data: {
            title: `Delete “${product.title}”?`,
            message: 'The product will be removed from the inventory.',
            cancelLabel: 'Cancel',
            confirmLabel: 'Delete',
          },
          role: 'alertdialog',
        })
        .afterClosed(),
    );
    return confirmed === true;
  }

  /** Call after confirm(). */
  delete(product: Pick<Product, 'id' | 'title'>): void {
    this.local.markDeleted(product.id);

    // The snackbar is a polite live region, so screen readers hear the message too
    this.snackBar
      .openFromComponent<UndoSnackbar, UndoSnackbarData>(UndoSnackbar, {
        data: { message: 'Product deleted', durationMs: UNDO_MS },
      })
      .afterDismissed()
      .subscribe(({ dismissedByAction }) => {
        if (dismissedByAction) {
          this.local.restore(product.id);
          void this.announcer.announce(`“${product.title}” restored`);
          return;
        }
        this.local.commitDelete(product.id).subscribe({
          error: () =>
            this.snackBar.open(`Couldn’t delete “${product.title}”. It’s back in the list.`, 'OK', {
              duration: UNDO_MS,
            }),
        });
      });
  }
}
