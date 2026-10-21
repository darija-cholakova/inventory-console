import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

import { BackLink } from '../../../../shared/ui/back-link/back-link';
import { StateMessage } from '../../../../shared/ui/state-message/state-message';
import { I18n } from '../../../../core/i18n/i18n';
import { LocalChanges } from '../../../../core/products/local-changes';
import { ProductsApi } from '../../../../core/api/products-api';
import { ProductForm } from '../../ui/product-form/product-form';
import { HasUnsavedChanges } from '../../../../shared/models/interfaces';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * Edit page for a direct link (/products/:id/edit). Inside the app, Edit opens
 * the same form in a dialog (ProductEditDialog).
 */
@Component({
  selector: 'app-product-edit-page',
  imports: [
    TranslocoPipe,
    BackLink,
    RouterLink,
    MatButton,
    MatProgressBar,
    StateMessage,
    ProductForm,
  ],
  templateUrl: './product-edit-page.html',
  styleUrl: './product-edit-page.scss',
  // Closing or reloading the tab is outside the router: let the browser ask instead
  host: { '(window:beforeunload)': 'onBeforeUnload($event)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditPage implements HasUnsavedChanges {
  private readonly api = inject(ProductsApi);
  private readonly local = inject(LocalChanges);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly i18n = inject(I18n);

  /** Route param, bound through withComponentInputBinding(). */
  readonly id = input.required<string>();

  protected readonly product = rxResource({
    params: () => Number(this.id()),
    stream: ({ params: id }) => this.api.getProduct(id),
  });
  protected readonly categories = rxResource({ stream: () => this.api.getCategories() });

  /** Server product with the user's local edits applied. */
  protected readonly view = computed(() =>
    this.product.hasValue() && !this.isDeleted() ? this.local.apply(this.product.value()) : null,
  );

  private readonly isDeleted = computed(() => this.local.isDeleted(Number(this.id())));
  protected readonly notFound = computed(() => {
    const error = this.product.error();
    return this.isDeleted() || (error instanceof HttpErrorResponse && error.status === 404);
  });

  private readonly form = viewChild(ProductForm);

  hasUnsavedChanges(): boolean {
    return this.form()?.hasUnsavedChanges() ?? false;
  }

  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) event.preventDefault();
  }

  protected async onSaved(): Promise<void> {
    await this.router.navigate(['/products', this.id()]);
    this.snackBar.open(this.i18n.t('validation.success.changesSaved'), undefined, {
      duration: 4000,
    });
  }

  protected onCancelled(): void {
    void this.router.navigate(['/products', this.id()]);
  }
}
