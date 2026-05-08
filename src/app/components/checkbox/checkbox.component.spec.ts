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
    it('flips checked and emits the new value', () => {
      component.checked = false;
      const emitted: boolean[] = [];
      component.hasChecked.subscribe(v => emitted.push(v));
      component.toggle();
      expect(component.checked).toBe(true);
      expect(emitted).toEqual([true]);
    });
  });
});
