import type { AuthTokens, AuthUser, ProductDetail, ProfileFormModel } from './interfaces';

// All type aliases of the app (unions and derived types). Object shapes are in ./interfaces.ts.

// ─── Auth ────────────────────────────────────────────────────────────────

/** POST /auth/login returns the profile and both tokens in one object. */
export type LoginResponse = AuthUser & AuthTokens;

/** Why a sign-in attempt failed; the login page maps it to a message. */
export type LoginErrorKind = 'invalid-credentials' | 'network' | 'unknown';

/** Profile fields the user can change; kept locally because DummyJSON does not store them. */
export type ProfileChanges = Partial<ProfileFormModel>;

// ─── Theme ───────────────────────────────────────────────────────────────

/** Theme picked explicitly by the user (no choice = follow the system setting). */
export type ThemeMode = 'light' | 'dark';

/** What the account menu offers: an explicit theme, or follow the system setting. */
export type ThemePreference = ThemeMode | 'system';

// ─── Products ────────────────────────────────────────────────────────────

export type SortField = 'title' | 'price' | 'stock' | 'rating';
export type SortOrder = 'asc' | 'desc';

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

/** Fields the edit form can change. */
export type EditableProductFields = Pick<
  ProductDetail,
  'title' | 'description' | 'category' | 'brand' | 'price' | 'discountPercentage' | 'stock'
>;

export type ProductChanges = Partial<EditableProductFields>;

/** Edit dialog result: true = saved, undefined = closed without saving. */
export type ProductEditDialogResult = true | undefined;

// ─── Shared UI ───────────────────────────────────────────────────────────

/** Look and live-region role of a banner: error = role="alert", info = role="status". */
export type BannerKind = 'error' | 'info';

/** Stock level shown to the user. */
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';
