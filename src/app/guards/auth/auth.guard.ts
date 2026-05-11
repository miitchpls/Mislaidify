import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { SpotifyService } from '@services/spotify/spotify.service';

export const authGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const spotifyService = inject(SpotifyService);

  if (route.queryParams['error']) {
    return router.createUrlTree(['/']);
  }

  if (route.queryParams['code']) {
    return true;
  }

  const authenticated = await spotifyService.isAuthenticated();
  return authenticated ? true : router.createUrlTree(['/']);
};
