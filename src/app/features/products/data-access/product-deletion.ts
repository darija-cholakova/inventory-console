import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { ConfirmDialog } from '../../../shared/ui/dialogs/confirm-dialog/confirm-dialog';

import { UndoSnackbar } from '../../../shared/ui/undo-snackbar/undo-snackbar';
import { I18n } from '../../../core/i18n/i18n';
import { LocalChanges } from '../../../core/products/local-changes';
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
  private readonly i18n = inject(I18n);

  /** "Delete …?" dialog; resolves to true when the user confirms. Cancel has the initial focus. */
  async confirm(product: Pick<Product, 'id' | 'title'>): Promise<boolean> {
    const confirmed = await firstValueFrom(
      this.dialog
        .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
          data: {
            title: 'products.delete.title',
            titleParams: { title: product.title },
            message: 'products.delete.message',
            cancelLabel: 'buttons.cancel',
            confirmLabel: 'buttons.delete',
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
        data: { message: this.i18n.t('validation.success.productDeleted'), durationMs: UNDO_MS },
      })
      .afterDismissed()
      .subscribe(({ dismissedByAction }) => {
        if (dismissedByAction) {
          this.local.restore(product.id);
          void this.announcer.announce(
            this.i18n.t('validation.success.productRestored', { title: product.title }),
          );
          return;
        }
        this.local.commitDelete(product.id).subscribe({
          error: () =>
            this.snackBar.open(
              this.i18n.t('validation.error.deleteProduct', { title: product.title }),
              this.i18n.t('buttons.ok'),
              { duration: UNDO_MS },
            ),
        });
      });
  }
}
