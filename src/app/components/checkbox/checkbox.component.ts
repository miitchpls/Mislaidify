import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'checkbox',
  imports: [CommonModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent {
  @Input() label: string = '';
  @Input() checked!: boolean;

  @Output() hasChecked = new EventEmitter<boolean>();

  public toggle(): void {
    this.checked = !this.checked;
    this.hasChecked.emit(this.checked);
  }
}
