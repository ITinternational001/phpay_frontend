import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { ConfirmationModalComponent } from 'src/shared/components/modals/confirmation-modal/confirmation-modal.component';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { MerchantsService, ClientService, MerchantDTO } from 'src/shared/dataprovider/api';
import { RemittanceService } from 'src/shared/dataprovider/api/api/remittance.service';
import { RemittanceDTO } from 'src/shared/dataprovider/api/model/remittanceDTO';
import { WithdrawalStatusEnum } from 'src/shared/dataprovider/api/model/withdrawalStatusEnum';
import { RemittanceAll, RemittanceDecline, RemittanceProcessing, RemittanceRelease, SelectedRemittanceStatus, TableOption } from 'src/shared/dataprovider/local/data/common';
import { getWeekBeforeDateRange, getCurrentUserClientId, convertToFormattedDate, formatDateUtc, DecimalPipeConverter, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { RemittanceModalComponent } from '../remittance-modal/remittance-modal.component';
import { CopViewDetailsComponent } from '../cop-view-details/cop-view-details.component';
import { RemittanceListDTO } from 'src/shared/dataprovider/api/api/remittanceListDTO';
import { ActivatedRoute } from '@angular/router';
import { MerchantsListDTO } from 'src/shared/dataprovider/api/model/merchantsListDTO';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-remittance-completed',
  templateUrl: './remittance-completed.component.html',
  styleUrls: ['./remittance-completed.component.scss']
})
export class RemittanceCompletedComponent {
  @Input() data: boolean = false;
  @Input() isAdmin!: boolean;
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
  receiptUrls: string[] = [];
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0];
  displayedColumns: string[] = ['status',
    'receipt',
    'timestamp',
    'remittanceid',
    'wallet',
    'requestedamount',
    'transactionFee',
    'totalamount',
    'MOP',
    'methodDescription',
    'dateremitted',
    'referenceNo',
    'requestee',
    'approver',
    'source',
    'authPersonnel',
    'remarks',
    'action'];
  public clientId: number = getCurrentUserClientId();
  language: string = "";
  public statusType = SelectedRemittanceStatus.filter(x => x.id != 0 && x.id != 1 && x.id != 2);
  public selectedStatusId: number | null = null;
  constructor(private _notification: NotificationService,
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private _merchantService: MerchantsService,
    private _remittance: RemittanceService,
    private _clientService: ClientService,
    private _dialog: MatDialog,
    private _datepipe: DatePipe,
    private _decimalpipe: DecimalPipe,
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
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'action');
    } else {
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'action');
    }
    this.loadPage(1, this.RemittanceForm.getRawValue())
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      // Load data automatically
      this.loadPage(1, this.RemittanceForm.getRawValue());
    }
  }

  onApproved(row: any) {
    let width = '600px';
    try {
      const dialogRef = this._dialog.open(RemittanceModalComponent, { width: width, data: row });
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
        this.loadPage(1, this.RemittanceForm.getRawValue());
        this._notification.showNotification("Transaction set to processing", "close", 'success');
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error" + error.error, "close", "error");
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
          this.declineRemittanceTransfer(row);
        }
      }
    });

  }

  declineRemittanceTransfer(data: any) {
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
      undefined
    );
    this.subsDecline = this.obsDecline.subscribe({
      next: (response) => {
        this.loadPage(1, this.RemittanceForm.getRawValue());
        this._notification.showNotification("Transaction has been declined", "close", 'success');
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  approvedRemittanceTransfer(data: any) {
    this.isLoading = true;
    if (this.obsApproveTransfer) {
      this.subsApproveTransfer.unsubscribe();
    }
    this.obsApproveTransfer = this._clientService.apiClientChangeWithdrawalRequestStatusPostForm(
      data.row.RemittanceId,
      data.row.ReferenceNumber,
      RemittanceRelease,
      SessionManager.getFromToken("Id"),
      data.row.ClientId,
      data.form.WithdrawalCount,
      data.form.TotalAmount,
      data.form.DepositSlips
    );
    this.subsApproveTransfer = this.obsApproveTransfer.subscribe({
      next: (response) => {
        this.loadPage(1, this.RemittanceForm.getRawValue());
        this._notification.showNotification("Transfer fund successfully", "close", 'success');
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }


  getReceipts(transactionNumber: string) {
    let result = "";
    if (this.observable) {
      this.subscription.unsubscribe();
    }

    this.observable = this._clientService.apiClientGetWithdrawalsReceiptsURLsGet(transactionNumber);
    this.subscription = this.observable.subscribe({
      next: (response: string[]) => {
        this.receiptUrls = response;
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => { }
    });
  }

  openReceipt(url: string) {
    window.open(url, '_blank');
  }

  getClientRemittanceRequests(clientId: number, keyword?: string) {
    this.isLoading = true;
    const statusId = this.selectedStatusId !== null ? this.selectedStatusId.toString() : "3,4";
    let formGroup = this.RemittanceForm;
    let startDate = convertToFormattedDate(formGroup.get('StartDate')?.getRawValue(), this._datepipe).toDateString();
    let endDate = convertToFormattedDate(formGroup.get('EndDate')?.getRawValue(), this._datepipe).toDateString();
    this._clientService.apiClientGetWithdrawalsByClientGet(
      clientId,
      this.itemsPerPage,
      this.currentPage,
      undefined,
      startDate,
      endDate,
      statusId,
      keyword
    ).subscribe({
      next: (response: RemittanceListDTO) => {
        this.totalItems = response.TotalRecordCount || 0;
        if (response && Array.isArray(response.Data)) {
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
            CardAccountName: item.CardAccountName,
            CardAccountNumber: item.CardAccountNumber,
            CardBankName: item.CardBankName,
            RemittanceMethod: item.RemittanceId,
            RequestedAmount: item.RequestedAmount,
            TransactionFee: item.TransactionFee,
            MethodDescription: item.MethodDescription,
            Approver: item.ApproverName,
            FullNameIdHolder: item.FullNameIdHolder,
            MotherCardBankName: item.MotherCardBankName,
            MotherCardAccountName: item.MotherCardAccountName,
            MotherCardAccountNumber: item.MotherCardAccountNumber,
            MotherCardNickname: item.MotherCardNickname,
            Remarks: item.Remarks
          }));
          this.dataSource = new MatTableDataSource(tableData);
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {
        this.isLoading = false;
      }
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
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;

    // Determine if it's the last page
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);

    // Transform the date values for consistency
    const convertedStartDate = this._datepipe.transform(data.StartDate, 'yyyy-MM-dd');
    const convertedEndDate = this._datepipe.transform(data.EndDate, 'yyyy-MM-dd');

    // Ensure date objects are correctly set for API requests
    data.StartDate = new Date(convertedStartDate!);
    data.EndDate = new Date(convertedEndDate!);

    if (this.selectedStatusId !== null) {
      data.statusId = this.selectedStatusId;
    }

    // Call the method to fetch remittance requests with the page number, dates, and keyword
    this.getClientRemittanceRequests(data.ClientId, keyword);
  }

  onFirstPage(): void {
    this.loadPage(1, this.RemittanceForm.getRawValue());
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, this.RemittanceForm.getRawValue());
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1, this.RemittanceForm.getRawValue());
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), this.RemittanceForm.getRawValue());
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
  wrapReferenceNumber(referenceNumber: string): string[] {
    if (!referenceNumber) return [];
    // Split the string into chunks of 15 characters
    return referenceNumber.match(/.{1,25}/g) || [];
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

