import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

import { AuthService } from '../../auth/auth.service';

/** Avatar button in the top bar; opens a menu with the signed-in user and Sign out. */
@Component({
  selector: 'app-account-menu',
  imports: [MatMenu, MatMenuItem, MatMenuTrigger, MatDivider, MatIcon],
  templateUrl: './account-menu.html',
  styleUrl: './account-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountMenu {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.currentUser;
  protected readonly fullName = computed(() => {
    const user = this.user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });
  protected readonly initials = computed(() => {
    const user = this.user();
    return user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '';
  });

  protected signOut(): void {
    this.auth.logout();
  }
}
