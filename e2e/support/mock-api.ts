import { Page, Route } from '@playwright/test';

import categories from '../fixtures/categories.json';
import products from '../fixtures/products.json';
import user from '../fixtures/user.json';

const API = 'https://dummyjson.com';

/** Requests the app sent, so a test can check that e.g. DELETE was (not) called. */
export type ApiLog = string[];

/**
 * Fake DummyJSON: fixed data, no network. Like the real API it pages with limit/skip,
 * searches by title, filters by category, and accepts but does not store PATCH/DELETE.
 */
export async function mockApi(page: Page): Promise<ApiLog> {
  const log: ApiLog = [];

  // Fonts are not needed for the test and would need the network
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

  await page.route(`${API}/**`, async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    log.push(`${request.method()} ${path}`);

    if (path === '/auth/login') {
      return route.fulfill({ json: { ...user, accessToken: 'access', refreshToken: 'refresh' } });
    }
    if (path === '/auth/me') return route.fulfill({ json: user });
    if (path === '/auth/refresh') {
      return route.fulfill({ json: { accessToken: 'access', refreshToken: 'refresh' } });
    }
    if (path.startsWith('/users/') && request.method() === 'PATCH') {
      return route.fulfill({ json: { ...user, ...request.postDataJSON() } });
    }
    if (path === '/products/categories') return route.fulfill({ json: categories });

    const byId = path.match(/^\/products\/(\d+)$/);
    if (byId) {
      const product = products.find((p) => p.id === Number(byId[1]));
      if (!product) return route.fulfill({ status: 404, json: { message: 'Not found' } });
      if (request.method() === 'DELETE')
        return route.fulfill({ json: { ...product, isDeleted: true } });
      if (request.method() === 'PATCH') {
        return route.fulfill({ json: { ...product, ...request.postDataJSON() } });
      }
      return route.fulfill({ json: product });
    }

    // Lists: /products, /products/search?q=, /products/category/{slug}
    let list = products;
    const q = url.searchParams.get('q')?.toLowerCase();
    if (path === '/products/search' && q) {
      list = products.filter((p) => p.title.toLowerCase().includes(q));
    }
    const category = path.match(/^\/products\/category\/(.+)$/)?.[1];
    if (category) list = products.filter((p) => p.category === category);

    const limit = Number(url.searchParams.get('limit') ?? 30) || list.length;
    const skip = Number(url.searchParams.get('skip') ?? 0);
    return route.fulfill({
      json: { products: list.slice(skip, skip + limit), total: list.length, skip, limit },
    });
  });

  return log;
}
