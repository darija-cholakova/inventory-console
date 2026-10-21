import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';

/**
 * Translations for TypeScript code (snackbars, announcements, computed texts).
 * Templates use the `transloco` pipe instead. Reading `t()` inside computed() makes the text
 * update when another language is loaded.
 */
@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly transloco = inject(TranslocoService);
  /** Emits once the active language's file is loaded (and again after a language switch). */
  private readonly translation = toSignal(this.transloco.selectTranslation(), {
    initialValue: {},
  });

  t(key: string, params?: Record<string, unknown>): string {
    this.translation();
    return this.transloco.translate(key, params);
  }
}
