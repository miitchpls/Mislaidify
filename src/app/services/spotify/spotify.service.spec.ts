import { TestBed } from '@angular/core/testing';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { environment } from '@environments/environment';
import { SpotifyService } from './spotify.service';

let mockApi: {
  authenticate: jest.Mock;
  getAccessToken: jest.Mock;
  logOut: jest.Mock;
  currentUser: { profile: jest.Mock; playlists: { playlists: jest.Mock } };
};

jest.mock('@spotify/web-api-ts-sdk', () => ({
  SpotifyApi: {
    withUserAuthorization: jest.fn(() => mockApi),
  },
}));

describe('SpotifyService', () => {
  let service: SpotifyService;

  beforeEach(() => {
    mockApi = {
      authenticate: jest.fn(),
      getAccessToken: jest.fn(),
      logOut: jest.fn(),
      currentUser: { profile: jest.fn(), playlists: { playlists: jest.fn() } },
    };
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('initializes the SDK with client id, redirect url and scopes', () => {
    expect(SpotifyApi.withUserAuthorization).toHaveBeenCalledWith(
      environment.clientId,
      environment.redirectUrl,
      ['user-read-private', 'playlist-read-private', 'user-library-read']
    );
  });

  describe('authenticate()', () => {
    it('delegates to api.authenticate()', () => {
      mockApi.authenticate.mockResolvedValue({ authenticated: true, accessToken: {} });
      service.authenticate();
      expect(mockApi.authenticate).toHaveBeenCalledTimes(1);
    });

    it('returns the result from api.authenticate()', async () => {
      const mockResponse = { authenticated: true, accessToken: {} as any };
      mockApi.authenticate.mockResolvedValue(mockResponse);
      const result = await service.authenticate();
      expect(result).toBe(mockResponse);
    });
  });

  describe('isAuthenticated()', () => {
    it('delegates to api.getAccessToken()', async () => {
      mockApi.getAccessToken.mockResolvedValue(null);
      await service.isAuthenticated();
      expect(mockApi.getAccessToken).toHaveBeenCalledTimes(1);
    });

    it('returns true when a token exists', async () => {
      mockApi.getAccessToken.mockResolvedValue({ access_token: 'tok', token_type: 'Bearer', expires_in: 3600, refresh_token: 'ref' });
      const result = await service.isAuthenticated();
      expect(result).toBe(true);
    });

    it('returns false when no token exists', async () => {
      mockApi.getAccessToken.mockResolvedValue(null);
      const result = await service.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('logout()', () => {
    it('delegates to api.logOut()', () => {
      service.logout();
      expect(mockApi.logOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPlaylists()', () => {
    it('fetches a single page when all playlists fit in one request', async () => {
      const items = [{ id: '1' }, { id: '2' }];
      mockApi.currentUser.playlists.playlists.mockResolvedValue({ items, total: 2, offset: 0 });
      const result = await service.getPlaylists();
      expect(mockApi.currentUser.playlists.playlists).toHaveBeenCalledTimes(1);
      expect(mockApi.currentUser.playlists.playlists).toHaveBeenCalledWith(20, 0);
      expect(result).toEqual(items);
    });

    it('fetches multiple pages until all playlists are retrieved', async () => {
      const page1 = [{ id: '1' }];
      const page2 = [{ id: '2' }];
      mockApi.currentUser.playlists.playlists
        .mockResolvedValueOnce({ items: page1, total: 2, offset: 0 })
        .mockResolvedValueOnce({ items: page2, total: 2, offset: 20 });
      const result = await service.getPlaylists();
      expect(mockApi.currentUser.playlists.playlists).toHaveBeenCalledTimes(2);
      expect(mockApi.currentUser.playlists.playlists).toHaveBeenNthCalledWith(1, 20, 0);
      expect(mockApi.currentUser.playlists.playlists).toHaveBeenNthCalledWith(2, 20, 20);
      expect(result).toEqual([...page1, ...page2]);
    });
  });

  describe('currentUser', () => {
    it('returns api.currentUser', () => {
      expect(service.currentUser).toBe(mockApi.currentUser);
    });
  });
});
