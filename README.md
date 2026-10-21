// for me> Sign in: 13:24(start) - almost done: 13:45 (needs few style tweaks)
F2: Products list: 13:47(start)

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
- **Accessibility:** skip link to the main content (WCAG 2.4.1), landmarks (`header`, `nav`, `main`), `aria-current` on the active link, visible focus ring, `prefers-reduced-motion` respected, page title per route.

## Possible improvements

- Store tokens in `HttpOnly` cookies set by a real backend instead of `sessionStorage` (not readable by injected scripts).
- Password reset and sign-up flows (DummyJSON has no reset endpoint, and `/users/add` does not persist users).
- Specific messages for rate limiting (`429`) and timeouts.

## Time log (personal notes – remove before submission)

Start = prompt sent to Claude, end = feature committed and pushed (times from git history, CEST).

| Task                        | Started | Finished | Duration |
| --------------------------- | ------- | -------- | -------- |
| Feature 1 – Setup and shell | 13:04   | 13:22    | 18 min   |
| Feature 2 – Authentication  | 13:24   |          |          |

## Time spent

| Part                                        | Time |
| ------------------------------------------- | ---- |
| Feature 1 – Setup and shell (started 13:04) |      |
