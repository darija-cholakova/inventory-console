import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign in',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      {
        path: 'products',
        title: 'Products',
        loadComponent: () =>
          import('./features/products/pages/products-page/products-page').then(
            (m) => m.ProductsPage,
          ),
      },
      {
        path: 'bookmarked',
        title: 'Bookmarked',
        loadComponent: () =>
          import('./features/bookmarks/pages/bookmarks-page/bookmarks-page').then(
            (m) => m.BookmarksPage,
          ),
      },
    ],
  },
  // Unknown URLs go back to the product list (a 404 page is out of scope)
  { path: '**', redirectTo: 'products' },
];
