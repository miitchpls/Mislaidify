import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TrackObject } from '../../models';
import { CheckboxComponent } from '../checkbox/checkbox.component';

@Component({
  selector: 'track-card',
  imports: [CommonModule, CheckboxComponent],
  templateUrl: './track-card.component.html',
  styleUrl: './track-card.component.scss',
})
export class TrackCardComponent {
  @Input() track!: TrackObject;

  public selected: boolean = false;

  public get albumCover(): string {
    return this.track?.album?.images?.[0]?.url ?? '';
  }

  public get artistNames(): string {
    return this.track?.artists?.map(a => a.name).join(', ') ?? '';
  }

  public get spotifyUrl(): string {
    return (this.track as any)?.external_urls?.spotify ?? '';
  }

  public toggleCard(selected: boolean) {
    this.selected = selected;
  }
}
