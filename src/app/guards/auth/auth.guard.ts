import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { SESSION_VERIFIER_KEY } from '@constants';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);

  if (route.queryParams['error']) {
    return router.createUrlTree(['/']);
  }

  if (route.queryParams['code']) {
    return true;
  }

  if (sessionStorage.getItem(SESSION_VERIFIER_KEY)) {
    return true;
  }

  return router.createUrlTree(['/']);
};
