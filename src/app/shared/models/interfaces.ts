import { FieldTree } from '@angular/forms/signals';

import type { LoadStatus, ProductChanges, SortField, SortOrder, ThemePreference } from './types';

// All interfaces of the app (object shapes). Type aliases and unions are in ./types.ts.

// ─── Auth ────────────────────────────────────────────────────────────────

/** Body of POST /auth/login. */
export interface LoginRequest {
  username: string;
  password: string;
  /** Access token lifetime; DummyJSON defaults to 60. */
  expiresInMins?: number;
}

/** Profile fields returned by POST /auth/login. */
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

/** Body of POST /auth/refresh. */
export interface RefreshRequest {
  refreshToken: string;
  expiresInMins?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Work-related fields of GET /auth/me shown on the profile page. The API returns much more
 * (bank card, SSN, IP, health data…); those are deliberately not typed or shown.
 */
export interface UserProfile extends AuthUser {
  phone: string;
  role: string;
  address: { city: string; state: string; country: string };
  company: { name: string; title: string; department: string };
}

/** Values of the profile edit form (job title maps to company.title). */
export interface ProfileFormModel {
  firstName: string;
  lastName: string;
  phone: string;
  jobTitle: string;
}

/** Body of PATCH /users/{id} for the profile form. */
export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: { title: string };
}

/** What the app keeps in sessionStorage. */
export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

// ─── Layout and routing ──────────────────────────────────────────────────

/** Entry of the Theme submenu in the account menu. */
export interface ThemeOption {
  value: ThemePreference;
  label: string;
  /** Material Symbols ligature name */
  icon: string;
}

/** Entry of the Language submenu; only English exists for now (i18n is a possible improvement). */
export interface LanguageOption {
  code: string;
  label: string;
  available: boolean;
}

export interface NavItem {
  label: string;
  path: string;
  /** Material Symbols ligature name */
  icon: string;
  /** Optional count shown next to the label, e.g. bookmarked products. */
  count?: () => number;
  /** What the count means, for screen readers ("3 products"). */
  countLabel?: string;
}

/** Implemented by pages with a form that can lose changes on navigation. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

// ─── Products: API data ──────────────────────────────────────────────────

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

// ─── Products: list state ────────────────────────────────────────────────

/**
 * Everything that defines the visible list. It is mirrored in the URL
 * (?q=&category=&sort=&order=&page=&size=), which is the source of truth.
 */
export interface ProductQuery {
  /** Search text; when set, category is null (the API cannot combine them). */
  q: string;
  category: string | null;
  sortBy: SortField | null;
  order: SortOrder;
  /** 1-based page number */
  page: number;
  pageSize: number;
}

/** Emitted by the table headers and the "Sort by" select. */
export interface SortChange {
  sortBy: SortField | null;
  order: SortOrder;
}

/** One entry of the "Sort by" select on small screens. */
export interface SortOption extends SortChange {
  value: string;
  label: string;
}

/** State of ProductsStore. */
export interface ProductsState {
  query: ProductQuery;
  /** Page as the server returned it; local edits and deletions are applied on top. */
  serverItems: Product[];
  serverTotal: number;
  /** Where the visible page starts in serverItems (> 0 only when fetched from the start). */
  windowStart: number;
  status: LoadStatus;
  categories: Category[];
}

// ─── Products: editing ───────────────────────────────────────────────────

/** What LocalChanges keeps in sessionStorage. */
export interface StoredChanges {
  edits: Record<number, ProductChanges>;
  deleted: number[];
}

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

/** A field in the form's error summary: the id its link points to and the field to focus. */
export interface SummaryField {
  id: string;
  field: FieldTree<unknown>;
}

export interface ProfileEditDialogData {
  profile: UserProfile;
}

export interface ProductEditDialogData {
  productId: number;
}

// ─── Bookmarks ───────────────────────────────────────────────────────────

/** The few product fields the bookmark button needs (id to store, title for labels). */
export interface BookmarkTarget {
  id: number;
  title: string;
}

// ─── Shared UI ───────────────────────────────────────────────────────────

export interface ConfirmDialogData {
  title: string;
  message: string;
  /** Safe choice: listed first, so it gets the initial focus. Closes with false. */
  cancelLabel: string;
  /** Destructive choice. Closes with true. */
  confirmLabel: string;
}

export interface UndoSnackbarData {
  message: string;
  /** Time before the snackbar closes on its own; paused while hovered or focused. */
  durationMs: number;
}
