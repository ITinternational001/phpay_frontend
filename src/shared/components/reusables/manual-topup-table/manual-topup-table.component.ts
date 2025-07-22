import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { MerchantsService, ClientService, TransactionsService } from 'src/shared/dataprovider/api';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { Approved, CashIn, CashOut, Decline, SelectedTopUpStatus, TableOption, TopUpStatus, WalletToCOF } from 'src/shared/dataprovider/local/data/common';
import { getWeekBeforeDateRange, formatDateUtc, getStatusName, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { NotificationService } from '../../modals/notification/notification.service';
import { UserUpdateTopUpRequestDTO } from 'src/shared/dataprovider/api/model/userUpdateTopUpRequestDTO';
import { TopupModalComponent } from '../../modals/topup-modal/topup-modal.component';
import { UserUpdateBalanceTransferRequestDTO } from 'src/shared/dataprovider/api/model/userUpdateBalanceTransferRequestDTO';
import { ConfirmationModalComponent } from '../../modals/confirmation-modal/confirmation-modal.component';
import { TransferModalComponent } from '../../modals/transfer-modal/transfer-modal.component';
import { TopUpReportRequest } from 'src/shared/dataprovider/api/model/topUpReportRequest';
import { ActivatedRoute } from '@angular/router';
import { MerchantsListDTO } from 'src/shared/dataprovider/api/model/merchantsListDTO';
import { TopUpSummaryReport } from 'src/shared/dataprovider/api/model/topUpSummaryReport';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';
import { UpdateBalanceTransferRequestDTO } from 'src/shared/dataprovider/api/model/updateBalanceTransferRequestDTO';

@Component({
  selector: 'app-manual-topup-table',
  templateUrl: './manual-topup-table.component.html',
  styleUrls: ['./manual-topup-table.component.scss']
})
export class ManualTopupTableComponent implements OnInit, OnChanges {
  @Input() transferFormCondition: boolean = true;  // transferfund modal condition
  @Input() data: boolean = false;
  @Input() isTopUpChanged: boolean = false;
  @Input() isAdmin!: boolean;
  @Input() isLoading: boolean = false;
  dataSource!: MatTableDataSource<any>;
  TopUpForm!: FormGroup;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private obs!: Observable<any>;
  private subs!: Subscription;
  public tableOption = TableOption;
  public statusType = SelectedTopUpStatus;
  public selectedStatusId: number | null = null;
  receiptUrls: string[] = [];
  selectedTransaction: string | null = null;
  public defaultDateRange = getWeekBeforeDateRange(7);
  currentPage: number = 1; 
  totalItems: number = 0; 
  itemsPerPage = itemsPerPageOptions[0]; 
  displayedColumns: string[] = ['id', 'clientName', 'transactionNo', 'receipt', 'referenceNo', 'amount','vendor', 'createdDate', 'completedDate', 'requestee', 'status', 'type', 'remarks', 'action'];
  public clientId: number = parseInt(SessionManager.getFromToken('ClientId'));
  public isReadAndWrite : boolean = false;
  language: string = "";
  constructor(private _notification: NotificationService,
    private _fb: FormBuilder,
    private _merchantService: MerchantsService,
    private _clientService: ClientService,
    private _transactionService: TransactionsService,
    private _reportsService: ReportsService,
    private _dialog: MatDialog,
    private _datepipe: DatePipe,
    private route: ActivatedRoute,
    private translateService: TranslateService) {

      this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);

    this.TopUpForm = _fb.group({
      StartDate: this.defaultDateRange.startDate,
      EndDate: this.defaultDateRange.endDate,
      ClientId: this.clientId
    });


    this.TopUpForm.get("EndDate")?.valueChanges.subscribe(() => {
      const formGroup = this.TopUpForm;
      this.loadPage(1, formGroup.getRawValue());
    });
  }
  ngOnInit(): void {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    if (this.isAdmin) {
      this.TopUpForm.patchValue({ ClientId: 0 });
    } else {
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'action' && column !== 'vendor');
    }
    this.loadPage(1, this.TopUpForm.getRawValue())
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      // Load data automatically
      this.loadPage(1, this.TopUpForm.getRawValue());
    }
  }

  onUpdateManualTopUp(row: any, status: number | undefined): void {
    const type = status === Approved ? "Proceed" : "Decline";
    const dialogRef = this._dialog.open(TopupModalComponent, {
      data: { type: type }
    });
  
    dialogRef.afterClosed().subscribe({
      next: (val: any) => {
        if (val) {
          const params = val.continue
            ? {
                ClientName: row.ClientName,
                TransactionNumber: row.TransactionNo,
                VendorId: val.VendorId,
                PaymentChannelId: val.PaymentChannelId,
                Status: status
              }
            : {
                TransactionNumber: row.TransactionNo,
                Status: status,
                Remarks: val.Remarks // Pass Remarks for declined transactions
              };
  
          this.updateManualTopUp(params);
        }
      },
      error: (error: any) => {
        this._notification.showNotification(
          `Error processing dialog result: ${error.message}`,
          "close",
          "error"
        );
      }
    });
  }
  
  updateManualTopUp(data: any): void {
    if (this.obs) {
      this.subs.unsubscribe();
    }
  
    this.obs = this._transactionService.apiTransactionsCashinsManualTopUpPut(data);
  
    this.subs = this.obs.subscribe({
      next: (response: any) => {
        const message =
          response.Status === 4
            ? "Top up has been approved"
            : "Top up has been declined";
        this._notification.showNotification(message, "close", "success");
  
        // Reload the page and reset the form data
        this.loadPage(1, this.TopUpForm.getRawValue());
      },
      error: (error: HttpErrorResponse) => {
        const errorMessage =
          error?.error || "An unknown error occurred during the update.";
        this._notification.showNotification(
          `Error approving top-up: ${errorMessage}`,
          "close",
          "error"
        );
      }
    });
  }

  getManualTopUps(data: any, keyword?: string) {
    this.isLoading = true;
    if (this.observable) {
      this.subscription.unsubscribe();
    }
    const statusId = this.selectedStatusId !== null ? this.selectedStatusId : undefined;
    this.observable = this._reportsService.apiReportsGetTopUpSummaryReportPost(data, this.itemsPerPage, this.currentPage, statusId, keyword);
    this.subscription = this.observable.subscribe({
      next: (response) => {
        this.totalItems = response.TotalRecordCount!;
        const tableData = response.TopUpData.map((item: any) => ({
          Id: item.Id,
          Amount: item.Amount,
          TransactionNo: item.TransactionNumber,
          ReferenceNo: item.ReferenceNumber ? item.ReferenceNumber : "N/A",
          CompletedDate: formatDateUtc(item.CompletedDate!.toString(), this._datepipe),
          CreatedDate: formatDateUtc(item.CreatedDate!.toString(), this._datepipe),
          TypeDescription: item.TransferTypeDescription,
          ClientName: item.ClientName,
          ClientId: item.ClientId,
          Requestee: item.Requestee,
          RequesteeName: item.RequesteeName,
          Status: getStatusName(item.Status!, TopUpStatus),
          Remarks: item.Remarks,
          Receipt: item.Receipt,
          Type: item.TransferType,
          Vendor: item.DestinationMerchants && item.DestinationMerchants.length > 0 ? item.DestinationMerchants[0].VendorName : "n/a"
        }));
        this.dataSource = new MatTableDataSource(tableData);
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", "error")
      },
      complete: () => {
        this.isLoading = false;
        this.subscription.unsubscribe();
        this.data = false;
      }
    });
  }

  onDownloadExcel() {
    // Check if the user has read and write permissions
    if (!this.isReadAndWrite) {
      this._notification.showNotification("You don't have permission to download the report", 'close', 'error');
      return; // Exit if no permission
    }
  
    this.isLoading = true;
  
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  
    // Get form data
    let formGroup = this.TopUpForm.getRawValue();
    let _startDate = formGroup.StartDate;
    let _endDate = formGroup.EndDate;
  
    // Format the dates
    const convertedStartDate = this._datepipe.transform(formGroup.StartDate, 'yyyy-MM-dd');
    const convertedEndDate = this._datepipe.transform(formGroup.EndDate, 'yyyy-MM-dd');
  
    formGroup.StartDate = new Date(convertedStartDate!);
    formGroup.EndDate = new Date(convertedEndDate!);
  
    // Prepare the request body for the API
    const requestBody: TopUpReportRequest = {
      StartDate: formGroup.StartDate,
      EndDate: formGroup.EndDate,
    };
  
    this.observable = this._reportsService.apiReportsGetTopUpSummaryReportPost(requestBody, undefined, undefined, undefined, undefined, true);
  
    this.subscription = this.observable.subscribe({
      next: (response) => {
        if (response) {
          // Create a new Blob object using the response data
          const blob = new Blob([response], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `DPay_Manual_TopUp_Transaction_Report_${this.formatDateForFileName(_startDate)}_${this.formatDateForFileName(_endDate)}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification('Error:' + error.error, 'close', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
  
  private formatDateForFileName(date: Date): string {
    return this._datepipe.transform(date, 'yyyy-MM-dd')!;
  }

  //BALANCE TRASNFER
  async onApproveTransfer(row: any) {
    console.log(row);
    let width = '1000px';
    let source: any[] = [];
    let destination: any[] = [];
    try {
      source = await this.getMerchantByClientId(row.ClientId, CashIn);
      destination = await this.getMerchantByClientId(row.ClientId, CashOut);
  
      // Set the flag based on your logic (e.g., after a successful transfer)
      const isTopUpChanged = true; // Example flag; replace with your actual condition if needed
  
      const dialogRef = this._dialog.open(TransferModalComponent, {
        width: width,
        data: {
          source,
          destination,
          row,
          transferFormCondition: this.transferFormCondition, // Transfer modal condition
          isTopUpChanged, // Pass the flag to the modal
        },
      });
  
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val) {
            this.loadPage(1, this.TopUpForm.getRawValue());
            this._notification.showNotification("Transfer fund successfully", "close", 'success');
          }
        },
      });
    } catch (error) {
      console.error("Error fetching merchant data", error);
    }
  }
  

  onDeclineTransfer(row: any) {
    const dialogRef = this._dialog.open(ConfirmationModalComponent, { 
      data: { type: 'DeclineTransfer', data: row } // Pass the row data to the modal
    });
    
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val?.continue && val.remarks) {
          // Proceed only if the user confirmed and provided remarks
          this.declineTransfer(row, val.remarks);
        }
      }
    });
  }
  
  declineTransfer(data: any, remarks: string) {
    if (this.observable) {
      this.subscription.unsubscribe();
    }
  
    const params: UpdateBalanceTransferRequestDTO = {
      TransactionNumber: data.TransactionNo,
      Status: Decline, 
      Remarks: remarks, 
      TransferType: WalletToCOF
    };
  
    this.observable = this._transactionService.updateBalanceTransfer(params);
    this.subscription = this.observable.subscribe({
      next: (response) => {
        this.loadPage(1, this.TopUpForm.getRawValue());
        this._notification.showNotification("Transfer fund declined", "close", 'success');
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error on decline process: " + error.error, "close", 'error');
      }
    });
  }
  

  getMerchantByClientId(clientId: number, type?:number): Promise<ResultData[]> {
    return new Promise((resolve, reject) => {
      this.observable = this._merchantService.apiMerchantsGetMerchantsByClientIdGet(clientId);
      this.subscription = this.observable.subscribe({
        next: (response : MerchantsListDTO) => {
          const vendorMap: { [key: number]: any } = {};
          if(response.Data != null){
            response.Data.forEach((data: any) => {
              const vendorId = data.Vendor.Id;
              const channelId = data.PaymentChannel.Id;
              const channelName = data.PaymentChannel.Name;
              const balance = type == CashIn ? data.Balance : data.TopUpBalance;

              //Source "Balance" CI remove instapay
              //Destination "TopUpBalance" CO instapay only
  
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
          }
          const result: ResultData[] = Object.values(vendorMap);
          resolve(result);
        },
        error: (error: HttpErrorResponse) => {
          this._notification.showNotification("Error: " + error.error, "close", "error");
        },
        complete: () => {
          this.subscription.unsubscribe();
        }
      });
    });
  }
  //END BALANCE TRANSFER

  loadPage(page: number, data?: any, keyword?: string): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);
  
    // Convert start and end dates
    const convertedStartDate = this._datepipe.transform(data?.StartDate, 'yyyy-MM-dd');
    const convertedEndDate = this._datepipe.transform(data?.EndDate, 'yyyy-MM-dd');
  
    if (data) {
      data.StartDate = convertedStartDate ? new Date(convertedStartDate) : null;
      data.EndDate = convertedEndDate ? new Date(convertedEndDate) : null;
  
      // Pass selectedStatusId
      if (this.selectedStatusId !== null) {
        data.statusId = this.selectedStatusId;
      }
    }
  
    // Load data for the selected page
    this.getManualTopUps(data, keyword);
  }


  onFirstPage(): void {
    this.loadPage(1, this.TopUpForm.getRawValue());
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, this.TopUpForm.getRawValue());
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1, this.TopUpForm.getRawValue());
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), this.TopUpForm.getRawValue());
  }

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage, this.TopUpForm.getRawValue());
  }

  onSearch(query: string): void {
    // Handle the search query, e.g., make an API call or filter data
    this.loadPage(1, this.TopUpForm.getRawValue(), query);
  }

  getReceipts(transactionNumber: string) {
    if (!transactionNumber) {
      console.error("Transaction number is required.");
      return;
    }
  
    console.log("Fetching receipts for:", transactionNumber);
  
    // Unsubscribe from previous subscription
    this.subscription?.unsubscribe();
  
    this.subscription = this._transactionService
      .apiTransactionsCashinsManualTopUpDepositSlipGet(transactionNumber)
      .subscribe({
        next: (response: string[]) => {
          console.log("API Response:", response);
  
          if (response && response.length > 0) {
            this.receiptUrls = response;
          } else {
            console.warn("No receipts found for transaction:", transactionNumber);
            this.receiptUrls = [];
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error("API Error:", error);
          this._notification.showNotification(
            "Error: " + (error.error?.message || "Failed to fetch receipts"),
            "close",
            "error"
          );
        },
        complete: () => console.log("Receipt fetch completed."),
      });
  }
  
  
  openReceipt(url: string) {
    window.open(url, '_blank');
  }

  onStatusType(selectedStatus: { id: number; name: string }) {
    this.selectedStatusId = selectedStatus.id;

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
