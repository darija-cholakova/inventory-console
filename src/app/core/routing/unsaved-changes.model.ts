/** Implemented by pages with a form that can lose changes on navigation. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}
