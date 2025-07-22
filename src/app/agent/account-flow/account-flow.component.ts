import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { ReportAccountFlowSummary } from 'src/shared/dataprovider/api/model/reportAccountFlowSummary';
import { formatDateUtc, getAgentId, getCurrentUserId, getUserPermissionsAccess, getWeekBeforeDateRange } from 'src/shared/helpers/helper';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { BrandNameDTO } from 'src/shared/dataprovider/api/model/brandNameDTO';
import { MatSelectChange } from '@angular/material/select';
import { DropDownData } from 'src/shared/dataprovider/local/interface/commonInterface';
import { AgentChannelsDTO } from 'src/shared/dataprovider/api/model/agentChannelsDTO';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BrandDTO } from 'src/shared/dataprovider/api/model/brandDTO';
import { AgentListDTO } from 'src/shared/dataprovider/api/model/agentListDTO';
import { AgentListData } from 'src/shared/dataprovider/api/model/agentListData';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-account-flow',
  templateUrl: './account-flow.component.html',
  styleUrls: ['./account-flow.component.scss']
})
export class AccountFlowComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean = false;
  @Input() isAdmin: boolean = false;
  dataSource = new MatTableDataSource<any>();
  AgentIncomeReport!: FormGroup;
  incomeReportClient!: FormGroup;
  displayedIncomeReport: string[] = ['timeDate', 'transactionId', 'clientName', 'type', 'bank', 'initialAmount', 'adjustment', 'runningBalance'];
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0]; 
  selectedClientId: number = 0;
  selectedClientName: string = '';
  selectedChannelName: string = '';
  public defaultAgentId: number = getAgentId('some-id') ?? 0;
  public getCurrentUserId: number = getCurrentUserId() ?? 0;
  public clientsDropdown: Array<{ id: number; name: string }> = [];
  public channelsDropdown: Array<{ id: number; name: string }> = [];
  public isReadAndWrite:boolean = false;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private defaultDateRange = getWeekBeforeDateRange(7);
  searchKeyword: string = '';
  language: string ="";
  constructor(
    private fb: FormBuilder,
    private agentService: AgentService,
    private notification: NotificationService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) { 
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.AgentIncomeReport = this.fb.group({
          StartDate: this.defaultDateRange.startDate,
          EndDate: this.defaultDateRange.endDate,
        })
  }

  ngOnInit(): void {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    this.incomeReportClient = this.fb.group({
      ClientId: [''],
      ChannelId: ['']
    });

    this.AgentIncomeReport.valueChanges.subscribe(() => {
      this.loadPage(1, this.searchKeyword);
    });

    this.getClientsDropdown();
    this.getIncomeReport();
    this.getChannelList();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getIncomeReport(
    pageNumber: number = 1, 
    pageSize: number = 100, 
    searchKeyword: string = '', 
    generateCSV: boolean = false
  ): void {
      let startDateUtc = this.AgentIncomeReport.get('StartDate')?.value;
      let endDateUtc = this.AgentIncomeReport.get('EndDate')?.value;
  
      if (!startDateUtc || !endDateUtc) {
        const { startDate, endDate } = this.defaultDateRange; // Use default date range
        startDateUtc = startDate;
        endDateUtc = endDate;
      }
  
      let startDate = new Date(startDateUtc);
      let endDate = new Date(endDateUtc);
  
      // ✅ Convert to exact UTC date (midnight UTC)
      startDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
      endDate = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59)); // End of the day
  
      if (startDate > endDate) {
        this.isLoading = false;
        return;
      }
  
      this.isLoading = true;
  
      // ✅ Optional: Log UTC-formatted date for debugging
      console.log("Formatted Start Date (UTC):", formatDateUtc(startDate.toISOString(), this.datePipe, true));
      console.log("Formatted End Date (UTC):", formatDateUtc(endDate.toISOString(), this.datePipe, true));
      const agentIdToUse = this.isAdmin ? 2 : getAgentId('some-id') ?? 0;
      this.observable = this.agentService.apiAgentReportsAccountsFlowGet(
        agentIdToUse,
        this.selectedChannelName,
        this.selectedClientName,
        searchKeyword,
        startDate,  // ✅ Pass exact UTC Date object
        endDate,    // ✅ Pass exact UTC Date object
        this.currentPage,
        this.itemsPerPage,
        generateCSV
      );
  
      this.subscription = this.observable.subscribe({
        next: (response: ReportAccountFlowSummary) => {
          this.isLoading = false;
  
          if (response?.Data) {
            this.dataSource.data = response.Data.map(item => ({
              ...item,
              Type: this.getTypeDescription(item.Type || 0),
              TypeColor: this.getTypeColor(this.getTypeDescription(item.Type || 0))
            }));
  
            this.totalItems = response.Pagination?.TotalRecordCount || 0;
            this.itemsPerPage = response.Pagination?.PageSize || 10;
            this.currentPage = response.Pagination?.PageNumber || 1;
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.notification.showNotification(
            `Error fetching income report data: ${error.error}`, "close", "error"
          );
        }
      });
  }
  
  getTypeDescription(type: number): string {
    const typeDescriptions: { [key: number]: string } = {
      1: 'Cash-In',
      2: 'Cash-Out',
      3: 'Withdraw'
    };

    return typeDescriptions[type] || 'Unknown';
  }

  getTypeColor(typeDescription: string): string {
    const typeColors: { [key: string]: string } = {
      'Cash-In': 'green',
      'Cash-Out': 'red',
      'Withdraw': 'yellow'
    };

    return typeColors[typeDescription] || 'gray';
  }

  loadPage(page: number, searchKeyword: string = this.searchKeyword): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);
    this.getIncomeReport(page, this.itemsPerPage, searchKeyword);
  }

  onSearch(query: string): void {
    this.searchKeyword = query;
    this.loadPage(1, query);
  }

  onFirstPage(): void {
    this.loadPage(1,  this.searchKeyword);
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, this.searchKeyword);
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1, this.searchKeyword);
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), this.searchKeyword);
  }

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage, this.searchKeyword);
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
  
  getChannelList(): void {
    this.isLoading = true;
    this.observable = this.agentService.apiAgentManagementGetAllChannelsGet();
    this.subscription = this.observable.subscribe({
      next: (response: AgentChannelsDTO[]) => {
        this.channelsDropdown = response.map(channel => ({
          id: channel.ChannelId || 0,
          name: channel.ChannelName || 'Unknown Channel'
        }));

        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification('Error fetching channel data' + error.error, "close", "error");
        this.isLoading = false;
      }
    });
  }

  onClientChange(selectedClient: { id: number, name: string }) { 
    if (!selectedClient) return;
    this.selectedClientName = selectedClient.name;
    // Patch the form with selected client data
    this.incomeReportClient.patchValue({
      clientId: selectedClient.id,
      clientName: selectedClient.name
    });
    // Reload the data for the selected client
    this.loadPage(1); 
  }
  

  onChannelChange(selectedChannelId: { id: number, name: string }): void {
    this.selectedChannelName = selectedChannelId.name;
    this.incomeReportClient.patchValue({});
    this.loadPage(1);
  }


  exportToExcel(): void {
    if (!this.isReadAndWrite) {
      this.notification.showNotification("You don't have permission to download the data", 'close', 'error');
      return; // Exit if no permission
    }
    const transactionLogs = this.dataSource.data;
    if (!transactionLogs || transactionLogs.length === 0) {
      console.error('No transaction logs available to export.');
      return;
    }

    const headers = [
      'Date & TIme',
      'Transaction ID',
      'Client Name',
      'Type',
      'Bank Name',
      'Initial Amount',
      'Adjustment',
      'Running Balance',
    ];

    const csvData = transactionLogs.map((transaction: any) => [
      transaction.Timestamp,
      transaction.TransactionNumber,
      transaction.ClientName,
      transaction.Type,
      transaction.Channel,
      transaction.InitialAmount,
      transaction.Adjustment,
      transaction.RunningBalance,
    ].join(','));

    const csvContent = [headers.join(','), ...csvData].join('\n');
    const startDate = this.AgentIncomeReport.get('StartDate')?.value || new Date();
    const endDate = this.AgentIncomeReport.get('EndDate')?.value || new Date();
    const formattedStartDate = formatDateUtc(startDate.toString(), new DatePipe('en-US'), true);
    const formattedEndDate = formatDateUtc(endDate.toString(), new DatePipe('en-US'), true);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agent_Income_Report_${formattedStartDate.replace(/\//g, '-')}_to_${formattedEndDate.replace(/\//g, '-')}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

}
