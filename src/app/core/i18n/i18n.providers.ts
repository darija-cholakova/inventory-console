import { DOCUMENT } from '@angular/common';
import {
  EnvironmentProviders,
  Provider,
  inject,
  isDevMode,
  provideAppInitializer,
} from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoService, provideTransloco } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { TranslatedPaginatorIntl } from './paginator-intl';
import { TranslocoHttpLoader } from './transloco-loader';

/** Languages with a translation file in public/i18n. */
export const AVAILABLE_LANGS = ['en'];
export const DEFAULT_LANG = 'en';

/** Transloco setup, plus translated labels for Material components that have their own text. */
export function provideI18n(): (Provider | EnvironmentProviders)[] {
  return [
    provideTransloco({
      config: {
        availableLangs: AVAILABLE_LANGS,
        defaultLang: DEFAULT_LANG,
        fallbackLang: DEFAULT_LANG,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: { useFallbackTranslation: true },
      },
      loader: TranslocoHttpLoader,
    }),
    // Load the file before the first render: no keys flash on screen, and translate() in
    // TypeScript can be used synchronously. <html lang> follows the active language.
    provideAppInitializer(() => {
      const transloco = inject(TranslocoService);
      const document = inject(DOCUMENT);
      transloco.langChanges$.subscribe((lang) => (document.documentElement.lang = lang));
      return firstValueFrom(transloco.load(DEFAULT_LANG));
    }),
    { provide: MatPaginatorIntl, useClass: TranslatedPaginatorIntl },
  ];
}
