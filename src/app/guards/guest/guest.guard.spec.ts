import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot } from '@angular/router';
import { provideRouter } from '@angular/router';
import { SpotifyService } from '@services/spotify/spotify.service';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
  let router: Router;
  let spotifyService: jest.Mocked<SpotifyService>;

  const mockState = {} as RouterStateSnapshot;

  const runGuard = () =>
    TestBed.runInInjectionContext(() => guestGuard({} as any, mockState));

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

  describe('when user is authenticated', () => {
    it('redirects to /dashboard', async () => {
      spotifyService.isAuthenticated.mockResolvedValue(true);
      const result = await runGuard();
      expect(result).toEqual(router.createUrlTree(['/dashboard']));
    });
  });

  describe('when user is not authenticated', () => {
    it('allows access', async () => {
      const result = await runGuard();
      expect(result).toBe(true);
    });
  });
});
