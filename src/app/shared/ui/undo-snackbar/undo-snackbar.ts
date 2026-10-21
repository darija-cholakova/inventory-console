import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

import { UndoSnackbarData } from '../../models/interfaces';

/**
 * Snackbar with an Undo action. MatSnackBar's own `duration` cannot pause, so the timer
 * lives here: it stops while the pointer or keyboard focus is on the snackbar, giving
 * keyboard and screen reader users time to reach Undo. Undo = dismissWithAction().
 */
@Component({
  selector: 'app-undo-snackbar',
  imports: [MatButton, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction],
  template: `
    <div matSnackBarLabel>{{ data.message }}</div>
    <div matSnackBarActions>
      <button matButton matSnackBarAction type="button" (click)="ref.dismissWithAction()">
        Undo
      </button>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
    }
  `,
  host: {
    '(mouseenter)': 'setHovered(true)',
    '(mouseleave)': 'setHovered(false)',
    '(focusin)': 'setFocused(true)',
    '(focusout)': 'setFocused(false)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UndoSnackbar {
  protected readonly data = inject<UndoSnackbarData>(MAT_SNACK_BAR_DATA);
  protected readonly ref = inject<MatSnackBarRef<UndoSnackbar>>(MatSnackBarRef);

  private remainingMs = this.data.durationMs;
  private startedAt = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private hovered = false;
  private focused = false;

  constructor() {
    this.resume();
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected setHovered(value: boolean): void {
    this.hovered = value;
    this.update();
  }

  protected setFocused(value: boolean): void {
    this.focused = value;
    this.update();
  }

  private update(): void {
    if (this.hovered || this.focused) this.pause();
    else this.resume();
  }

  private pause(): void {
    if (this.timer === undefined) return;
    clearTimeout(this.timer);
    this.timer = undefined;
    this.remainingMs -= Date.now() - this.startedAt;
  }

  private resume(): void {
    if (this.timer !== undefined) return;
    this.startedAt = Date.now();
    this.timer = setTimeout(() => this.ref.dismiss(), Math.max(this.remainingMs, 0));
  }
}
