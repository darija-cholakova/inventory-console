import { Injector, inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';

import { HasUnsavedChanges } from '../../shared/models/interfaces';

/**
 * Asks before leaving a page with unsaved changes; Esc or a backdrop click keeps editing.
 * The dialog code is imported on demand: the guard sits in the eagerly loaded route config,
 * and a static import would pull MatDialog and the CDK overlay (~90 kB) into the initial bundle.
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = async (page) => {
  if (!page.hasUnsavedChanges()) return true;

  const injector = inject(Injector);
  const [{ MatDialog }, { confirmDiscardChanges }, { firstValueFrom }] = await Promise.all([
    import('@angular/material/dialog'),
    import('../../shared/ui/dialogs/confirm-dialog/confirm-discard'),
    import('rxjs'),
  ]);
  return firstValueFrom(confirmDiscardChanges(injector.get(MatDialog)));
};
