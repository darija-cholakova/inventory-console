import { InjectionToken } from '@angular/core';

/** Base URL of the DummyJSON API; injectable so tests can point it elsewhere. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'https://dummyjson.com',
});
