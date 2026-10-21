import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

import { Category } from '../../models/product.model';
import { ProductQuery, SortChange, SortOption } from '../../models/product-query.model';

/** Sort choices for small screens, where the table headers are not shown. */
const SORT_OPTIONS: SortOption[] = [
  { value: 'default', label: 'Default order', sortBy: null, order: 'asc' },
  { value: 'title-asc', label: 'Name A–Z', sortBy: 'title', order: 'asc' },
  { value: 'price-asc', label: 'Price: low to high', sortBy: 'price', order: 'asc' },
  { value: 'price-desc', label: 'Price: high to low', sortBy: 'price', order: 'desc' },
  { value: 'stock-asc', label: 'Stock: low to high', sortBy: 'stock', order: 'asc' },
  { value: 'rating-desc', label: 'Rating: high to low', sortBy: 'rating', order: 'desc' },
];

const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-products-toolbar',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatSuffix,
    MatInput,
    MatIcon,
    MatIconButton,
    MatSelect,
    MatOption,
  ],
  templateUrl: './products-toolbar.html',
  styleUrl: './products-toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsToolbar {
  readonly query = input.required<ProductQuery>();
  readonly categories = input.required<Category[]>();
  /** The sort dropdown is only needed when the table (with sortable headers) is hidden. */
  readonly showSort = input(false);

  readonly searchChange = output<string>();
  readonly categoryChange = output<string | null>();
  readonly sortChange = output<SortChange>();

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly search = new FormControl('', { nonNullable: true });

  constructor() {
    // Keep the field in sync with the URL (e.g. Back button) without re-emitting
    effect(() => {
      const q = this.query().q;
      if (q !== this.search.value.trim()) {
        this.search.setValue(q, { emitEvent: false });
      }
    });

    this.search.valueChanges
      .pipe(
        map((value) => value.trim()),
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((value) => this.searchChange.emit(value));
  }

  protected clearSearch(): void {
    this.search.setValue('', { emitEvent: false });
    this.searchChange.emit('');
  }

  protected sortValue(): string {
    const { sortBy, order } = this.query();
    return SORT_OPTIONS.find((o) => o.sortBy === sortBy && o.order === order)?.value ?? 'default';
  }

  protected onSortSelected(value: string): void {
    const option = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
    this.sortChange.emit({ sortBy: option.sortBy, order: option.order });
  }
}
