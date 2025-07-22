import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-input-text-field',
  templateUrl: './input-text-field.component.html',
  styleUrls: ['./input-text-field.component.scss']
})
export class InputTextFieldComponent implements OnInit {
  @Input() label: string = ''; 
  @Input() controlName!: string; 
  @Input() type: string = 'text'; 
  @Input() placeholder: string = ''; 
  @Input() formGroup!: FormGroup; 
  @Input() errorMessage: string = ''; 
  @Input() isInvalid: boolean = false; 
  @Input() readonly: boolean = false; // New readonly property
  @Input() isReadAndWrite: boolean = true;

  public isFocused: boolean = false; // Flag for focus state

  ngOnInit() {
    if (!this.formGroup || !this.controlName) {
      throw new Error('formGroup and controlName inputs are required');
    }
  }

  get control(): FormControl {
    return this.formGroup.get(this.controlName) as FormControl;
  }
}
