import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api.config';
import { AuthTokens, AuthUser, LoginRequest, RefreshRequest } from '../../shared/models/interfaces';
import { LoginResponse } from '../../shared/models/types';

/** HTTP access to DummyJSON /auth. No state; the session lives in AuthService. */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, body);
  }

  /** Current user for the Bearer token (added by the interceptor). */
  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiUrl}/auth/me`);
  }

  refresh(body: RefreshRequest): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.apiUrl}/auth/refresh`, body);
  }
}
