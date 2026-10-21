export interface ProductEditDialogData {
  productId: number;
}

/** true = saved, undefined = closed without saving. */
export type ProductEditDialogResult = true | undefined;
