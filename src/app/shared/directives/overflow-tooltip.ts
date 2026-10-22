import { Directive, ElementRef, inject } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

/**
 * Tooltip with the full text, shown only when the element's text is cut off (ellipsis).
 * The element needs `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`.
 * Usage: `<span [appOverflowTooltip]="fullText">{{ fullText }}</span>`
 */
@Directive({
  selector: '[appOverflowTooltip]',
  hostDirectives: [{ directive: MatTooltip, inputs: ['matTooltip: appOverflowTooltip'] }],
  // Runs before MatTooltip's own listeners (added later, after view init), so it decides first
  host: { '(mouseenter)': 'update()', '(touchstart)': 'update()' },
})
export class OverflowTooltip {
  private readonly tooltip = inject(MatTooltip);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected update(): void {
    const element = this.host.nativeElement;
    this.tooltip.disabled = element.scrollWidth <= element.clientWidth;
  }
}
