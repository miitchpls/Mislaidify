import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpotifyService } from '@services/spotify/spotify.service';
import { HeroComponent } from './hero.component';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;
  let spotifyService: jest.Mocked<Pick<SpotifyService, 'authenticate'>>;

  beforeEach(async () => {
    spotifyService = { authenticate: jest.fn().mockResolvedValue({ authenticated: false, accessToken: null }) };

    await TestBed.configureTestingModule({
      imports: [HeroComponent],
      providers: [{ provide: SpotifyService, useValue: spotifyService }],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('login button', () => {
    it('calls authenticate when clicked', () => {
      fixture.nativeElement.querySelector('.login-button').click();
      expect(spotifyService.authenticate).toHaveBeenCalledTimes(1);
    });

    it('does not call authenticate before any interaction', () => {
      expect(spotifyService.authenticate).not.toHaveBeenCalled();
    });
  });
});
