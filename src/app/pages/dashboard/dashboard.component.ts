import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PlaylistCardSkeletonComponent } from '@components/playlist-card-skeleton/playlist-card-skeleton.component';
import { TrackCardSkeletonComponent } from '@components/track-card-skeleton/track-card-skeleton.component';
import { TrackCardComponent } from '@components/track-card/track-card.component';
import { Router } from '@angular/router';
import { CurrentUsersProfileResponse, PlaylistObjectSimplified, TrackObject } from '@models';
import { SpotifyService } from '@services/spotify/spotify.service';
import { PlaylistCardComponent } from '@components/playlist-card/playlist-card.component';
import { AllPlaylistsCardComponent } from '@components/all-playlists-card/all-playlists-card.component';
import { EMPTY, Subscription, expand, lastValueFrom, tap } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    AllPlaylistsCardComponent,
    PlaylistCardSkeletonComponent,
    PlaylistCardComponent,
    TrackCardSkeletonComponent,
    TrackCardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  public showProfileMenu: boolean = false;
  public userProfile?: CurrentUsersProfileResponse;
  public playlists?: PlaylistObjectSimplified[];
  public selectedPlaylistIds = new Set<string>();
  public playlistTracks = new Map<string, any[]>();
  public savedTracks?: TrackObject[];

  private trackFetchOffsets = new Map<string, number>();
  private trackFetchSubscriptions = new Map<string, Subscription>();
  private completedTrackFetches = new Set<string>();

  private savedTracksOffset = 0;
  private savedTracksTotal = Infinity;
  private isFetchingTracks = false;
  private tracksEnabled = false;
  private readonly onTracksScroll = () => this.fetchIfNearBottom();

  @ViewChild('tracksContainer') private tracksContainer!: ElementRef;

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

    this.tracksEnabled = true;
    this.fetchNextTracksPage();
  }

  public ngAfterViewInit(): void {
    this.tracksContainer.nativeElement.addEventListener('scroll', this.onTracksScroll);
  }

  public ngOnDestroy(): void {
    this.tracksContainer?.nativeElement?.removeEventListener('scroll', this.onTracksScroll);
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

  private fetchIfNearBottom(): void {
    const el = this.tracksContainer.nativeElement;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      this.fetchNextTracksPage();
    }
  }

  private async fetchNextTracksPage(): Promise<void> {
    if (!this.tracksEnabled || this.isFetchingTracks || this.savedTracksOffset >= this.savedTracksTotal) return;
    this.isFetchingTracks = true;
    const page = await lastValueFrom(this.spotifyService.getSavedTracksPage(this.savedTracksOffset));
    this.savedTracksTotal = page.total;
    this.savedTracks = [...(this.savedTracks ?? []), ...page.items.map((item: any) => item.track as TrackObject)];
    this.savedTracksOffset += page.items.length;
    this.isFetchingTracks = false;
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
