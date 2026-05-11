import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { provideRouter } from '@angular/router';
import { SpotifyService } from '@services/spotify/spotify.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let router: Router;
  let spotifyService: jest.Mocked<SpotifyService>;

  const mockRoute = (queryParams: Record<string, string> = {}) =>
    ({ queryParams } as ActivatedRouteSnapshot);

  const mockState = {} as RouterStateSnapshot;

  const runGuard = (queryParams: Record<string, string> = {}) =>
    TestBed.runInInjectionContext(() => authGuard(mockRoute(queryParams), mockState));

  beforeEach(() => {
    const spotifyServiceMock: Partial<jest.Mocked<SpotifyService>> = {
      isAuthenticated: jest.fn().mockResolvedValue(false),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: SpotifyService, useValue: spotifyServiceMock },
      ],
    });

    router = TestBed.inject(Router);
    spotifyService = TestBed.inject(SpotifyService) as jest.Mocked<SpotifyService>;
  });

  describe('when error param is present', () => {
    it('redirects to /', async () => {
      const result = await runGuard({ error: 'access_denied' });
      expect(result).toEqual(router.createUrlTree(['/']));
    });

    it('redirects to / even if code is also present', async () => {
      const result = await runGuard({ error: 'access_denied', code: 'some-code' });
      expect(result).toEqual(router.createUrlTree(['/']));
    });
  });

  describe('when code param is present', () => {
    it('allows access', async () => {
      const result = await runGuard({ code: 'AQDqUCcG' });
      expect(result).toBe(true);
    });
  });

  describe('when a valid access token exists', () => {
    it('allows access', async () => {
      spotifyService.isAuthenticated.mockResolvedValue(true);
      const result = await runGuard();
      expect(result).toBe(true);
    });
  });

  describe('when no code, no error, and no token', () => {
    it('redirects to /', async () => {
      const result = await runGuard();
      expect(result).toEqual(router.createUrlTree(['/']));
    });
  });
});
