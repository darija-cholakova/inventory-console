export interface UndoSnackbarData {
  message: string;
  /** Time before the snackbar closes on its own; paused while hovered or focused. */
  durationMs: number;
}
