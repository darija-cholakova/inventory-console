import { ProductDetail, ProductFormModel } from '../../../shared/models/interfaces';
import { ProductChanges } from '../../../shared/models/types';

/** Product → form values (brand may be missing on the API side). */
export function toFormModel(product: ProductDetail): ProductFormModel {
  return {
    title: product.title,
    description: product.description,
    category: product.category,
    brand: product.brand ?? '',
    price: product.price,
    discountPercentage: product.discountPercentage,
    stock: product.stock,
  };
}

/** Form values → PATCH body. Called only for a valid form, so the number fields are set. */
export function toProductChanges(value: ProductFormModel): ProductChanges {
  return {
    title: value.title.trim(),
    description: value.description.trim(),
    category: value.category,
    brand: value.brand.trim() || undefined,
    price: value.price ?? 0,
    discountPercentage: value.discountPercentage ?? 0,
    stock: value.stock ?? 0,
  };
}
