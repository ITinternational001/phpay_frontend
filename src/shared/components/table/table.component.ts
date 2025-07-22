import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-reusable-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  @Input() data: any[] = []; // Data passed to the table
  @Input() columns: { key: string, label: string }[] = []; // Columns to display dynamically
  @Input() totalItems: number = 0; // Total number of items for pagination
  @Output() onEdit = new EventEmitter<any>(); // Event for edit
  @Output() onDelete = new EventEmitter<any>(); // Event for delete
  @Output() onPageChange = new EventEmitter<number>(); // Event for page change

  displayedColumns: string[] = [];
  pageSize: number = 10;
  currentPage: number = 1;
  currentPageStart: number = 1;
  currentPageEnd: number = this.pageSize;

  ngOnInit() {
    this.displayedColumns = [...this.columns.map(col => col.key), 'actions'];
  }

  edit(element: any) {
    this.onEdit.emit(element);
  }

  delete(element: any) {
    this.onDelete.emit(element);
  }

  goToFirstPage() {
    this.updatePagination(1);
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.updatePagination(this.currentPage - 1);
    }
  }

  goToNextPage() {
    const maxPage = Math.ceil(this.totalItems / this.pageSize);
    if (this.currentPage < maxPage) {
      this.updatePagination(this.currentPage + 1);
      
    }
  }

  goToLastPage() {
    const maxPage = Math.ceil(this.totalItems / this.pageSize);
    this.updatePagination(maxPage);
  }

  updatePagination(page: number) {
    this.currentPage = page;
    this.currentPageStart = (this.currentPage - 1) * this.pageSize + 1;
    this.currentPageEnd = Math.min(this.currentPage * this.pageSize, this.totalItems);
    this.onPageChange.emit(this.currentPage);
  }
}



