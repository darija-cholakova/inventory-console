import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { I18n } from '../i18n/i18n';

/**
 * Builds the browser tab title as "<page> · Inventory Console". Each route's `title`
 * is a translation key; pages with their own title (product detail) set it themselves.
 */
@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(I18n);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    this.title.setTitle(
      key ? this.i18n.t('app.pageTitle', { page: this.i18n.t(key) }) : this.i18n.t('app.name'),
    );
  }
}
