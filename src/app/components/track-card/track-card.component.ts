import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TrackObject } from '@models/spotify';
import { CheckboxComponent } from '@components/checkbox/checkbox.component';
import { TooltipDirective } from '@directives/tooltip/tooltip.directive';

@Component({
  selector: 'track-card',
  imports: [CommonModule, CheckboxComponent, TooltipDirective],
  templateUrl: './track-card.component.html',
  styleUrl: './track-card.component.scss',
})
export class TrackCardComponent {
  @Input() track!: TrackObject;
  
  @Output() selectionChange = new EventEmitter<boolean>();

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
    this.selectionChange.emit(selected);
  }
}
