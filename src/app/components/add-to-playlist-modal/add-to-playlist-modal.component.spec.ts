import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddToPlaylistModalComponent } from './add-to-playlist-modal.component';

const mockPlaylists = [
  { id: '1', name: 'Playlist 1' },
  { id: '2', name: 'Playlist 2' },
] as any[];

describe('AddToPlaylistModalComponent', () => {
  let component: AddToPlaylistModalComponent;
  let fixture: ComponentFixture<AddToPlaylistModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddToPlaylistModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddToPlaylistModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isSinglePlaylist', () => {
    it('is true when exactly one playlist is provided', () => {
      component.playlists = [mockPlaylists[0]];
      expect(component.isSinglePlaylist).toBe(true);
    });

    it('is false when multiple playlists are provided', () => {
      component.playlists = mockPlaylists;
      expect(component.isSinglePlaylist).toBe(false);
    });

    it('is false when no playlists are provided', () => {
      component.playlists = [];
      expect(component.isSinglePlaylist).toBe(false);
    });
  });


  describe('filteredPlaylists', () => {
    it('returns all playlists when searchQuery is empty', () => {
      component.playlists = mockPlaylists;
      component.searchQuery = '';
      expect(component.filteredPlaylists).toEqual(mockPlaylists);
    });

    it('returns all playlists when searchQuery is only whitespace', () => {
      component.playlists = mockPlaylists;
      component.searchQuery = '   ';
      expect(component.filteredPlaylists).toEqual(mockPlaylists);
    });

    it('filters playlists by name case-insensitively', () => {
      component.playlists = mockPlaylists;
      component.searchQuery = 'playlist 1';
      expect(component.filteredPlaylists).toEqual([mockPlaylists[0]]);
    });

    it('returns empty array when no playlists match the query', () => {
      component.playlists = mockPlaylists;
      component.searchQuery = 'xyz';
      expect(component.filteredPlaylists).toEqual([]);
    });
  });

  describe('ngOnInit()', () => {
    it('leaves targetPlaylistIds empty regardless of how many playlists are provided', () => {
      component.playlists = mockPlaylists;
      component.ngOnInit();
      expect(component.targetPlaylistIds.size).toBe(0);
    });

    it('sets overflow hidden on the body', () => {
      component.playlists = [];
      component.ngOnInit();
      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  describe('allPlaylistsSelected', () => {
    it('is false when no playlists are selected', () => {
      component.playlists = mockPlaylists;
      component.targetPlaylistIds = new Set();
      expect(component.allPlaylistsSelected).toBe(false);
    });

    it('is false when only some playlists are selected', () => {
      component.playlists = mockPlaylists;
      component.targetPlaylistIds = new Set(['1']);
      expect(component.allPlaylistsSelected).toBe(false);
    });

    it('is true when all playlists are selected', () => {
      component.playlists = mockPlaylists;
      component.targetPlaylistIds = new Set(mockPlaylists.map(p => p.id));
      expect(component.allPlaylistsSelected).toBe(true);
    });

    it('is false when playlists list is empty', () => {
      component.playlists = [];
      expect(component.allPlaylistsSelected).toBe(false);
    });
  });

  describe('toggleAllPlaylists()', () => {
    it('selects all playlists when not all are selected', () => {
      component.playlists = mockPlaylists;
      component.targetPlaylistIds = new Set(['1']);
      component.toggleAllPlaylists();
      expect(component.targetPlaylistIds.size).toBe(mockPlaylists.length);
      mockPlaylists.forEach(p => expect(component.targetPlaylistIds.has(p.id)).toBe(true));
    });

    it('deselects all playlists when all are selected', () => {
      component.playlists = mockPlaylists;
      component.targetPlaylistIds = new Set(mockPlaylists.map(p => p.id));
      component.toggleAllPlaylists();
      expect(component.targetPlaylistIds.size).toBe(0);
    });

    it('selects all when starting from empty', () => {
      component.playlists = mockPlaylists;
      component.targetPlaylistIds = new Set();
      component.toggleAllPlaylists();
      expect(component.targetPlaylistIds.size).toBe(mockPlaylists.length);
    });
  });

  describe('ngOnDestroy()', () => {
    it('restores body overflow', () => {
      document.body.style.overflow = 'hidden';
      component.ngOnDestroy();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('toggleTargetPlaylist()', () => {
    it('adds a playlist id when not present', () => {
      component.toggleTargetPlaylist('1');
      expect(component.targetPlaylistIds.has('1')).toBe(true);
    });

    it('removes a playlist id when already present', () => {
      component.targetPlaylistIds = new Set(['1']);
      component.toggleTargetPlaylist('1');
      expect(component.targetPlaylistIds.has('1')).toBe(false);
    });

    it('creates a new Set reference on each toggle', () => {
      const original = component.targetPlaylistIds;
      component.toggleTargetPlaylist('1');
      expect(component.targetPlaylistIds).not.toBe(original);
    });
  });

  describe('onConfirm()', () => {
    it('emits the single playlist id when isSinglePlaylist is true', () => {
      component.playlists = [mockPlaylists[0]];
      const emitted: string[][] = [];
      component.confirm.subscribe(ids => emitted.push(ids));

      component.onConfirm();

      expect(emitted).toHaveLength(1);
      expect(emitted[0]).toEqual([mockPlaylists[0].id]);
    });

    it('emits all targetPlaylistIds when multiple playlists are provided', () => {
      component.playlists = mockPlaylists;
      component.targetPlaylistIds = new Set(['1', '2']);
      const emitted: string[][] = [];
      component.confirm.subscribe(ids => emitted.push(ids));

      component.onConfirm();

      expect(emitted).toHaveLength(1);
      expect(emitted[0]).toEqual(expect.arrayContaining(['1', '2']));
      expect(emitted[0]).toHaveLength(2);
    });

    it('emits only the currently selected targetPlaylistIds in picker mode', () => {
      component.playlists = mockPlaylists;
      component.targetPlaylistIds = new Set(['1']);
      const emitted: string[][] = [];
      component.confirm.subscribe(ids => emitted.push(ids));

      component.onConfirm();

      expect(emitted[0]).toEqual(['1']);
    });
  });
});
