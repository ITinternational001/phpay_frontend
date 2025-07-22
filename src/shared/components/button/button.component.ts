import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {
  @Input() text!: string;
  @Input() btnClass!: string;
  @Input() icon!: string;
  @Output() buttonClick = new EventEmitter<void>();
  @Input() disabled: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  onClick(): void {
    this.buttonClick.emit();
  }
}