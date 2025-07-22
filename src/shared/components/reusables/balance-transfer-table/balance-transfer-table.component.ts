import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { MerchantsService, ClientService, TransactionsService } from 'src/shared/dataprovider/api';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { Approved, Decline, TableOption, TopUpStatus } from 'src/shared/dataprovider/local/data/common';
import { getWeekBeforeDateRange, formatDateUtc, getStatusName } from 'src/shared/helpers/helper';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { NotificationService } from '../../modals/notification/notification.service';
import { TransferModalComponent } from '../../modals/transfer-modal/transfer-modal.component';
import { ConfirmationModalComponent } from '../../modals/confirmation-modal/confirmation-modal.component';
import { UserUpdateBalanceTransferRequestDTO } from 'src/shared/dataprovider/api/model/userUpdateBalanceTransferRequestDTO';
import { MerchantsListDTO } from 'src/shared/dataprovider/api/model/merchantsListDTO';

@Component({
  selector: 'app-balance-transfer-table',
  templateUrl: './balance-transfer-table.component.html',
  styleUrls: ['./balance-transfer-table.component.scss']
})
export class BalanceTransferTableComponent implements OnInit, OnChanges {

  @Input() data: boolean = false;
  @Input() isAdmin!: boolean;
  @Input() isLoading: boolean = false;
  dataSource!: MatTableDataSource<any>;
  BalanceTransferForm!: FormGroup;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  public tableOption = TableOption;
  public defaultDateRange = getWeekBeforeDateRange(7);
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage: number = this.tableOption.PageSize; // Number of items per page
  displayedColumns: string[] = ['id', 'clientName', 'transactionNo', 'amount', 'createdDate', 'completedDate', 'requestee', 'status', 'action'];
  public clientId: number = parseInt(SessionManager.getFromToken('ClientId'));
  constructor(private _notification: NotificationService,
    private _fb: FormBuilder,
    private _merchantService: MerchantsService,
    private _clientService: ClientService,
    private _transactionService: TransactionsService,
    private _reportsService: ReportsService,
    private _dialog: MatDialog,
    private _datepipe: DatePipe) {
   

    this.BalanceTransferForm = _fb.group({
      StartDate: this.defaultDateRange.startDate,
      EndDate: this.defaultDateRange.endDate,
      ClientId: this.clientId
    });

    this.BalanceTransferForm.get("EndDate")?.valueChanges.subscribe(() => {
      const formGroup = this.BalanceTransferForm;
      this.loadPage(1, formGroup.getRawValue());
    });
  }
  ngOnInit(): void {
    if (this.isAdmin) {
      this.BalanceTransferForm.patchValue({ ClientId: 0 });
    }else{  
       this.displayedColumns = this.displayedColumns.filter(column => column !== 'action');
    }

    this.loadPage(1, this.BalanceTransferForm.getRawValue())
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      // Load data automatically
      this.loadPage(1, this.BalanceTransferForm.getRawValue());
    }
  }

  async onApproveTransfer(row: any) {
    let width = '1000px';
    let data: any[] = [];

    try {
      data = await this.getMerchantByClientId(row.ClientId);

      const dialogRef = this._dialog.open(TransferModalComponent, { width: width, data: { data, transactionNumber: row.TransactionNo, status: Approved } });
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val) {
            this._notification.showNotification("Transfer fund successfully", "close", 'success');
          }
        }
      });
    } catch (error) {
      console.error("Error fetching merchant data", error);
    }
  }

  onDeclineTransfer(row:any){
    const dialogRef = this._dialog.open(ConfirmationModalComponent, { data: { type: 'DeclineTransfer' } });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val.continue) {
         this.declineTransfer({...row, remarks:val.remarks});
        }
      }
    });
  }

  declineTransfer(data:any){
    if(this.observable){
      this.subscription.unsubscribe();
    }

    const params : UserUpdateBalanceTransferRequestDTO = {
      TransactionNumber: data.TransactionNo,
      Status: Decline,
      Destinations: [],
      Sources:[],
      Remarks: data.remarks
    }
    this.observable = this._transactionService.apiTransactionsBalanceTransferRequestFundForCOPut(params);
    this.subscription = this.observable.subscribe({
      next:(response)=>{
        this.loadPage(1, this.BalanceTransferForm.getRawValue())
        this._notification.showNotification("Transfer fund declined", "close", 'success');
      },
      error:(error:HttpErrorResponse)=>{
        this._notification.showNotification("Error on decline process" + error.error, "close", 'error');
      }
    })
  }



  getBalanceTransfers(data: any) {
    this.isLoading = true;
    if (this.observable) {
      this.subscription.unsubscribe();
    }
    this.observable = this._reportsService.apiReportsGetRequestFundForCOListPost(data, this.itemsPerPage, this.currentPage);
    this.subscription = this.observable.subscribe({
      next: (response) => {
        this.totalItems = response.length;
        const tableData = response.map((item: any) => ({
          Id: item.Id,
          Amount: item.Amount,
          TransactionNo: item.TransactionNumber,
          CompletedDate: formatDateUtc(item.CompletedDate!.toString(), this._datepipe),
          CreatedDate: formatDateUtc(item.CreatedDate!.toString(), this._datepipe),
          ClientName: item.ClientName,
          ClientId: item.ClientId,
          Requestee: item.Requestee,
          RequesteeName: item.RequesteeName,
          Status: getStatusName(item.Status!, TopUpStatus)
        }));
        this.dataSource = new MatTableDataSource(tableData);
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {
        this.isLoading = false;
        this.subscription.unsubscribe();
      }
    });
  }

  getMerchantByClientId(clientId: number): Promise<ResultData[]> {
    return new Promise((resolve, reject) => {
      this.observable = this._merchantService.apiMerchantsGetMerchantsByClientIdGet(clientId);
      this.subscription = this.observable.subscribe({
        next: (response: MerchantsListDTO) => {  // Assuming response is of type MerchantsListDTO
          const vendorMap: { [key: number]: any } = {};
          const vendors = response.Data || [];  
          vendors.forEach((data: any) => { 
            const vendorId = data.Vendor.Id;
            const channelId = data.PaymentChannel.Id;
            const channelName = data.PaymentChannel.Name;
            const balance = data.Balance;
  
            if (!vendorMap[vendorId]) {
              vendorMap[vendorId] = {
                Id: vendorId,
                Name: data.Vendor.Name,
                Client: { Id: data.Client.Id, Name: data.Client.Name },
                Channels: []
              };
            }
  
            const vendor = vendorMap[vendorId];
            const existingChannel = vendor.Channels.find((channel: any) => channel.Id === channelId);
  
            if (existingChannel) {
              existingChannel.TotalBalance += balance;
            } else {
              vendor.Channels.push({ Id: channelId, Name: channelName, TotalBalance: balance });
            }
          });
  
          const result: ResultData[] = Object.values(vendorMap);
          resolve(result);
        },
        error: (err: HttpErrorResponse) => {
          this._notification.showNotification("Error:" + err.error, "close", "error");
          reject(err);
        },
        complete: () => {
          this.subscription.unsubscribe();
        }
      });
    });
  }
  


  loadPage(page: number, data?: any): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    // Determine if it's the last page
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);

    // Load data for the selected page here
    const convertedStartDate = this._datepipe.transform(data.StartDate, 'yyyy-MM-dd');
     const convertedEndDate = this._datepipe.transform(data.EndDate, 'yyyy-MM-dd');
     data.StartDate = new Date(convertedStartDate!);
     data.EndDate = new Date(convertedEndDate!);
    this.getBalanceTransfers(data);


  }

  onFirstPage(): void {
    this.loadPage(1, this.BalanceTransferForm.getRawValue());
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, this.BalanceTransferForm.getRawValue());
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1, this.BalanceTransferForm.getRawValue());
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), this.BalanceTransferForm.getRawValue());
  }

  onUpdateManualTopUp(data: any, status: number) {

  }

  onTransferFunds(data: any) {

  }

}


export interface ResultData {
  Vendor: [
    {
      Id: number,
      Name: string,
      TransactionNo?: string,
      Channels: [
        { Id: number, Name: string, TotalBalance?: number }
      ],
      Client: { Id: number, Name: string },

    }
  ]
}