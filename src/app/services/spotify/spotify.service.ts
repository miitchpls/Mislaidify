import { Injectable } from '@angular/core';
import { AuthenticationResponse, SpotifyApi } from '@spotify/web-api-ts-sdk';
import { environment } from '@environments/environment';

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

  public get currentUser() {
    return this.api.currentUser;
  }
}
