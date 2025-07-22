import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  TemplateRef,
  ElementRef,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Component({
  selector: 'app-select-search',
  templateUrl: './select-search.component.html',
  styleUrls: ['./select-search.component.scss'],
})
export class SelectSearchComponent implements AfterViewInit, OnDestroy {
  @Input() options: Array<{ id: number; name: string; balance?:number }> = [];
  @Input() placeholder: string = 'Select an option';
  @Input() toplabel: string = '';
  @Input() preselectedOption: { id: number; name: string } | null = null; // Autofill feature
  @Input() showSearch: boolean = true;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() showErrorMessage: boolean = false;
  @Input() resetFormTrigger: boolean = false; // Trigger for resetting the form

  @Output() optionSelected = new EventEmitter<{ id: number; name: string }>();
  @Output() selectionChange = new EventEmitter<{ id: number; name: string }>();

  isFocused = false;
  searchControl = new FormControl('');
  filteredOptions: Array<{ id: number; name: string; balance?:number }> = [];
  isDropdownOpen = false;
  selectedOption: { id: number; name: string; balance?:number } | null = null;

  @ViewChild('dropdownOverlay') dropdownOverlay!: TemplateRef<any>;
  @ViewChild('selectSearchTrigger') selectSearchTrigger!: ElementRef;

  overlayRef!: OverlayRef;
  portal!: TemplatePortal;

  constructor(private overlay: Overlay, private viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    this.filteredOptions = this.options;

    this.searchControl.valueChanges.subscribe((searchText: any) => {
      this.filterOptions(searchText);
    });

    if(this.disabled){
      this.placeholder = this.placeholder + "(disabled)";
    }

    // Apply preselected value if available
    if (this.preselectedOption) {
      this.selectedOption = this.options.find(option => option.id === this.preselectedOption?.id) || null;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options']) {
      this.filteredOptions = this.options;
    }
  
    // Update selected option if `preselectedOption` changes
    if (changes['preselectedOption'] && changes['preselectedOption'].currentValue) {
      this.selectedOption = this.options.find(option => option.id === this.preselectedOption?.id) || null;
    }
  
    // Reset form when `resetFormTrigger` changes
    if (changes['resetFormTrigger'] && changes['resetFormTrigger'].currentValue) {
      this.resetForm();
    }
  }
  

  ngAfterViewInit() {
    this.portal = new TemplatePortal(this.dropdownOverlay, this.viewContainerRef);
  }

  ngOnDestroy() {
    this.closeDropdown();
  }

  toggleDropdown() {
    if (this.disabled || this.readonly) return; // Prevent toggle if disabled or readonly
    this.isDropdownOpen ? this.closeDropdown() : this.openDropdown();
  }

  openDropdown() {
    if (!this.overlayRef) {
      const positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo(this.selectSearchTrigger)
        .withPositions([{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }]);

      this.overlayRef = this.overlay.create({
        positionStrategy,
        hasBackdrop: true,
        backdropClass: 'cdk-overlay-transparent-backdrop',
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
      });

      this.overlayRef.backdropClick().subscribe(() => this.closeDropdown());
    }

    const triggerWidth = this.selectSearchTrigger.nativeElement.offsetWidth;
    this.overlayRef.updateSize({ width: triggerWidth });

    this.overlayRef.attach(this.portal);
    this.isDropdownOpen = true;
  }

  closeDropdown() {
    if (this.overlayRef) {
      this.overlayRef.detach();
    }
    this.isDropdownOpen = false;
  }

  filterOptions(searchText: string) {
    this.filteredOptions = this.options.filter(option =>
      option.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  onSelect(option: { id: number; name: string }) {
    if (this.readonly) return; // Prevent selection if readonly
    this.selectedOption = option;
    this.optionSelected.emit(option);
    this.closeDropdown();
  }

  resetForm() {
    this.selectedOption = null;
    this.searchControl.setValue('');
    this.filteredOptions = [...this.options]; // Reset filter
  }
}
