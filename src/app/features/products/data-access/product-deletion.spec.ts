import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarDismiss } from '@angular/material/snack-bar';
import { Subject, of, throwError } from 'rxjs';

import { ProductsApi } from '../../../core/api/products-api';
import { LocalChanges } from './local-changes';
import { ProductDeletion } from './product-deletion';

const PRODUCT = { id: 7, title: 'Chanel Coco Noir' };

/** dialogResult: what the confirm dialog closes with (undefined = Esc / click outside). */
function setup({ dialogResult }: { dialogResult?: boolean } = { dialogResult: true }) {
  const dismissed = new Subject<MatSnackBarDismiss>();
  const api = { deleteProduct: vi.fn(() => of({ isDeleted: true })) };
  const dialog = { open: vi.fn(() => ({ afterClosed: () => of(dialogResult) })) };
  const snackBar = {
    openFromComponent: vi.fn(() => ({ afterDismissed: () => dismissed })),
    open: vi.fn(),
  };

  TestBed.configureTestingModule({
    providers: [
      { provide: ProductsApi, useValue: api },
      { provide: MatDialog, useValue: dialog },
      { provide: MatSnackBar, useValue: snackBar },
      { provide: LiveAnnouncer, useValue: { announce: vi.fn(() => Promise.resolve()) } },
    ],
  });

  return {
    api,
    snackBar,
    dismissed,
    deletion: TestBed.inject(ProductDeletion),
    local: TestBed.inject(LocalChanges),
  };
}

describe('ProductDeletion', () => {
  beforeEach(() => sessionStorage.clear());

  it('confirms only when the user picks Delete', async () => {
    expect(await setup({ dialogResult: true }).deletion.confirm(PRODUCT)).toBe(true);
    TestBed.resetTestingModule();
    expect(await setup({ dialogResult: false }).deletion.confirm(PRODUCT)).toBe(false);
    TestBed.resetTestingModule();
    // Esc or a click outside closes the dialog without a result
    expect(await setup({}).deletion.confirm(PRODUCT)).toBe(false);
  });

  it('hides the product at once and offers Undo', () => {
    const { deletion, local, snackBar } = setup();

    deletion.delete(PRODUCT);

    expect(local.isDeleted(7)).toBe(true);
    expect(snackBar.openFromComponent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: { message: 'Product deleted', durationMs: 8000 } }),
    );
  });

  it('Undo restores the product and never sends DELETE', () => {
    const { deletion, local, api, dismissed } = setup();
    deletion.delete(PRODUCT);

    dismissed.next({ dismissedByAction: true });

    expect(local.isDeleted(7)).toBe(false);
    expect(api.deleteProduct).not.toHaveBeenCalled();
  });

  it('sends DELETE when the undo window closes without Undo', () => {
    const { deletion, local, api, dismissed } = setup();
    deletion.delete(PRODUCT);

    dismissed.next({ dismissedByAction: false });

    expect(api.deleteProduct).toHaveBeenCalledWith(7);
    expect(local.isDeleted(7)).toBe(true);
  });

  it('brings the product back with a message when DELETE fails', () => {
    const { deletion, local, api, snackBar, dismissed } = setup();
    api.deleteProduct.mockReturnValueOnce(throwError(() => new Error('500')));
    deletion.delete(PRODUCT);

    dismissed.next({ dismissedByAction: false });

    expect(local.isDeleted(7)).toBe(false);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Couldn’t delete “Chanel Coco Noir”. It’s back in the list.',
      'OK',
      expect.anything(),
    );
  });
});
