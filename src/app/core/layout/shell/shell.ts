import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatListItem,
  MatListItemIcon,
  MatListItemMeta,
  MatListItemTitle,
  MatNavList,
} from '@angular/material/list';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { AccountMenu } from '../account-menu/account-menu';
import { Bookmarks } from '../../../features/bookmarks/data-access/bookmarks';
import { NavItem } from '../../../shared/models/interfaces';

/** M3 "expanded" window class starts at 840px: from there the nav is always visible. */
const EXPANDED_QUERY = '(min-width: 840px)';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbar,
    MatIcon,
    MatIconButton,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    MatNavList,
    MatListItemMeta,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    AccountMenu,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  constructor() {
    // The shell only renders for a signed-in user: confirm the stored session is still valid.
    inject(AuthService).verifySession();
  }

  private readonly bookmarks = inject(Bookmarks);

  protected readonly navItems: NavItem[] = [
    { label: 'Products', path: '/products', icon: 'inventory_2' },
    {
      label: 'Bookmarked',
      path: '/bookmarked',
      icon: 'bookmark',
      count: this.bookmarks.count,
      countLabel: 'products',
    },
  ];

  protected readonly isExpanded = toSignal(
    inject(BreakpointObserver)
      .observe(EXPANDED_QUERY)
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  /** Drawer state on small screens; on large screens the nav is always open. */
  private readonly drawerOpen = signal(false);
  protected readonly navOpened = computed(() => this.isExpanded() || this.drawerOpen());

  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  protected toggleDrawer(): void {
    this.drawerOpen.update((open) => !open);
  }

  protected onDrawerClosed(): void {
    this.drawerOpen.set(false);
  }

  /** Close the drawer after picking a destination on small screens. */
  protected onNavigate(): void {
    if (!this.isExpanded()) {
      this.drawerOpen.set(false);
    }
  }

  /** Skip link: move focus into the main region without changing the route. */
  protected skipToMain(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }
}
