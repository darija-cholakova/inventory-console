import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';

import { AuthApi } from '../../../../core/api/auth-api';
import { StateMessage } from '../../../../shared/ui/state-message/state-message';
import { ProfileEdits } from '../../data-access/profile-edits';
import { ProfileEditDialog } from '../../dialogs/profile-edit-dialog/profile-edit-dialog';

/**
 * Profile of the signed-in user (GET /auth/me) with local edits applied. Only work-related
 * fields are shown; name, phone and job title can be edited (kept locally, see ProfileEdits).
 */
@Component({
  selector: 'app-profile-page',
  imports: [MatButton, MatIcon, MatProgressBar, StateMessage],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly api = inject(AuthApi);
  private readonly edits = inject(ProfileEdits);
  private readonly dialog = inject(MatDialog);

  protected readonly profile = rxResource({ stream: () => this.api.profile() });

  protected readonly view = computed(() =>
    this.profile.hasValue() ? this.edits.apply(this.profile.value()) : null,
  );

  protected readonly initials = computed(() => {
    const p = this.view();
    return p ? `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase() : '';
  });

  protected edit(): void {
    const profile = this.view();
    if (profile) ProfileEditDialog.open(this.dialog, { profile });
  }
}
