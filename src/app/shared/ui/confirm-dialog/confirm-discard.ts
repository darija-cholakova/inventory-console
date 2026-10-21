import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';

import { ConfirmDialog } from './confirm-dialog';
import { ConfirmDialogData } from './confirm-dialog.model';

/** "Discard unsaved changes?" Emits true when the user chooses Discard. */
export function confirmDiscardChanges(dialog: MatDialog): Observable<boolean> {
  return dialog
    .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Discard unsaved changes?',
        message: 'Your changes to this product will be lost.',
        cancelLabel: 'Keep editing',
        confirmLabel: 'Discard',
      },
      role: 'alertdialog',
    })
    .afterClosed()
    .pipe(map((discard) => discard === true));
}
