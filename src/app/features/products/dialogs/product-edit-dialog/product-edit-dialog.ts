import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DialogShell } from '../../../../shared/ui/dialogs/dialog-shell/dialog-shell';
import { StateMessage } from '../../../../shared/ui/state-message/state-message';
import { LocalChanges } from '../../../../core/products/local-changes';
import { ProductsApi } from '../../../../core/api/products-api';
import { ProductForm } from '../../ui/product-form/product-form';
import { ProductEditDialogData } from '../../../../shared/models/interfaces';
import { ProductEditDialogResult } from '../../../../shared/models/types';

/**
 * Edit form in a dialog, opened from the list, the cards, Bookmarked and the detail page.
 * Closing (and the unsaved-changes check) is handled by the shared DialogShell.
 */
@Component({
  selector: 'app-product-edit-dialog',
  imports: [DialogShell, ProductForm, StateMessage, MatProgressBar, MatButton],
  template: `
    <app-dialog-shell title="Edit product" [hasUnsavedChanges]="hasUnsavedChanges">
      @if (product.isLoading()) {
        <div role="status">
          <span class="visually-hidden">Loading product…</span>
          <mat-progress-bar mode="indeterminate" aria-hidden="true" />
        </div>
      } @else if (notFound()) {
        <app-state-message
          icon="search_off"
          title="Product not found"
          message="This product may have been deleted."
        />
      } @else if (product.error()) {
        <app-state-message icon="error" title="Couldn't load the product">
          <button matButton="tonal" type="button" (click)="product.reload()">Try again</button>
        </app-state-message>
      } @else if (view(); as p) {
        <app-product-form
          [product]="p"
          [categories]="categories.value() ?? []"
          (saved)="onSaved()"
          (cancelled)="shell().requestClose()"
        />
      }
    </app-dialog-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditDialog {
  private readonly api = inject(ProductsApi);
  private readonly local = inject(LocalChanges);
  private readonly snackBar = inject(MatSnackBar);
  private readonly ref =
    inject<MatDialogRef<ProductEditDialog, ProductEditDialogResult>>(MatDialogRef);
  private readonly id = inject<ProductEditDialogData>(MAT_DIALOG_DATA).productId;

  protected readonly product = rxResource({ stream: () => this.api.getProduct(this.id) });
  protected readonly categories = rxResource({ stream: () => this.api.getCategories() });

  protected readonly view = computed(() =>
    this.product.hasValue() && !this.local.isDeleted(this.id)
      ? this.local.apply(this.product.value())
      : null,
  );
  protected readonly notFound = computed(() => {
    const error = this.product.error();
    return (
      this.local.isDeleted(this.id) || (error instanceof HttpErrorResponse && error.status === 404)
    );
  });

  private readonly form = viewChild(ProductForm);
  protected readonly shell = viewChild.required(DialogShell);
  protected readonly hasUnsavedChanges = () => this.form()?.hasUnsavedChanges() ?? false;

  /** Opens the dialog for one product. */
  static open(dialog: MatDialog, productId: number): MatDialogRef<ProductEditDialog> {
    return dialog.open<ProductEditDialog, ProductEditDialogData, ProductEditDialogResult>(
      ProductEditDialog,
      {
        data: { productId },
        width: 'var(--app-dialog-form-width)',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: '95vh',
      },
    );
  }

  protected onSaved(): void {
    this.ref.close(true);
    this.snackBar.open('Changes saved', undefined, { duration: 4000 });
  }
}
