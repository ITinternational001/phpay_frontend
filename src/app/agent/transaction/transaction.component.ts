import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { CashInOutStatusEnum, TransactionTypeEnum } from 'src/shared/dataprovider/api';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { AgentListData } from 'src/shared/dataprovider/api/model/agentListData';
import { AgentListDTO } from 'src/shared/dataprovider/api/model/agentListDTO';
import { AgentReportTransactionLog } from 'src/shared/dataprovider/api/model/agentReportTransactionLog';
import { AgentReportTransactionLogList } from 'src/shared/dataprovider/api/model/agentReportTransactionLogList';
import { BrandDTO } from 'src/shared/dataprovider/api/model/brandDTO';
import { BrandNameDTO } from 'src/shared/dataprovider/api/model/brandNameDTO';
import { RightSideSummaryReport } from 'src/shared/dataprovider/api/model/rightSideSummaryReport';
import { Type } from 'src/shared/dataprovider/local/data/common';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';
import { DropDownData } from 'src/shared/dataprovider/local/interface/commonInterface';
import { formatDateUtc, getAgentId, getCurrentUserId, getUserPermissionsAccess, getWeekBeforeDateRange } from 'src/shared/helpers/helper';

export interface LeftSideSummaryReport {
    TodayIncome?: number;
    YesterdayIncome?: number;
    ThisWeekIncome?: number;
    ThisMonthIncome?: number;
}

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  @Input() label!: string;
  @Input() value!: string | number; 
  agentTransactionLogs!: FormGroup;
  AgentTransaction!: FormGroup;
  agentlistofClient!: FormGroup;
  dataSource = new MatTableDataSource<any>();
  row: LeftSideSummaryReport | null = null;
  transactionLogs: AgentReportTransactionLogList[] | null = null;
  selectedClientName: string = '';
  brandList: BrandNameDTO[] = [];
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0];
  startDate: Date | null = null;
  endDate: Date | null = null;
  public defaultAgentId: number = getAgentId('some-id') ?? 0;
  public getCurrentUserId: number = getCurrentUserId() ?? 0;
  public defaultDateRange = getWeekBeforeDateRange(7);
  public isReadAndWrite:boolean = false;
  public clientsDropdown: Array<{ id: number; name: string }> = [];
  public selectType = Type;
  selectedClientId: string = '';
  topData: { label: string; value: number | string, icon: string }[] = [
    { label: 'totalCashIn', value: 0, icon: "fa fa-coins" },
    { label: 'totalCashOut', value: 0, icon: "fa fa-coins" },
    { label: 'totalWalletBalance', value: 0, icon: "fa fa-coins" },
  ];
  displayTransaction: string[] = [
    'timesTamp', 'transactionNo', 'clientName', 'type', 
    'channelName', 'grossAmount', 'totalComms', 'netAmount', 'status'
  ];

  private obsClient!: Observable<any>;
  private subsClient!: Subscription;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  @Input() isLoading: boolean = false;
  language: string ="";
  constructor(
    private agentService: AgentService,
    private fb: FormBuilder,
    private decimalPipe: DecimalPipe,
    private datePipe: DatePipe,
    private notification: NotificationService,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.agentTransactionLogs = this.fb.group({
      StartDate: this.defaultDateRange.startDate,
      EndDate: this.defaultDateRange.endDate,
    });

    this.agentTransactionLogs.get("EndDate")?.valueChanges.subscribe(() => {
      this.loadPage(1);
    });
  }

  ngOnInit(): void {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    const { startDate, endDate } = this.defaultDateRange;
    this.getTransactionLogs(this.defaultAgentId, undefined, undefined, startDate, endDate);
    this.getClientsDropdown();
    this.agentlistofClient = this.fb.group({
      ClientId: 0,
    });
  }
  
  getTransactionLogs(agentId: number, clientName?: string, searchKeyword?: string, startDate?: Date, endDate?: Date, pageNumber: number = 1, pageSize: number = 10,
     generateCSV: boolean = false): void {
    this.isLoading = true;
    this.observable = this.agentService.apiAgentReportsTransactionLogsGet(agentId, clientName, searchKeyword, startDate, endDate, this.currentPage, this.itemsPerPage, generateCSV);
    this.subscription = this.observable.subscribe({
      next: (response: { 
        Transactions: AgentReportTransactionLogList[]; 
        WalletBalance?: LeftSideSummaryReport; 
        TotalCommissions?: RightSideSummaryReport; 
        Pagination?: { TotalRecordCount?: number; PageNumber?: number; PageSize?: number } 
      }) => {
        this.isLoading = false;
      
        if (response.Transactions) {
          this.transactionLogs = response.Transactions.map(transaction => this.mapTransaction(transaction)) || [];
          this.dataSource.data = this.transactionLogs;
  
          if (response.Pagination) {
            this.totalItems = response.Pagination.TotalRecordCount || 0;
            this.currentPage = response.Pagination.PageNumber || 1;
            this.itemsPerPage = response.Pagination.PageSize || 10;
          }
  
          if (response.WalletBalance) {
            this.row = {
              TodayIncome: response.WalletBalance.TodayIncome || 0,
              YesterdayIncome: response.WalletBalance.YesterdayIncome || 0,
              ThisWeekIncome: response.WalletBalance.ThisWeekIncome || 0,
              ThisMonthIncome: response.WalletBalance.ThisMonthIncome || 0
            } as LeftSideSummaryReport;
          }
  
          if (response.TotalCommissions) {
            this.topData = [
              { label: 'totalCashIn', value: this.decimalPipe.transform(response.TotalCommissions.TotalCashIn ?? 0, '1.2-2') || '0', icon: "fa fa-coins" },
              { label: 'totalCashOut', value: this.decimalPipe.transform(response.TotalCommissions.TotalCashOut ?? 0, '1.2-2') || '0', icon: "fa fa-coins" },
              { label: 'totalWalletBalance', value: this.decimalPipe.transform(response.TotalCommissions.TotalWalletBalance ?? 0, '1.2-2') || '0', icon: "fa fa-coins" },
            ];
          }
        } else {
          console.warn('No transactions found in the response');
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", "error");
      }
    });
  }
  
  private mapTransaction(transaction: AgentReportTransactionLogList): any {
    return {
      ...transaction,
      Type: this.getTransactionTypeText(transaction.Type),
      TypeColor: this.getStatusColor(transaction.Type),
      Status: this.getTransactionStatusText(transaction.Status),
    };
  }
  
  private getTransactionTypeText(type?: TransactionTypeEnum): string {
    switch (type) {
      case TransactionTypeEnum.NUMBER_1: 
        return 'Cash-In';
      case TransactionTypeEnum.NUMBER_2: 
        return 'Cash-Out';
      default:
        return 'Unknown';
    }
  }
  
  private getTransactionStatusText(status?: CashInOutStatusEnum): string {
    switch (status) {
      case CashInOutStatusEnum.NUMBER_1: 
        return 'Pending';
      case CashInOutStatusEnum.NUMBER_2:
        return 'Cancelled';
      case CashInOutStatusEnum.NUMBER_3: 
        return 'Completed';
      case CashInOutStatusEnum.NUMBER_4: 
        return 'Rejected';
      case CashInOutStatusEnum.NUMBER_5: 
        return 'Closed';
      default:
        return 'Unknown';
    }
  }
  
  getStatusColor(type?: TransactionTypeEnum): string {
    switch (type) {
      case TransactionTypeEnum.NUMBER_1:
        return 'green';
      case TransactionTypeEnum.NUMBER_2: 
        return 'red';
      default:
        return 'black'; 
    }
  }
  
  exportToExcel(): void {
    if (!this.isReadAndWrite) {
      this.notification.showNotification("You don't have permission to download the data", 'close', 'error');
      return; 
    }
    const headers = ['Timestamp', 'Transaction No','Client Name', 'Type', 'Vendor Name',
        'Channel Name', 'Gross Amount', 'Commissions', 'Net Amount', 'Status'];
    const csvData = this.transactionLogs?.map(transaction => [
        transaction.Timestamp,
        transaction.TransactionNo,
        transaction.ClientName,
        transaction.Type,
        transaction.VendorName,
        transaction.Channelname,
        transaction.GrossAmount,
        transaction.Commissions,
        transaction.NetAmount,
        transaction.Status
    ].join(',')) || []; 
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const startDate = this.agentTransactionLogs.get('StartDate')?.value || new Date();
    const endDate = this.agentTransactionLogs.get('EndDate')?.value || new Date();
    const formattedStartDate = formatDateUtc(startDate.toString(), new DatePipe('en-US'), true);
    const formattedEndDate = formatDateUtc(endDate.toString(), new DatePipe('en-US'), true);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agent_transactionLogs_${formattedStartDate.replace(/\//g, '-')}_to_${formattedEndDate.replace(/\//g, '-')}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); 
}

  loadPage(page: number, searchKeyword?: string, query?: string): void {
    const { StartDate, EndDate } = this.agentTransactionLogs.getRawValue();
    const convertedStartDate = this.datePipe.transform(StartDate, 'yyyy-MM-dd');
    const convertedEndDate = this.datePipe.transform(EndDate, 'yyyy-MM-dd');
    const startDate = convertedStartDate ? new Date(convertedStartDate) : undefined;
    const endDate = convertedEndDate ? new Date(convertedEndDate) : undefined;

    this.getTransactionLogs(this.defaultAgentId, this.selectedClientName, query, startDate, endDate, page);
}

  onFirstPage(): void {
    this.loadPage(1, this.agentTransactionLogs.getRawValue());
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, this.agentTransactionLogs.getRawValue());
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1, this.agentTransactionLogs.getRawValue());
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), this.agentTransactionLogs.getRawValue());
  }

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage, this.agentTransactionLogs.getRawValue());
  }

  onSearch(query: string): void {
    this.loadPage(1, this.agentTransactionLogs.getRawValue(), query);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.subsClient?.unsubscribe(); 
  }

  
  getClientsDropdown(userId: number = this.getCurrentUserId) {
      this.isLoading = true;
      this.subscription = this.agentService.apiAgentManagementListGet(userId).subscribe({
        next: (response: AgentListDTO) => {
          if (response && response.Agents && Array.isArray(response.Agents)) {
            let filteredBrands: BrandDTO[] = [];
            const matchedAgent = response.Agents.find((agent: AgentListData) => agent.UserId === userId);
            if (matchedAgent && matchedAgent.Brands && Array.isArray(matchedAgent.Brands)) {
              filteredBrands = matchedAgent.Brands;
            }
            this.clientsDropdown = filteredBrands.map((client: BrandDTO) => ({
              id: client.ClientId ?? 0,
              name: client.ClientName ?? ''
            }));
          } else {
            this.clientsDropdown = [];
          }
        },
        error: (error) => {
          this.clientsDropdown = [];
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }
  
  onClientChange(selectedClientId: { id: number, name: string }) { 
    this.selectedClientName = selectedClientId.name;
    this.agentlistofClient.patchValue({
    });
    this.loadPage(1, undefined, undefined); 
  }

  onSelectType(selectedTypeId: { id: number, name: string}) {

  }
  
  
  
}
