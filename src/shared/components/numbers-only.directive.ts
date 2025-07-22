import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNumbersOnly]'
})
export class NumbersOnlyDirective {


  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = this.el.nativeElement as HTMLInputElement;
    const cleanedValue = input.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters

    // Set the cleaned value back to the control
    this.control.control?.setValue(cleanedValue, { emitEvent: false });

    // Update validation
    this.control.control?.updateValueAndValidity();
  }

}
