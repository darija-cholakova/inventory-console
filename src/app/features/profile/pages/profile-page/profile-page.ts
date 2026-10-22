import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from '@angular/material/tooltip';

import { AuthApi } from '../../../../core/api/auth-api';
import { I18n } from '../../../../core/i18n/i18n';
import { StateMessage } from '../../../../shared/ui/state-message/state-message';
import { ProfileEdits } from '../../data-access/profile-edits';
import { ProfileEditDialog } from '../../dialogs/profile-edit-dialog/profile-edit-dialog';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * Profile of the signed-in user (GET /auth/me) with local edits applied. Only work-related
 * fields are shown; name, phone and job title can be edited (kept locally, see ProfileEdits).
 */
@Component({
  selector: 'app-profile-page',
  imports: [
    TranslocoPipe,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressBar,
    MatTooltip,
    StateMessage,
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly api = inject(AuthApi);
  private readonly edits = inject(ProfileEdits);
  private readonly dialog = inject(MatDialog);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);
  private readonly i18n = inject(I18n);

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

  /** Copies the email and confirms it in a snackbar (also announced to screen readers). */
  protected copyEmail(email: string): void {
    const key = this.clipboard.copy(email)
      ? 'validation.success.emailCopied'
      : 'validation.error.copyFailed';
    this.snackBar.open(this.i18n.t(key), undefined, { duration: 4000 });
  }
}
