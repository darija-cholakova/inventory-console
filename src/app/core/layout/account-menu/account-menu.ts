import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { RouterLink } from '@angular/router';

import { LanguageOption, ThemeOption } from '../../../shared/models/interfaces';
import { ProfileEdits } from '../../../features/profile/data-access/profile-edits';
import { AuthService } from '../../auth/auth.service';
import { ThemeService } from '../../theme/theme.service';

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: 'light_mode' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode' },
  { value: 'system', label: 'System', icon: 'contrast' },
];

/** English only for now; the other entries show where translations would go. */
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
  imports: [MatMenu, MatMenuItem, MatMenuTrigger, MatDivider, MatIcon, RouterLink],
  templateUrl: './account-menu.html',
  styleUrl: './account-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountMenu {
  private readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);

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

  protected signOut(): void {
    this.auth.logout();
  }
}
