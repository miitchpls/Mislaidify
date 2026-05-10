import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { EMPTY, Subject, of } from 'rxjs';
import { SpotifyService } from '@services/spotify/spotify.service';
import { DashboardComponent } from './dashboard.component';

const mockProfile = {
  display_name: 'Test User',
  id: 'test-user',
  images: [{ url: 'https://example.com/avatar.jpg' }],
} as any;

const mockPlaylists = [
  { id: '1', name: 'Playlist 1', images: [{ url: 'https://example.com/1.jpg' }], owner: { id: 'test-user' } },
  { id: '2', name: 'Playlist 2', images: [{ url: 'https://example.com/2.jpg' }], owner: { id: 'test-user' } },
] as any[];

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let spotifyService: jest.Mocked<Pick<SpotifyService, 'authenticate' | 'logout' | 'getPlaylists' | 'getPlaylistPage' | 'getSavedTracksPage' | 'addTracksToPlaylist'>> & {
    currentUser: { profile: jest.Mock };
  };
  let router: Router;

  // Flushes all pending microtasks and macrotasks so async component work completes.
  const flushPromises = () => new Promise<void>(resolve => setTimeout(resolve, 0));

  const setup = async (authenticated: boolean, profile: any = null, playlists: any[] = []) => {
    spotifyService.authenticate.mockResolvedValue({ authenticated, accessToken: null as any });
    spotifyService.currentUser.profile.mockResolvedValue(profile);
    spotifyService.getPlaylists.mockResolvedValue(playlists);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();   // triggers ngOnInit (once) and ngAfterViewInit via Angular lifecycle
    await flushPromises();     // waits for all async work in ngOnInit (including fetchNextTracksPage)
    fixture.detectChanges();   // re-renders DOM with final state
  };

  beforeEach(async () => {
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
      unobserve: jest.fn(),
    }));

    spotifyService = {
      authenticate: jest.fn(),
      logout: jest.fn(),
      getPlaylists: jest.fn(),
      getPlaylistPage: jest.fn().mockReturnValue(EMPTY),
      getSavedTracksPage: jest.fn().mockReturnValue(of({ items: [], total: 0, offset: 0 })),
      addTracksToPlaylist: jest.fn().mockResolvedValue(undefined),
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
      expect(component.playlists).toEqual(mockPlaylists);
    });

    it('keeps only playlists owned by the current user', async () => {
      const mixed = [
        { id: '1', name: 'Mine', images: [{ url: 'https://example.com/1.jpg' }], owner: { id: 'test-user' } },
        { id: '2', name: 'Followed', images: [{ url: 'https://example.com/2.jpg' }], owner: { id: 'someone-else' } },
      ];
      await setup(true, mockProfile, mixed as any[]);
      expect(component.playlists).toHaveLength(1);
      expect(component.playlists![0].id).toBe('1');
    });

    it('shows no playlists when none are owned by the current user', async () => {
      const followed = [
        { id: '1', name: 'Followed', owner: { id: 'someone-else' } },
      ];
      await setup(true, mockProfile, followed as any[]);
      expect(component.playlists).toHaveLength(0);
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

  describe('mislaidTracks', () => {
    it('is empty when saved tracks are loaded but no playlists are selected', async () => {
      spotifyService.getSavedTracksPage.mockReturnValue(
        of({ items: [mockTrackItem], total: 1, offset: 0 })
      );
      await setup(true, mockProfile, mockPlaylists);
      expect(component.mislaidTracks).toEqual([]);
    });

    it('excludes saved tracks that appear in a selected playlist', async () => {
      spotifyService.getSavedTracksPage.mockReturnValue(
        of({ items: [mockTrackItem], total: 1, offset: 0 })
      );
      spotifyService.getPlaylistPage.mockReturnValue(
        of({ items: [], offset: 0, total: 0 })
      );
      await setup(true, mockProfile, mockPlaylists);
      component.playlistTracks.set(mockPlaylists[0].id, [{ id: mockTrackItem.track.id }]);
      component.togglePlaylist(mockPlaylists[0]);
      expect(component.mislaidTracks).toHaveLength(0);
    });

    it('deduplicates across multiple selected playlists', async () => {
      spotifyService.getSavedTracksPage.mockReturnValue(
        of({ items: [mockTrackItem], total: 1, offset: 0 })
      );
      spotifyService.getPlaylistPage.mockReturnValue(
        of({ items: [], offset: 0, total: 0 })
      );
      await setup(true, mockProfile, mockPlaylists);
      const sharedTrack = { id: mockTrackItem.track.id };
      component.playlistTracks.set(mockPlaylists[0].id, [sharedTrack]);
      component.playlistTracks.set(mockPlaylists[1].id, [sharedTrack]);
      component.toggleAll();
      expect(component.mislaidTracks).toHaveLength(0);
    });

    it('treats a selected playlist with no loaded tracks as empty', async () => {
      spotifyService.getSavedTracksPage.mockReturnValue(
        of({ items: [mockTrackItem], total: 1, offset: 0 })
      );
      spotifyService.getPlaylistPage.mockReturnValue(
        of({ items: [], offset: 0, total: 0 })
      );
      await setup(true, mockProfile, mockPlaylists);
      component.togglePlaylist(mockPlaylists[0]);
      expect(component.mislaidTracks).toHaveLength(1);
    });

    it('skips playlist tracks that have no id', async () => {
      spotifyService.getSavedTracksPage.mockReturnValue(
        of({ items: [mockTrackItem], total: 1, offset: 0 })
      );
      spotifyService.getPlaylistPage.mockReturnValue(
        of({ items: [], offset: 0, total: 0 })
      );
      await setup(true, mockProfile, mockPlaylists);
      component.playlistTracks.set(mockPlaylists[0].id, [{ id: undefined }, { id: mockTrackItem.track.id }] as any[]);
      component.togglePlaylist(mockPlaylists[0]);
      expect(component.mislaidTracks).toHaveLength(0);
    });

    it('keeps saved tracks not present in any selected playlist', async () => {
      spotifyService.getSavedTracksPage.mockReturnValue(
        of({ items: [mockTrackItem], total: 1, offset: 0 })
      );
      spotifyService.getPlaylistPage.mockReturnValue(
        of({ items: [], offset: 0, total: 0 })
      );
      await setup(true, mockProfile, mockPlaylists);
      component.playlistTracks.set(mockPlaylists[0].id, [{ id: 'other-id' }]);
      component.togglePlaylist(mockPlaylists[0]);
      expect(component.mislaidTracks).toHaveLength(1);
    });

    it('clears selectedTrackIds when the playlist selection changes', async () => {
      spotifyService.getSavedTracksPage.mockReturnValue(
        of({ items: [mockTrackItem], total: 1, offset: 0 })
      );
      spotifyService.getPlaylistPage.mockReturnValue(
        of({ items: [], offset: 0, total: 0 })
      );

      await setup(true, mockProfile, mockPlaylists);

      component.togglePlaylist(mockPlaylists[0]);
      component.selectedTrackIds.add(mockTrackItem.track.id);
      expect(component.selectedTrackIds.size).toBe(1);

      component.togglePlaylist(mockPlaylists[1]);

      expect(component.selectedTrackIds.size).toBe(0);
    });

    it('falls back to empty array when completedTrackFetches has an id not in playlistTracks', async () => {
      spotifyService.getSavedTracksPage.mockReturnValue(
        of({ items: [mockTrackItem], total: 1, offset: 0 })
      );
      await setup(true, mockProfile, mockPlaylists);
      component.selectedPlaylistIds.add(mockPlaylists[0].id);
      (component as any).completedTrackFetches.add(mockPlaylists[0].id);
      (component as any).recomputeMislaidTracks();
      expect(component.mislaidTracks).toHaveLength(1);
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

    it('clears selectedTrackIds when playlist selection changes via toggleAll', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.selectedTrackIds.add('t1');
      component.toggleAll();
      expect(component.selectedTrackIds.size).toBe(0);
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

    it('starts track fetch when selecting a playlist', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.togglePlaylist(mockPlaylists[0]);
      expect(spotifyService.getPlaylistPage).toHaveBeenCalledWith(mockPlaylists[0].id, 0);
    });

    it('accumulates tracks as pages arrive', async () => {
      await setup(true, mockProfile, mockPlaylists);
      const page2Subject = new Subject<any>();
      spotifyService.getPlaylistPage
        .mockReturnValueOnce(of({ items: [{ track: { id: 't1' } }], offset: 0, total: 100 }))
        .mockReturnValueOnce(page2Subject.asObservable());

      component.togglePlaylist(mockPlaylists[0]);
      page2Subject.next({ items: [{ track: { id: 't2' } }], offset: 50, total: 100 });
      page2Subject.complete();

      expect(component.playlistTracks.get(mockPlaylists[0].id)).toHaveLength(2);
    });

    it('commits in-flight page but does not continue after deselection', async () => {
      await setup(true, mockProfile, mockPlaylists);
      const pageSubject = new Subject<any>();
      spotifyService.getPlaylistPage.mockReturnValue(pageSubject.asObservable());

      component.togglePlaylist(mockPlaylists[0]); // select
      component.togglePlaylist(mockPlaylists[0]); // deselect

      pageSubject.next({ items: [{ track: { id: 't1' } }], offset: 0, total: 100 });
      pageSubject.complete();

      expect(component.playlistTracks.get(mockPlaylists[0].id)).toHaveLength(1); // committed
      expect(spotifyService.getPlaylistPage).toHaveBeenCalledTimes(1); // no next page
    });

    it('does not start a new fetch if subscription is still active when reselected', async () => {
      await setup(true, mockProfile, mockPlaylists);
      const pageSubject = new Subject<any>();
      spotifyService.getPlaylistPage.mockReturnValue(pageSubject.asObservable());

      component.togglePlaylist(mockPlaylists[0]); // select
      component.togglePlaylist(mockPlaylists[0]); // deselect — subscription still active
      component.togglePlaylist(mockPlaylists[0]); // reselect

      expect(spotifyService.getPlaylistPage).toHaveBeenCalledTimes(1);
    });

    it('resumes from last committed offset after subscription completes', async () => {
      await setup(true, mockProfile, mockPlaylists);
      const page2Subject = new Subject<any>();
      spotifyService.getPlaylistPage
        .mockReturnValueOnce(of({ items: Array(50).fill({ track: { id: 't' } }), offset: 0, total: 100 }))
        .mockReturnValueOnce(page2Subject.asObservable());

      component.togglePlaylist(mockPlaylists[0]); // select — page1 lands, page2 in flight
      component.togglePlaylist(mockPlaylists[0]); // deselect

      page2Subject.next({ items: [{ track: { id: 'late' } }], offset: 50, total: 100 });
      page2Subject.complete(); // subscription ends (deselected → expand returns EMPTY)

      component.togglePlaylist(mockPlaylists[0]); // reselect
      expect(spotifyService.getPlaylistPage).toHaveBeenLastCalledWith(mockPlaylists[0].id, 51);
    });

    it('does not re-fetch a fully loaded playlist', async () => {
      await setup(true, mockProfile, mockPlaylists);
      spotifyService.getPlaylistPage.mockReturnValue(
        of({ items: [{ track: { id: 't1' } }], offset: 0, total: 1 })
      );

      component.togglePlaylist(mockPlaylists[0]); // fully loads
      component.togglePlaylist(mockPlaylists[0]); // deselect
      component.togglePlaylist(mockPlaylists[0]); // reselect

      expect(spotifyService.getPlaylistPage).toHaveBeenCalledTimes(1);
    });
  });

  describe('toggleAll() — track fetching', () => {
    it('starts fetches for all playlists when selecting all', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.toggleAll();
      expect(spotifyService.getPlaylistPage).toHaveBeenCalledTimes(mockPlaylists.length);
    });

    it('commits in-flight pages but does not continue after deselect all', async () => {
      await setup(true, mockProfile, mockPlaylists);
      const subjects = mockPlaylists.map(() => new Subject<any>());
      let callIndex = 0;
      spotifyService.getPlaylistPage.mockImplementation(() => subjects[callIndex++ % subjects.length].asObservable());

      component.toggleAll(); // select all — starts fetches
      component.toggleAll(); // deselect all

      subjects[0].next({ items: [{ track: { id: 't1' } }], offset: 0, total: 100 });
      subjects[0].complete();

      expect(component.playlistTracks.get(mockPlaylists[0].id)).toHaveLength(1); // committed
      expect(spotifyService.getPlaylistPage).toHaveBeenCalledTimes(mockPlaylists.length); // no extra calls
    });
  });

  describe('tracksContainer setter', () => {
    it('removes the scroll listener when the tracks container leaves the DOM', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.togglePlaylist(mockPlaylists[0]);
      fixture.detectChanges();
      const tracksEl = fixture.nativeElement.querySelector('.tracks');
      const removeSpy = jest.spyOn(tracksEl, 'removeEventListener');
      component.togglePlaylist(mockPlaylists[0]); // deselect → element leaves DOM
      fixture.detectChanges();
      expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
  });

  describe('ngOnDestroy()', () => {
    it('unsubscribes all active fetches', async () => {
      await setup(true, mockProfile, mockPlaylists);
      const subject = new Subject<any>();
      spotifyService.getPlaylistPage.mockReturnValue(subject.asObservable());

      component.togglePlaylist(mockPlaylists[0]);
      component.ngOnDestroy();
      subject.next({ items: [{ track: { id: 't1' } }], offset: 0 });

      expect(component.playlistTracks.get(mockPlaylists[0].id) ?? []).toHaveLength(0);
    });
  });

  describe('hasSelectedTracks', () => {
    it('is false when no tracks are selected', async () => {
      await setup(true, mockProfile, mockPlaylists);
      expect(component.hasSelectedTracks).toBe(false);
    });

    it('is true when at least one track is selected', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.selectedTrackIds.add('t1');
      expect(component.hasSelectedTracks).toBe(true);
    });
  });

  describe('selectedPlaylistList', () => {
    it('returns empty array when no playlists are selected', async () => {
      await setup(true, mockProfile, mockPlaylists);
      expect(component.selectedPlaylistList).toEqual([]);
    });

    it('returns only the selected playlists', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.selectedPlaylistIds.add(mockPlaylists[0].id);
      expect(component.selectedPlaylistList).toEqual([mockPlaylists[0]]);
    });

    it('returns empty array when playlists is undefined', async () => {
      await setup(false);
      expect(component.selectedPlaylistList).toEqual([]);
    });
  });

  describe('onTrackSelectionChange()', () => {
    it('adds track id to selectedTrackIds when selected is true', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.onTrackSelectionChange(mockTrackItem.track, true);
      expect(component.selectedTrackIds.has(mockTrackItem.track.id)).toBe(true);
    });

    it('removes track id from selectedTrackIds when selected is false', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.selectedTrackIds.add(mockTrackItem.track.id);
      component.onTrackSelectionChange(mockTrackItem.track, false);
      expect(component.selectedTrackIds.has(mockTrackItem.track.id)).toBe(false);
    });
  });

  describe('openAddToPlaylistModal()', () => {
    it('sets showModal to true', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.openAddToPlaylistModal();
      expect(component.showModal).toBe(true);
    });
  });

  describe('confirmAddTracks()', () => {
    beforeEach(async () => {
      spotifyService.getSavedTracksPage.mockReturnValue(
        of({ items: [mockTrackItem], total: 1, offset: 0 })
      );
      spotifyService.getPlaylistPage.mockReturnValue(
        of({ items: [], offset: 0, total: 0 })
      );
    });

    it('calls addTracksToPlaylist with correct playlist id and track uris', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.selectedTrackIds.add(mockTrackItem.track.id);

      await component.confirmAddTracks([mockPlaylists[0].id]);

      expect(spotifyService.addTracksToPlaylist).toHaveBeenCalledWith(
        mockPlaylists[0].id,
        [`spotify:track:${mockTrackItem.track.id}`]
      );
    });

    it('calls addTracksToPlaylist for each target playlist id', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.selectedTrackIds.add(mockTrackItem.track.id);

      await component.confirmAddTracks(mockPlaylists.map(p => p.id));

      expect(spotifyService.addTracksToPlaylist).toHaveBeenCalledTimes(mockPlaylists.length);
    });

    it('removes added tracks from mislaidTracks', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.mislaidTracks = [mockTrackItem.track];
      component.selectedTrackIds.add(mockTrackItem.track.id);

      await component.confirmAddTracks([mockPlaylists[0].id]);

      expect(component.mislaidTracks).toHaveLength(0);
    });

    it('pushes selected tracks into playlistTracks for each target', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.mislaidTracks = [mockTrackItem.track];
      component.selectedTrackIds.add(mockTrackItem.track.id);

      await component.confirmAddTracks([mockPlaylists[0].id]);

      expect(component.playlistTracks.get(mockPlaylists[0].id)).toContainEqual(mockTrackItem.track);
    });

    it('clears selectedTrackIds after success', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.mislaidTracks = [mockTrackItem.track];
      component.selectedTrackIds.add(mockTrackItem.track.id);

      await component.confirmAddTracks([mockPlaylists[0].id]);

      expect(component.selectedTrackIds.size).toBe(0);
    });

    it('closes the modal after success', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.mislaidTracks = [mockTrackItem.track];
      component.selectedTrackIds.add(mockTrackItem.track.id);
      component.showModal = true;

      await component.confirmAddTracks([mockPlaylists[0].id]);

      expect(component.showModal).toBe(false);
    });

    it('handles undefined mislaidTracks gracefully', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.mislaidTracks = undefined;
      component.selectedTrackIds.add(mockTrackItem.track.id);

      await component.confirmAddTracks([mockPlaylists[0].id]);

      expect(component.mislaidTracks).toBeUndefined();
    });

    it('does nothing when targetIds is empty', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.selectedTrackIds.add(mockTrackItem.track.id);

      await component.confirmAddTracks([]);

      expect(spotifyService.addTracksToPlaylist).not.toHaveBeenCalled();
    });

    it('resets isAddingTracks to false after success', async () => {
      await setup(true, mockProfile, mockPlaylists);
      component.mislaidTracks = [mockTrackItem.track];
      component.selectedTrackIds.add(mockTrackItem.track.id);

      await component.confirmAddTracks([mockPlaylists[0].id]);

      expect(component.isAddingTracks).toBe(false);
    });

    it('resets isAddingTracks to false even when the API call fails', async () => {
      spotifyService.addTracksToPlaylist.mockRejectedValue(new Error('API error'));
      await setup(true, mockProfile, mockPlaylists);
      component.mislaidTracks = [mockTrackItem.track];
      component.selectedTrackIds.add(mockTrackItem.track.id);

      await expect(component.confirmAddTracks([mockPlaylists[0].id])).rejects.toThrow('API error');

      expect(component.isAddingTracks).toBe(false);
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

  const mockTrackItem = { track: { id: 't1', name: 'T1', artists: [], album: { images: [] }, external_urls: { spotify: '' } } } as any;

  describe('saved tracks loading', () => {
    it('loads saved tracks after playlists resolve', async () => {
      spotifyService.getSavedTracksPage.mockReturnValue(
        of({ items: [mockTrackItem], total: 1, offset: 0 })
      );
      await setup(true, mockProfile, mockPlaylists);
      expect(spotifyService.getSavedTracksPage).toHaveBeenCalledWith(0);
      expect(component.savedTracks).toHaveLength(1);
    });

    it('does not load saved tracks when not authenticated', async () => {
      await setup(false);
      expect(spotifyService.getSavedTracksPage).not.toHaveBeenCalled();
      expect(component.savedTracks).toBeUndefined();
    });
  });

  describe('scroll-based track fetching', () => {
    const nearBottom = (el: HTMLElement) => {
      Object.defineProperty(el, 'scrollTop', { get: () => 900, configurable: true });
      Object.defineProperty(el, 'clientHeight', { get: () => 100, configurable: true });
      Object.defineProperty(el, 'scrollHeight', { get: () => 1000, configurable: true });
    };

    const farFromBottom = (el: HTMLElement) => {
      Object.defineProperty(el, 'scrollTop', { get: () => 0, configurable: true });
      Object.defineProperty(el, 'clientHeight', { get: () => 100, configurable: true });
      Object.defineProperty(el, 'scrollHeight', { get: () => 1000, configurable: true });
    };

    it('fetches the next page when scrolled near the bottom', async () => {
      spotifyService.getSavedTracksPage.mockReturnValue(
        of({ items: [mockTrackItem], total: 100, offset: 0 })
      );
      await setup(true, mockProfile, mockPlaylists);
      component.togglePlaylist(mockPlaylists[0]);
      fixture.detectChanges();
      const tracksEl = fixture.nativeElement.querySelector('.tracks');
      nearBottom(tracksEl);
      tracksEl.dispatchEvent(new Event('scroll'));
      await flushPromises();
      expect(spotifyService.getSavedTracksPage).toHaveBeenCalledTimes(2);
    });

    it('does not fetch when scrolled far from the bottom', async () => {
      spotifyService.getSavedTracksPage.mockReturnValue(
        of({ items: [mockTrackItem], total: 100, offset: 0 })
      );
      await setup(true, mockProfile, mockPlaylists);
      component.togglePlaylist(mockPlaylists[0]);
      fixture.detectChanges();
      const tracksEl = fixture.nativeElement.querySelector('.tracks');
      farFromBottom(tracksEl);
      tracksEl.dispatchEvent(new Event('scroll'));
      expect(spotifyService.getSavedTracksPage).toHaveBeenCalledTimes(1);
    });

    it('does not start a concurrent fetch while one is in progress', async () => {
      const subject = new Subject<any>();
      spotifyService.getSavedTracksPage.mockReturnValue(subject.asObservable());
      await setup(true, mockProfile, mockPlaylists);

      component.togglePlaylist(mockPlaylists[0]);
      fixture.detectChanges();
      const tracksEl = fixture.nativeElement.querySelector('.tracks');
      nearBottom(tracksEl);
      tracksEl.dispatchEvent(new Event('scroll'));

      expect(spotifyService.getSavedTracksPage).toHaveBeenCalledTimes(1);
    });

    it('does not fetch when all tracks are already loaded', async () => {
      spotifyService.getSavedTracksPage.mockReturnValue(
        of({ items: [mockTrackItem], total: 1, offset: 0 })
      );
      await setup(true, mockProfile, mockPlaylists);

      component.togglePlaylist(mockPlaylists[0]);
      fixture.detectChanges();
      const tracksEl = fixture.nativeElement.querySelector('.tracks');
      nearBottom(tracksEl);
      tracksEl.dispatchEvent(new Event('scroll'));

      expect(spotifyService.getSavedTracksPage).toHaveBeenCalledTimes(1);
    });

    it('does not fetch before authentication completes', async () => {
      await setup(false);
      expect(spotifyService.getSavedTracksPage).not.toHaveBeenCalled();
    });
  });

  describe('fill-on-load track fetching', () => {
    // Sets up an underfilled container (content shorter than viewport)
    const makeUnderfilled = (el: HTMLElement) => {
      Object.defineProperty(el, 'scrollHeight', { get: () => 200, configurable: true });
      Object.defineProperty(el, 'clientHeight', { get: () => 600, configurable: true });
    };

    const makeFilled = (el: HTMLElement) => {
      Object.defineProperty(el, 'scrollHeight', { get: () => 1000, configurable: true });
      Object.defineProperty(el, 'clientHeight', { get: () => 600, configurable: true });
    };

    it('fetches the next page when mislaid tracks do not fill the container', async () => {
      // First page has 1 track (total 100). Second page marks everything as loaded (total 1).
      spotifyService.getSavedTracksPage
        .mockReturnValueOnce(of({ items: [mockTrackItem], total: 100, offset: 0 }))
        .mockReturnValue(of({ items: [], total: 1, offset: 0 }));
      spotifyService.getPlaylistPage.mockReturnValue(of({ items: [], offset: 0, total: 0 }));

      await setup(true, mockProfile, mockPlaylists);
      component.togglePlaylist(mockPlaylists[0]);
      fixture.detectChanges();

      // Mock underfilled BEFORE the queued setTimeout fires
      const tracksEl = fixture.nativeElement.querySelector('.tracks');
      makeUnderfilled(tracksEl);

      // One flush: fires the component's setTimeout, then resolves after async fetchNextTracksPage
      await flushPromises();

      expect(spotifyService.getSavedTracksPage).toHaveBeenCalledTimes(2);
    });

    it('does not fetch again when the container is already filled', async () => {
      spotifyService.getSavedTracksPage.mockReturnValue(
        of({ items: [mockTrackItem], total: 100, offset: 0 })
      );
      spotifyService.getPlaylistPage.mockReturnValue(of({ items: [], offset: 0, total: 0 }));

      await setup(true, mockProfile, mockPlaylists);
      component.togglePlaylist(mockPlaylists[0]);
      fixture.detectChanges();

      const tracksEl = fixture.nativeElement.querySelector('.tracks');
      makeFilled(tracksEl);

      await flushPromises();

      expect(spotifyService.getSavedTracksPage).toHaveBeenCalledTimes(1);
    });

    it('does not fetch when all saved tracks are already loaded', async () => {
      spotifyService.getSavedTracksPage.mockReturnValue(
        of({ items: [mockTrackItem], total: 1, offset: 0 })
      );
      spotifyService.getPlaylistPage.mockReturnValue(of({ items: [], offset: 0, total: 0 }));

      await setup(true, mockProfile, mockPlaylists);
      component.togglePlaylist(mockPlaylists[0]);
      fixture.detectChanges();

      const tracksEl = fixture.nativeElement.querySelector('.tracks');
      makeUnderfilled(tracksEl);

      await flushPromises();

      expect(spotifyService.getSavedTracksPage).toHaveBeenCalledTimes(1);
    });
  });
});
