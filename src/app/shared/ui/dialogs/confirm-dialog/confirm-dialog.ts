import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';

import { ConfirmDialogData } from '../../../models/interfaces';
import { TranslocoPipe } from '@jsverse/transloco';

/** Two-choice dialog; all texts are translation keys. The safe action has the initial focus (cdkFocusInitial). */
@Component({
  selector: 'app-confirm-dialog',
  imports: [
    TranslocoPipe,
    MatButton,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title | transloco: data.titleParams }}</h2>
    <mat-dialog-content>{{ data.message | transloco }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton type="button" [mat-dialog-close]="false" cdkFocusInitial>
        {{ data.cancelLabel | transloco }}
      </button>
      <button matButton="filled" type="button" class="confirm" [mat-dialog-close]="true">
        {{ data.confirmLabel | transloco }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .confirm {
      --mat-button-filled-container-color: var(--mat-sys-error);
      --mat-button-filled-label-text-color: var(--mat-sys-on-error);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
