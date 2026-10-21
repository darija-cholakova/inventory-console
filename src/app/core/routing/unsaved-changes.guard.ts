import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivateFn } from '@angular/router';

import { HasUnsavedChanges } from './unsaved-changes.model';
import { confirmDiscardChanges } from '../../shared/ui/confirm-dialog/confirm-discard';

/** Asks before leaving a page with unsaved changes; Esc or a backdrop click keeps editing. */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (page) =>
  page.hasUnsavedChanges() ? confirmDiscardChanges(inject(MatDialog)) : true;
