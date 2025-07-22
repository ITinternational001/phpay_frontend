import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { RemittanceService } from 'src/shared/dataprovider/api/api/remittance.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe, DatePipe } from '@angular/common';
import { NotificationService } from '../../modals/notification/notification.service';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { TableOption, TopUpStatus, Approved, Decline, BTransferTypes, RejectedAndCompleted, PendingAndProcessing } from 'src/shared/dataprovider/local/data/common';
import { getWeekBeforeDateRange, formatDateUtc, getStatusName, DecimalPipeConverter } from 'src/shared/helpers/helper';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TransferModalComponent } from '../../modals/transfer-modal/transfer-modal.component';
import { ConfirmationModalComponent } from '../../modals/confirmation-modal/confirmation-modal.component';
import { ClientService, MerchantsService, TransactionsService } from 'src/shared/dataprovider/api';
import { UserUpdateBalanceTransferRequestDTO } from 'src/shared/dataprovider/api/model/userUpdateBalanceTransferRequestDTO';
import { TransferBalanceModalComponent } from '../../modals/transfer-balance-modal/transfer-balance-modal.component';
import { UserUpdateTransferFundsRequestDTO } from 'src/shared/dataprovider/api/model/userUpdateTransferFundsRequestDTO';
import { TopUpStatusEnum } from 'src/shared/dataprovider/api/model/topUpStatusEnum';
import { TranslateService } from '@ngx-translate/core';
import { BalanceTransferFundsListDTO } from 'src/shared/dataprovider/api/model/balanceTransferFundsListDTO';
import { BalanceTransferDataDTO, BTparams } from 'src/shared/dataprovider/api/model/balanceTransferDataDTO';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';
import { UpdateBalanceTransferRequestDTO } from 'src/shared/dataprovider/api/model/updateBalanceTransferRequestDTO';



@Component({
  selector: 'app-wallettransfer-history',
  templateUrl: './wallettransfer-history.component.html',
  styleUrls: ['./wallettransfer-history.component.scss']
})
export class WallettransferHistoryComponent implements OnInit {
  showDialogType2: boolean = true;
  @Input() isTransferBalanceRequestVisible: boolean = false;
  @Input() data: boolean = false;
  @Input() isAdmin!: boolean;
  @Input() isLoading: boolean = false;
  @Input() dataSource!: MatTableDataSource<any>;
  @Output() refreshData = new EventEmitter<void>(); // Add this line
  public walletBalanceCompleted: boolean = false;
  transferFormCondition: boolean = true;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0];

  displayedColumnsPending: string[] = ['timestamp', 'transactionId', 'clientname', 'transfertype', 'amountInputted', 'requestBy', 'status', 'action'];

  Date!: FormGroup;
  private observable!: Observable<any>;
  private subscription: Subscription = new Subscription();
  public tableOption = TableOption;
  public defaultDateRange = getWeekBeforeDateRange(7);
  TransferHistory!: FormGroup;
  BalanceTransferForm!: FormGroup;
  @Input() receivedData: any[] = [];
  public clientId: number = parseInt(SessionManager.getFromToken('ClientId'), 10);
  language: string = "";

  constructor(
    private _remittanceService: RemittanceService,
    private _fb: FormBuilder,
    private _dialog: MatDialog,
    private _transactionService: TransactionsService,
    private _merchantService: MerchantsService,
    private _datepipe: DatePipe,
    private _notification: NotificationService,
    private _clientService: ClientService,
    private _decimalpipe: DecimalPipe,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);

    this.TransferHistory = _fb.group({
      StartDate: this.defaultDateRange.startDate,
      EndDate: this.defaultDateRange.endDate,
      ClientId: this.clientId
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

  refreshTable(): void {
    this.refreshData.emit();
  }

  getPendingTransactions(data?: BTparams, keyword?: string): void {
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

  onPageChange(page: number): void {
    this.loadPage(page, this.TransferHistory.getRawValue());
  }

  loadPage(page: number, data?: BTparams, keyword?: string): void {
    this.currentPage = page;
    if (data) {
      data.ClientId = this.isAdmin ? 0 : this.clientId;
      const convertedStartDate =  new Date(this._datepipe.transform(data.StartDate, 'yyyy-MM-dd')!);
      const convertedEndDate =  new Date(this._datepipe.transform(data.EndDate, 'yyyy-MM-dd')!);
      data.StartDate = convertedStartDate!;
      data.EndDate = convertedEndDate!;

      data.Statuses = PendingAndProcessing;
      this.getPendingTransactions(data, keyword || '');
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
    // Handle the search query, e.g., make an API call or filter data
    this.loadPage(1, this.TransferHistory.getRawValue(), query);
  }

  // Balance Transfer Approval


  onApproveTransfer(row: any) {
    const width = '600px';
    try {
      const dialogRef = this._dialog.open(TransferBalanceModalComponent, {
        width: width,
        data: {
          data: { type: 'clientTransferBalance' },
          transactionNumber: row.TransactionNumber,
          clientId: row.ClientId,
          clientName: row.ClientName,
          channelName: row.ChannelName,
          Amount: row.Amount,
          status: row.Status,
          showMerchant: true,
          transferType: row.TransferType
        }
      });


      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val) {
            this.loadPage(1, this.TransferHistory.getRawValue());
            this.walletBalanceCompleted = true;
            this._notification.showNotification("Transfer fund successfully", "close", 'success');
          }
        }
      });
    } catch (error) {
      console.error("Error opening modal", error);
    }
  }

  onDeclineTransfer(row: any) {
    const dialogRef = this._dialog.open(ConfirmationModalComponent, {
      data: { type: 'DeclineTransfer', data: row } // Pass the row data to the modal
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val.continue) {
          // Proceed only if the remarks are not null (i.e., the user confirmed)
          this.declineTransfer(row, val.remarks);
        }
      }
    });
  }

  declineTransfer(data: any, remarks: string): void {
    // Cancel previous subscription if active
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    const payload: UpdateBalanceTransferRequestDTO = {
      TransactionNumber: data.TransactionNumber,
      Status: TopUpStatusEnum.NUMBER_3,
      TransferType: data.TransferType,
      Remarks: remarks
    };

    this.observable = this._transactionService.updateBalanceTransfer(payload);
    this.subscription = this.observable.subscribe({
      next: (response) => {
        this._notification.showNotification("Transfer fund declined", "close", 'success');
        this.loadPage(1, this.TransferHistory.getRawValue());
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error on decline process: " + error.error, "close", 'error');
      }
    });
  }
}
