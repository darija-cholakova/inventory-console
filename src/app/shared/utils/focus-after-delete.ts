/**
 * After a row is deleted, moves focus to the actions button that now sits in the same
 * position (the next row), so keyboard users keep their place and the page does not scroll
 * to the top. Falls back to `fallback` (e.g. the page heading) when the list is empty.
 */
export function focusRowAfterDelete(
  host: HTMLElement,
  index: number,
  fallback?: HTMLElement,
): void {
  const buttons = host.querySelectorAll<HTMLElement>('button[aria-label^="Actions for "]');
  const target = buttons.length ? buttons[Math.min(index, buttons.length - 1)] : fallback;
  target?.focus({ preventScroll: true });
}
