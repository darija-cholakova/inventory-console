import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

/**
 * Frame for dialogs that host a feature component (e.g. a form): title, close button
 * and a scrollable body. The host decides what "close" means (e.g. ask about unsaved changes).
 */
@Component({
  selector: 'app-dialog-shell',
  imports: [MatDialogTitle, MatDialogContent, MatIconButton, MatIcon],
  template: `
    <header class="header">
      <h2 mat-dialog-title class="title">{{ title() }}</h2>
      <button matIconButton type="button" aria-label="Close" (click)="closeRequest.emit()">
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
  readonly title = input.required<string>();
  readonly closeRequest = output<void>();
}
