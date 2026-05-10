import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaylistCardSkeletonComponent } from './playlist-card-skeleton.component';

describe('PlaylistCardSkeletonComponent', () => {
  let component: PlaylistCardSkeletonComponent;
  let fixture: ComponentFixture<PlaylistCardSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistCardSkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistCardSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
