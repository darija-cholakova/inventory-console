import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { I18n } from '../../../../core/i18n/i18n';
import { ProfileEditDialogData } from '../../../../shared/models/interfaces';
import { DialogShell } from '../../../../shared/ui/dialogs/dialog-shell/dialog-shell';
import { ProfileForm } from '../../ui/profile-form/profile-form';
import { TranslocoPipe } from '@jsverse/transloco';

/** Profile form in the shared dialog frame (DialogShell handles closing and the discard check). */
@Component({
  selector: 'app-profile-edit-dialog',
  imports: [TranslocoPipe, DialogShell, ProfileForm],
  template: `
    <app-dialog-shell
      [title]="'buttons.editProfile' | transloco"
      [hasUnsavedChanges]="hasUnsavedChanges"
    >
      <app-profile-form
        [profile]="data.profile"
        (saved)="onSaved()"
        (cancelled)="shell().requestClose()"
      />
    </app-dialog-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEditDialog {
  protected readonly data = inject<ProfileEditDialogData>(MAT_DIALOG_DATA);
  private readonly snackBar = inject(MatSnackBar);
  private readonly i18n = inject(I18n);
  private readonly ref = inject<MatDialogRef<ProfileEditDialog>>(MatDialogRef);
  private readonly form = viewChild(ProfileForm);
  protected readonly shell = viewChild.required(DialogShell);
  protected readonly hasUnsavedChanges = () => this.form()?.hasUnsavedChanges() ?? false;

  static open(dialog: MatDialog, data: ProfileEditDialogData): MatDialogRef<ProfileEditDialog> {
    return dialog.open<ProfileEditDialog, ProfileEditDialogData>(ProfileEditDialog, {
      data,
      width: '560px',
      maxWidth: 'calc(100vw - 32px)',
    });
  }

  protected onSaved(): void {
    this.ref.close();
    this.snackBar.open(this.i18n.t('validation.success.profileUpdated'), undefined, {
      duration: 4000,
    });
  }
}
