import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SpotifyService } from '@services/spotify/spotify.service';

export const guestGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const spotifyService = inject(SpotifyService);

  const authenticated = await spotifyService.isAuthenticated();
  return authenticated ? router.createUrlTree(['/dashboard']) : true;
};
