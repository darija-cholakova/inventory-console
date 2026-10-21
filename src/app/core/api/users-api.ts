import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { UserProfile, UserUpdateRequest } from '../../shared/models/interfaces';
import { API_BASE_URL } from './api.config';

/** HTTP access to DummyJSON /users. DummyJSON simulates updates and does not store them. */
@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  updateUser(id: number, changes: UserUpdateRequest): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/users/${id}`, changes);
  }
}
