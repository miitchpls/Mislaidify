import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '@services/auth/auth.service';

@Component({
  selector: 'app-hero',
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  constructor(public authService: AuthService) { }

}
