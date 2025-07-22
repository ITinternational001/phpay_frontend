import { query } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription, takeLast } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { AgentRemittance } from 'src/shared/dataprovider/api/model/agentRemittance';
import { AgentRemittanceListDataDTO } from 'src/shared/dataprovider/api/model/agentRemittanceListDataDTO';
import { AgentRemittanceListDTO } from 'src/shared/dataprovider/api/model/agentRemittanceListDTO';
import { ShortenedReceipt } from 'src/shared/dataprovider/api/model/shortenedReceipt';
import { agentremittancetabletransactions } from 'src/shared/dataprovider/local/data/common';
import { formatDateUtc, getAgentId, getCurrentUserId, getUserPermissionsAccess, getWeekBeforeDateRange } from 'src/shared/helpers/helper';
import { AgentRemittanceModalComponent } from '../agent-remittance-modal/agent-remittance-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from 'src/shared/components/modals/confirmation-modal/confirmation-modal.component';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { ActivatedRoute } from '@angular/router';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-agentremittance-transaction-table',
  templateUrl: './remittance-transaction-table.component.html',
  styleUrls: ['./remittance-transaction-table.component.scss']
})
export class RemittanceTransactionTableComponent implements OnInit, OnDestroy {
  private subscription!: Subscription;
  private observable!: Observable<any>;
  private obsApproveTransfer!: Observable<any>;
  private subsApproveTransfer!: Subscription;
  @Input() title: string = 'remittanceRecord';
  @Input() isAdmin: boolean = false;
  @Input() isLoading: boolean = false;
  // @Output() refreshData = new EventEmitter<void>();
  public defaultAgentId: number = getAgentId('some-id') ?? 0;
  public agentId: number | undefined;
  isCompletedChanged: boolean = false;
  dataSource = new MatTableDataSource<any>();
  agentRemittanceTransaction!: FormGroup;
  receiptUrls: string[] = [];
  actionDisable: boolean = false;
  tableHeaders = agentremittancetabletransactions.header;
  displayedColumns: string[] = [
    'timestamp',
    'remittanceId',
    'agent',
    'totalRequestedAmount',
    'fees',
    'totalAmount',
    'agentMOP',
    // 'totalApprove',
    'source',
    'receipt',
    'referenceNo',
    'requestee',
    'approvedBy',
    'remarks',
    'status',
    'action',
  ];
  public defaultDateRange = getWeekBeforeDateRange(7);
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0]; 
  public isReadAndWrite : boolean = false;
  constructor(
    private fb: FormBuilder,
    private agentService: AgentService,
    private notification: NotificationService,
    private datePipe: DatePipe,
    private _dialog: MatDialog,
    private route: ActivatedRoute,
  ) {
     this.agentRemittanceTransaction = this.fb.group({

          StartDate: this.defaultDateRange.startDate,
          EndDate: this.defaultDateRange.endDate,
        })
  }

  ngOnInit(): void {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    const today = new Date();
    if (this.isAdmin) {
      this.agentId = undefined;
      this.displayedColumns = [
        'timestamp',
        'remittanceId',
        'agent',
        'totalRequestedAmount',
        'fees',
        'totalAmount',
        'agentMOP',
        'source',
        'receipt',
        'referenceNo',
        'requestee',
        'approvedBy',
        'remarks',
        'status',
        'action',
      ];
    } else {
      this.agentId = this.defaultAgentId;
      this.displayedColumns = [
        'timestamp',
        'remittanceId',
        'agent',
        'totalAmount',
        'fees',
        'totalRequestedAmount',
        'dateRemitted',
        // 'totalApprove',
        'agentMOP',
        'receipt',
        'referenceNo',
        'requestee',
        'approvedBy',
        'remarks',
        'status',
      ];
    }
  
   
    this.loadPage(1, '', today, today);
  

    this.agentRemittanceTransaction.get('StartDate')!.valueChanges.subscribe(() => {
      this.loadPage(
        1,
        '',
        this.agentRemittanceTransaction.get('StartDate')!.value,
        this.agentRemittanceTransaction.get('EndDate')!.value
      );
    });
  
    this.agentRemittanceTransaction.get('EndDate')!.valueChanges.subscribe(() => {
      this.loadPage(
        1,
        '',
        this.agentRemittanceTransaction.get('StartDate')!.value,
        this.agentRemittanceTransaction.get('EndDate')!.value
      );
    });
  }
  
  getRemittanceTransaction(
    agentId: number | undefined,
    status: AgentRemittance | undefined = undefined, // Allow undefined to fetch all statuses
    keywords: string = '',
    startDate: Date,
    endDate: Date,
    pageNumber: number,
    pageSize: number,
    generateCSV: boolean
  ): void {
    this.isLoading = true;
  
    this.observable = this.agentService.apiAgentCardTransactionRemittanceListGet(
      agentId, status, keywords, startDate, endDate, pageNumber, pageSize, false
    );
  
    this.subscription = this.observable.subscribe({
      next: (response: AgentRemittanceListDTO) => {
        if (response?.Data && Array.isArray(response.Data)) {
  
          const tableData = response.Data.map((item: AgentRemittanceListDataDTO) => {

            const receiptUris = item.Receipt?.map((receipt: ShortenedReceipt) => receipt.Uri) || [];
  
      
            let statusDescription = '';
            switch (item.Status) {
              case AgentRemittance.NUMBER_1:
                statusDescription = 'Pending';
                break;
              case AgentRemittance.NUMBER_2:
                statusDescription = 'Disapprove';
                break;
              case AgentRemittance.NUMBER_3:
                statusDescription = 'Completed';
                break;
              default:
                statusDescription = 'Processing';
            }
            const totalApprove = (item.TransactionFee || 0) + (item.TotalAmount || 0);

            console.log(`TransactionId: ${item.TransactionId}, TotalApprove: ${totalApprove}`);
            return {
              TransactionId: item.TransactionId,
              Status: statusDescription, 
              TimeStamp: item.TimeStamp ? formatDateUtc(item.TimeStamp.toString(), this.datePipe) : '-',
              RemittanceId: item.RemittanceId,
              AgentId: item.AgentId || '-',
              Agentname: item.Agentname || '-',
              RequestedAmount: item.RequestedAmount || '-',
              TotalAmount: item.TotalAmount || 0,
              // DisplayTotalAmount: item.Status === AgentRemittance.NUMBER_3 ? item.TotalAmount : '-',
              WithdrawalCount: item.WithdrawalCount || 0,
              TransacationFees: item.TransactionFee || 0,
              DateRemitted: item.DateRemitted ? formatDateUtc(item.DateRemitted.toString(), this.datePipe) : '-',
              MOP: item.MOP || '-',
              MOPBankName: item.MOPBankName || '-',
              SourceId: item.SourceID || '-',
              SourceName: item.SourceName || '-',
              ReceiptUris: receiptUris, // Include URIs
              ReferenceNo: item.ReferenceNo || '-',
              Requestee: item.RequestedByAdmin ? item.RequestedByAdmin : item.Requestee,
              ApprovedById: item.ApprovedById || '-',
              ApprovedByName: item.ApprovedByName || '-',
              Remarks: item.Remarks || '-',
              Method: item.Method || '-',
              MethodDescription: item.MethodDescription || '-',
              BankWithdrawalFee: item.BankWithdrawalFee || 0,
              USDTWithdrawalFee: item.USDTWithdrawalFee || 0,
              CashOnPickupWithdrawalFee: item.CashOnPickupWithdrawalFee || 0,
             

            };
         
          });
          console.log('Transformed table data:', tableData);
          this.dataSource.data = tableData;
  
          this.totalItems = response.Paginations?.TotalRecordCount || 0;
        } else {

          this.notification.showNotification('Invalid response data from the server', 'close', 'error');
          this.totalItems = 0;
        }
  
        // Stop loading spinner
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification('Failed to fetch remittance transactions. ' + error.error, 'close', 'error');
        this.isLoading = false;
      }
    });
  }
  
  

getReceipts(receiptUris: string[]): void {
  if (receiptUris && receiptUris.length > 0) {
    this.receiptUrls = receiptUris;
  } else {
    this.notification.showNotification('No receipts available', 'close', 'error');
  }
}


openReceipt(uri: string): void {
  const link = document.createElement('a');
  const filename = uri.split('/').pop() || 'receipt'; 
  link.href = uri;
  link.target = '_blank';
  link.download = filename; 
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}



  onSearch(query: string): void {
    const formValues = this.agentRemittanceTransaction.getRawValue();
    const convertedStartDate = this.datePipe.transform(formValues.StartDate, 'yyyy-MM-dd');
    const convertedEndDate = this.datePipe.transform(formValues.EndDate, 'yyyy-MM-dd');

    const startDate = convertedStartDate ? new Date(convertedStartDate) : new Date();
    const endDate = convertedEndDate ? new Date(convertedEndDate) : new Date();

    if (startDate > endDate) {
      this.notification.showNotification('Start date cannot be greater than end date.', 'close', 'error');
      return;
    }

    this.loadPage(1, query, startDate, endDate);
  }

  exportToExcel(): void {
    // Check if the user has read and write permissions
    if (!this.isReadAndWrite) {
      this.notification.showNotification("You don't have permission to download data", "close", "error");
      return; // Exit if no permission
    }
  
    const transactionLogs = this.dataSource.data; 
    if (!transactionLogs || transactionLogs.length === 0) {
      console.error('No transaction logs available to export.');
      return; 
    }
  
    const headers = [
      'Date & Time',
      'Remittance ID',
      'Agent Name',
      'Total Amount',
      'Withdrawal Count',
      'Agent MOP',
      'Source',
      'Receipt',
      'Reference No.',
      'Requestee',
      'Approved By',
      'Remarks',
      'Status',
    ];
  
    const csvData = transactionLogs.map((item: any) => [
      item.TimeStamp,
      item.RemittanceId,
      item.AgentId,
      item.TotalAmount,
      item.WithdrawalCount,
      item.MOP,
      item.MOPBankName,
      item.SourceId,
      item.ReceiptUris,
      item.ReferenceNo || 'N/A',
      item.Requestee,
      item.ApprovedByName,
      item.StatusDescription
    ].join(',')); 
  
    const csvContent = [headers.join(','), ...csvData].join('\n'); 
    const startDate = this.agentRemittanceTransaction.get('StartDate')?.value || new Date();
    const endDate = this.agentRemittanceTransaction.get('EndDate')?.value || new Date();
    const formattedStartDate = formatDateUtc(startDate.toString(), new DatePipe('en-US'), true);
    const formattedEndDate = formatDateUtc(endDate.toString(), new DatePipe('en-US'), true);
  
    // Create and download the CSV file
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
  

  onApproved(row: any): void {
    const dialogConfig = {
      width: '700px',
      data: {
        ...row,
        TransactionFees: {
          BankWithdrawalFee: row.BankWithdrawalFee,
          USDTWithdrawalFee: row.USDTWithdrawalFee,
          CashOnPickupWithdrawalFee: row.CashOnPickupWithdrawalFee,
        },
      },
      hasBackdrop: true,
      disableClose: true,
    };
    console.log('Opening modal with data:', dialogConfig.data);
  
    try {
      const dialogRef = this._dialog.open(AgentRemittanceModalComponent, dialogConfig);
  
      dialogRef.afterClosed().subscribe({
        next: (data) => {
          if (data?.release) {
            this.ApprovedRemittanceTransfer(data);
          }
        },
        error: (err) => {
          console.error('Error handling dialog close:', err);
        },
      });
    } catch (error) {
      console.error('Error opening remittance modal:', error);
    }
  }

  onDeclineRemittance(row: any) {
    if (row.Status === 'Decline' || row.Status === 'Disapprove') {
      this.notification.showNotification(
        'This transaction has already been declined or disapproved.',
        'close',
        'error'
      );
      return;
    }
  
    const dialogRef = this._dialog.open(ConfirmationModalComponent, {
      data: {
        type: 'DeclineRemittance',
        remittanceId: row.RemittanceId,
        transactionId: row.TransactionId,
        remarks: row.remarks,
        approvedBy: row.ApproveBy,
        data: row,
      },
    });
  
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result?.remarks) {
          const approvedBy = this.getCurrentUserId(); // get user ID here
          const remarks = result.remarks;
  
          console.log('Sending to API:', {
            remittanceId: row.RemittanceId,
            remarks,
            approvedBy,
          });
  
          this.declineRemittance(row, remarks);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification('Error: ' + error.error, 'close', 'error');
      },
    });
  }
  
  
  
  
  declineRemittance(row: any, remarks: string) {
    const approvedBy: number | undefined = this.getCurrentUserId();
    if (!approvedBy) {
      this.notification.showNotification('User ID not found. Cannot decline transfer.', 'close', 'error');
      return;
    }

    console.log('Decline Payload:', {
      remittanceId: row.RemittanceId,
      remarks,
      approvedBy,
    });
    
    this.isLoading = true;
    this.observable = this.agentService.apiAgentCardTransactionRemittanceDeclinePut(row.RemittanceId, remarks, approvedBy);
    this.subscription = this.observable.subscribe({
      next: () => {
        this.notification.showNotification('Transfer declined successfully', 'close', 'success');
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


  onProcessing(data: any) {
    this.isLoading = true;

    if (this.observable) {
        this.subscription.unsubscribe();
    }

    if (data.Status !== 'Pending') {
        this.notification.showNotification(
            "Transaction must be in 'Pending' status to process.",
            "close",
            "error"
        );
        this.isLoading = false;
        return;
    }

    this.observable = this.agentService.apiAgentCardTransactionRemittanceProcessingPut(data.RemittanceId);
    this.subscription = this.observable.subscribe({
        next: (response) => {

            const today = new Date();
            const startDate = today; 
            const endDate = today; 
            this.loadPage(1, '', startDate, endDate);

            this.notification.showNotification(
                "Transaction status updated to 'Processing'.",
                "close",
                "success"
            );
        },
        error: (error: HttpErrorResponse) => {
            this.notification.showNotification("Error: " + error.error, "close", "error");
        },
        complete: () => {
            this.isLoading = false;
        },
    });
}

  

ApprovedRemittanceTransfer(data: any): void {
  this.isLoading = true;

 
  if (!data.row?.TransactionId || !data.form) {
    this.notification.showNotification("Invalid data received for processing.", "close", 'error');
    this.isLoading = false;
    return;
  }

 
  if (data.row.Status !== 'Processing') {
    this.notification.showNotification("Transaction must be in 'Processing' status to approve.", "close", "error");
    this.isLoading = false;
    return;
  }


  if (this.obsApproveTransfer) {
    this.subsApproveTransfer.unsubscribe();
  }

 
  this.obsApproveTransfer = this.agentService.apiAgentCardTransactionRemittanceApprovePutForm(
    data.row.TransactionId,
    data.form.WithdrawalCount,
    data.form.ConfirmAmount,
    data.form.ReferenceNumber,
    data.form.Source,
    data.form.DepositSlips,
    data.form.ApproveBy,
    data.form.ModeOfPayment
  );

  // Handle API response
  this.subsApproveTransfer = this.obsApproveTransfer.subscribe({
    next: (response) => {
      const keywords = this.agentRemittanceTransaction.getRawValue();

      const today = new Date();
      const startDate = today;
      const endDate = today;
      this.actionDisable = true;
      this.loadPage(1, keywords, startDate, endDate);  
      this.isCompletedChanged = true;
      this.notification.showNotification("Fund was released successfully", "close", 'success');
    },
    error: (error: HttpErrorResponse) => {
      console.error('Error approving remittance transfer:', error);
      this.notification.showNotification("Error: " + error.error, "close", 'error');
      this.isLoading = false;
    },
    complete: () => {
      this.isLoading = false;
    },
  });
}



  
  onFirstPage(): void {
    this.loadPage(1, '', new Date(), new Date()); 
  }
  
  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, '', new Date(), new Date()); 
    }
  }
  
  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1, '', new Date(), new Date()); 
    }
  }
  
  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), '', new Date(), new Date()); 
  }

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage, '', new Date(), new Date());
  }


  

  loadPage(page: number, keywords: string, startDate: Date, endDate: Date): void {
    this.currentPage = page;
  
    const convertedStartDate = this.datePipe.transform(startDate, 'yyyy-MM-dd');
    const convertedEndDate = this.datePipe.transform(endDate, 'yyyy-MM-dd');
    const formattedStartDate = new Date(convertedStartDate!);
    const formattedEndDate = new Date(convertedEndDate!);
    this.getRemittanceTransaction(this.agentId, undefined, keywords, formattedStartDate, formattedEndDate, this.currentPage, this.itemsPerPage, false);
  }
  
  

  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
  

  
}
