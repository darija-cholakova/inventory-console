import { Injectable, inject } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoService } from '@jsverse/transloco';

/** MatPaginator's built-in English labels, replaced with keys from the translation file. */
@Injectable()
export class TranslatedPaginatorIntl extends MatPaginatorIntl {
  private readonly transloco = inject(TranslocoService);

  constructor() {
    super();
    this.transloco.selectTranslation().subscribe(() => {
      this.itemsPerPageLabel = this.t('paginator.itemsPerPage');
      this.nextPageLabel = this.t('paginator.nextPage');
      this.previousPageLabel = this.t('paginator.previousPage');
      this.firstPageLabel = this.t('paginator.firstPage');
      this.lastPageLabel = this.t('paginator.lastPage');
      this.changes.next();
    });
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) return this.t('paginator.rangeEmpty', { length });
    const start = page * pageSize + 1;
    const end = Math.min(start + pageSize - 1, length);
    return this.t('paginator.range', { start, end, length });
  };

  private t(key: string, params?: Record<string, unknown>): string {
    return this.transloco.translate(key, params);
  }
}
