// for me> Sign in: 13:24

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
- **Accessibility:** skip link to the main content (WCAG 2.4.1), landmarks (`header`, `nav`, `main`), `aria-current` on the active link, visible focus ring, `prefers-reduced-motion` respected, page title per route.

## Possible improvements

_Filled in at the end._

## Time spent

| Part                                        | Time |
| ------------------------------------------- | ---- |
| Feature 1 – Setup and shell (started 13:04) |      |
