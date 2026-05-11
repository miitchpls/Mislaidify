import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '@components/checkbox/checkbox.component';
import { PlaylistObjectSimplified } from '@models/spotify';

@Component({
  selector: 'add-to-playlist-modal',
  imports: [CommonModule, FormsModule, CheckboxComponent],
  templateUrl: './add-to-playlist-modal.component.html',
  styleUrl: './add-to-playlist-modal.component.scss',
})
export class AddToPlaylistModalComponent implements OnInit, OnDestroy {
  @Input() selectedTrackIds = new Set<string>();
  @Input() playlists: PlaylistObjectSimplified[] = [];
  @Input() isAddingTracks = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<string[]>();

  public targetPlaylistIds = new Set<string>();
  public searchQuery = '';

  get isSinglePlaylist(): boolean {
    return this.playlists.length === 1;
  }

  get filteredPlaylists(): PlaylistObjectSimplified[] {
    const q = this.searchQuery.trim().toLowerCase();
    return q ? this.playlists.filter(p => p.name.toLowerCase().includes(q)) : this.playlists;
  }

  get allPlaylistsSelected(): boolean {
    return this.playlists.length > 0 && this.playlists.every(p => this.targetPlaylistIds.has(p.id));
  }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  toggleAllPlaylists(): void {
    this.targetPlaylistIds = this.allPlaylistsSelected
      ? new Set()
      : new Set(this.playlists.map(p => p.id));
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  toggleTargetPlaylist(id: string): void {
    const next = new Set(this.targetPlaylistIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.targetPlaylistIds = next;
  }

  onConfirm(): void {
    const ids = this.isSinglePlaylist
      ? [this.playlists[0].id]
      : [...this.targetPlaylistIds];
    this.confirm.emit(ids);
  }
}
