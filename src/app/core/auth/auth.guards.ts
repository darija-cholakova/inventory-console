import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/** Signed-in pages: without a session, go to sign-in and come back afterwards. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) return true;

  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Sign-in page: an already signed-in user goes straight to the products. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? inject(Router).createUrlTree(['/products']) : true;
};
