import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { TranslocoService } from '@jsverse/transloco';
import { RouterLink } from '@angular/router';

import { LanguageOption, ThemeOption } from '../../../shared/models/interfaces';
import { ProfileEdits } from '../../../features/profile/data-access/profile-edits';
import { AuthService } from '../../auth/auth.service';
import { ThemeService } from '../../theme/theme.service';
import { TranslocoPipe } from '@jsverse/transloco';

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'userMenu.themes.light', icon: 'light_mode' },
  { value: 'dark', label: 'userMenu.themes.dark', icon: 'dark_mode' },
  { value: 'system', label: 'userMenu.themes.system', icon: 'contrast' },
];

/**
 * Language names stay in their own language (not translated), so users can always find theirs.
 * Only English has a translation file for now (public/i18n/en.json).
 */
const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', available: true },
  { code: 'de', label: 'Deutsch', available: false },
  { code: 'mk', label: 'Македонски', available: false },
];

/**
 * Avatar button in the top bar. The menu holds everything about the user and their
 * preferences: theme, language, profile page and sign out.
 */
@Component({
  selector: 'app-account-menu',
  imports: [TranslocoPipe, MatMenu, MatMenuItem, MatMenuTrigger, MatDivider, MatIcon, RouterLink],
  templateUrl: './account-menu.html',
  styleUrl: './account-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountMenu {
  private readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly transloco = inject(TranslocoService);

  protected readonly activeLang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });
  protected readonly activeLanguage = computed(
    () => LANGUAGES.find((language) => language.code === this.activeLang()) ?? LANGUAGES[0],
  );

  protected readonly themeOptions = THEME_OPTIONS;
  protected readonly languages = LANGUAGES;

  private readonly profileEdits = inject(ProfileEdits);

  /** Session user with the local profile edits (name) applied. */
  protected readonly user = computed(() => {
    const user = this.auth.currentUser();
    return user ? this.profileEdits.apply(user) : null;
  });
  protected readonly fullName = computed(() => {
    const user = this.user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });
  protected readonly initials = computed(() => {
    const user = this.user();
    return user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '';
  });

  private readonly currentTheme = computed(
    () =>
      THEME_OPTIONS.find((option) => option.value === this.theme.preference()) ?? THEME_OPTIONS[2],
  );
  protected readonly themeLabel = computed(() => this.currentTheme().label);
  protected readonly themeIcon = computed(() => this.currentTheme().icon);

  protected setLanguage(code: string): void {
    this.transloco.setActiveLang(code);
  }

  protected signOut(): void {
    this.auth.logout();
  }
}
