import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '@services/auth/auth.service';
import { HeroComponent } from './hero.component';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;
  let authService: jest.Mocked<Pick<AuthService, 'redirectToSpotifyAuth'>>;

  beforeEach(async () => {
    authService = { redirectToSpotifyAuth: jest.fn().mockResolvedValue(undefined) };

    await TestBed.configureTestingModule({
      imports: [HeroComponent],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('login button', () => {
    it('calls redirectToSpotifyAuth when clicked', () => {
      fixture.nativeElement.querySelector('.login-button').click();
      expect(authService.redirectToSpotifyAuth).toHaveBeenCalledTimes(1);
    });

    it('does not call redirectToSpotifyAuth before any interaction', () => {
      expect(authService.redirectToSpotifyAuth).not.toHaveBeenCalled();
    });
  });
});
