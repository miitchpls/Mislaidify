import { Injectable } from '@angular/core';
import { AuthenticationResponse, SpotifyApi } from '@spotify/web-api-ts-sdk';
import { environment } from '@environments/environment';
import { PlaylistObjectSimplified } from '@models/spotify';
import { defer, expand, EMPTY, concatMap, toArray, lastValueFrom, Observable, retry, timer, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  
  private readonly api: SpotifyApi;

  constructor() {
    this.api = SpotifyApi.withUserAuthorization(
      environment.clientId,
      environment.redirectUrl,
      [
        'user-read-private', // Get Current User's Profile
        'playlist-read-private', // Get Current User's Playlists
        'user-library-read', // Get User's Saved Tracks
        'playlist-modify-public', // Add tracks to public playlists
        'playlist-modify-private', // Add tracks to private playlists
      ]
    );
  }

  public authenticate(): Promise<AuthenticationResponse> {
    return this.api.authenticate();
  }

  public async isAuthenticated(): Promise<boolean> {
    const token = await this.api.getAccessToken();
    return token !== null;
  }

  public logout(): void {
    this.api.logOut();
  }

  public getPlaylists(): Promise<PlaylistObjectSimplified[]> {
    const limit = 20;

    return lastValueFrom(
      this.withRateLimitRetry(defer(() => this.currentUser.playlists.playlists(limit, 0))).pipe(
        expand((page: any) =>
          page.offset + page.items.length < page.total
            ? this.withRateLimitRetry(defer(() => this.currentUser.playlists.playlists(limit, page.offset + limit)))
            : EMPTY
        ),
        concatMap((page: any) => page.items as unknown as PlaylistObjectSimplified[]),
        toArray()
      )
    );
  }

  /** Fetches a single page of the current user's saved tracks starting from the given offset. */
  public getSavedTracksPage(offset: number): Observable<any> {
    return this.withRateLimitRetry(
      defer(() => this.api.currentUser.tracks.savedTracks(20, offset))
    );
  }

  /** Fetches a single page of playlist tracks starting from the given offset. */
  public getPlaylistPage(playlistId: string, offset: number): Observable<any> {
    return this.withRateLimitRetry(
      defer(() => this.api.playlists.getPlaylistItems(playlistId, undefined, undefined, 50, offset))
    );
  }

  /** Retries once per second on Spotify rate-limit errors (HTTP 429). */
  private withRateLimitRetry<T>(source: Observable<T>): Observable<T> {
    return source.pipe(
      retry({ delay: err => err.message?.includes('rate limits') ? timer(5000) : throwError(() => err) })
    );
  }

  public addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<void> {
    return this.api.playlists.addItemsToPlaylist(playlistId, trackUris) as unknown as Promise<void>;
  }

  public get currentUser() {
    return this.api.currentUser;
  }
}
