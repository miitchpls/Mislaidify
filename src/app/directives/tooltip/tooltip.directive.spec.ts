import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TooltipDirective } from './tooltip.directive';

@Component({
  standalone: true,
  imports: [TooltipDirective],
  template: `<button [tooltip]="text">Hover me</button>`,
})
class TestHostComponent {
  text = 'Test tooltip';
}

describe('TooltipDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    const btn = fixture.debugElement.query(By.directive(TooltipDirective))?.nativeElement;
    btn?.dispatchEvent(new MouseEvent('mouseleave'));
  });

  it('should create the directive', () => {
    const directiveEl = fixture.debugElement.query(By.directive(TooltipDirective));
    expect(directiveEl).toBeTruthy();
  });

  describe('show() on mouseenter', () => {
    it('appends a .tooltip-popup element to document.body', () => {
      const btn = fixture.debugElement.query(By.directive(TooltipDirective)).nativeElement;
      btn.dispatchEvent(new MouseEvent('mouseenter'));

      const popup = document.body.querySelector('.tooltip-popup');
      expect(popup).toBeTruthy();
    });

    it('displays the tooltip input text', () => {
      const btn = fixture.debugElement.query(By.directive(TooltipDirective)).nativeElement;
      btn.dispatchEvent(new MouseEvent('mouseenter'));

      const popup = document.body.querySelector('.tooltip-popup');
      expect(popup?.textContent).toBe('Test tooltip');
    });

    it('uses fixed positioning with transform centering', () => {
      const btn = fixture.debugElement.query(By.directive(TooltipDirective)).nativeElement;
      btn.dispatchEvent(new MouseEvent('mouseenter'));

      const popup = document.body.querySelector<HTMLElement>('.tooltip-popup');
      expect(popup?.style.position).toBe('fixed');
      expect(popup?.style.transform).toBe('translate(-50%, -100%)');
    });

    it('reflects an updated tooltip input value', () => {
      host.text = 'Updated tooltip';
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.directive(TooltipDirective)).nativeElement;
      btn.dispatchEvent(new MouseEvent('mouseenter'));

      const popup = document.body.querySelector('.tooltip-popup');
      expect(popup?.textContent).toBe('Updated tooltip');
    });
  });

  describe('hide() on mouseleave', () => {
    it('removes the tooltip element from document.body', () => {
      const btn = fixture.debugElement.query(By.directive(TooltipDirective)).nativeElement;
      btn.dispatchEvent(new MouseEvent('mouseenter'));
      expect(document.body.querySelector('.tooltip-popup')).toBeTruthy();

      btn.dispatchEvent(new MouseEvent('mouseleave'));
      expect(document.body.querySelector('.tooltip-popup')).toBeNull();
    });

    it('does not throw when called without a prior mouseenter', () => {
      const directive = fixture.debugElement
        .query(By.directive(TooltipDirective))
        .injector.get(TooltipDirective);
      expect(() => directive.hide()).not.toThrow();
    });
  });

  describe('ngOnDestroy', () => {
    it('removes the tooltip element when the component is destroyed', () => {
      const btn = fixture.debugElement.query(By.directive(TooltipDirective)).nativeElement;
      btn.dispatchEvent(new MouseEvent('mouseenter'));
      expect(document.body.querySelector('.tooltip-popup')).toBeTruthy();

      fixture.destroy();
      expect(document.body.querySelector('.tooltip-popup')).toBeNull();
    });
  });
});
