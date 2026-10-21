import { max, min, required, schema, validate } from '@angular/forms/signals';

import { ProductFormModel } from './product-form.model';

/** Text that is not just spaces. */
const blank = (value: string) => value.trim() === '';

/**
 * Validation rules of the product form, kept apart from the page so they can be
 * reused (e.g. by an "Add product" form) and unit tested on their own.
 * Brand stays optional: some DummyJSON products (groceries) have none.
 */
export const productFormSchema = schema<ProductFormModel>((p) => {
  required(p.title, { message: 'Title is required.' });
  validate(p.title, ({ value }) =>
    value() && blank(value()) ? { kind: 'blank', message: 'Title is required.' } : null,
  );

  required(p.description, { message: 'Description is required.' });
  validate(p.description, ({ value }) =>
    value() && blank(value()) ? { kind: 'blank', message: 'Description is required.' } : null,
  );

  required(p.category, { message: 'Choose a category.' });

  required(p.price, { message: 'Price is required.' });
  validate(p.price, ({ value }) =>
    value() !== null && value()! <= 0
      ? { kind: 'positive', message: 'Price must be greater than 0.' }
      : null,
  );

  required(p.discountPercentage, { message: 'Discount is required. Use 0 for no discount.' });
  min(p.discountPercentage, 0, { message: 'Discount must be between 0 and 100.' });
  max(p.discountPercentage, 100, { message: 'Discount must be between 0 and 100.' });

  required(p.stock, { message: 'Stock is required.' });
  min(p.stock, 0, { message: 'Stock can’t be negative.' });
  validate(p.stock, ({ value }) =>
    value() !== null && !Number.isInteger(value())
      ? { kind: 'integer', message: 'Stock must be a whole number.' }
      : null,
  );
});
