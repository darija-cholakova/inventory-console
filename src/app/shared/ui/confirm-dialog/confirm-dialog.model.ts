export interface ConfirmDialogData {
  title: string;
  message: string;
  /** Safe choice: listed first, so it gets the initial focus. Closes with false. */
  cancelLabel: string;
  /** Destructive choice. Closes with true. */
  confirmLabel: string;
}
