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
import { MerchantsListDTO } from 'src/shared/dataprovider/api/model/merchantsListDTO';
import { TableOption } from 'src/shared/dataprovider/local/data/common';
import { SessionManager } from 'src/shared/helpers/session-manager';

@Component({
  selector: 'app-merchant-summary',
  templateUrl: './merchant-summary.component.html',
  styleUrls: ['./merchant-summary.component.scss']
})
export class MerchantSummaryComponent implements OnInit {
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private obsMerchant!: Observable<MerchantsListDTO>;
  private subsMerchant!: Subscription;
  public clientName!: string;
  public clientId: number = parseInt(SessionManager.getFromToken('ClientId'));
  public vendorName!: string;
  public tableOption = TableOption;
  public vendorTable : any;
  displayedColumns: string[] = [
    'PaymentChannel',
    'Merchant',
    'CIFee',
    'CIFeeFixed',
    'COFee',
    'COFeeFixed',
    'Action'
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
    this.getAllMerchants();
    this.getAllClient();
  }

  openForm() {
    const dialogRef = this._dialog.open(MerchantsFormComponent, { width: '800px' });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.notification.showNotification("Merchant Added successfully", "close", 'success');
          this.getAllMerchants();
        }
      }
    });
  }

  openEditForm(data: any) {
    this.observable = this._merchantService.apiMerchantsGetMerchantByIdGet(data.Id);
    this.subscription = this.observable.subscribe({
      next: (response: MerchantDTO) => {

        const dialogRef = this._dialog.open(MerchantsFormComponent, { data: response });
        dialogRef.afterClosed().subscribe({
          next: (val) => {
            if (val) {
              this.notification.showNotification("Merchant data updated successfully", "close", 'success');
              this.getAllMerchants();
            }
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:"+ error.error, "close", 'error');
      }
    })
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getAllMerchants() {
    if (this.clientId) {
      this.obsMerchant = this._merchantService.apiMerchantsGetMerchantsByClientIdGet(this.clientId);
      this.subsMerchant = this.obsMerchant.subscribe({
        next: (response: MerchantsListDTO) => {

          if (response != null) {
            const tableData: any = response.Data!.map((item) => ({
                  PaymentChannel: item.PaymentChannel?.Name,
                  Merchant: "DynastyPay " + item.Vendor?.Id,
                  CIFee: item.CashInFee?.FeeAtCostPercent,
                  CIFeeFixed: item.CashInFee?.FeeAtCostFixed,
                  COFee: item.CashOutFee?.FeeAtCostPercent,
                  COFeeFixed: item.CashOutFee?.FeeAtCostFixed,  
            }));
            this.vendorTable = response.Data!.map((item)=>({
              Vendor: item.Vendor?.Name,
            }))
            this.dataSource = new MatTableDataSource(tableData);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.notification.showNotification("Error:" + error.error, "close", 'error');
        },
        complete: () => {
          this.subsMerchant.unsubscribe();
        }
      });
    }
  }

  getAllClient() {
    this.observable = this._clientService.apiClientGetAllClientsGet();
    this.subscription = this.observable.subscribe({
      next: (response: Array<ClientDTO>) => {
        this.clientsList = response;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  getClientNameById(clientId: number | undefined): Observable<string> {
    if (clientId === undefined) {
      return of('Vendor not Found');
    }
    return this._clientService.apiClientGetClientByIdGet(clientId).pipe(
      map((response: ClientDTO) => response?.Name ?? 'Client not Found'),
      catchError(error => {
        console.log(error);
        return of('Client not Found');
      })
    );
  }

  getVendorNameById(vendorId: number | undefined): Observable<string> {

    if (vendorId === undefined) {
      return of('Vendor not Found');
    }

    return this._vendorService.apiVendorsGetVendorByIdGet(vendorId).pipe(
      map((response: VendorDTO) => response?.Name ?? 'Vendor not Found'),
      catchError(error => {
        console.log(error);
        return of('Vendor not Found');
      })
    );
  }

  deleteMerchantById(Id: number) {

  }

  onDropdownValueChanged(selectedValue: string) {
    this.clientId = selectedValue ? parseInt(selectedValue) : 1;
    this.getAllMerchants();
  }
}
