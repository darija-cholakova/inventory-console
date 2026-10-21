import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-bookmarks-page',
  template: `
    <h1 class="page-title">Bookmarked</h1>
    <p class="page-subtitle">Bookmarked products arrive in feature 6.</p>
  `,
  styleUrl: '../../../../shared/styles/page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarksPage {}
