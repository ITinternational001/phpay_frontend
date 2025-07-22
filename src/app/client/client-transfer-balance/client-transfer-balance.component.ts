import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { WallettransferHistoryComponent } from 'src/shared/components/reusables/wallettransfer-history/wallettransfer-history.component';
import { ClientService, MerchantsService, TransactionsService, VendorsService } from 'src/shared/dataprovider/api';
import { RemittanceService } from 'src/shared/dataprovider/api/api/remittance.service';
import { BalanceTransferDataDTO, BTparams } from 'src/shared/dataprovider/api/model/balanceTransferDataDTO';
import { BalanceTransferFundsListDTO } from 'src/shared/dataprovider/api/model/balanceTransferFundsListDTO';
import { ClientBalanceResultDTO } from 'src/shared/dataprovider/api/model/clientBalanceResultDTO';
import { WithdrawalFeeDTO } from 'src/shared/dataprovider/api/model/withdrawalFeeDTO';
import { allowedChannel, BTransferTypes, ConfigFeeMethod, MerchantCardData, TopUpStatus } from 'src/shared/dataprovider/local/data/common';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';
import { DecimalPipeConverter, formatDateUtc, getCurrentUserClientId, getStatusName, getWeekBeforeDateRange } from 'src/shared/helpers/helper';
import { SessionManager } from 'src/shared/helpers/session-manager';

@Component({
  selector: 'app-client-transfer-balance',
  templateUrl: './client-transfer-balance.component.html',
  styleUrls: ['./client-transfer-balance.component.scss']
})
export class ClientTransferBalanceComponent implements OnInit {
  @Input() isLoading: boolean = false;
  @Output() refreshData = new EventEmitter<void>(); // Add this line
  @Input() dataSource!: MatTableDataSource<any>;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private clientObservable!: Observable<any>;
  private clientSubscription!: Subscription;
  public MerchantCard = MerchantCardData.merchantCard;
  displayedColumns: string[] = ['timestamp', 'transactionId', 'channelname', 'amountInputted', 'requestBy', 'approveBy', 'remarks', 'status'];
  requestForm!: FormGroup;
  public listOfWallet: { Id: number, Name: string, VendorId: number, Balance: number, TotalCashIn: number, TotalCashOut: number }[] = [];
  public listOfDestination: { Id: number, Name: string }[] = [];
  public transferMethod = ConfigFeeMethod;
  public merchantBalance: number = 0;
  public merchantFee: number = 0;
  public topData: any;
  public vendorId: number = 0;
  public method: number = 0;
  clientId: number;
  public isRemittanceChanged: boolean = false;
  transferHistoryData: any;
  public clientTransfer!: FormGroup;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0];
  public defaultDateRange = getWeekBeforeDateRange(7);
  private downloadObs!: Observable<any>;
  private downloadSubs!: Subscription;
  language: string = "";
  constructor(
    private dialog: MatDialog,
    private _remittanceService: RemittanceService,
    private _transactionService: TransactionsService,
    private _datepipe: DatePipe,
    private clientService: ClientService,
    private _notification: NotificationService,
    private _fb: FormBuilder,
    private _decimalpipe: DecimalPipe,
    private translateService: TranslateService) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.clientId = getCurrentUserClientId();

    this.clientTransfer = _fb.group({
      StartDate: this.defaultDateRange.startDate,
      EndDate: this.defaultDateRange.endDate,
      ClientId: this.clientId
    });

    this.clientTransfer.get("EndDate")?.valueChanges.subscribe(() => {
      this.loadPage(1, this.clientTransfer.getRawValue());

    });
  }


  initializeForm(): void {
    this.requestForm = this._fb.group({
      ClientId: [getCurrentUserClientId()],
      IdCardDestination: [0],
      RequesterUserId: [parseInt(SessionManager.getFromToken('Id'))],
      RequesterName: [SessionManager.getFromToken('Username')],
      Method: [""],
      WithdrawalFee: [""],
      Amount: [""],
      NetAmount: [""],
    });
  }

  ngOnInit() {
    this.initializeForm();
    this.loadPage(1, this.clientTransfer.getRawValue());
    this.refreshData.subscribe(() => this.loadPage(1, this.clientTransfer.getRawValue()));
  }



  getIconForChannel(channelName: string): string {
    switch (channelName) {
      case 'Gcash':
        return 'assets/icons/Gcash-New.png';
      case 'Maya':
        return 'assets/icons/Maya-New.png';
      case 'QRPH':
        return 'assets/icons/QRPH-New.png';
      default:
        return '';
    }
  }
  openTransferHistory(): void {
    const dialogRef = this.dialog.open(WallettransferHistoryComponent, {
      width: '80%', // Adjust the width as needed
      height: '80%', // Adjust the height as needed
      data: {

      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Handle any result from the dialog if necessary
      console.log('Dialog closed with result:', result);
    });
  }

  getCompletedTransactions(data?: BTparams, keyword?: string): void {
    this.isLoading = true;

    this._transactionService.getBalanceTransferTransactions(
      data?.ClientId,
      data?.StartDate,
      data?.EndDate,
      this.itemsPerPage,
      this.currentPage,
      keyword || undefined,
      data?.Statuses,
      BTransferTypes
    ).subscribe({
      next: (response: BalanceTransferFundsListDTO) => {
        if (response && Array.isArray(response.Data)) {
          this.totalItems = response.TotalRecordCount ?? 0;

          const tableData = response.Data.map((item: BalanceTransferDataDTO) => ({
            Id: item.Id,
            ClientId: item.ClientId,
            ClientName: item.ClientName,
            SourceChannelId: item.SourceChannelId,
            SourceChannelName: item.SourceChannelName,
            VendorSourceName: item.SourceMerchants?.map(x => { return x.VendorName }),
            DestinationChannelId: item.DestinationChannelId,
            DestinationChannelName: item.DestinationChannelName,
            VendorDestinationName: item.DestinationMerchants?.map(x => { return x.VendorName }),
            TransactionNumber: item.TransactionNumber,
            Requestee: item.Requestee,
            RequesteeName: item.RequesteeName,
            Status: item.Status,
            StatusDescription: item.StatusDescription,
            Amount: item.Amount,
            CreatedDate: item.CreatedDate ? formatDateUtc(item.CreatedDate.toString(), this._datepipe) : '',
            CompletedDate: item.CompletedDate ? formatDateUtc(item.CompletedDate.toString(), this._datepipe) : '',
            ApproverId: item.ApproverId,
            ApproverName: item.ApproverName,
            Remarks: item.Remarks,
            TransferType: item.TransferType,
            TransferTypeDescription: item.TransferTypeDescription
          }));

          this.dataSource = new MatTableDataSource(tableData);
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error: " + error.error, "close", "error");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  loadPage(page: number, data?: BTparams, keyword?: string): void {
    this.currentPage = page;
    if(data){
      data.ClientId = this.clientId;
      const convertedStartDate = new Date(this._datepipe.transform(data?.StartDate, 'yyyy-MM-dd')!);
      const convertedEndDate = new Date(this._datepipe.transform(data?.EndDate, 'yyyy-MM-dd')!)
      data.StartDate = convertedStartDate;
      data.EndDate = convertedEndDate;
      this.getCompletedTransactions(data, keyword);
    } 
  }

  onFirstPage(): void {
    this.loadPage(1, this.clientTransfer.getRawValue());
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, this.clientTransfer.getRawValue());
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1, this.clientTransfer.getRawValue());
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), this.clientTransfer.getRawValue());
  }

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage, this.clientTransfer.getRawValue());
  }

  onSearch(query: string): void {
    // Handle the search query, e.g., make an API call or filter data
    this.loadPage(1, this.clientTransfer.getRawValue(), query);
  }

  onTransactionSubmitted(): void {
    this.loadPage(1, this.clientTransfer.getRawValue());
  }



}