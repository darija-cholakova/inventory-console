/** Stock level shown to the user. Lives in shared/ so any feature can reuse the chip. */
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

/** 10 or fewer items counts as low stock. */
export const LOW_STOCK_THRESHOLD = 10;

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'out-of-stock';
  if (stock <= LOW_STOCK_THRESHOLD) return 'low-stock';
  return 'in-stock';
}
