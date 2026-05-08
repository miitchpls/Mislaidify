import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlaylistObjectSimplified } from '@models';

@Component({
  selector: 'playlist-card',
  imports: [CommonModule],
  templateUrl: './playlist-card.component.html',
  styleUrl: './playlist-card.component.scss',
})
export class PlaylistCardComponent {
  @Input() playlist!: PlaylistObjectSimplified;

  @Output() hasClicked = new EventEmitter<PlaylistObjectSimplified>();

  public toggle(): void {
    this.hasClicked.emit(this.playlist);
  }
}
