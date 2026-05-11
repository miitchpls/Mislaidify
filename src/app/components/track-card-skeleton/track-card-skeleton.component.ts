import { Component } from '@angular/core';

@Component({
  selector: 'track-card-skeleton',
  imports: [],
  template: `
    <div class="flex items-center justify-between p-3 mb-1">
      <div class="flex items-center gap-3">
        <div class="skeleton w-11 h-11"></div>
        <div class="flex flex-col gap-2">
          <span class="skeleton w-28 h-4 rounded-sm"></span>
          <span class="skeleton w-24 h-3 rounded-sm"></span>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class TrackCardSkeletonComponent { }
