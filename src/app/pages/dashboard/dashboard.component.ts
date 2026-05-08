import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PlaylistCardSkeletonComponent } from '@components/playlist-card-skeleton/playlist-card-skeleton.component';
import { TrackCardSkeletonComponent } from '@components/track-card-skeleton/track-card-skeleton.component';
import { Router } from '@angular/router';
import { CurrentUsersProfileResponse } from '@models';
import { SpotifyService } from '@services/spotify/spotify.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    PlaylistCardSkeletonComponent,
    TrackCardSkeletonComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  public showProfileMenu: boolean = false;
  public userProfile?: CurrentUsersProfileResponse;

  constructor(
    private router: Router,
    private spotifyService: SpotifyService
  ) { }

  public async ngOnInit(): Promise<void> {
    const { authenticated } = await this.spotifyService.authenticate();
    if (!authenticated) return;

    this.userProfile = await this.spotifyService.currentUser.profile() as unknown as CurrentUsersProfileResponse;
  }

  public logout(): void {
    this.spotifyService.logout();
    this.router.navigateByUrl('');
  }
}
