import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TransactionSummary } from 'src/shared/dataprovider/api/model/transactionSummary';
import { TransactionSummaryData } from 'src/shared/dataprovider/api/model/transactionSummaryData';
import { TableOption } from 'src/shared/dataprovider/local/data/common';
import { formatDateUtc } from 'src/shared/helpers/helper';

@Component({
  selector: 'app-client-merchant-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnChanges {
  public tableOption = TableOption;
  @Input() data!: TransactionSummary;

  displayedColumns: string[] = [
    'Date',
    'TransactionNo',
    'Client',
    'Type',
    'Method',
    'Merchant',
    'Gross',
    'TranFee',
    'Net',
    'Status'
  ];

  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private datepipe:DatePipe) { }

  ngOnChanges(changes: SimpleChanges) {
    // Check if data changed
    if (changes['data'] && changes['data'].currentValue) {
      // Load data automatically
      this.loadData();
    }
  }



  loadData() {
    if (this.data != null && Array.isArray(this.data.Data)) {
      const tableData: any = this.data.Data.map((item: TransactionSummaryData) => ({
        Date: formatDateUtc(item?.Timestamp?.toString()!, this.datepipe),
        TransactionNo: item.TransactionNo,
        Client: item.ClientName,
        Type: item.Type,
        Method: item.PMethod,
        Merchant: item.MerchantName,
        Gross: item.GrossAmount,
        TranFee: item.FixFee,
        Net: item.NetAmount,
        Status: item.Status,
      }));


      // Assign the table data to dataSource
      this.dataSource = new MatTableDataSource<any>(tableData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } else {
 
    }
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
