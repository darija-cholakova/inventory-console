import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, shareReplay, tap, throwError } from 'rxjs';

import { AuthApi } from '../api/auth-api';
import { AuthSession, AuthTokens, AuthUser, LoginRequest } from '../../shared/models/interfaces';
import { LoginErrorKind } from '../../shared/models/types';

const STORAGE_KEY = 'inventory-console.session';
/**
 * Short-lived access token; the refresh token renews it silently.
 * TEMP: 1 minute (the API accepts whole minutes) to test the refresh flow; set back to 15 before committing.
 */
const ACCESS_TOKEN_MINUTES = 1;

/**
 * Owns the signed-in session.
 * The session lives in sessionStorage: it survives a reload but ends when the tab or browser closes.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  private readonly session = signal<AuthSession | null>(this.readSession());
  /** Shared in-flight refresh, so parallel 401s trigger only one refresh call. */
  private refreshInFlight$: Observable<AuthTokens> | null = null;

  readonly currentUser = computed(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);

  get accessToken(): string | null {
    return this.session()?.tokens.accessToken ?? null;
  }

  /** Signs in; on failure emits a `LoginErrorKind` instead of the raw HTTP error. */
  login(credentials: Omit<LoginRequest, 'expiresInMins'>): Observable<AuthUser> {
    const body: LoginRequest = { ...credentials, expiresInMins: ACCESS_TOKEN_MINUTES };

    return this.api.login(body).pipe(
      map(({ accessToken, refreshToken, ...user }) => {
        this.saveSession({ user, tokens: { accessToken, refreshToken } });
        return user;
      }),
      catchError((error: unknown) => throwError(() => toLoginErrorKind(error))),
    );
  }

  /**
   * Re-checks a session restored from sessionStorage with GET /auth/me.
   * An expired access token gets refreshed by the interceptor; a dead session ends there.
   */
  verifySession(): void {
    if (!this.session()) return;

    this.api.me().subscribe({
      next: ({ id, username, email, firstName, lastName, gender, image }) => {
        const current = this.session();
        if (current) {
          this.saveSession({
            ...current,
            user: { id, username, email, firstName, lastName, gender, image },
          });
        }
      },
      // Errors are handled by the interceptor (refresh or expire session).
      error: () => undefined,
    });
  }

  /** Exchanges the refresh token for a new token pair. */
  refreshTokens(): Observable<AuthTokens> {
    const current = this.session();
    if (!current) {
      return throwError(() => new Error('No session to refresh'));
    }

    this.refreshInFlight$ ??= this.api
      .refresh({ refreshToken: current.tokens.refreshToken, expiresInMins: ACCESS_TOKEN_MINUTES })
      .pipe(
        tap((tokens) => this.saveSession({ ...current, tokens })),
        finalize(() => (this.refreshInFlight$ = null)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    return this.refreshInFlight$;
  }

  /** Manual sign out from the account menu. */
  logout(): void {
    this.clearSession();
    void this.router.navigate(['/login']);
  }

  /** Called when the refresh token no longer works: back to sign-in, then return to the same page. */
  expireSession(): void {
    this.clearSession();
    void this.router.navigate(['/login'], {
      queryParams: { reason: 'expired', returnUrl: this.router.url },
    });
  }

  private saveSession(session: AuthSession): void {
    this.session.set(session);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Storage unavailable: the session still works until the page reloads.
    }
  }

  private clearSession(): void {
    this.session.set(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clear.
    }
  }

  private readSession(): AuthSession | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  }
}

/** DummyJSON answers wrong credentials with 400; status 0 means the request never reached the server. */
function toLoginErrorKind(error: unknown): LoginErrorKind {
  if (!(error instanceof HttpErrorResponse)) return 'unknown';
  if (error.status === 0) return 'network';
  if (error.status === 400 || error.status === 401) return 'invalid-credentials';
  return 'unknown';
}
