// for me> f2: Sign in: 13:24(start) - almost done: 13:45 (needs few style tweaks)
F3: Products list: 13:47(start) - almost done: 14:09
f4: Product details : 14:12 (start) -> 14:26"
f5: Product manipulation: 14: 28(start)

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
  core/        app-wide singletons: layout shell, theme, routing helpers (auth comes later)
  shared/      reusable UI pieces and styles
  features/    one folder per feature (products, bookmarks), each with pages/, ui/, data-access/, models/
```

- Every route is lazy loaded; the shell is a layout route that wraps all signed-in pages.
- Interfaces and types live in their own `*.model.ts` files.

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
- **Responsive list:** a sortable table from 1024px; below that, cards with a "Sort by" dropdown. Stock status is a shared chip with text, icon and color.
- **Accessibility:** skip link to the main content (WCAG 2.4.1), landmarks (`header`, `nav`, `main`), `aria-current` on the active link, visible focus ring, `prefers-reduced-motion` respected, page title per route.

## Possible improvements

- Store tokens in `HttpOnly` cookies set by a real backend instead of `sessionStorage` (not readable by injected scripts).
- Password reset and sign-up flows (DummyJSON has no reset endpoint, and `/users/add` does not persist users).
- Specific messages for rate limiting (`429`) and timeouts.
- Search within a category and a real stock filter (In stock / Low stock / Out of stock) need a backend that combines these filters; DummyJSON offers neither.

## Time log (personal notes – remove before submission)

Start = prompt sent to Claude, end = feature committed and pushed (times from git history, CEST).

| Task                        | Started | Finished | Duration |
| --------------------------- | ------- | -------- | -------- |
| Feature 1 – Setup and shell | 13:04   | 13:22    | 18 min   |
| Feature 2 – Authentication  | 13:24   | 13:45    | 21 min   |
| Feature 3 – Products list   | 13:47   | 14:09    | 22 min   |
| Feature 4 – Product detail  | 14:12   | 14:26    | 14 min   |

## Time spent

| Part                                        | Time |
| ------------------------------------------- | ---- |
| Feature 1 – Setup and shell (started 13:04) |      |
