import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';

import { ConfirmDialog } from './confirm-dialog';
import { ConfirmDialogData } from '../../../models/interfaces';

/** "Discard unsaved changes?" Emits true when the user chooses Discard. */
export function confirmDiscardChanges(dialog: MatDialog): Observable<boolean> {
  return dialog
    .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'dialogs.discardChanges.title',
        message: 'dialogs.discardChanges.message',
        cancelLabel: 'buttons.keepEditing',
        confirmLabel: 'buttons.discard',
      },
      role: 'alertdialog',
    })
    .afterClosed()
    .pipe(map((discard) => discard === true));
}
