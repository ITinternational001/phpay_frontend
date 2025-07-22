import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription, of, map, catchError } from 'rxjs';
import { MerchantsFormComponent } from 'src/app/admin/merchants/merchants-form/merchants-form.component';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { MerchantDTO, ClientDTO, MerchantsService, VendorsService, ClientService, VendorDTO } from 'src/shared/dataprovider/api';
import { TableOption } from 'src/shared/dataprovider/local/data/common';
import { SessionManager } from 'src/shared/helpers/session-manager';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit{
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private obsMerchant!: Observable<Array<MerchantDTO>>;
  private subsMerchant!: Subscription;
  public clientName!: string;
  public clientId: number = parseInt(SessionManager.getFromToken('ClientId'));
  public vendorName!: string;
  public tableOption = TableOption;
  public vendorTable : any;
  displayedColumns: string[] = [
    'Date',
    'TransactionNo',
    'UserID',
    'Transaction',
    'Merchant',
    'Amount',
    'Fee',
    'NetAmount',
    'Status'
  ];

  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  clientsList: Array<ClientDTO> = [];

  constructor(private _dialog: MatDialog,
    private _merchantService: MerchantsService,
    private _vendorService: VendorsService,
    private _clientService: ClientService,
    private notification: NotificationService) { }


  ngOnInit(): void {
   
  }




  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
