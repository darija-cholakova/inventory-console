import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { TranslocoTestingModule } from '@jsverse/transloco';

import en from '../../../../public/i18n/en.json';

/** Unit tests: the real English file, loaded synchronously (no HTTP). */
export function provideI18nTesting(): EnvironmentProviders {
  return importProvidersFrom(
    TranslocoTestingModule.forRoot({
      langs: { en },
      translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
      preloadLangs: true,
    }),
  );
}
