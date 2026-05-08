import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SpotifyService } from '@services/spotify/spotify.service';
import { DashboardComponent } from './dashboard.component';

const mockProfile = {
  display_name: 'Test User',
  id: 'test-user',
  images: [{ url: 'https://example.com/avatar.jpg' }],
} as any;

const mockPlaylists = [
  { id: '1', name: 'Playlist 1', images: [{ url: 'https://example.com/1.jpg' }] },
  { id: '2', name: 'Playlist 2', images: [{ url: 'https://example.com/2.jpg' }] },
] as any[];

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let spotifyService: jest.Mocked<Pick<SpotifyService, 'authenticate' | 'logout' | 'getPlaylists'>> & {
    currentUser: { profile: jest.Mock };
  };
  let router: Router;

  const setup = async (authenticated: boolean, profile: any = null, playlists: any[] = []) => {
    spotifyService.authenticate.mockResolvedValue({ authenticated, accessToken: null as any });
    spotifyService.currentUser.profile.mockResolvedValue(profile);
    spotifyService.getPlaylists.mockResolvedValue(playlists);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    await component.ngOnInit();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    spotifyService = {
      authenticate: jest.fn(),
      logout: jest.fn(),
      getPlaylists: jest.fn(),
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
    it('loads user profile and playlists when authenticated', async () => {
      await setup(true, mockProfile, mockPlaylists);
      expect(spotifyService.currentUser.profile).toHaveBeenCalledTimes(1);
      expect(spotifyService.getPlaylists).toHaveBeenCalledTimes(1);
      expect(component.userProfile).toBe(mockProfile);
      expect(component.playlists).toBe(mockPlaylists);
    });

    it('does not load profile or playlists when not authenticated', async () => {
      await setup(false);
      expect(spotifyService.currentUser.profile).not.toHaveBeenCalled();
      expect(spotifyService.getPlaylists).not.toHaveBeenCalled();
      expect(component.userProfile).toBeUndefined();
      expect(component.playlists).toBeUndefined();
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

  describe('playlist grid', () => {
    it('shows 8 skeleton cards when playlists are not loaded', async () => {
      await setup(false);
      const skeletons = fixture.nativeElement.querySelectorAll('playlist-card-skeleton');
      expect(skeletons.length).toBe(8);
      expect(fixture.nativeElement.querySelector('playlist-card')).toBeNull();
    });

    it('shows all-playlists-card and playlist cards when playlists are loaded', async () => {
      await setup(true, mockProfile, mockPlaylists);
      expect(fixture.nativeElement.querySelector('all-playlists-card')).toBeTruthy();
      const cards = fixture.nativeElement.querySelectorAll('playlist-card');
      expect(cards.length).toBe(mockPlaylists.length);
      expect(fixture.nativeElement.querySelector('playlist-card-skeleton')).toBeNull();
    });

    it('does not show all-playlists-card when playlists are not loaded', async () => {
      await setup(false);
      expect(fixture.nativeElement.querySelector('all-playlists-card')).toBeNull();
    });
  });

  describe('allSelected', () => {
    it('is false when no playlists are selected', async () => {
      await setup(true, mockProfile, mockPlaylists);
      expect(component.allSelected).toBe(false);
    });

    it('is false when only some playlists are selected', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.selectedPlaylistIds.add(mockPlaylists[0].id);
      expect(component.allSelected).toBe(false);
    });

    it('is true when all playlists are selected', async () => {
      await setup(true, mockProfile, mockPlaylists);
      mockPlaylists.forEach(p => component.selectedPlaylistIds.add(p.id));
      expect(component.allSelected).toBe(true);
    });
  });

  describe('toggleAll()', () => {
    it('selects all playlists when none are selected', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.toggleAll();
      expect(component.selectedPlaylistIds.size).toBe(mockPlaylists.length);
    });

    it('selects all playlists when some are selected', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.selectedPlaylistIds.add(mockPlaylists[0].id);
      component.toggleAll();
      expect(component.selectedPlaylistIds.size).toBe(mockPlaylists.length);
    });

    it('deselects all playlists when all are selected', async () => {
      await setup(true, mockProfile, mockPlaylists);
      mockPlaylists.forEach(p => component.selectedPlaylistIds.add(p.id));
      component.toggleAll();
      expect(component.selectedPlaylistIds.size).toBe(0);
    });
  });

  describe('togglePlaylist()', () => {
    it('adds a playlist to the selection when not selected', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.togglePlaylist(mockPlaylists[0]);
      expect(component.selectedPlaylistIds.has(mockPlaylists[0].id)).toBe(true);
    });

    it('removes a playlist from the selection when already selected', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.selectedPlaylistIds.add(mockPlaylists[0].id);
      component.togglePlaylist(mockPlaylists[0]);
      expect(component.selectedPlaylistIds.has(mockPlaylists[0].id)).toBe(false);
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
