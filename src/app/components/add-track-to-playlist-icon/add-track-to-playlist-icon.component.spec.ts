import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddTrackToPlaylistIconComponent } from './add-track-to-playlist-icon.component';

describe('AddTrackToPlaylistIconComponent', () => {
  let component: AddTrackToPlaylistIconComponent;
  let fixture: ComponentFixture<AddTrackToPlaylistIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTrackToPlaylistIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTrackToPlaylistIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('binds the class input to the host element', () => {
    component.class = 'text-primary';
    fixture.detectChanges();
    expect(fixture.nativeElement.className).toBe('text-primary');
  });
});
