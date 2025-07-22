import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService } from 'src/shared/dataprovider/api';
import { TransactionLogsService } from 'src/shared/dataprovider/api/api/transactionLogs.service';
import { ChannelTransactionSummaryData } from 'src/shared/dataprovider/api/model/channelTransactionSummaryData';
import { TableOption } from 'src/shared/dataprovider/local/data/common';

@Component({
  selector: 'app-paymentchannel-modal',
  templateUrl: './paymentchannel-modal.component.html',
  styleUrls: ['./paymentchannel-modal.component.scss']
})
export class PaymentchannelModalComponent implements OnInit {
  private observable!: Observable<any>;
  private subscription!: Subscription;

  public topData: Array<{ label: string, icon: string, value: number }> = [];
  public isLoading: boolean = false;
  public tableOption = TableOption;
  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = this.tableOption.PageSize;
  selectedChannelName: string = '';
  dataSource: ChannelTransactionSummaryData[] = [];
  displayedColumns: string[] = [
    'timeStamp',
    'transactionNo',
    'userId',
    'transaction',
    'merchant',
    'amount',
    'transFee',
    'netAmount',
    'status'
  ];
  language: string = "";
  constructor(
    private clientService: ClientService,
    private transactionService: TransactionLogsService,
    private notification: NotificationService,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit(): void {
    if (this.data.selectedChannelId && this.data.clientId) {
      this.getChannelCard(
        this.data.selectedChannelId,
        this.data.clientId,
        100,
        1,
        new Date(this.data.startDate),
        new Date(this.data.endDate),
        this.data.status
      );
    }
  }

  getChannelCard(
    channelId: number,
    clientId?: number,
    pageSize?: number,
    pageNumber?: number,
    startDate?: Date,
    endDate?: Date,
    status?: number,
    searchKeyword?: string
  ) {
    this.isLoading = true;

    this.observable = this.transactionService.apiTransactionLogsTransactionsSummaryChannelsChannelIdGet(
      channelId,
      clientId,
      pageSize,
      pageNumber,
      startDate,
      endDate,
      status,
      searchKeyword
    );

    this.subscription = this.observable.subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response && response.Data) {
          this.dataSource = response.Data.map((transaction: { Type: string | undefined; }) => ({
            ...transaction,
            color: this.getTransactionColor(transaction.Type)
          }));

          this.selectedChannelName = response.Data[0]?.ChannelName || 'No Channel';

          const total = response.Total;
          this.topData = [
            {
              label: `${this.selectedChannelName} walletBalance`,
              icon: 'wallet',
              value: total?.WalletBalance ?? 0
            },
            {
              label: `totalCashIn`,
              icon: 'cash-in',
              value: total?.TotalCashin ?? 0
            },
            {
              label: `totalCashOut`,
              icon: 'cash-out',
              value: total?.TotalCashout ?? 0
            }
          ];
        } else {
          this.dataSource = [];
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.notification.showNotification("Error fetching channel card data", 'closed', 'error');
        this.dataSource = [];
      }
    });
  }

  public getTransactionColor(type?: string): string {
    switch (type) {
      case 'cashIn':
        return 'green';
      case 'cashOut':
        return 'red';
      default:
        return 'black';
    }
  }

  loadPage(page: number, data?: any, keyword?: string): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);

    const convertedStartDate = this.datePipe.transform(data.startDate, 'yyyy-MM-dd');
    const convertedEndDate = this.datePipe.transform(data.endDate, 'yyyy-MM-dd');
    data.startDate = new Date(convertedStartDate!);
    data.endDate = new Date(convertedEndDate!);

    this.getChannelCard(
      data.selectedChannelId,
      data.clientId,
      this.itemsPerPage,
      this.currentPage,
      data.startDate,
      data.endDate,
      data.status,
      keyword
    );
  }

  onFirstPage(): void {
    this.loadPage(1);
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1);
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1);
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage));
  }

  onSearch(query: string): void {
    this.loadPage(1, {
      selectedChannelId: this.data.selectedChannelId,
      clientId: this.data.clientId,
      startDate: this.data.startDate,
      endDate: this.data.endDate,
      status: this.data.status
    }, query);
  }
}
