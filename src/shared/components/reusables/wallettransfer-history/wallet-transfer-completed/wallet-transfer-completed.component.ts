import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { TransactionsService } from 'src/shared/dataprovider/api';
import { RemittanceService } from 'src/shared/dataprovider/api/api/remittance.service';
import { BalanceTransferDataDTO, BTparams } from 'src/shared/dataprovider/api/model/balanceTransferDataDTO';
import { BalanceTransferFundsListDTO } from 'src/shared/dataprovider/api/model/balanceTransferFundsListDTO';
import { ALL, BTransferTypes, COMPLETED, REJECTED, RejectedAndCompleted, SelectedTopUpStatus, TableOption, TopUpStatus } from 'src/shared/dataprovider/local/data/common';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';
import { DecimalPipeConverter, formatDateUtc, getStatusName, getWeekBeforeDateRange } from 'src/shared/helpers/helper';
import { SessionManager } from 'src/shared/helpers/session-manager';

@Component({
  selector: 'app-wallet-transfer-completed',
  templateUrl: './wallet-transfer-completed.component.html',
  styleUrls: ['./wallet-transfer-completed.component.scss']
})
export class WalletTransferCompletedComponent {
  @Input() isTransferBalanceRequestVisible: boolean = false;
  @Input() data: boolean = false;
  @Input() isAdmin!: boolean;
  @Input() isLoading: boolean = false;
  @Input() dataSource!: MatTableDataSource<any>;
  @Output() refreshData = new EventEmitter<void>();
  displayedColumns: string[] = ['timestamp', 'transactionId', 'clientname', 'transfertype', 'amountInputted', 'requestBy', 'approveBy', 'remarks', 'status',];
  private downloadObs!: Observable<any>;
  private downloadSubs!: Subscription;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0];
  Date!: FormGroup;
  private observable!: Observable<any>;
  private subscription: Subscription = new Subscription();
  public tableOption = TableOption;
  public defaultDateRange = getWeekBeforeDateRange(7);
  TransferHistory!: FormGroup;
  public clientId: number = parseInt(SessionManager.getFromToken('ClientId'), 10);
  language: string = "";
  public statusType = SelectedTopUpStatus.filter(x => (x.id == ALL || x.id == REJECTED || x.id == COMPLETED));
  constructor(
    private _remittanceService: RemittanceService,
    private _transactionService: TransactionsService,
    private _datepipe: DatePipe,
    private _notification: NotificationService,
    private _decimalpipe: DecimalPipe,
    private _dialog: MatDialog,
    private _fb: FormBuilder,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.TransferHistory = _fb.group({
      StartDate: this.defaultDateRange.startDate,
      EndDate: this.defaultDateRange.endDate,
      ClientId: this.clientId,
      ItemsPerPage: this.itemsPerPage,
      CurrentPage: this.currentPage,
      Statuses: "0"
    });

    this.TransferHistory.get("EndDate")?.valueChanges.subscribe(() => {
      this.loadPage(1, this.TransferHistory.getRawValue());
    });
  }


  ngOnInit(): void {
    if (this.isAdmin) {
      this.TransferHistory.patchValue({ ClientId: 0 });
    }
    this.loadPage(1, this.TransferHistory.getRawValue());
    this.refreshData.subscribe(() => this.loadPage(1, this.TransferHistory.getRawValue()));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.loadPage(1, this.TransferHistory.getRawValue());
    }
  }


  getCompletedTransactions(data: BTparams, keyword?: string): void {
    console.log("FORM", data);
    this.isLoading = true;

    this._transactionService.getBalanceTransferTransactions(
      data.ClientId,
      data.StartDate,
      data.EndDate,
      this.itemsPerPage,
      this.currentPage,
      keyword || undefined,
      data.Statuses,
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




  onPageChange(page: number): void {
    this.loadPage(page, this.TransferHistory.getRawValue());
  }

  loadPage(page: number, data?: BTparams, keyword?: string): void {
    if (data) {
      this.currentPage = page;
      data.ClientId = this.isAdmin ? 0 : this.clientId;

      // Convert date before calling the API
      if (data.StartDate) {
        data.StartDate = new Date(this._datepipe.transform(data.StartDate, 'yyyy-MM-dd')!);
      }
      if (data.EndDate) {
        data.EndDate = new Date(this._datepipe.transform(data.EndDate, 'yyyy-MM-dd')!);
      }

      var statusvalue = this.TransferHistory.get("Statuses")?.value;
      data.Statuses = statusvalue == "0" ? RejectedAndCompleted : statusvalue;
      this.getCompletedTransactions(data, keyword);
    }

  }


  onFirstPage(): void {
    this.loadPage(1, this.TransferHistory.getRawValue());
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, this.TransferHistory.getRawValue());
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1, this.TransferHistory.getRawValue());
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), this.TransferHistory.getRawValue());
  }

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage);
  }

  onSearch(query: string): void {
    this.loadPage(1, this.TransferHistory.getRawValue(), query);
  }

  onStatusType(selectedStatus: { id: number; name: string }) {
    this.TransferHistory.patchValue({Statuses:selectedStatus.id.toString()})
    const data = this.TransferHistory.getRawValue();
    this.loadPage(1, data);

  }


}


