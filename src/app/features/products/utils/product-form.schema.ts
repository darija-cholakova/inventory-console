import { max, min, required, schema, validate } from '@angular/forms/signals';

import { ProductFormModel } from '../../../shared/models/interfaces';

/** Text that is not just spaces. */
const blank = (value: string) => value.trim() === '';

/**
 * Validation rules of the product form, kept apart from the page so they can be
 * reused (e.g. by an "Add product" form) and unit tested on their own.
 * Brand stays optional: some DummyJSON products (groceries) have none.
 */
// Messages are translation keys; the template and the error summary translate them.
export const productFormSchema = schema<ProductFormModel>((p) => {
  required(p.title, { message: 'validation.error.titleRequired' });
  validate(p.title, ({ value }) =>
    value() && blank(value()) ? { kind: 'blank', message: 'validation.error.titleRequired' } : null,
  );

  required(p.description, { message: 'validation.error.descriptionRequired' });
  validate(p.description, ({ value }) =>
    value() && blank(value())
      ? { kind: 'blank', message: 'validation.error.descriptionRequired' }
      : null,
  );

  required(p.category, { message: 'validation.error.categoryRequired' });

  required(p.price, { message: 'validation.error.priceRequired' });
  validate(p.price, ({ value }) =>
    value() !== null && value()! <= 0
      ? { kind: 'positive', message: 'validation.error.pricePositive' }
      : null,
  );

  required(p.discountPercentage, { message: 'validation.error.discountRequired' });
  min(p.discountPercentage, 0, { message: 'validation.error.discountRange' });
  max(p.discountPercentage, 100, { message: 'validation.error.discountRange' });

  required(p.stock, { message: 'validation.error.stockRequired' });
  min(p.stock, 0, { message: 'validation.error.stockNegative' });
  validate(p.stock, ({ value }) =>
    value() !== null && !Number.isInteger(value())
      ? { kind: 'integer', message: 'validation.error.stockInteger' }
      : null,
  );
});
