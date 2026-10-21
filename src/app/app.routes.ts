import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guards';
import { unsavedChangesGuard } from './core/routing/unsaved-changes.guard';

/** Route titles are translation keys; PageTitleStrategy translates them. */
export const routes: Routes = [
  {
    path: 'login',
    title: 'buttons.signIn',
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
        title: 'products.title',
        loadComponent: () =>
          import('./features/products/pages/products-page/products-page').then(
            (m) => m.ProductsPage,
          ),
      },
      {
        path: 'products/:id',
        title: 'products.product',
        loadComponent: () =>
          import('./features/products/pages/product-detail-page/product-detail-page').then(
            (m) => m.ProductDetailPage,
          ),
      },
      {
        path: 'products/:id/edit',
        title: 'products.edit.title',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
          import('./features/products/pages/product-edit-page/product-edit-page').then(
            (m) => m.ProductEditPage,
          ),
      },
      {
        path: 'profile',
        title: 'profile.title',
        loadComponent: () =>
          import('./features/profile/pages/profile-page/profile-page').then((m) => m.ProfilePage),
      },
      {
        path: 'bookmarked',
        title: 'bookmarks.title',
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
