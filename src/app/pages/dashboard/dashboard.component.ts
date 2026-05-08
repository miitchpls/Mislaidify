import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlaylistCardSkeletonComponent } from '@components/playlist-card-skeleton/playlist-card-skeleton.component';
import { TrackCardSkeletonComponent } from '@components/track-card-skeleton/track-card-skeleton.component';
import { Router } from '@angular/router';
import { CurrentUsersProfileResponse, PlaylistObjectSimplified } from '@models';
import { SpotifyService } from '@services/spotify/spotify.service';
import { PlaylistCardComponent } from '@components/playlist-card/playlist-card.component';
import { AllPlaylistsCardComponent } from '@components/all-playlists-card/all-playlists-card.component';
import { EMPTY, Subscription, expand, tap } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    AllPlaylistsCardComponent,
    PlaylistCardSkeletonComponent,
    PlaylistCardComponent,
    TrackCardSkeletonComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {

  public showProfileMenu: boolean = false;
  public userProfile?: CurrentUsersProfileResponse;
  public playlists?: PlaylistObjectSimplified[];
  public selectedPlaylistIds = new Set<string>();
  public playlistTracks = new Map<string, any[]>();

  private trackFetchOffsets = new Map<string, number>();
  private trackFetchSubscriptions = new Map<string, Subscription>();
  private completedTrackFetches = new Set<string>();

  constructor(
    private router: Router,
    private spotifyService: SpotifyService
  ) { }

  public async ngOnInit(): Promise<void> {
    const { authenticated } = await this.spotifyService.authenticate();
    if (!authenticated) return;

    [this.userProfile, this.playlists] = await Promise.all([
      this.spotifyService.currentUser.profile() as unknown as Promise<CurrentUsersProfileResponse>,
      this.spotifyService.getPlaylists(),
    ]);
  }

  public ngOnDestroy(): void {
    this.trackFetchSubscriptions.forEach(sub => sub.unsubscribe());
  }

  public get allSelected(): boolean {
    return !!this.playlists?.length && this.selectedPlaylistIds.size === this.playlists.length;
  }

  /** Selects all if any playlist is unselected; deselects all only when every playlist is already selected. */
  public toggleAll(): void {
    if (this.allSelected) {
      this.selectedPlaylistIds.clear();
    } else {
      this.playlists!.forEach(p => {
        if (!this.selectedPlaylistIds.has(p.id)) {
          this.selectedPlaylistIds.add(p.id);
          this.startTrackFetch(p.id);
        }
      });
    }
  }

  public togglePlaylist(playlist: PlaylistObjectSimplified): void {
    if (this.selectedPlaylistIds.has(playlist.id)) {
      this.selectedPlaylistIds.delete(playlist.id);
    } else {
      this.selectedPlaylistIds.add(playlist.id);
      this.startTrackFetch(playlist.id);
    }
  }

  public logout(): void {
    this.spotifyService.logout();
    this.router.navigateByUrl('');
  }

  /**
   * Expand checks selection before each next-page request, so an in-flight page is always
   * committed but no further pages are fetched if the playlist was deselected in the meantime.
   */
  private startTrackFetch(playlistId: string): void {
    if (this.completedTrackFetches.has(playlistId) || this.trackFetchSubscriptions.has(playlistId)) return;

    const offset = this.trackFetchOffsets.get(playlistId) ?? 0;
    const sub = this.spotifyService.getPlaylistPage(playlistId, offset).pipe(
      expand((page: any) =>
        page.offset + page.items.length < page.total && this.selectedPlaylistIds.has(playlistId)
          ? this.spotifyService.getPlaylistPage(playlistId, page.offset + 50)
          : EMPTY
      ),
      tap((page: any) => {
        const current = this.playlistTracks.get(playlistId) ?? [];
        this.playlistTracks.set(playlistId, [...current, ...page.items.map((t: any) => t.track)]);
        this.trackFetchOffsets.set(playlistId, page.offset + page.items.length);
        if (page.offset + page.items.length >= page.total) {
          this.completedTrackFetches.add(playlistId);
        }
      })
    ).subscribe({
      complete: () => this.trackFetchSubscriptions.delete(playlistId)
    });

    this.trackFetchSubscriptions.set(playlistId, sub);
  }
}
