import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { AgentBalanceTransfer } from 'src/shared/dataprovider/api/model/agentBalanceTransfer';
import { BalanceTransferListDTOV2 } from 'src/shared/dataprovider/api/model/balanceTransferListDTOV2';
import { formatDateUtc, getStatusName, getWeekBeforeDateRange } from 'src/shared/helpers/helper';
import { TableOption, TopUpStatus } from 'src/shared/dataprovider/local/data/common';
import { BalanceTransferListDTO } from 'src/shared/dataprovider/api/model/balanceTransferListDTO';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from 'src/shared/components/modals/confirmation-modal/confirmation-modal.component';
import { TransferBalanceModalComponent } from 'src/shared/components/modals/transfer-balance-modal/transfer-balance-modal.component';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { getAgentId } from 'src/shared/helpers/helper';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-agent-transfer-balance-request-table',
  templateUrl: './transfer-balance-request-table.component.html',
  styleUrls: ['./transfer-balance-request-table.component.scss']
})
export class TransferBalanceRequestTableComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['timestamp', 'transactionId', 'clientName', 'amount', 'requestBy', 'status', 'action'];
  @Input() data: any;
  @Input() isAdmin!: boolean;
  @Input() isLoading: boolean = false;
  @Input() agentId?: number; 
  public tableOption = TableOption;
  dataSource = new MatTableDataSource<any>();
  AgentRequestForm!: FormGroup;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0]; 
  private currentAgentId: number | undefined;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  refreshTrigger: boolean = false;
  @Input() refresh!: boolean;  // Input property to trigger refresh
  @Output() refreshData = new EventEmitter<void>();
  public defaultAgentId: number = getAgentId('some-id') ?? 0;
  public defaultDateRange = getWeekBeforeDateRange(7);
  language: string ="";
  constructor(
    private fb: FormBuilder,
    private _dialog: MatDialog,
    private agentService: AgentService,
    private notification: NotificationService,
    private decimalPipe: DecimalPipe,
    private datePipe: DatePipe,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.AgentRequestForm = fb.group({
      StartDate: this.defaultDateRange.startDate,
      EndDate: this.defaultDateRange.endDate,
    });
  }

  ngOnInit(): void {
    if (this.isAdmin) {
      this.agentId = undefined; 
      this.AgentRequestForm.patchValue({ agentId: undefined });
    } else {
      this.agentId = this.defaultAgentId; 
      this.displayedColumns = this.displayedColumns.filter(col => col !== 'action');
    }
    this.loadPage(1, this.AgentRequestForm.getRawValue());
    this.refreshData.subscribe(() => this.loadPage(1, this.AgentRequestForm.getRawValue()));
    this.loadPage(1, this.AgentRequestForm.getRawValue());
    this.AgentRequestForm.get('StartDate')!.valueChanges.subscribe(() => {
      this.loadPage(1, this.AgentRequestForm.getRawValue());
    });
    this.AgentRequestForm.get('EndDate')!.valueChanges.subscribe(() => {
      this.loadPage(1, this.AgentRequestForm.getRawValue());
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refresh'] && changes['refresh'].currentValue !== changes['refresh'].previousValue) {
      this.reloadTableData();
    }
  }

  reloadTableData(): void {
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  refreshTable(): void {
    this.refreshData.emit();
    this.loadPage(this.currentPage, this.AgentRequestForm.getRawValue()); 
  }

  getHistoryTransfer(
    agentId: number | undefined, 
    status: AgentBalanceTransfer = 1, 
    keyword: string = '', 
    startDate: Date, 
    endDate: Date, 
    pageNumber: number = 1, 
    pageSize: number = 100
  ) {
    this.isLoading = true;
  
    // Store the current agentId for later use
    this.currentAgentId = agentId;
  
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  
    this.observable = this.agentService.apiAgentRequestBalanceTransFerListGet(agentId, status, keyword, startDate, endDate, pageNumber, pageSize);
  
    this.subscription = this.observable.subscribe({
      next: (response: BalanceTransferListDTO) => {            
        if (response.Paginations && response.Paginations.TotalRecordCount !== undefined) {
          this.totalItems = response.Paginations.TotalRecordCount;
        }
        if (response.Data) {
          // Map response data to table format
          const tableData = response.Data.map((item: BalanceTransferListDTOV2) => ({
            Status: getStatusName(item.Status!, TopUpStatus),
            StatusDescription: item.StatusDescription,
            TimeStamp: item.TimeStamp ? formatDateUtc(item.TimeStamp.toString(), this.datePipe) : 'N/A',
            RequestID: item.RequestID,
            AgentId: item.AgentId,
            ClientId: item.ClientId,
            ClientName: item.ClientName,
            PaymentChannelName: item.PaymentChannelName,
            TotalAmount: item.TotalAmount,
            Requestee: item.RequestedByAdmin ? item.RequestedByAdmin : item.Requestee, 
            ApproverName: item.ApproverName,
            Datecompleted: item.DateCompleted ? formatDateUtc(item.DateCompleted.toString(), this.datePipe) : 'N/A'
          }));
          this.dataSource = new MatTableDataSource(tableData);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.loadPage(page, this.AgentRequestForm.getRawValue());
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
    this.getHistoryTransfer(agentId, 1, keywords ?? '', startDate ?? new Date(0), endDate ?? new Date(), this.currentPage, this.itemsPerPage);
}
  
  onFirstPage(): void {
    this.loadPage(1, this.AgentRequestForm.getRawValue());
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, this.AgentRequestForm.getRawValue());
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1, this.AgentRequestForm.getRawValue());
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), this.AgentRequestForm.getRawValue());
  }

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage, this.AgentRequestForm.getRawValue());
  }

  onSearch(query: string): void {
    this.isLoading = true;
    this.loadPage(1, this.AgentRequestForm.getRawValue(), query); 
}

  onDeclineTransfer(row: any) {
    const dialogRef = this._dialog.open(ConfirmationModalComponent, { data: { type: 'DeclineTransfer' } });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val.continue) {
          this.declineTransfer(row);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", "error");
      }
    });
  }
  

  declineTransfer(row: any,) {
    // const approvedBy = this.agentId; 
    this.isLoading = true;
    const approvedBy = this.getCurrentUserId();
    this.observable = this.agentService.apiAgentRequestBalanceTransferDeclinePut(row.RequestID, approvedBy);
    this.subscription = this.observable.subscribe({
      next: (response: any) => {
        this.notification.showNotification('Transfer declined successfully', 'close', 'success');
        this.refreshTable(); 
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error declining transfer:', error);
        this.notification.showNotification('Failed to decline transfer', 'close', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
  getCurrentUserId(): number {
    return parseInt(SessionManager.getFromToken('Id'));
  }


  onAgentTransfer(row: any): void {
    console.log("Agent Row:", row);
   
    const dialogRef = this._dialog.open(TransferBalanceModalComponent, {
      width: '800px',
      data: {
        data: { type: 'agentTransferBalance' },
        AgentId: row.AgentId,
        clientId: row.ClientId,
        channelName: row.PaymentChannelName,
        clientName: row.ClientName,
        Amount: row.TotalAmount,
        requestId: row.RequestID,
        ApproverName: row.ApproverName,
        showMerchant: false 
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();  
      }
    });
  }
  
  
  

}
  
