import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'all-playlists-card',
  imports: [CommonModule],
  templateUrl: './all-playlists-card.component.html',
  styleUrl: './all-playlists-card.component.scss',
})
export class AllPlaylistsCardComponent {
  @Input() selected: boolean = false;

  @Output() hasClicked = new EventEmitter<null>();

  public toggle(): void {
    this.hasClicked.emit();
  }
}
