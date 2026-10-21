// for me> f2: Sign in: 13:24(start) - almost done: 13:45 (needs few style tweaks)
F3: Products list: 13:47(start) - almost done: 14:09
f4: Product details : 14:12 (start) -> 14:26"
f5: Product manipulation: 14: 28(start) -> 15:09
f6: Bookmarked: 15:11(start) -> 15;21
Refactor: 15:26 -> 15:29
Unit test+e2e: 20:52 -> 21:07 (one component for now)
restore 15-minute access token lifetime ~ <1m
readable rating in table and label-in-name for account button & a11y labels in table and account menu, validate stored local changes: 21:13 -> 21:24
User Profile> 21:30 -> 21:46
Improvements: 21:50->21:58

# Inventory Console

A small inventory management console built with Angular on top of the public [DummyJSON](https://dummyjson.com/) API: sign in, browse and search products, open a product, edit or delete it locally.

> Technical test for the Frontend Engineer position (UX/UI department) at Hornetsecurity.

## How to run

Requirements: Node.js `^22.22.3 || ^24.15.0 || ^26` (Angular 22).

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build in dist/
npm run lint       # ESLint (angular-eslint)
npm test           # unit tests (Vitest)
```

## Tech stack

| Area       | Choice                                                               |
| ---------- | -------------------------------------------------------------------- |
| Framework  | Angular 22 (standalone, signals, zoneless, new control flow, OnPush) |
| UI library | Angular Material 3 + CDK                                             |
| Styling    | SCSS, Material 3 system tokens (`--mat-sys-*`), mobile first         |
| State      | NgRx Signals (SignalStore)                                           |
| Tests      | Vitest (unit), Playwright (E2E)                                      |
| Tooling    | Angular CLI, ESLint, Prettier                                        |

## Architecture

```
src/app/
  core/        app-wide singletons
    api/         all HTTP clients in one place: api.config.ts (base URL), auth-api.ts, products-api.ts
    auth/        session (AuthService), interceptor, guards
    layout/      shell, account menu
    routing/     title strategy, unsaved-changes guard
    theme/
  shared/
    models/      interfaces.ts (all interfaces) and types.ts (all type aliases)
    ui/          reusable components: state message, stock chip, product image, confirm dialog, dialog shell, undo snackbar
    utils/       small pure helpers (stock status)
    styles/
  features/    one folder per feature (products, bookmarks), each with pages/, ui/, data-access/ and, where needed, utils/
```

- Every route is lazy loaded; the shell is a layout route that wraps all signed-in pages.
- **API layer:** every HTTP call goes through a small, stateless client in `core/api/` (`AuthApi`, `ProductsApi`). Services and stores above it own the state (session, local edits, page), so the endpoints can be found, mocked or replaced in one place.
- **Types:** all of them live in two files, `shared/models/interfaces.ts` (object shapes: API responses, state, form model, dialog data) and `shared/models/types.ts` (unions and derived types: `LoadStatus`, `SortField`, `ProductChanges = Partial<Pick<…>>`, `LoginResponse = AuthUser & AuthTokens`), grouped by area with section comments. Components and services only import them; no type is declared inside a component or service. Functions and constants that used to sit next to types moved to `utils/` (form mapper, validation schema, default query, stock status).

## Technical decisions

- **Theme:** Material 3 palette generated from the seed color Signal Blue `#1E63D6` with the official `theme-color` schematic; Inter font; light and dark theme from the same tokens via `light-dark()`. Success and warning status colors are app tokens (`--app-*`) because Material 3 has none.
- **Dark theme switch:** follows the OS setting until the user picks a theme; the choice is stored in `localStorage`. A labelled switch ("Dark theme") instead of a sun/moon icon, so the meaning is explicit.
- **Navigation:** permanent side nav from 840px (M3 expanded window class); below that a modal drawer opened from the menu button.
- **Authentication:** sign-in against DummyJSON `/auth/login`. The session (user + access and refresh tokens) is kept in `sessionStorage`: a reload keeps the user signed in, closing the tab or browser signs them out. Access tokens live 15 minutes (`expiresInMins: 15`, short-lived as OWASP recommends); a functional interceptor adds the Bearer token, and on a `401` it refreshes once (parallel requests share one refresh call) and repeats the request. If the refresh fails the session has expired and the user returns to sign-in with a `returnUrl`.
- **Route guards:** `authGuard` protects every signed-in page, `guestGuard` keeps signed-in users away from `/login`. `returnUrl` accepts in-app paths only, which prevents open redirects.
- **Sign-in errors:** "user does not exist" and "wrong password" share one message, so the form does not reveal which usernames exist (user enumeration). Network failures get their own message. Field errors are shown on submit and focus moves to the first invalid field.
- **State management:** NgRx SignalStore (`ProductsStore`) holds the query, the current page of products, the total and a load status. `rxMethod` + `switchMap` cancels an outdated request when the query changes quickly. The store is provided by the page, so its state lives as long as the page.
- **URL as the source of truth:** search, category, sort, order, page and page size live in the query string (`?q=phone&sort=price&page=2`). Links are shareable, a reload restores the same view and Back/Forward work. Starting a search adds a history entry; refining it replaces that entry.
- **Search and category:** DummyJSON has separate endpoints for search (`/products/search`) and category (`/products/category/{slug}`) and cannot combine them. Search therefore looks across all categories, and choosing a category clears the search (and the other way round). Everything else (paging, sorting) runs on the server.
- **Sorting by stock instead of a stock filter:** the API cannot filter by stock, but it can sort by any field. Sorting by stock (low to high) brings low and out-of-stock items to the top without loading the whole catalog in the browser.
- **Smaller responses:** list requests use `select` to fetch only the fields the list shows.
- **List states:** skeleton on the first load, a thin progress bar while a new page loads (rows stay visible), an empty state with "Clear filters", and an error state with "Try again". A live region announces the number of results.
- **Product detail with `rxResource`:** one read request per page, so the detail page uses Angular's `rxResource` (stable in v22) instead of a store. It exposes loading, value and error as signals and refetches when the `:id` changes. A `404` shows "Product not found"; other errors show "Try again" (`reload()`).
- **Back to the list keeps the filters:** the list remembers its last URL (as a `UrlTree`) in a small root service, so "Products" on the detail page returns to the same search, sort and page.
- **Detail page accessibility:** the tab title becomes the product name and focus moves to the heading after load; the gallery thumbnails are one tab stop with arrow-key navigation; stars are decorative and the rating is read as "Rating 4.6 out of 5". The main image uses `NgOptimizedImage` with `priority` (LCP), thumbnails are lazy loaded.
- **Local changes layer:** DummyJSON answers `PATCH` and `DELETE` as if they succeeded but never stores them. `LocalChanges` (root service) keeps the user's edits and deletions in `sessionStorage` and applies them on top of every server response: the store derives the visible rows and total from the raw server page, and the detail and edit pages apply the edits to the fetched product. A deleted product is treated like a `404`.
- **Full pages after a delete:** the server still counts deleted products, so its pages are shifted. While there are local deletions, the list fetches from the first item up to the end of the current page plus the number of deletions (`limit = page × size + deleted`, `skip = 0`), removes the deleted ones and cuts the page in the store. Every page stays full, nothing is skipped or shown twice, and a delete or Undo reloads the page at once. On a large catalog this request grows with the page number; a real backend would handle deletions itself.
- **Optimistic update with rollback:** an edit is applied at once (list and detail show it immediately) and the `PATCH` runs in the background. If it fails, the edit is rolled back and the form shows an error, keeping the user's input.
- **Delete: confirmation and Undo:** every delete asks "Delete “…”?" first (Cancel has the initial focus, the confirm button uses the error color). After confirming, the product disappears at once and a snackbar still offers Undo for 8 seconds as a safety net; the timer pauses while the pointer or keyboard focus is on the snackbar. `DELETE` is sent only when the window closes without Undo; if it fails, the product comes back with a message. After a delete from the list, focus moves to the page heading instead of being lost. Cancel in the edit form asks only when there are unsaved changes, so closing an untouched form stays one click.
- **Edit form with Signal Forms:** `@angular/forms/signals` is stable in Angular 22 and fits a signals-first app: the form model is a `linkedSignal` seeded from the product, and the validation rules are a separate, reusable `schema` (`product-form.schema.ts`). Angular Material 22 supports it directly (`matInput` and `mat-select` read the `[formField]` state), so no adapter code was needed. Rules: title, description, category, price, discount and stock are required; price > 0, discount 0–100, stock a whole number ≥ 0; brand is optional (some products have none).
- **Form validation UX:** errors appear after the first save attempt (not while the user is still filling in the form) and then update live. An error summary lists every problem with links to the fields, and focus moves to the first invalid field. The button shows "Saving…" while the request runs; after saving, the detail page opens with a "Changes saved" snackbar.
- **Edit in a dialog, or as a page from a link:** inside the app, Edit (row menu, card menu, detail page) opens the form in a dialog over the current screen, so the user keeps their place in the list. A direct link to `/products/:id/edit` opens the same form as a centered page. Both hosts load the product and reuse one `ProductForm` component; the dialog frame (`DialogShell`: title, close button, scrollable body) is a shared UI component.
- **Unsaved changes:** leaving a changed form asks "Discard unsaved changes?" ("Keep editing" has the initial focus). On the page this is a `canDeactivate` guard (plus the browser's own prompt on tab close via `beforeunload`); in the dialog, Esc, the backdrop and the close button go through the same check (`disableClose` + `backdropClick` / `keydownEvents`).
- **Bookmarked:** a personal working list of products to keep an eye on. Ids live in `localStorage`, not `sessionStorage` like the session and local edits: a bookmark should survive closing the tab. DummyJSON has no favorites/bookmarks resource and cannot fetch several ids in one request, so the page loads the catalog once with list fields only (`limit=0&select=…`, ~194 small items) and keeps the bookmarked ones; one request regardless of the number of bookmarks, always current prices and stock. A real backend would offer `?ids=` or a bookmarks endpoint. The page reuses `ProductsTable`, `ProductCards`, the skeleton, the edit dialog and the delete flow; search and sorting run in the browser (short list, no paginator). One `BookmarkButton` (filled icon + `aria-pressed`, label with the product name, tooltip) is used in the table, the cards and the detail page; the side nav shows the count with screen reader text ("3 products").
- **Responsive list:** a sortable table from 1200px (it needs room for eight columns next to the side nav); below that, cards with a "Sort by" dropdown. In the table, stock is split into **Stock** (status chip with text, icon and color, never color alone) and **Quantity** (right-aligned number, sortable), so quantities line up and are easy to compare; the cards keep both in one chip ("In stock · 29").
- **Accessibility:** skip link to the main content (WCAG 2.4.1), landmarks (`header`, `nav`, `main`), `aria-current` on the active link, visible focus ring, `prefers-reduced-motion` respected, page title per route.

## Testing

```bash
npm test          # unit tests (Vitest, through `ng test`; add `-- --watch=false` for a single run)
npm run e2e       # end-to-end test (Playwright); starts `ng serve` if it is not running
```

First run of the E2E test: `npx playwright install chromium` (downloads the browser once).

- **Unit tests (32, in `features/products/data-access/`):**
  - `products-store.spec.ts` – loads a page; keeps pages full after a delete (`limit = page × size + deleted`, `skip = 0`) with no product shown twice; removes a row at once and brings it back on Undo; empty last page; "no results"; keeps rows while the next page loads; ignores an outdated response (`switchMap`); keeps the query after an error so "Try again" repeats it.
  - `local-changes.spec.ts` – optimistic edit and rollback to the previous value; delete hides without calling the API; failed `DELETE` brings the product back; survives a reload; broken or old storage data (invalid JSON, `null`, wrong shape) starts empty instead of crashing.
  - `product-deletion.spec.ts` – confirm only on "Delete" (Cancel, Esc, click outside = no); Undo restores and never sends `DELETE`; timeout sends `DELETE`; failed `DELETE` restores with a message.
  - `product-query-params.spec.ts` – URL → query and back; invalid or hand-edited values fall back to defaults; search wins over category; spaces-only search; defaults are left out of the URL.
  - `ProductsApi` and Material dialogs/snackbars are fakes; the real `LocalChanges` runs on jsdom `sessionStorage`, so the store and the local layer are tested together.
- **E2E – main flow** (`e2e/product-flow.spec.ts`): sign in → search → detail → edit in the dialog → delete with confirmation → Undo, and checks that the `PATCH` was sent and the `DELETE` was not (undone in time).
- **Why mocks:** DummyJSON does not store changes and the data can change, so the E2E test answers every API call from fixed fixtures (`e2e/fixtures/`, `e2e/support/mock-api.ts`). The test is fast, stable and works offline.
- **Selectors by role and label** (`getByRole`, `getByLabel`), never CSS classes: if a control loses its accessible name, the test fails. That makes the E2E test a small accessibility check too.

## Possible improvements

- Store tokens in `HttpOnly` cookies set by a real backend instead of `sessionStorage` (not readable by injected scripts).
- Password reset and sign-up flows (DummyJSON has no reset endpoint, and `/users/add` does not persist users).
- Specific messages for rate limiting (`429`) and timeouts.
- Product images: DummyJSON stores images as URLs and has no upload endpoint, so the edit form shows the image but cannot change it. Uploading needs a backend with file storage.
- Add product: DummyJSON has `POST /products/add` (simulated, not stored). The `ProductForm` component and `productFormSchema` are reusable for it; it was left out to stay within the time budget.
- A keyboard shortcut to reach Undo in the snackbar.
- Search within a category and a real stock filter (In stock / Low stock / Out of stock) need a backend that combines these filters; DummyJSON offers neither.

## Time log (personal notes – remove before submission)

Start = prompt sent to Claude, end = feature committed and pushed (times from git history, CEST).

| Task                        | Started | Finished | Duration |
| --------------------------- | ------- | -------- | -------- |
| Feature 1 – Setup and shell | 13:04   | 13:22    | 18 min   |
| Feature 2 – Authentication  | 13:24   | 13:45    | 21 min   |
| Feature 3 – Products list   | 13:47   | 14:09    | 22 min   |
| Feature 4 – Product detail  | 14:12   | 14:26    | 14 min   |
| Feature 5 – Edit and delete | 14:29   | 15:09    | 40 min   |
| Feature 6 – Bookmarked      | 15:11   | 15:21    | 10 min   |
| Refactor – API layer, types | 15:21   | 15:29    | 8 min    |
| Feature 7 – Tests           | 20:52   | 21:10    | 18 min   |

## Time spent

| Part                                        | Time |
| ------------------------------------------- | ---- |
| Feature 1 – Setup and shell (started 13:04) |      |
