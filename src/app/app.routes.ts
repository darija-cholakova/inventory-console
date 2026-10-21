import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
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
