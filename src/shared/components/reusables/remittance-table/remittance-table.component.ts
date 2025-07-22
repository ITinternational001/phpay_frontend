import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { MerchantsService, ClientService, TransactionsService, MerchantDTO } from 'src/shared/dataprovider/api';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { UserUpdateBalanceTransferRequestDTO } from 'src/shared/dataprovider/api/model/userUpdateBalanceTransferRequestDTO';
import { TableOption, Approved, Decline, TopUpStatus, Pending, RemittanceProcessing, RemittanceRelease, RemittancePending, RemittanceAll, RemittanceDecline, SelectedRemittanceStatus } from 'src/shared/dataprovider/local/data/common';
import { getWeekBeforeDateRange, formatDateUtc, getStatusName, DecimalPipeConverter, getClientId, getCurrentUserClientId, convertTimestamp, convertToFormattedDate, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { ConfirmationModalComponent } from '../../modals/confirmation-modal/confirmation-modal.component';
import { NotificationService } from '../../modals/notification/notification.service';
import { TransferModalComponent } from '../../modals/transfer-modal/transfer-modal.component';
import { RemittanceService } from 'src/shared/dataprovider/api/api/remittance.service';
import { RemittanceDTO } from 'src/shared/dataprovider/api/model/remittanceDTO';
import { UpdateCardWithdrawalRequestDTO } from 'src/shared/dataprovider/api/model/updateCardWithdrawalRequestDTO';
import { RemittanceModalComponent } from './remittance-modal/remittance-modal.component';
import { WithdrawalStatusEnum } from 'src/shared/dataprovider/api/model/withdrawalStatusEnum';
import { CopViewDetailsComponent } from './cop-view-details/cop-view-details.component';
import { RemittanceListDTO } from 'src/shared/dataprovider/api/api/remittanceListDTO';
import { ActivatedRoute } from '@angular/router';
import { MerchantsListDTO } from 'src/shared/dataprovider/api/model/merchantsListDTO';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-remittance-table',
  templateUrl: './remittance-table.component.html',
  styleUrls: ['./remittance-table.component.scss']
})
export class RemittanceTableComponent {

  @Input() data: boolean = false;
  @Input() isAdmin: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() remittanceStatus!: WithdrawalStatusEnum;
  @Input() title: string = "";
  dataSource!: MatTableDataSource<any>;
  dataSource1!: MatTableDataSource<any>;
  RemittanceForm!: FormGroup;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private obsApproveTransfer!: Observable<any>;
  private subsApproveTransfer!: Subscription;
  private obsDecline!: Observable<any>;
  private subsDecline!: Subscription;
  private obsProcessing!: Observable<any>;
  private subsProcessing!: Subscription;
  public tableOption = TableOption;
  public defaultDateRange = getWeekBeforeDateRange(7);
  public isReadAndWrite: boolean = false;
  isCompletedChanged: boolean = false;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0];
  displayedColumns: string[] = ['timestamp', 'remittanceid', 'wallet', 'requestedamount', 'transactionFee', 'totalamount', 'MOP', 'methodDescription', 'dateremitted', 'referenceNo', 'requestee', 'approver', 'status', 'action'];
  language: string = "";
  public clientId: number = getCurrentUserClientId();
  public statusType = SelectedRemittanceStatus.filter(x => x.id != 3 && x.id != 4);
  public selectedStatusId: number | null = null;
  actionDisable: boolean = false;
  constructor(private _notification: NotificationService,
    private _fb: FormBuilder,
    private _merchantService: MerchantsService,
    private _remittance: RemittanceService,
    private _clientService: ClientService,
    private _dialog: MatDialog,
    private _datepipe: DatePipe,
    private _decimalpipe: DecimalPipe,
    private route: ActivatedRoute,
    private translateService: TranslateService) {

    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.RemittanceForm = _fb.group({
      StartDate: this.defaultDateRange.startDate,
      EndDate: this.defaultDateRange.endDate,
      ClientId: this.clientId
    });

    this.RemittanceForm.get("EndDate")?.valueChanges.subscribe(() => {
      const formGroup = this.RemittanceForm;
      this.loadPage(1, formGroup.getRawValue());
    });
  }
  ngOnInit(): void {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    if (this.isAdmin) {
      this.RemittanceForm.patchValue({ ClientId: 0 });
    } else {
      // Ensure action column is included for clients
      if (!this.displayedColumns.includes('action')) {
        this.displayedColumns.push('action');
      }
    }
    this.loadPage(1, this.RemittanceForm.getRawValue());
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      // Load data automatically
      this.loadPage(1, this.RemittanceForm.getRawValue());
    }
  }

  onApproved(row: any) {
    let width = '700px';
    try {
      const dialogRef = this._dialog.open(RemittanceModalComponent, { width: width, data: row, hasBackdrop: true, disableClose: true });
      dialogRef.afterClosed().subscribe({
        next: (data) => {
          if (data) {
            if (data.release) {
              this.approvedRemittanceTransfer(data);
            }
          }
        }
      });
    } catch (error) {
      console.error("Error fetching merchant data", error);
    }
  }

  onProcessing(data: any) {
    this.isLoading = true;
    if (this.obsProcessing) {
      this.subsProcessing.unsubscribe();
    }
    this.obsProcessing = this._clientService.apiClientChangeWithdrawalRequestStatusPostForm(
      data.RemittanceId,
      undefined,
      RemittanceProcessing,
      SessionManager.getFromToken("Id"),
      data.ClientId.toString(),
      undefined,
      undefined,
      undefined
    );
    this.subsProcessing = this.obsProcessing.subscribe({
      next: (response) => {
        this.loadPage(1, this.RemittanceForm.getRawValue()); // Reload table after processing
        this._notification.showNotification("Transaction set to processing", "close", 'success');
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onDecline(row: any) {
    const dialogRef = this._dialog.open(ConfirmationModalComponent, { data: { type: 'DeclineRelease', data: row } });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val.continue) {
          this.declineRemittanceTransfer({ ...row, Remarks: val.remarks });
        }
      }
    });
  }

  declineRemittanceTransfer(data: any) {
    this.isCompletedChanged = false;
    this.isLoading = true;
    if (this.obsDecline) {
      this.subsDecline.unsubscribe();
    }
    this.obsDecline = this._clientService.apiClientChangeWithdrawalRequestStatusPostForm(
      data.RemittanceId,
      undefined,
      RemittanceDecline,
      SessionManager.getFromToken("Id"),
      data.ClientId.toString(),
      undefined,
      undefined,
      undefined,
      data.Remarks,
      undefined
    );
    this.subsDecline = this.obsDecline.subscribe({
      next: (response) => {
        this.loadPage(1, this.RemittanceForm.getRawValue());
        this.isCompletedChanged = true;
        this._notification.showNotification("Transaction has been declined", "close", 'success');
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", 'error');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  approvedRemittanceTransfer(data: any) {
    this.isCompletedChanged = false;
    this.isLoading = true;
    if (this.obsApproveTransfer) {
      this.subsApproveTransfer.unsubscribe();
    }
    this.obsApproveTransfer = this._clientService.apiClientChangeWithdrawalRequestStatusPostForm(
      data.row.RemittanceId,
      data.form.ReferenceNumber,
      RemittanceRelease,
      SessionManager.getFromToken("Id"),
      data.row.ClientId,
      data.form.WithdrawalCount,
      data.form.TotalAmount,
      data.form.CardId,
      "Completed",
      data.form.DepositSlips
    );
    this.subsApproveTransfer = this.obsApproveTransfer.subscribe({
      next: (response) => {
        // this.actionDisable = true;
        this.loadPage(1, this.RemittanceForm.getRawValue());
        this.isCompletedChanged = true;
        this._notification.showNotification("Fund was released successfully", "close", 'success');
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", 'error');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }


  getClientRemittanceRequests(clientId: number, keyword?: string): void {
    this.isLoading = true;

    const statusId = this.selectedStatusId !== null ? this.selectedStatusId.toString() : "1,2";
    const formGroup = this.RemittanceForm;

    // Extract and format dates
    const startDate = convertToFormattedDate(
      formGroup.get('StartDate')?.getRawValue(),
      this._datepipe
    ).toDateString();
    const endDate = convertToFormattedDate(
      formGroup.get('EndDate')?.getRawValue(),
      this._datepipe
    ).toDateString();

    this._clientService.apiClientGetWithdrawalsByClientGet(
      clientId,
      this.itemsPerPage,        // Items per page
      this.currentPage,         // Current page
      undefined,                // Other filter options
      startDate,
      endDate,
      statusId,
      keyword
    ).subscribe({
      next: (response: RemittanceListDTO) => {

        if (response && Array.isArray(response.Data)) {
          this.totalItems = response.TotalRecordCount!;
          const tableData = response.Data.map((item: RemittanceDTO) => ({
            TimeStamp: formatDateUtc(item.TimeStamp!.toString(), this._datepipe),
            RemittanceId: item.RemittanceId,
            TotalAmount: item.TotalAmount,
            Wallet: item.Wallet,
            Amount: DecimalPipeConverter(item.TotalAmount!, this._decimalpipe),
            DateRemitted: item.DateRemitted,
            ReferenceNumber: item.ReferenceNumber,
            Requestee: item.Requestee,
            Status: item.Status,
            ClientId: item.ClientId,
            IDType: item.IDType,
            FullNameIdHolder: item.FullNameIdHolder,
            IdNumber: item.IdNumber,
            MethodDescription: item.MethodDescription,
            CardAccountName: item.CardAccountName,
            CardAccountNumber: item.CardAccountNumber,
            CardBankName: item.CardBankName,
            RemittanceMethod: item.RemittanceId,
            LettersURLs: item.LettersURLs,
            IDsURLs: item.IDsURLs,
            RequestedAmount: item.RequestedAmount,
            TransactionFee:
              item.Status === 'Pending' || item.Status === 'Processing'
                ? '-'
                : DecimalPipeConverter(item.TransactionFee!, this._decimalpipe),
            Method: item.MethodDescription,
            OriginalFee: item.TransactionFee,
            Approver: item.ApproverName,
            CardId: item.CardId,
          }));
          this.dataSource = new MatTableDataSource(tableData);
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification(
          'Error:' + error.error,
          'close',
          'error'
        );
      },
      complete: () => {
        this.isLoading = false;
        this.subscription.unsubscribe();
      },
    });
  }


  getMerchantByClientId(clientId: number): Promise<ResultData[]> {
    return new Promise((resolve, reject) => {
      this.observable = this._merchantService.apiMerchantsGetMerchantsByClientIdGet(clientId);
      this.subscription = this.observable.subscribe({
        next: (response: MerchantsListDTO) => {
          const vendorMap: { [key: number]: any } = {};
          const merchants = response.Data || [];
          merchants.forEach((data: MerchantDTO) => {
            const vendorId = data.Vendor?.Id;
            const channelId = data.PaymentChannel?.Id;
            const channelName = data.PaymentChannel?.Name;
            const balance = data.Balance;
            if (vendorId !== undefined) {
              if (!vendorMap[vendorId]) {
                vendorMap[vendorId] = {
                  Id: vendorId,
                  Name: data.Vendor?.Name,
                  Client: { Id: data.Client?.Id, Name: data.Client?.Name },
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
            }
          });
          const result: ResultData[] = Object.values(vendorMap);
          resolve(result);
        },
        error: (error: HttpErrorResponse) => {
          this._notification.showNotification("Error:" + error.error, "close", "error");
        },
        complete: () => {
          this.subscription.unsubscribe();
        }
      });
    });
  }


  loadPage(page: number, data?: any, keyword?: string): void {
    this.currentPage = page;
    // Calculate start and end index (optional if server handles this)
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const convertedStartDate = this._datepipe.transform(data.StartDate, 'yyyy-MM-dd');
    const convertedEndDate = this._datepipe.transform(data.EndDate, 'yyyy-MM-dd');
    data.StartDate = new Date(convertedStartDate!);
    data.EndDate = new Date(convertedEndDate!);

    if (this.selectedStatusId !== null) {
      data.statusId = this.selectedStatusId;
    }
    // Fetch data for the selected page
    this.getClientRemittanceRequests(data.ClientId, keyword);
  }

  onFirstPage(): void {
    this.loadPage(1, this.RemittanceForm.getRawValue(), this.RemittanceForm.get('Keyword')?.value);
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, this.RemittanceForm.getRawValue(), this.RemittanceForm.get('Keyword')?.value);
    }
  }

  onNextPage(): void {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.loadPage(this.currentPage + 1, this.RemittanceForm.getRawValue(), this.RemittanceForm.get('Keyword')?.value);
    }
  }

  onLastPage(): void {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.loadPage(totalPages, this.RemittanceForm.getRawValue(), this.RemittanceForm.get('Keyword')?.value);
  }

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage, this.RemittanceForm.getRawValue());
  }



  onUpdateManualTopUp(data: any, status: number) {

  }

  onTransferFunds(data: any) {

  }
  onSearch(query: string): void {
    // Handle the search query, e.g., make an API call or filter data
    this.loadPage(1, this.RemittanceForm.getRawValue(), query);
  }



  onCashPickup(row: any) {
    const width = '500px';
    try {
      const dialogData = {
        ClientId: row.ClientId,
        RemittanceId: row.RemittanceId,
        IDType: row.IDType,
        IdNumber: row.IdNumber,
        FullNameIdHolder: row.FullNameIdHolder,
        MethodDescription: row.MethodDescription,
        LettersURLs: row.LettersURLs,
        IDsURLs: row.IDsURLs,

      };

      const dialogRef = this._dialog.open(CopViewDetailsComponent, {
        width: width,
        data: dialogData
      });

      dialogRef.afterClosed().subscribe({
        next: (data) => {
          if (data && data.release) {
          }
        }
      });
    } catch (error) {
      console.error("Error opening dialog for cash pickup", error);
    }
  }

  onStatusType(selectedStatus: { id: number; name: string }) {
    this.selectedStatusId = selectedStatus.id;
    this.loadPage(1, this.RemittanceForm.getRawValue());

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