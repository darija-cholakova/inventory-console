import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, merge } from 'rxjs';

import { ProfileEditDialogData } from '../../../../shared/models/interfaces';
import { confirmDiscardChanges } from '../../../../shared/ui/confirm-dialog/confirm-discard';
import { DialogShell } from '../../../../shared/ui/dialog-shell/dialog-shell';
import { ProfileForm } from '../profile-form/profile-form';

/** Profile form in the shared dialog frame; closing asks first when there are changes. */
@Component({
  selector: 'app-profile-edit-dialog',
  imports: [DialogShell, ProfileForm],
  template: `
    <app-dialog-shell title="Edit profile" (closeRequest)="requestClose()">
      <app-profile-form [profile]="data.profile" (saved)="onSaved()" (cancelled)="requestClose()" />
    </app-dialog-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEditDialog {
  protected readonly data = inject<ProfileEditDialogData>(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly ref = inject<MatDialogRef<ProfileEditDialog>>(MatDialogRef);
  private readonly form = viewChild(ProfileForm);

  static open(dialog: MatDialog, data: ProfileEditDialogData): MatDialogRef<ProfileEditDialog> {
    return dialog.open<ProfileEditDialog, ProfileEditDialogData>(ProfileEditDialog, {
      data,
      disableClose: true,
      width: '560px',
      maxWidth: 'calc(100vw - 32px)',
    });
  }

  constructor() {
    // disableClose stops MatDialog from closing on Esc / backdrop, so we can ask first
    merge(
      this.ref.backdropClick(),
      this.ref.keydownEvents().pipe(filter((event) => event.key === 'Escape')),
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.requestClose());
  }

  protected requestClose(): void {
    if (!this.form()?.hasUnsavedChanges()) {
      this.ref.close();
      return;
    }
    confirmDiscardChanges(this.dialog).subscribe((discard) => {
      if (discard) this.ref.close();
    });
  }

  protected onSaved(): void {
    this.ref.close();
    this.snackBar.open('Profile updated', undefined, { duration: 4000 });
  }
}
