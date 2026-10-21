import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import {
  MatDialog,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { filter, merge } from 'rxjs';

import { confirmDiscardChanges } from '../confirm-dialog/confirm-discard';

/**
 * Frame for dialogs that host a form: title, close button, scrollable body, and one close
 * path. Esc, a click outside, the X button and the form's Cancel all call requestClose(),
 * which asks "Discard unsaved changes?" when hasUnsavedChanges() says so.
 */
@Component({
  selector: 'app-dialog-shell',
  imports: [MatDialogTitle, MatDialogContent, MatIconButton, MatIcon],
  template: `
    <header class="header">
      <h2 mat-dialog-title class="title">{{ title() }}</h2>
      <button matIconButton type="button" aria-label="Close" (click)="requestClose()">
        <mat-icon>close</mat-icon>
      </button>
    </header>
    <mat-dialog-content class="content">
      <ng-content />
    </mat-dialog-content>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      max-block-size: inherit;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--app-space-8);
      padding-inline-end: var(--app-space-12);
    }

    .title {
      flex: 1;
    }

    // Material caps the body at 65vh; long forms get more room before they scroll
    .content {
      max-block-size: var(--app-dialog-content-max-height);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogShell {
  private readonly ref = inject(MatDialogRef);
  private readonly dialog = inject(MatDialog);

  readonly title = input.required<string>();
  /** Asked before closing; true opens the discard confirmation. */
  readonly hasUnsavedChanges = input<() => boolean>(() => false);

  constructor() {
    // Take over Esc and the backdrop from MatDialog, so they go through requestClose()
    this.ref.disableClose = true;
    merge(
      this.ref.backdropClick(),
      this.ref.keydownEvents().pipe(filter((event) => event.key === 'Escape')),
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.requestClose());
  }

  requestClose(): void {
    if (!this.hasUnsavedChanges()()) {
      this.ref.close();
      return;
    }
    confirmDiscardChanges(this.dialog).subscribe((discard) => {
      if (discard) this.ref.close();
    });
  }
}
