import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '@services/auth/auth.service';
import { SpotifyIconComponent } from '@components/spotify-icon/spotify-icon.component';

@Component({
  selector: 'app-hero',
  imports: [CommonModule, SpotifyIconComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  constructor(public authService: AuthService) { }

}
