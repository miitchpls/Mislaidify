import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import { Token } from '@models/spotify';
import { SESSION_VERIFIER_KEY } from '@constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private scopes: string[] = [
    'user-read-private', // Get Current User's Profile
    'playlist-read-private', // Get Current User's Playlists
    'user-library-read', // Get User's Saved Tracks
  ];

  constructor(private httpClient: HttpClient) { }

  public async redirectToSpotifyAuth() {
    sessionStorage.clear();

    const verifier = this.generateCodeVerifier(64);
    const hashed = await this.sha256(verifier);
    const challenge = this.base64encode(hashed);

    sessionStorage.setItem(SESSION_VERIFIER_KEY, verifier);

    const params = new URLSearchParams();
    params.append('client_id', environment.clientId);
    params.append('response_type', 'code');
    params.append('redirect_uri', environment.redirectUrl);
    params.append('scope', this.scopes.join(' '));
    params.append('code_challenge_method', 'S256');
    params.append('code_challenge', challenge);

    this.navigate(`${environment.spotifyAuthBaseUrl}/authorize?${params.toString()}`);
  }

  protected navigate(url: string) {
    window.location.assign(url);
  }

  public getToken(authCode: string): Observable<Token> {
    if (!sessionStorage.getItem(SESSION_VERIFIER_KEY))
      return throwError(() => new Error('Code verifier missing!'));

    const params = new URLSearchParams();
    params.append('client_id', environment.clientId!);
    params.append('grant_type', 'authorization_code');
    params.append('code', authCode);
    params.append('redirect_uri', environment.redirectUrl!);
    params.append('code_verifier', sessionStorage.getItem(SESSION_VERIFIER_KEY)!);

    return this.httpClient.post<Token>(
      `${environment.spotifyAuthBaseUrl}/api/token`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
  }

  private generateCodeVerifier(length: number) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
  }

  private sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
  }

  private base64encode(input: ArrayBuffer) {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
}
