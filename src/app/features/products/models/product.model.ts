/** Product fields the list needs (requested with `select`). */
export interface Product {
  id: number;
  title: string;
  /** Some DummyJSON products (e.g. groceries) have no brand. */
  brand?: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  thumbnail: string;
}

/** Item of GET /products/categories. */
export interface Category {
  slug: string;
  name: string;
}

/** Shape of every DummyJSON list response. */
export interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

/** One page of products as the app uses it. */
export interface ProductsPage {
  items: Product[];
  total: number;
}
