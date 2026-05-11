import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllPlaylistsCardComponent } from './all-playlists-card.component';

describe('AllPlaylistsCardComponent', () => {
  let component: AllPlaylistsCardComponent;
  let fixture: ComponentFixture<AllPlaylistsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllPlaylistsCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AllPlaylistsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when not selected', () => {
    it('does not apply the selected class', () => {
      const card = fixture.nativeElement.querySelector('.all-playlists-card');
      expect(card.classList).not.toContain('selected');
    });

    it('shows the select icon', () => {
      const uses = fixture.nativeElement.querySelectorAll('use');
      const hrefs = Array.from(uses).map((u: any) => u.getAttribute('href'));
      expect(hrefs).toContain('assets/select_all_playlists.svg#svg');
    });
  });

  describe('when selected', () => {
    beforeEach(() => {
      component.selected = true;
      fixture.detectChanges();
    });

    it('applies the selected class', () => {
      const card = fixture.nativeElement.querySelector('.all-playlists-card');
      expect(card.classList).toContain('selected');
    });

    it('shows the deselect icon', () => {
      const uses = fixture.nativeElement.querySelectorAll('use');
      const hrefs = Array.from(uses).map((u: any) => u.getAttribute('href'));
      expect(hrefs).toContain('assets/deselect_all_playlists.svg#svg');
    });
  });

  describe('toggle()', () => {
    it('emits hasClicked when the card is clicked', () => {
      const emitted: any[] = [];
      component.hasClicked.subscribe(() => emitted.push(true));
      fixture.nativeElement.querySelector('.all-playlists-card').click();
      expect(emitted).toHaveLength(1);
    });
  });
});
