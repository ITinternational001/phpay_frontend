import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent{
  @Input() totalItems: number = 0;  // Total number of items
  @Input() itemsPerPage: number = 100;  // Items per page
  @Input() currentPage: number = 1;  // Current page number
  @Output() firstData: EventEmitter<void> = new EventEmitter<void>();
  @Output() nextData: EventEmitter<void> = new EventEmitter<void>();
  @Output() previousData: EventEmitter<void> = new EventEmitter<void>();
  @Output() lastData: EventEmitter<void> = new EventEmitter<void>();
  @Output() itemsPerPageChange = new EventEmitter<number>();
  selectedItemsPerPage = itemsPerPageOptions[0];
  itemsPerPageOptions = itemsPerPageOptions;
  get isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  get isLastPage(): boolean {
    return this.currentPage === this.totalPages;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  onFirstPage(): void {
    if (!this.isFirstPage) {
      this.firstData.emit();
    }
  }

  onPreviousPage(): void {
    if (!this.isFirstPage) {
      this.previousData.emit();
    }
  }

  onNextPage(): void {
    if (!this.isLastPage) {
      this.nextData.emit();
    }
  }

  onLastPage(): void {
    if (!this.isLastPage) {
      this.lastData.emit();
    }
  }

  onItemsPerPageChange() {
    this.itemsPerPageChange.emit(this.selectedItemsPerPage);
  }
}
