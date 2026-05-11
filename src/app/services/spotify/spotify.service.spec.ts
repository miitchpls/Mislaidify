import { TestBed } from '@angular/core/testing';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { environment } from '@environments/environment';
import { lastValueFrom } from 'rxjs';
import { SpotifyService } from './spotify.service';

let mockApi: {
  authenticate: jest.Mock;
  getAccessToken: jest.Mock;
  logOut: jest.Mock;
  currentUser: { profile: jest.Mock; playlists: { playlists: jest.Mock }; tracks: { savedTracks: jest.Mock } };
  playlists: { getPlaylistItems: jest.Mock; addItemsToPlaylist: jest.Mock };
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
      currentUser: { profile: jest.fn(), playlists: { playlists: jest.fn() }, tracks: { savedTracks: jest.fn() } },
      playlists: { getPlaylistItems: jest.fn(), addItemsToPlaylist: jest.fn() },
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
      ['user-read-private', 'playlist-read-private', 'user-library-read', 'playlist-modify-public', 'playlist-modify-private']
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

  describe('getPlaylistPage()', () => {
    it('calls getPlaylistItems with limit 50 and the given offset', async () => {
      const page = { items: [], offset: 0, total: 0 };
      mockApi.playlists.getPlaylistItems.mockResolvedValue(page);
      await lastValueFrom(service.getPlaylistPage('pl1', 0));
      expect(mockApi.playlists.getPlaylistItems).toHaveBeenCalledWith('pl1', undefined, undefined, 50, 0);
    });

    it('emits the page returned by the SDK', async () => {
      const page = { items: [{ track: { id: 't1' } }], offset: 0, total: 1 };
      mockApi.playlists.getPlaylistItems.mockResolvedValue(page);
      const result = await lastValueFrom(service.getPlaylistPage('pl1', 0));
      expect(result).toBe(page);
    });
  });

  describe('addTracksToPlaylist()', () => {
    it('calls addItemsToPlaylist with the given playlist id and track uris', async () => {
      mockApi.playlists.addItemsToPlaylist.mockResolvedValue(undefined);
      await service.addTracksToPlaylist('pl1', ['spotify:track:a', 'spotify:track:b']);
      expect(mockApi.playlists.addItemsToPlaylist).toHaveBeenCalledWith('pl1', ['spotify:track:a', 'spotify:track:b']);
    });

    it('returns the resolved value from the SDK', async () => {
      mockApi.playlists.addItemsToPlaylist.mockResolvedValue(undefined);
      const result = await service.addTracksToPlaylist('pl1', ['spotify:track:a']);
      expect(result).toBeUndefined();
    });

    it('propagates errors thrown by the SDK', async () => {
      mockApi.playlists.addItemsToPlaylist.mockRejectedValue(new Error('Forbidden'));
      await expect(service.addTracksToPlaylist('pl1', ['spotify:track:a'])).rejects.toThrow('Forbidden');
    });
  });

  describe('currentUser', () => {
    it('returns api.currentUser', () => {
      expect(service.currentUser).toBe(mockApi.currentUser);
    });
  });

  describe('getSavedTracksPage()', () => {
    it('calls savedTracks with limit 20 and the given offset', async () => {
      const page = { items: [], offset: 0, total: 0 };
      mockApi.currentUser.tracks.savedTracks.mockResolvedValue(page);
      await lastValueFrom(service.getSavedTracksPage(0));
      expect(mockApi.currentUser.tracks.savedTracks).toHaveBeenCalledWith(20, 0);
    });

    it('emits the page returned by the SDK', async () => {
      const page = { items: [{ track: { id: 't1' } }], offset: 0, total: 1 };
      mockApi.currentUser.tracks.savedTracks.mockResolvedValue(page);
      const result = await lastValueFrom(service.getSavedTracksPage(0));
      expect(result).toBe(page);
    });
  });

  describe('withRateLimitRetry (via getPlaylistPage)', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('retries after 5 s on a rate-limit error', async () => {
      const page = { items: [], offset: 0, total: 0 };
      mockApi.playlists.getPlaylistItems
        .mockRejectedValueOnce(new Error('API rate limits exceeded'))
        .mockResolvedValueOnce(page);

      const resultPromise = lastValueFrom(service.getPlaylistPage('pl1', 0));
      await jest.advanceTimersByTimeAsync(5000);
      const result = await resultPromise;

      expect(mockApi.playlists.getPlaylistItems).toHaveBeenCalledTimes(2);
      expect(result).toBe(page);
    });

    it('does not retry on non-rate-limit errors', async () => {
      mockApi.playlists.getPlaylistItems.mockRejectedValue(new Error('Network error'));

      await expect(lastValueFrom(service.getPlaylistPage('pl1', 0))).rejects.toThrow('Network error');
      expect(mockApi.playlists.getPlaylistItems).toHaveBeenCalledTimes(1);
    });
  });
});
