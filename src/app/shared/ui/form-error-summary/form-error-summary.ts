import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { FormErrorItem } from '../../models/interfaces';

let nextId = 0;

/**
 * List of all form errors with links that move focus to the field (GOV.UK pattern).
 * Shown above the form after the first save attempt.
 */
@Component({
  selector: 'app-form-error-summary',
  imports: [MatIcon],
  template: `
    <h3 class="title" [id]="titleId">
      <mat-icon aria-hidden="true">error</mat-icon>
      Fix {{ items().length }} {{ items().length === 1 ? 'error' : 'errors' }} to save
    </h3>
    <ul>
      @for (item of items(); track item.id) {
        <li>
          <a [href]="'#' + item.id" (click)="focus($event, item)">{{ item.message }}</a>
        </li>
      }
    </ul>
  `,
  styleUrl: './form-error-summary.scss',
  host: { role: 'region', '[attr.aria-labelledby]': 'titleId' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormErrorSummary {
  readonly items = input.required<FormErrorItem[]>();

  protected readonly titleId = `form-error-summary-${nextId++}`;

  protected focus(event: Event, item: FormErrorItem): void {
    event.preventDefault();
    item.focus();
  }
}
