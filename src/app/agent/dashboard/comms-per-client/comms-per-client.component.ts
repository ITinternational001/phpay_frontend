import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-comms-per-client',
  templateUrl: './comms-per-client.component.html',
  styleUrls: ['./comms-per-client.component.scss']
})
export class CommsPerClientComponent implements OnInit, OnChanges {
  displayedColumns: string[] = ['clientId', 'clientName', 'totalCommission'];
  dataSource = new MatTableDataSource(); 
  @Input() isLoading: boolean = false;
  @Input() data: any;
  @Output() search = new EventEmitter<string>();
  language: string = "";
  constructor(
    private translateService: TranslateService
  ){
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage: number = 1; // Number of items per page
  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.dataSource.data = changes['data'].currentValue;
    }
  }

  onSearch(query: string): void {
    this.search.emit(query); // Emit the search term to parent
  }

  onFirstPage(): void {
    this.loadPage(1,);
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1,);
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1,);
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage));
  }
  loadPage(page: number, data?: any, keyword?: string): void {
    // this.currentPage = page;
    // const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    // // Determine if it's the last page
    // const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);

    // const convertedStartDate = this._datepipe.transform(data.StartDate, 'yyyy-MM-dd');
    // const convertedEndDate = this._datepipe.transform(data.EndDate, 'yyyy-MM-dd');
    // data.StartDate = new Date(convertedStartDate!);
    // data.EndDate = new Date(convertedEndDate!);

    // // Load data for the selected page here
    // this.getManualTopUps(data, keyword);


  }
}
