import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumberFormat]'
})
export class NumberFormatDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/,/g, ''); // Remove existing commas

    // Allow numbers and a single decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');

    // Ensure there is only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      input.value = this.formatNumber(parts[0]) + '.' + parts[1]; // If more than one decimal, keep the first two parts
    } else {
      input.value = this.formatNumber(numericValue);
    }
  }

  private formatNumber(value: string): string {
    if (!value) return '';
    
    // Split the number on the decimal point to format only the integer part
    const parts = value.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Join integer part and decimal part (if it exists)
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  }
}
