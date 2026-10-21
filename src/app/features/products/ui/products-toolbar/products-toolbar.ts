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

import {
  Category,
  ProductQuery,
  SortChange,
  SortOption,
} from '../../../../shared/models/interfaces';
import { TranslocoPipe } from '@jsverse/transloco';

/** Sort choices for small screens, where the table headers are not shown. Labels are translation keys. */
const SORT_OPTIONS: SortOption[] = [
  { value: 'default', label: 'products.toolbar.sort.default', sortBy: null, order: 'asc' },
  { value: 'title-asc', label: 'products.toolbar.sort.titleAsc', sortBy: 'title', order: 'asc' },
  { value: 'price-asc', label: 'products.toolbar.sort.priceAsc', sortBy: 'price', order: 'asc' },
  { value: 'price-desc', label: 'products.toolbar.sort.priceDesc', sortBy: 'price', order: 'desc' },
  { value: 'stock-asc', label: 'products.toolbar.sort.stockAsc', sortBy: 'stock', order: 'asc' },
  {
    value: 'rating-desc',
    label: 'products.toolbar.sort.ratingDesc',
    sortBy: 'rating',
    order: 'desc',
  },
];

const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-products-toolbar',
  imports: [
    TranslocoPipe,
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
