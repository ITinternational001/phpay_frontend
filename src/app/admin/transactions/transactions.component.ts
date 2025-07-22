import { Component, OnInit, ViewChild } from '@angular/core';
import { TableOption, TransactionStatus } from '../../../shared/dataprovider/local/data/common';
import { Observable, Subscription } from 'rxjs';
import { TransactionLogsService } from 'src/shared/dataprovider/api/api/transactionLogs.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TransactionSummary } from 'src/shared/dataprovider/api/model/transactionSummary';
import { DatePipe } from '@angular/common';
import { formatDateUtc, getUserPermissionsAccess, getWeekBeforeDateRange } from 'src/shared/helpers/helper';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormGroup } from '@angular/forms'; 
import { ReceiptDialogComponent } from 'src/shared/components/modals/receipt-dialog/receipt-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TransactionSummaryData } from 'src/shared/dataprovider/api/model/transactionSummaryData';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientWalletDTO } from 'src/shared/dataprovider/api/model/clientWalletDTO';
import { ClientService, TransactionsService } from 'src/shared/dataprovider/api';
import { ActivatedRoute } from '@angular/router';
import { ClientWalletListDTO } from 'src/shared/dataprovider/api/model/clientWalletListDTO';
import { TranslateService } from '@ngx-translate/core';
import { ResendWebhookRequestDTO } from 'src/shared/dataprovider/api/model/resendWebhookRequestDTO';
import { CashoutDigipayWebhookRequestDTO } from 'src/shared/dataprovider/api/model/cashoutDigipayWebhookRequestDTO';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';
@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private obsCIResend! : Observable<any>;
  private subsCIResend! : Subscription;
  private obsCOResend! : Observable<any>;
  private subsCOResend! : Subscription;
  public transactionList!: TransactionSummary;
  public topData: Array<{ label: string; value: number }> = [];
  private transactionReport!: any;
  public clientId: number = 0; 
  public tableOption = TableOption;
  public transactionStatus = TransactionStatus;
  public transactionType =  [
    {id:0, name: "All"},
    {id: 1, name: "Cash-In"},
    {id: 2, name: "Cash-Out"},
  ];
  clients: ClientWalletDTO[] = [];
  dataSource!: MatTableDataSource<any>;
  public exportedData : any = [];
  DateRangeForm!: FormGroup;
  displayedColumns: string[] = ['TransactionNo', 'OrderNo','ReferenceNo','ReferenceUserId', 'Client', 'Type', 'Method', 'Merchant', 'Gross', 'TranFee', 'Net', 'createdDate', 'completedDate',  'Status', 'Receipt'];
  public isLoading: Boolean = false;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0];
  public selectedStatus: { id: number; name: string} | null = null;
  public selectedType: { id: number; name: string } | null = null;
  public clientsList: Array<{ id: number; name: string }> = [];
  public selectedClient: { id: number; name: string } | null = null;
  public statusEnum = [
    {id: 0, name: "All"},
    {id: 1, name: "Pending"},
    {id: 2, name: "Processing"},
    {id: 3, name: "Completed"},
    {id: 4, name: "Rejected"},
    {id: 5, name: "Closed"},
    {id: 6, name: "Reversed"},
    {id: 7, name: "Timeout"}
  ];
  public isReadAndWrite : boolean = false;
  language: string = "";
  constructor(
    private _transactionLogService: TransactionLogsService, 
    private _clientService: ClientService,
    private _datepipe: DatePipe, 
    private _fb: FormBuilder, 
    private _dialog:MatDialog,
    private notification: NotificationService,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private transactionService: TransactionsService,
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.DateRangeForm = _fb.group({
      startDate: getWeekBeforeDateRange(7).startDate,
      endDate: getWeekBeforeDateRange(7).endDate,
      status: 0,
      transactionType: 0,
      clientList: ['']

    });

    this.DateRangeForm.get("startDate")?.valueChanges.subscribe(() => {
      this.checkDateRangeChange();
    });

    this.DateRangeForm.get("endDate")?.valueChanges.subscribe(() => {
      this.checkDateRangeChange();
    });

    this.DateRangeForm.get("status")?.valueChanges.subscribe(() => {
      this.loadPage(1);
    });

  }


  ngOnInit(): void {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    //this.getAllTransactions(this.clientId, this.tableOption.PageLimit, this.currentPage,getWeekBeforeDateRange().startDate, getWeekBeforeDateRange().endDate );
    this.loadPage(this.currentPage);
    this.getAllClient();
  }

  checkDateRangeChange(): void {
    const startDate = this.DateRangeForm.get("startDate")?.value;
    const endDate = this.DateRangeForm.get("endDate")?.value;

    // ✅ Only trigger API call when both are filled
    if (startDate && endDate) {
      this.loadPage(1);
    }
  }


  onTransactionTypeChange(selectedType: {id: number, name: string}) {
    this.selectedType = selectedType;
    this.DateRangeForm.patchValue({
      transactionType: selectedType.id,
    })
    this.loadPage(1);
}

loadPage(page: number, keyword?: string): void {
  this.currentPage = page;
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);

  let formgroup = this.DateRangeForm;
  let _startDateObj; 
  let _endDateObj;
  let status: number = formgroup.get('status')?.value;
  let clientList: string = formgroup.get('clientList')?.value;
  let transactionType: number = formgroup.get('transactionType')?.value; // Get the selected transaction type

  const startDate = formgroup.get('startDate')?.value;
  const endDate = formgroup.get('endDate')?.value;
  if (startDate && endDate) {
    const convertedStartDate = this._datepipe.transform(startDate, 'yyyy-MM-dd');
    const convertedEndDate = this._datepipe.transform(endDate, 'yyyy-MM-dd');
    _startDateObj = new Date(convertedStartDate!);
    _endDateObj = new Date(convertedEndDate!);
  } else {
    const defaultDateRange = getWeekBeforeDateRange();
    _startDateObj = defaultDateRange.startDate;
    _endDateObj = defaultDateRange.endDate;
  }
  const searchKeyword = keyword ? keyword : this.selectedClient?.name || '';

  this.getAllTransactions(this.clientId, this.itemsPerPage, this.currentPage, _startDateObj, _endDateObj, status, searchKeyword, transactionType);
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

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage);
  }


  viewReceipt(data:any){
    const dialogRef = this._dialog.open(ReceiptDialogComponent, { data, width: '600px' });
        dialogRef.afterClosed().subscribe({
          next: (val) => {
            
          }
        });
  }

  getAllTransactions(
    clientId?: number,
    pageSize?: number,
    pageNumber?: number,
    startDate?: Date,
    endDate?: Date,
    status?: number,
    searchKeyword?: string,
    transactionType?: number

  ) {
    this.isLoading = true;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.observable = this._transactionLogService.apiTransactionLogsGetTransactionSummaryGet(
      clientId,
      pageSize,
      pageNumber,
      startDate,
      endDate,
      status,
      searchKeyword,
      transactionType
    );
  
    this.subscription = this.observable.subscribe({
      next: (response) => {
        let tableData: any = [];
        let total = response.Total || {};
        this.transactionList = response;
        this.transactionReport = response.Data;
        this.totalItems = response.TotalRecordCount;
        this.topData = [
          { label: 'totalCompleted', value: total.TotalSuccessfulTransaction || 0 },
          { label: 'totalFailed', value: total.TotalFailedTransaction || 0 },
          { label: 'totalClosed', value: total.TotalClosedTransaction || 0 },
          { label: 'totalCancelled', value: total.TotalCancelledTransaction || 0 },
        ];
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        tableData = response.Data.map((item: any) => ({
          Date: formatDateUtc(item?.VendorResponseTime?.toString()!, this._datepipe),
          TransactionNo: item.TransactionNo,
          OrderNumber: item.OrderNumber,
          ReferenceNo: item.ReferenceNumber,
          ReferenceUserId: item.ReferenceUserId,
          Client: item.ClientName,
          Type: item.Type,
          Method: item.PMethod,
          Merchant: item.MerchantName.replace("DPayDynastyPay", ""), 
          Gross: item.GrossAmount,
          TranFee: item.FixFee,
          Net: item.NetAmount,
          Status: item.Status,
          VendorResponseTime: item.VendorResponseTime,
          HolderName: item.HolderName,
          AccountNumber: item.AccountNumber,
          Id:item.Id
        }));
        this.exportedData = response.Data.map((item: TransactionSummaryData, index: number) => ({
          Id: startIndex + index + 1,
          Date: formatDateUtc(item?.VendorResponseTime!, this._datepipe),
          TransactionNo: item.TransactionNo,
          OrderNumber: item.OrderNumber,
          Client: item.ClientName,
          Type: item.Type,
          Method: item.PMethod,
          Merchant: item.MerchantName,
          Gross: item.GrossAmount,
          TranFee: item.FixFee,
          Net: item.NetAmount,
          Status: item.Status,
        }));
        this.dataSource = new MatTableDataSource<any>(tableData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
  

  exportToExcel() {
    if (this.isReadAndWrite) {
      const formgroup = this.DateRangeForm;
      const convertedStartDate = this._datepipe.transform(formgroup.get('startDate')?.value, 'yyyy-MM-dd');
      const convertedEndDate = this._datepipe.transform(formgroup.get('endDate')?.value, 'yyyy-MM-dd');
      let _status = formgroup.get('status')?.value;
      let _startDate = new Date(convertedStartDate!);
      let _endDate = new Date(convertedEndDate!);
  
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
  
      this.observable = this._transactionLogService.apiTransactionLogsExportTransactionLogCSVGet(undefined, _startDate, _endDate, _status);
  
      this.subscription = this.observable.subscribe({
        next: (response) => {
          const blob = new Blob([response], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `DPay_TransactionLogs_${formatDateUtc(_startDate.toString(), this._datepipe)}_${formatDateUtc(_endDate.toString(), this._datepipe)}.csv`;
  
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
  
          this.notification.showNotification("Transaction logs exported successfully", "close", "success");
        },
        error: (error: HttpErrorResponse) => {
          this.notification.showNotification("Error: " + error.message, "close", "error");
        },
      });
    } else {
      this.notification.showNotification("You don't have permission to download the transaction logs", "closed", "error");
    }
  }
  

  onSearch(query: string): void {
    this.loadPage(1, query);
  }


  getAllClient(): void {
    this._clientService.apiClientGetAllClientsGet().subscribe({
      next: (response: ClientWalletListDTO) => {
        if (response.Data) {
          this.clientsList = response.Data
            .filter(client => client.Id !== 1 && client.Id !== 2)
            .map(client => ({
              id: client.Id ?? 0,
              name: client.Name ?? 'Unknown'
            }));
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification(`Error: ${error.error}`, "closed", "error");
      }
    });
  }
  
  onClientChange(selectedClient: { id: number; name: string }): void {
    this.selectedClient = selectedClient;
  
    // Pass the selected client ID as part of the keyword when loading the page
    this.loadPage(1, `${selectedClient.name}`);
  }

  onSelectStatus(selectedStatus: { id: number, name: string }) {
    this.selectedStatus = selectedStatus;
    this.DateRangeForm.patchValue({
      status: selectedStatus.id, // Directly update the form's status field
    });
    this.loadPage(1); // No need to pass status as keyword
  }

  onResendWebhook(transactionNo:string, type:string){
    console.log(type);
   if(type == 'Cash-In'){
    this.cashInWebhook(transactionNo);
   }else if( type == 'Cash-Out'){
    this.cashOutWebhook(transactionNo);
   }
  }

  cashInWebhook(transactionNo:string){
    let payload : ResendWebhookRequestDTO = {TransactionNumbers:[]};
    payload.TransactionNumbers?.push(transactionNo);
     this.obsCIResend = this.transactionService.resendWebHook(payload);
     this.subsCIResend = this.obsCIResend.subscribe({
      next:(res:any)=>{
        if(res){
          this.notification.showNotification("Successfull resend webhook!","Close","success");
        }
      },
      error:(err : HttpErrorResponse)=>{
        this.notification.showNotification("Problem resending webhook! " + err.message,"Close","error");
      }
     })
  }

  cashOutWebhook(transactionNo:string){
     this.obsCOResend = this.transactionService.CashoutSendCallbackToClient(transactionNo);
     this.subsCOResend = this.obsCOResend.subscribe({
      next:(res:any)=>{
        if(res){
          this.notification.showNotification("Callback was send successfully","Close","success");
        }
      },
      error:(err : HttpErrorResponse)=>{
        this.notification.showNotification("Problem resending Callback! " + err.message,"Close","error");
      }
     })
  }
  
}
