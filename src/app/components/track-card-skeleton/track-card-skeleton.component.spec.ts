import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackCardSkeletonComponent } from './track-card-skeleton.component';

describe('TrackCardSkeletonComponent', () => {
  let component: TrackCardSkeletonComponent;
  let fixture: ComponentFixture<TrackCardSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackCardSkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackCardSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
