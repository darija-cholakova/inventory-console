import { expect, test } from '@playwright/test';

import { mockApi } from './support/mock-api';

/**
 * Main flow of the app: sign in → search → detail → edit in the dialog →
 * delete with confirmation → undo. Selectors use roles and labels, which also checks
 * that the controls have accessible names.
 */
test('sign in, find, edit, delete and undo a product', async ({ page }) => {
  const api = await mockApi(page);

  // Sign in
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill('emilys');
  await page.getByLabel('Password', { exact: true }).fill('emilyspass');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Products', level: 1 })).toBeVisible();

  // Search
  await page.getByRole('searchbox', { name: 'Search' }).fill('lipstick');
  await expect(page).toHaveURL(/q=lipstick/);
  await expect(page.getByText('1 result for “lipstick”')).toBeVisible();

  // Detail
  await page.getByRole('link', { name: 'Red Lipstick' }).click();
  await expect(page.getByRole('heading', { name: 'Red Lipstick', level: 1 })).toBeVisible();

  // Edit in the dialog
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  const editDialog = page.getByRole('dialog', { name: 'Edit product' });
  await editDialog.getByLabel('Title').fill('Red Lipstick Matte');
  await editDialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(editDialog).toBeHidden();
  await expect(page.getByText('Changes saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Red Lipstick Matte', level: 1 })).toBeVisible();
  expect(api).toContain('PATCH /products/4');

  // Delete: confirm, back to the list (same search), then undo
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  const confirm = page.getByRole('alertdialog', { name: 'Delete “Red Lipstick Matte”?' });
  await confirm.getByRole('button', { name: 'Delete' }).click();

  await expect(page).toHaveURL(/\/products\?q=lipstick/);
  await expect(page.getByText('Product deleted')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Red Lipstick Matte' })).toBeHidden();

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByRole('link', { name: 'Red Lipstick Matte' })).toBeVisible();
  // Undo before the window closed: the DELETE request was never sent
  expect(api).not.toContain('DELETE /products/4');
});
