import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaylistCardComponent } from './playlist-card.component';

const mockPlaylist = {
  id: '1',
  name: 'My Playlist',
  images: [{ url: 'https://example.com/cover.jpg' }],
} as any;

describe('PlaylistCardComponent', () => {
  let component: PlaylistCardComponent;
  let fixture: ComponentFixture<PlaylistCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistCardComponent);
    component = fixture.componentInstance;
    component.playlist = mockPlaylist;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the playlist name', () => {
    const p: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(p.textContent).toContain('My Playlist');
  });

  it('renders the playlist image with correct src and alt', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.src).toContain('cover.jpg');
    expect(img.alt).toBe('My Playlist');
  });

  describe('toggle()', () => {
    it('emits hasClicked with the playlist when the card is clicked', () => {
      const emitted: any[] = [];
      component.hasClicked.subscribe(p => emitted.push(p));
      fixture.nativeElement.querySelector('.playlist-card').click();
      expect(emitted).toHaveLength(1);
      expect(emitted[0]).toBe(mockPlaylist);
    });
  });
});
