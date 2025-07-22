import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { CardDTO } from 'src/shared/dataprovider/api/model/cardDTO';
import { CardTransactionDTO } from 'src/shared/dataprovider/api/model/cardTransactionDTO';
import { cardsData } from 'src/shared/dataprovider/local/data/common';
import { CardTransaction } from 'src/shared/dataprovider/local/interface/commonInterface';

@Component({
  selector: 'app-client-card-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage: number = 100; // Number of items per page
  itemsPerPageOptions: number[] = [10, 20, 50, 100];

  dataSource!: MatTableDataSource<any>;
  displayedColumns: string[] = ['dateReq', 'transaction', 'client', 'type', 'destination', 'ref', 'source', 'dateRem', 'amount'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public isLoading: boolean = false;
  language: string = "";
@Input() transactions! : CardDTO;
  constructor(
    private translateService: TranslateService
  ){
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit() {
   
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transactions']) {
      this.onChange();
    }
  }

  onChange() {
    const cardsData: { data: CardTransaction[] } = { data: [] };
    if (this.transactions && Array.isArray(this.transactions)) {
      this.isLoading = true;
      cardsData.data = this.transactions.flatMap(transaction => 
        transaction.CardTransactions?.map((item:CardTransactionDTO) => ({
          dateReq: item.CreatedDate,
          transaction: item.TransactionNumber,
          client: this.transactions.Client,
          type: item.TransactionType,
          destination: item.CardNameDestination,
          ref: item.ReferenceNumber,
          source: item.Method,
          dateRem: item.CompletedDate,
          amount: item.Amount,
          status: item.Status,
        })) || []
      );
    }

    this.dataSource = new MatTableDataSource(cardsData.data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.isLoading = false;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onFirstPage(): void {
    this.loadPage(1);
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1);
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1);
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage));
  }

  loadPage(page: number, keyword?:string){
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    // Determine if it's the last page
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);
  }
  
}
