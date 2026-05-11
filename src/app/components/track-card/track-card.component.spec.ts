import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackCardComponent } from './track-card.component';

describe('TrackCardComponent', () => {
  let component: TrackCardComponent;
  let fixture: ComponentFixture<TrackCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackCardComponent);
    component = fixture.componentInstance;
    component.track = {
      id: '1',
      name: 'Test Track',
      artists: [{ name: 'Test Artist' }] as any,
      album: { images: [] } as any,
      external_urls: { spotify: 'https://open.spotify.com' },
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggleCard()', () => {
    it('sets selected to the provided value', () => {
      component.toggleCard(true);
      expect(component.selected).toBe(true);
      component.toggleCard(false);
      expect(component.selected).toBe(false);
    });

    it('emits selectionChange with the new value', () => {
      const emitted: boolean[] = [];
      component.selectionChange.subscribe((v: boolean) => emitted.push(v));

      component.toggleCard(true);
      component.toggleCard(false);

      expect(emitted).toEqual([true, false]);
    });

    it('emits selectionChange after updating selected', () => {
      let selectedAtEmit: boolean | undefined;
      component.selectionChange.subscribe(() => { selectedAtEmit = component.selected; });

      component.toggleCard(true);

      expect(selectedAtEmit).toBe(true);
    });
  });

  describe('albumCover', () => {
    it('returns the first image url', () => {
      component.track = { ...component.track, album: { images: [{ url: 'https://img.jpg' }] } } as any;
      expect(component.albumCover).toBe('https://img.jpg');
    });

    it('returns empty string when images is empty', () => {
      component.track = { ...component.track, album: { images: [] } } as any;
      expect(component.albumCover).toBe('');
    });
  });

  describe('spotifyUrl', () => {
    it('returns the spotify external url', () => {
      expect(component.spotifyUrl).toBe('https://open.spotify.com');
    });

    it('returns empty string when external_urls is missing', () => {
      component.track = { ...component.track, external_urls: null } as any;
      expect(component.spotifyUrl).toBe('');
    });
  });

  describe('artistNames', () => {
    it('joins multiple artists with a comma', () => {
      component.track = { ...component.track, artists: [{ name: 'A' }, { name: 'B' }] } as any;
      expect(component.artistNames).toBe('A, B');
    });

    it('returns single artist name', () => {
      expect(component.artistNames).toBe('Test Artist');
    });

    it('returns empty string when artists is null', () => {
      component.track = { ...component.track, artists: null } as any;
      expect(component.artistNames).toBe('');
    });
  });
});
