import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { BannerKind } from '../../models/types';

const DEFAULT_ICON: Record<BannerKind, string> = { error: 'error', info: 'info' };

/**
 * Inline message at the top of a form or page; takes the full width of its container.
 * Errors are announced at once (role="alert"), info politely (role="status").
 */
@Component({
  selector: 'app-banner',
  imports: [MatIcon, MatIconButton],
  template: `
    <mat-icon aria-hidden="true">{{ icon() ?? defaultIcon() }}</mat-icon>
    <span class="text"><ng-content /></span>
    @if (dismissLabel(); as label) {
      <button
        matIconButton
        type="button"
        class="close"
        [attr.aria-label]="label"
        (click)="dismissed.emit()"
      >
        <mat-icon>close</mat-icon>
      </button>
    }
  `,
  styleUrl: './banner.scss',
  host: {
    '[attr.role]': "kind() === 'error' ? 'alert' : 'status'",
    '[attr.data-kind]': 'kind()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Banner {
  readonly kind = input<BannerKind>('error');
  readonly icon = input<string>();
  /** Shows a close button with this accessible name (e.g. "Dismiss error message"). */
  readonly dismissLabel = input<string>();
  readonly dismissed = output<void>();

  protected readonly defaultIcon = computed(() => DEFAULT_ICON[this.kind()]);
}
