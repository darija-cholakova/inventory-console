import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { FieldTree, FormField, FormRoot, form } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { ErrorStateMatcher } from '@angular/material/core';
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatOption, MatSelect } from '@angular/material/select';
import { firstValueFrom } from 'rxjs';

import { ProductImage } from '../../../../shared/ui/product-image/product-image';
import { LocalChanges } from '../../data-access/local-changes';
import { ProductDetail } from '../../models/product-detail.model';
import {
  ProductFormModel,
  SummaryField,
  toFormModel,
  toProductChanges,
} from '../../models/product-form.model';
import { productFormSchema } from '../../models/product-form.schema';
import { Category } from '../../models/product.model';

const EMPTY_FORM: ProductFormModel = {
  title: '',
  description: '',
  category: '',
  brand: '',
  price: null,
  discountPercentage: null,
  stock: null,
};

/**
 * The product edit form, shared by the edit dialog and the /products/:id/edit page.
 * The host loads the product and decides what happens after save or cancel.
 */
@Component({
  selector: 'app-product-form',
  imports: [
    FormRoot,
    FormField,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatPrefix,
    MatSuffix,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatIcon,
    MatProgressSpinner,
    ProductImage,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductForm {
  private readonly local = inject(LocalChanges);

  /**
   * Server product with local edits already applied. Not `input.required`: form() reads
   * the model while the component is constructed, before inputs are set.
   */
  readonly product = input<ProductDetail>();
  readonly categories = input<Category[]>([]);

  readonly saved = output<void>();
  readonly cancelled = output<void>();

  /** Form values start from the product and reset if another product comes in. */
  private readonly model = linkedSignal<ProductFormModel>(() => {
    const product = this.product();
    return product ? toFormModel(product) : EMPTY_FORM;
  });

  /** Signal Forms: the model signal is the single source of truth, rules come from the schema. */
  protected readonly productForm = form(this.model, productFormSchema, {
    submission: {
      action: (field) => this.save(field().value()),
      onInvalid: () => {
        this.attempted.set(true);
        this.firstInvalid()?.field().focusBoundControl();
      },
    },
  });

  /** True after the first save attempt; from then on errors update while typing. */
  protected readonly attempted = signal(false);
  protected readonly saveFailed = signal(false);
  private isSaved = false;

  /** Field errors appear only after a save attempt (same rule as the sign-in form). */
  protected readonly matcher: ErrorStateMatcher = {
    isErrorState: () => false,
    isSignalErrorState: (field) => !!field && this.attempted() && field().invalid(),
  };

  /** Order of the error summary = order of the fields on screen. */
  private readonly summaryFields: SummaryField[] = [
    { id: 'product-title', field: this.productForm.title },
    { id: 'product-description', field: this.productForm.description },
    { id: 'product-category', field: this.productForm.category },
    { id: 'product-brand', field: this.productForm.brand },
    { id: 'product-price', field: this.productForm.price },
    { id: 'product-discount', field: this.productForm.discountPercentage },
    { id: 'product-stock', field: this.productForm.stock },
  ];

  protected readonly summary = computed(() =>
    this.summaryFields
      .filter(({ field }) => field().invalid())
      .map(({ id, field }) => ({ id, field, message: field().errors()[0]?.message ?? '' })),
  );

  hasUnsavedChanges(): boolean {
    return !this.isSaved && this.productForm().dirty();
  }

  protected focusField(event: Event, field: FieldTree<unknown>): void {
    event.preventDefault();
    field().focusBoundControl();
  }

  private firstInvalid(): SummaryField | undefined {
    return this.summaryFields.find(({ field }) => field().invalid());
  }

  /** Returns nothing on success; a failed request keeps the user on the form with a message. */
  private async save(value: ProductFormModel): Promise<undefined> {
    const product = this.product();
    if (!product) return undefined;
    this.saveFailed.set(false);
    try {
      // Optimistic: lists and detail show the change at once; LocalChanges rolls back on error
      await firstValueFrom(this.local.update(product.id, toProductChanges(value)));
    } catch {
      this.saveFailed.set(true);
      return undefined;
    }
    this.isSaved = true;
    this.saved.emit();
    return undefined;
  }
}
