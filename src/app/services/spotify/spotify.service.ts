import { Injectable } from '@angular/core';
import { AuthenticationResponse, SpotifyApi } from '@spotify/web-api-ts-sdk';
import { environment } from '@environments/environment';
import { PlaylistObjectSimplified } from '@models';
import { from, expand, EMPTY, concatMap, toArray, lastValueFrom } from 'rxjs';

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
      from(this.currentUser.playlists.playlists(limit, 0)).pipe(
        expand(page =>
          page.offset + page.items.length < page.total
            ? from(this.currentUser.playlists.playlists(limit, page.offset + limit))
            : EMPTY
        ),
        concatMap(page => page.items as unknown as PlaylistObjectSimplified[]),
        toArray()
      )
    );
  }

  public get currentUser() {
    return this.api.currentUser;
  }
}
