import { ProductDetail } from './product-detail.model';
import { ProductChanges } from './product-changes.model';

/**
 * Values of the edit form. Number fields are null while the input is empty,
 * so "required" can tell an empty field from 0.
 */
export interface ProductFormModel {
  title: string;
  description: string;
  category: string;
  brand: string;
  price: number | null;
  discountPercentage: number | null;
  stock: number | null;
}

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

/** Called only for a valid form, so the number fields are set. */
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
