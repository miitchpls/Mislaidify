import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SpotifyService } from '@services/spotify/spotify.service';
import { DashboardComponent } from './dashboard.component';

const mockProfile = {
  display_name: 'Test User',
  id: 'test-user',
  images: [{ url: 'https://example.com/avatar.jpg' }],
} as any;

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let spotifyService: jest.Mocked<Pick<SpotifyService, 'authenticate' | 'logout'>> & {
    currentUser: { profile: jest.Mock };
  };
  let router: Router;

  const setup = async (authenticated: boolean, profile: any = null) => {
    spotifyService.authenticate.mockResolvedValue({ authenticated, accessToken: null as any });
    spotifyService.currentUser.profile.mockResolvedValue(profile);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    await component.ngOnInit();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    spotifyService = {
      authenticate: jest.fn(),
      logout: jest.fn(),
      currentUser: { profile: jest.fn() } as any,
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: SpotifyService, useValue: spotifyService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('should create', async () => {
    await setup(false);
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('loads user profile when authenticated', async () => {
      await setup(true, mockProfile);
      expect(spotifyService.currentUser.profile).toHaveBeenCalledTimes(1);
      expect(component.userProfile).toBe(mockProfile);
    });

    it('does not load profile when not authenticated', async () => {
      await setup(false);
      expect(spotifyService.currentUser.profile).not.toHaveBeenCalled();
      expect(component.userProfile).toBeUndefined();
    });
  });

  describe('welcome message', () => {
    it('shows skeleton when profile is not loaded', async () => {
      await setup(false);
      const skeleton = fixture.nativeElement.querySelector('.welcome .skeleton');
      expect(skeleton).toBeTruthy();
    });

    it('shows display name when profile is loaded', async () => {
      await setup(true, mockProfile);
      const welcome: HTMLElement = fixture.nativeElement.querySelector('.welcome');
      expect(welcome.textContent).toContain('Test User');
      expect(fixture.nativeElement.querySelector('.welcome .skeleton')).toBeNull();
    });
  });

  describe('profile picture', () => {
    it('shows skeleton when no profile images', async () => {
      await setup(false);
      const propic = fixture.nativeElement.querySelector('.propic');
      expect(propic.classList).toContain('skeleton');
    });

    it('shows image when profile has images', async () => {
      await setup(true, mockProfile);
      const img = fixture.nativeElement.querySelector('.propic img');
      expect(img).toBeTruthy();
      expect(img.src).toContain('avatar.jpg');
    });
  });

  describe('profile menu', () => {
    it('is hidden by default', async () => {
      await setup(false);
      expect(fixture.nativeElement.querySelector('.profile-menu')).toBeNull();
    });

    it('toggles open when propic is clicked', async () => {
      await setup(false);
      fixture.nativeElement.querySelector('.propic').click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.profile-menu')).toBeTruthy();
    });

    it('closes when overlay is clicked', async () => {
      await setup(false);
      component.showProfileMenu = true;
      fixture.detectChanges();
      fixture.nativeElement.querySelector('.overlay').click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.profile-menu')).toBeNull();
    });
  });

  describe('logout()', () => {
    it('calls spotifyService.logout and navigates to root', async () => {
      await setup(false);
      const navigateSpy = jest.spyOn(router, 'navigateByUrl');
      component.logout();
      expect(spotifyService.logout).toHaveBeenCalledTimes(1);
      expect(navigateSpy).toHaveBeenCalledWith('');
    });
  });
});
