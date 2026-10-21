import { Product } from './product.model';

export interface ProductReview {
  rating: number;
  comment: string;
  /** ISO date string */
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

/** Full product from GET /products/{id}. */
export interface ProductDetail extends Product {
  description: string;
  discountPercentage: number;
  tags: string[];
  sku: string;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: ProductReview[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: { createdAt: string; updatedAt: string; barcode: string; qrCode: string };
  images: string[];
}
