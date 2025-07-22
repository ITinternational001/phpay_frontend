import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { AgentBalanceTransfer } from 'src/shared/dataprovider/api/model/agentBalanceTransfer';
import { BalanceTransferListDTO } from 'src/shared/dataprovider/api/model/balanceTransferListDTO';
import { BalanceTransferListDTOV2 } from 'src/shared/dataprovider/api/model/balanceTransferListDTOV2';
import { AgentTransferBalanceStatus, TableOption, TopUpStatus } from 'src/shared/dataprovider/local/data/common';
import { formatDateUtc, getCurrentUserId, getStatusName, getUserPermissionsAccess, getWeekBeforeDateRange } from 'src/shared/helpers/helper';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { getAgentId } from 'src/shared/helpers/helper';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-agent-transfer-balance-histroy-table',
  templateUrl: './transfer-balance-histroy-table.component.html',
  styleUrls: ['./transfer-balance-histroy-table.component.scss']
})
export class TransferBalanceHistroyTableComponent {
 
  @Input() title: string = 'TRANSFER HISTORY';
  @Input() data: any;
  @Input() isAdmin!: boolean;
  @Input() isLoading: boolean = false;
  @Input() agentId?: number;  
  @Input() refresh!: boolean;  // Input property to trigger refresh
  @Output() refreshData = new EventEmitter<void>();
  public isReadAndWrite : boolean = false;
  public defaultAgentId: number = getAgentId('some-id') ?? 0;
  public getCurrentUserId: number = getCurrentUserId() ?? 0;
  public tableOption = TableOption;
  public defaultDateRange = getWeekBeforeDateRange(7);
  displayedColumnsCompleted: string[] = ['timestamp', 'transactionId', 'clientname',  'amountInputted', 'requestBy', 'approveBy', 'status', 'remarks'];
  dataSource = new MatTableDataSource<any>();
  agentTransferHistroy!: FormGroup;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0]; 
  private observable!: Observable<any>;
  private subscription!: Subscription;
  language: string = "";
  constructor(
    private fb: FormBuilder,
    private agentService: AgentService,
    private notification: NotificationService,
    private decimalPipe: DecimalPipe,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.agentTransferHistroy = fb.group({
      StartDate: this.defaultDateRange.startDate,
      EndDate: this.defaultDateRange.endDate,
    });
  }

  ngOnInit(): void {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    this.initializeDisplayedColumns();
    if (this.isAdmin) {
      this.agentId = getCurrentUserId() ?? 0;
      this.agentTransferHistroy.patchValue({ agentId: undefined });
    } else {
      this.agentId = this.defaultAgentId; 
    }
    this.loadPage(1, this.agentTransferHistroy.getRawValue());
    this.refreshData.subscribe(() => this.loadPage(1, this.agentTransferHistroy.getRawValue()));
    this.loadPage(1, this.agentTransferHistroy.getRawValue());
    this.agentTransferHistroy.get('StartDate')!.valueChanges.subscribe(() => {
      this.loadPage(1, this.agentTransferHistroy.getRawValue());
    });
    this.agentTransferHistroy.get('EndDate')!.valueChanges.subscribe(() => {
      this.loadPage(1, this.agentTransferHistroy.getRawValue());
    });
  }

  initializeDisplayedColumns(): void {
    if (this.isAdmin) {
      this.displayedColumnsCompleted = ['timestamp', 'transactionId', 'clientname',  'amountInputted', 'requestBy', 'approveBy', 'remarks', 'status',];
    } else {
      this.displayedColumnsCompleted = ['timestamp', 'transactionId', 'clientname',  'amountInputted', 'requestBy', 'approveBy', 'remarks',  'status',];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refresh'] && changes['refresh'].currentValue !== changes['refresh'].previousValue) {
      this.reloadTableData();
    }
  }


  reloadTableData(): void {
    this.loadPage(1, this.agentTransferHistroy.getRawValue());
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  refreshTable(): void {
    this.refreshData.emit(); 
    this.loadPage(this.currentPage, this.agentTransferHistroy.getRawValue()); 
  }
  
  getHistoryTransfer(
    agentId: number | undefined, 
    status: AgentBalanceTransfer, 
    keyword: string = '', 
    startDate: Date, 
    endDate: Date, 
    pageNumber: number = 1,
    pageSize: number = 100, 
    isAdmin: boolean
) {
    this.isLoading = true;

    if (this.subscription) {
        this.subscription.unsubscribe();
    }

    this.observable = this.agentService.apiAgentRequestBalanceTransFerListGet(
        agentId, status, keyword, startDate, endDate, this.currentPage, this.itemsPerPage
    );

    this.subscription = this.observable.subscribe({
        next: (response: BalanceTransferListDTO) => {
            console.log("Balance History:", response);

            if (response.Paginations) {
                console.log("Pagination History:", response);
                this.totalItems = response.Paginations.TotalRecordCount || 0;
            }

            const formattedData = response.Data?.map((item: any) => ({
                Status: getStatusName(item.Status!, AgentTransferBalanceStatus), 
                StatusDescription: item.StatusDescription,
                TimeStamp: item.TimeStamp ? formatDateUtc(item.TimeStamp.toString(), this.datePipe) : undefined,
                RequestID: item.RequestID,
                ClientName: item.ClientName,
                PaymentChannelName: item.PaymentChannelName,
                TotalAmount: item.TotalAmount,
                Remarks: item.Remarks,
                Requestee: item.RequestedByAdmin ? item.RequestedByAdmin : item.Requestee,
                ApproverName: item.ApproverName,
                DateCompleted: item.DateCompleted ? formatDateUtc(item.DateCompleted.toString(), this.datePipe) : undefined,
            }));

            this.dataSource = new MatTableDataSource(formattedData);
        },
        error: (error: HttpErrorResponse) => {
            this.notification.showNotification("Error:" + error.error, "close", "error");
        },
        complete: () => {
            this.isLoading = false;
        }
    });
}



    loadData(): void {
      this.loadPage(this.currentPage, this.agentTransferHistroy.getRawValue());
    }

  onPageChange(page: number): void {
    this.loadPage(page, this.agentTransferHistroy.getRawValue());
  }
  
  loadPage(page: number, data?: any, keywords?: string): void {
    this.currentPage = page;
    const convertedStartDate = this.datePipe.transform(data.StartDate, 'yyyy-MM-dd');
    const convertedEndDate = this.datePipe.transform(data.EndDate, 'yyyy-MM-dd');
    const startDate = convertedStartDate ? new Date(convertedStartDate) : undefined;
    const endDate = convertedEndDate ? new Date(convertedEndDate) : undefined;

    if (startDate && endDate && startDate > endDate) {
        this.isLoading = false;
        return;
    }

    const agentId = this.isAdmin ? undefined : this.agentId;

    this.getHistoryTransfer(agentId, 2, keywords || '', startDate ?? new Date(0), endDate ?? new Date(), this.currentPage, this.itemsPerPage, this.isAdmin);
    this.getHistoryTransfer(agentId, 0, keywords || '', startDate ?? new Date(0), endDate ?? new Date(), this.currentPage, this.itemsPerPage, this.isAdmin);
}
  

  onFirstPage(): void {
    this.loadPage(1, this.agentTransferHistroy.getRawValue());
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, this.agentTransferHistroy.getRawValue());
    }
  }

  onNextPage(): void {
    this.loadPage(this.currentPage + 1, this.agentTransferHistroy.getRawValue());
  }

  onLastPage(): void {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.loadPage(totalPages, this.agentTransferHistroy.getRawValue());
  }

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    this.loadPage(this.currentPage, this.agentTransferHistroy.getRawValue());
  }
  

  onSearch(query: string): void {
    const formValues = this.agentTransferHistroy.getRawValue();
    const convertedStartDate = this.datePipe.transform(formValues.StartDate, 'yyyy-MM-dd');
    const convertedEndDate = this.datePipe.transform(formValues.EndDate, 'yyyy-MM-dd');
    const startDate = convertedStartDate ? new Date(convertedStartDate) : new Date();
    const endDate = convertedEndDate ? new Date(convertedEndDate) : new Date();


    if (startDate > endDate) {
      this.notification.showNotification("Start date cannot be greater than end date.", "Close", "error");
      this.isLoading = false;
      return;
    }


    this.loadPage(1,formValues, query);
}


  
  reloadTable(): void {
    this.loadPage(this.currentPage, this.agentTransferHistroy.getRawValue());
  }

  exportToExcel(): void {
    // Check if the user has read and write permissions
    if (!this.isReadAndWrite) {
      this.notification.showNotification("You don't have permission to download data", "close", "error");
      return; // Exit if no permission
    }
  }
}
