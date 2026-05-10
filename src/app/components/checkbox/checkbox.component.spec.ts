import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggle()', () => {
    it('emits the inverse of the current checked value', () => {
      component.checked = false;
      const emitted: boolean[] = [];
      component.hasChecked.subscribe(v => emitted.push(v));
      component.toggle();
      expect(emitted).toEqual([true]);
    });

    it('does not mutate the checked @Input', () => {
      component.checked = false;
      component.toggle();
      expect(component.checked).toBe(false);
    });
  });
});
