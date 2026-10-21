import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivateFn } from '@angular/router';

import { confirmDiscardChanges } from '../../shared/ui/confirm-dialog/confirm-discard';

/** Implemented by pages with a form that can lose changes on navigation. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/** Asks before leaving a page with unsaved changes; Esc or a backdrop click keeps editing. */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (page) =>
  page.hasUnsavedChanges() ? confirmDiscardChanges(inject(MatDialog)) : true;
