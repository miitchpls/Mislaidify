import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PlaylistCardSkeletonComponent } from '@components/playlist-card-skeleton/playlist-card-skeleton.component';
import { TrackCardSkeletonComponent } from '@components/track-card-skeleton/track-card-skeleton.component';
import { Router } from '@angular/router';
import { CurrentUsersProfileResponse, PlaylistObjectSimplified } from '@models';
import { SpotifyService } from '@services/spotify/spotify.service';
import { PlaylistCardComponent } from '@components/playlist-card/playlist-card.component';
import { AllPlaylistsCardComponent } from '@components/all-playlists-card/all-playlists-card.component';

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
export class DashboardComponent implements OnInit {

  public showProfileMenu: boolean = false;
  public userProfile?: CurrentUsersProfileResponse;
  public playlists?: PlaylistObjectSimplified[];
  public selectedPlaylistIds = new Set<string>();

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

  public get allSelected(): boolean {
    return !!this.playlists?.length && this.selectedPlaylistIds.size === this.playlists.length;
  }

  public toggleAll(): void {
    if (this.allSelected) {
      this.selectedPlaylistIds.clear();
    } else {
      this.playlists!.forEach(p => this.selectedPlaylistIds.add(p.id));
    }
  }

  public togglePlaylist(playlist: PlaylistObjectSimplified): void {
    if (this.selectedPlaylistIds.has(playlist.id)) {
      this.selectedPlaylistIds.delete(playlist.id);
    } else {
      this.selectedPlaylistIds.add(playlist.id);
    }
  }

  public logout(): void {
    this.spotifyService.logout();
    this.router.navigateByUrl('');
  }
}
