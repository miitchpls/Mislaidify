import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpotifyService } from '@services/spotify/spotify.service';
import { HeroComponent } from './hero.component';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;
  let spotifyService: jest.Mocked<Pick<SpotifyService, 'authenticate' | 'logout'>>;

  beforeEach(async () => {
    spotifyService = {
      authenticate: jest.fn().mockResolvedValue({ authenticated: false, accessToken: null }),
      logout: jest.fn(),
    };

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
    it('does not call logout or authenticate before any interaction', () => {
      expect(spotifyService.logout).not.toHaveBeenCalled();
      expect(spotifyService.authenticate).not.toHaveBeenCalled();
    });

    it('calls logout then authenticate when clicked', async () => {
      const callOrder: string[] = [];
      spotifyService.logout.mockImplementation(() => callOrder.push('logout'));
      spotifyService.authenticate.mockImplementation(async () => { callOrder.push('authenticate'); return { authenticated: false, accessToken: null } as any; });

      fixture.nativeElement.querySelector('.login-button').click();
      await fixture.whenStable();

      expect(callOrder).toEqual(['logout', 'authenticate']);
    });
  });
});
