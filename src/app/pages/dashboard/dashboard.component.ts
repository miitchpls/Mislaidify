import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PlaylistCardSkeletonComponent } from '@components/playlist-card-skeleton/playlist-card-skeleton.component';
import { TrackCardSkeletonComponent } from '@components/track-card-skeleton/track-card-skeleton.component';

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
export class DashboardComponent {

}
