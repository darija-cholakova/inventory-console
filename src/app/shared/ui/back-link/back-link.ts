import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, UrlTree } from '@angular/router';

/** "‹ Products" style link back to the parent screen. */
@Component({
  selector: 'app-back-link',
  imports: [RouterLink, MatIcon],
  template: `
    <a [routerLink]="link()">
      <mat-icon aria-hidden="true">chevron_left</mat-icon>
      {{ label() }}
    </a>
  `,
  styles: `
    :host {
      align-self: flex-start;
    }

    a {
      display: inline-flex;
      align-items: center;
      gap: var(--app-space-4);
      font: var(--mat-sys-label-large);
      color: var(--mat-sys-primary);
      text-decoration: none;
      border-radius: var(--mat-sys-corner-small);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackLink {
  readonly link = input.required<string | UrlTree | readonly unknown[]>();
  readonly label = input.required<string>();
}
