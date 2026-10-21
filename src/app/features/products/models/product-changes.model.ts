import { ProductDetail } from './product-detail.model';

/** Fields the edit form can change. */
export type EditableProductFields = Pick<
  ProductDetail,
  'title' | 'description' | 'category' | 'brand' | 'price' | 'discountPercentage' | 'stock'
>;

export type ProductChanges = Partial<EditableProductFields>;

/** What LocalChanges keeps in sessionStorage. */
export interface StoredChanges {
  edits: Record<number, ProductChanges>;
  deleted: number[];
}
