import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { cardsData } from 'src/shared/dataprovider/local/data/common';

@Component({
  selector: 'app-admin-card-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent {

  dataSource!: MatTableDataSource<any>;
  displayedColumns: string[] = ['dateReq', 'transaction', 'client', 'type', 'destination', 'ref', 'source', 'dateRem', 'amount'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(){}

  ngOnInit() {
    this.dataSource = new MatTableDataSource(cardsData.data);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  
}
