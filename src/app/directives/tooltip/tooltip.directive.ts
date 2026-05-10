import { Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[tooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  @Input({ required: true }) tooltip = '';

  private tooltipEl?: HTMLElement;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter')
  show(): void {
    const rect: DOMRect = this.el.nativeElement.getBoundingClientRect();

    this.tooltipEl = this.renderer.createElement('div');
    this.renderer.appendChild(this.tooltipEl, this.renderer.createText(this.tooltip));
    this.renderer.addClass(this.tooltipEl, 'tooltip-popup');
    this.renderer.setStyle(this.tooltipEl, 'position', 'fixed');
    this.renderer.setStyle(this.tooltipEl, 'top', `${rect.top - 8}px`);
    this.renderer.setStyle(this.tooltipEl, 'left', `${rect.left + rect.width / 2}px`);
    this.renderer.setStyle(this.tooltipEl, 'transform', 'translate(-50%, -100%)');
    this.renderer.appendChild(document.body, this.tooltipEl);
  }

  @HostListener('mouseleave')
  hide(): void {
    if (this.tooltipEl) {
      document.body.removeChild(this.tooltipEl);
      this.tooltipEl = undefined;
    }
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
