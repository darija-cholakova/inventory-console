import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { API_BASE_URL } from '../api/api.config';
import { AuthService } from './auth.service';

/** Auth endpoints that must not carry a Bearer token or trigger a refresh loop. */
const SKIPPED_PATHS = ['/auth/login', '/auth/refresh'];

/**
 * Adds the Bearer token to API calls. On a 401 it refreshes the tokens once and repeats
 * the request; if the refresh fails the session has expired and the user goes back to sign-in.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const apiUrl = inject(API_BASE_URL);

  const isApiCall = request.url.startsWith(apiUrl);
  const isSkipped = SKIPPED_PATHS.some((path) => request.url.startsWith(apiUrl + path));
  if (!isApiCall || isSkipped || !auth.accessToken) {
    return next(request);
  }

  return next(withToken(request, auth.accessToken)).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }
      return auth.refreshTokens().pipe(
        catchError((refreshError: unknown) => {
          auth.expireSession();
          return throwError(() => refreshError);
        }),
        switchMap((tokens) => next(withToken(request, tokens.accessToken))),
      );
    }),
  );
};

function withToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
