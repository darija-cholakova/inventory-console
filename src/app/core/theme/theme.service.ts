import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { ThemeMode, ThemePreference } from '../../shared/models/types';

const STORAGE_KEY = 'inventory-console.theme';

/**
 * Light / dark theme state, chosen in the account menu (Light, Dark or System).
 * With "System" the app follows `prefers-color-scheme`;
 * an explicit choice is saved in localStorage and applied as `color-scheme` on <html>,
 * which drives every `light-dark()` value in the Material 3 tokens.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly mediaQuery = this.document.defaultView?.matchMedia(
    '(prefers-color-scheme: dark)',
  );

  private readonly userChoice = signal<ThemeMode | null>(this.readStoredChoice());
  private readonly systemPrefersDark = signal(this.mediaQuery?.matches ?? false);

  /** Current choice for the account menu. */
  readonly preference = computed<ThemePreference>(() => this.userChoice() ?? 'system');

  readonly isDark = computed(
    () => (this.userChoice() ?? (this.systemPrefersDark() ? 'dark' : 'light')) === 'dark',
  );

  constructor() {
    this.mediaQuery?.addEventListener('change', (event) =>
      this.systemPrefersDark.set(event.matches),
    );

    effect(() => {
      const choice = this.userChoice();
      this.document.documentElement.style.colorScheme = choice ?? 'light dark';
    });
  }

  setPreference(preference: ThemePreference): void {
    const mode = preference === 'system' ? null : preference;
    this.userChoice.set(mode);
    try {
      if (mode) localStorage.setItem(STORAGE_KEY, mode);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage can be unavailable (private mode); the choice then lasts for this session only.
    }
  }

  private readStoredChoice(): ThemeMode | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }
}
