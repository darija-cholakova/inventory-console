import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ProductsApi } from '../../../core/api/products-api';
import { Product } from '../../../shared/models/interfaces';
import { LocalChanges } from './local-changes';

const PRODUCT: Product = {
  id: 1,
  title: 'Red Lipstick',
  category: 'beauty',
  price: 12.99,
  stock: 91,
  rating: 4,
  thumbnail: '',
};

function setup() {
  const api = {
    updateProduct: vi.fn(() => of({})),
    deleteProduct: vi.fn(() => of({ isDeleted: true })),
  };
  TestBed.configureTestingModule({ providers: [{ provide: ProductsApi, useValue: api }] });
  return { api, local: TestBed.inject(LocalChanges) };
}

describe('LocalChanges', () => {
  beforeEach(() => sessionStorage.clear());

  it('applies an edit at once (optimistic) and sends a PATCH', () => {
    const { local, api } = setup();

    local.update(1, { title: 'Matte' }).subscribe();

    expect(local.apply(PRODUCT).title).toBe('Matte');
    expect(api.updateProduct).toHaveBeenCalledWith(1, { title: 'Matte' });
  });

  it('rolls an edit back to the previous value when the PATCH fails', () => {
    const { local, api } = setup();
    local.update(1, { title: 'First edit' }).subscribe();
    api.updateProduct.mockReturnValueOnce(throwError(() => new Error('500')));

    local.update(1, { title: 'Second edit' }).subscribe({ error: () => undefined });

    expect(local.apply(PRODUCT).title).toBe('First edit');
  });

  it('hides a deleted product and counts it, without calling the API yet', () => {
    const { local, api } = setup();

    local.markDeleted(1);
    const { items, removed } = local.applyToList([PRODUCT, { ...PRODUCT, id: 2 }]);

    expect(items.map((p) => p.id)).toEqual([2]);
    expect(removed).toBe(1);
    expect(local.deletedCount()).toBe(1);
    expect(api.deleteProduct).not.toHaveBeenCalled();
  });

  it('brings the product back when the DELETE fails', () => {
    const { local, api } = setup();
    api.deleteProduct.mockReturnValueOnce(throwError(() => new Error('500')));
    local.markDeleted(1);

    local.commitDelete(1).subscribe({ error: () => undefined });

    expect(local.isDeleted(1)).toBe(false);
  });

  it('survives a reload (sessionStorage)', () => {
    const { local } = setup();
    local.markDeleted(1);
    local.update(2, { stock: 0 }).subscribe();

    TestBed.resetTestingModule();
    const { local: reloaded } = setup();

    expect(reloaded.isDeleted(1)).toBe(true);
    expect(reloaded.apply({ ...PRODUCT, id: 2 }).stock).toBe(0);
  });

  it.each([
    ['not JSON', '{not json'],
    ['null', 'null'],
    ['an empty object', '{}'],
    ['a wrong shape', '{"edits":[],"deleted":"7"}'],
  ])('starts empty when the stored data is %s', (_label, stored) => {
    sessionStorage.setItem('inventory-console.local-changes', stored);

    const { local } = setup();

    expect(local.deletedCount()).toBe(0);
    expect(local.apply(PRODUCT)).toEqual(PRODUCT);
  });
});
