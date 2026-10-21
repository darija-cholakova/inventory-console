import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { UsersApi } from '../../../core/api/users-api';
import { AuthUser, UserProfile } from '../../../shared/models/interfaces';
import { ProfileChanges } from '../../../shared/models/types';

const STORAGE_KEY = 'inventory-console.profile-changes';

/**
 * Same idea as LocalChanges for products: DummyJSON answers PATCH /users/{id} but does not
 * store it, so profile edits are kept here (sessionStorage, per user id) and applied on top
 * of the server data, in the account menu and on the profile page.
 */
@Injectable({ providedIn: 'root' })
export class ProfileEdits {
  private readonly api = inject(UsersApi);

  private readonly edits = signal<Record<number, ProfileChanges>>(this.read());

  /** Works for the session user (menu) and the full profile (page). */
  apply<T extends AuthUser>(user: T): T {
    const { jobTitle, ...names } = this.edits()[user.id] ?? {};
    const result = { ...user, ...names };
    if (jobTitle !== undefined && 'company' in user) {
      const { company } = user as unknown as UserProfile;
      return { ...result, company: { ...company, title: jobTitle } };
    }
    return result;
  }

  /** Optimistic update: applied at once, rolled back if the request fails. */
  update(userId: number, changes: Required<ProfileChanges>): Observable<UserProfile> {
    const previous = this.edits();
    this.set({ ...previous, [userId]: { ...previous[userId], ...changes } });

    const { jobTitle, ...rest } = changes;
    return this.api.updateUser(userId, { ...rest, company: { title: jobTitle } }).pipe(
      catchError((error: unknown) => {
        this.set(previous);
        return throwError(() => error);
      }),
    );
  }

  private set(edits: Record<number, ProfileChanges>): void {
    this.edits.set(edits);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
    } catch {
      // Storage unavailable: edits last until reload.
    }
  }

  /** Storage is outside our control: accept only an object of objects. */
  private read(): Record<number, ProfileChanges> {
    try {
      const stored: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
      if (typeof stored !== 'object' || stored === null || Array.isArray(stored)) return {};
      return Object.fromEntries(
        Object.entries(stored).filter(([, value]) => typeof value === 'object' && value !== null),
      ) as Record<number, ProfileChanges>;
    } catch {
      return {};
    }
  }
}
