import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@environments/environment';
import { Token } from '@models/spotify';
import { AuthService } from './auth.service';
import { SESSION_VERIFIER_KEY } from '@constants';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  const mockVerifier = 'A'.repeat(64);
  const mockHash = new Uint8Array(32).fill(1).buffer;
  const mockToken: Token = {
    access_token: 'tok',
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'ref',
    scope: 'user-read-private',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
    sessionStorage.clear();

    spyOn(crypto, 'getRandomValues').and.callFake(
      <T extends ArrayBufferView | null>(array: T): T => {
        if (array) (array as unknown as Uint8Array).fill(0);
        return array;
      }
    );
    spyOn(crypto.subtle, 'digest').and.resolveTo(mockHash);
  });

  afterEach(() => {
    httpTesting.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('redirectToSpotifyAuth', () => {
    let navigateSpy: jasmine.Spy;

    beforeEach(() => {
      navigateSpy = spyOn(service as any, 'navigate');
    });

    it('clears sessionStorage before hashing', async () => {
      sessionStorage.setItem('stale', 'value');
      await service.redirectToSpotifyAuth();
      expect(sessionStorage.getItem('stale')).toBeNull();
    });

    it('calls crypto.getRandomValues to build the verifier', async () => {
      await service.redirectToSpotifyAuth();
      expect(crypto.getRandomValues).toHaveBeenCalled();
    });

    it('hashes the verifier with SHA-256', async () => {
      await service.redirectToSpotifyAuth();
      expect(crypto.subtle.digest).toHaveBeenCalledWith(
        'SHA-256',
        jasmine.any(Uint8Array)
      );
    });

    it('stores the verifier in sessionStorage after hashing', async () => {
      await service.redirectToSpotifyAuth();
      expect(sessionStorage.getItem(SESSION_VERIFIER_KEY)).toBeTruthy();
    });

    it('navigates to Spotify authorize URL with correct params', async () => {
      await service.redirectToSpotifyAuth();
      const url: string = navigateSpy.calls.mostRecent().args[0];
      expect(url).toContain(`${environment.spotifyAuthBaseUrl}/authorize`);
      expect(url).toContain(`client_id=${environment.clientId}`);
      expect(url).toContain('response_type=code');
      expect(url).toContain('redirect_uri=');
      expect(url).toContain('code_challenge_method=S256');
      expect(url).toContain('code_challenge=');
    });
  });

  describe('getToken', () => {
    const authCode = 'auth-code-123';

    it('returns an observable that resolves to a Token', () => {
      sessionStorage.setItem(SESSION_VERIFIER_KEY, mockVerifier);

      service.getToken(authCode).subscribe((token) => {
        expect(token).toEqual(mockToken);
      });

      const req = httpTesting.expectOne(
        `${environment.spotifyAuthBaseUrl}/api/token`
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockToken);
    });

    it('sends correct params in POST body', () => {
      sessionStorage.setItem(SESSION_VERIFIER_KEY, mockVerifier);

      service.getToken(authCode).subscribe();

      const req = httpTesting.expectOne(
        `${environment.spotifyAuthBaseUrl}/api/token`
      );
      const body: string = req.request.body.toString();
      expect(body).toContain(`code=${authCode}`);
      expect(body).toContain('grant_type=authorization_code');
      expect(body).toContain(`client_id=${environment.clientId}`);
      expect(body).toContain(`code_verifier=${mockVerifier}`);
      expect(body).toContain('redirect_uri=');
      req.flush(mockToken);
    });

    it('sets Content-Type to application/x-www-form-urlencoded', () => {
      sessionStorage.setItem(SESSION_VERIFIER_KEY, mockVerifier);

      service.getToken(authCode).subscribe();

      const req = httpTesting.expectOne(
        `${environment.spotifyAuthBaseUrl}/api/token`
      );
      expect(req.request.headers.get('Content-Type')).toBe(
        'application/x-www-form-urlencoded'
      );
      req.flush(mockToken);
    });

    it('errors without making an HTTP request when verifier is missing', (done) => {
      service.getToken(authCode).subscribe({
        error: (err: Error) => {
          expect(err.message).toBe('Code verifier missing!');
          httpTesting.expectNone(`${environment.spotifyAuthBaseUrl}/api/token`);
          done();
        },
      });
    });

    it('propagates HTTP errors from Spotify', (done) => {
      sessionStorage.setItem(SESSION_VERIFIER_KEY, mockVerifier);

      service.getToken(authCode).subscribe({
        error: (err) => {
          expect(err.status).toBe(400);
          done();
        },
      });

      const req = httpTesting.expectOne(
        `${environment.spotifyAuthBaseUrl}/api/token`
      );
      req.flush({ error: 'invalid_grant' }, { status: 400, statusText: 'Bad Request' });
    });
  });
});
