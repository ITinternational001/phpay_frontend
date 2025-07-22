import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { TransactionLogsService } from 'src/shared/dataprovider/api/api/transactionLogs.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TransactionSummary } from 'src/shared/dataprovider/api/model/transactionSummary';
import { TableOption, TopCardData, TotalNumberOfDataPerTable, TransactionStatus, TransactionTopData, TransactionType, transactionsData } from 'src/shared/dataprovider/local/data/common';
import { TransactionSummaryData } from 'src/shared/dataprovider/api/model/transactionSummaryData';
import { convertToFormattedDate, formatDateUtc, getUserPermissionsAccess, getWeekBeforeDateRange } from 'src/shared/helpers/helper';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ReceiptDialogComponent } from 'src/shared/components/modals/receipt-dialog/receipt-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-transactions',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  public transactionList!: TransactionSummary;
  private clientId: number = parseInt(SessionManager.getFromToken("ClientId"));;
  public tableOption = TableOption;
  public transactionType = TransactionType;
  @Input() data!: TransactionSummary;
  dataSource!: MatTableDataSource<any>;
  DateRangeForm!: FormGroup; 
  displayedColumns: string[] = ['Id', 'Date', 'TransactionNo', 'ReferenceNo', 'ReferenceUserId',  'Client',  'Type',  'Method', 'Merchant', 'Gross',  'TranFee',  'Net',   'Status',  'Receipt'];
  public isReadAndWrite:boolean = false;
  public topData = TransactionTopData;
  public transactionStatus = TransactionStatus;
  public totalDataCount = 0;
  public isLoading: Boolean = false;
  public exportedData : any = [];
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0];
  public defaultDateRange = getWeekBeforeDateRange(7);
  constructor(private _transactionLogService: TransactionLogsService, private _fb: FormBuilder, 
    private _datepipe: DatePipe, private _dialog:MatDialog, private _notification:NotificationService,
    private route: ActivatedRoute) {
    this.DateRangeForm = _fb.group({
      startDate: this.defaultDateRange.startDate,
      endDate: this.defaultDateRange.endDate,
      status: 0,
      transactionType: 0,
    });


    this.DateRangeForm.get("endDate")?.valueChanges.subscribe(() => {
      this.loadPage(1);
    });

    this.DateRangeForm.get("status")?.valueChanges.subscribe(()=>{
      this.loadPage(1);
    });

    this.DateRangeForm.get('transactionType')?.valueChanges.subscribe(()=>{
      this.loadPage(1);
    })
  }

  ngOnInit(): void {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    if (sessionStorage.getItem('clientId') != null) {
      this.clientId = parseInt(sessionStorage.getItem('clientId') as string);
      this.loadPage(this.currentPage);
    }
  }

  loadPage(page: number, keyword?:string): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);

    let formgroup = this.DateRangeForm;
    let _startDateObj; let _endDateObj;
    let status: number = formgroup.get('status')?.value;
    let transactionType: number = formgroup.get('transactionType')?.value;

    const startDate = formgroup.get('startDate')?.value;
    const endDate = formgroup.get('endDate')?.value;
    if (formgroup.get('startDate')?.value && formgroup.get('endDate')?.value) {
      const convertedStartDate = this._datepipe.transform(formgroup.get('startDate')?.value, 'yyyy-MM-dd');
      const convertedEndDate = this._datepipe.transform(formgroup.get('endDate')?.value, 'yyyy-MM-dd');
      _startDateObj = new Date(convertedStartDate!);
      _endDateObj = new Date(convertedEndDate!);
    } else {
      const convertedStartDate = this._datepipe.transform(this.defaultDateRange.startDate, 'yyyy-MM-dd');
      const convertedEndDate = this._datepipe.transform(this.defaultDateRange.endDate, 'yyyy-MM-dd');
      _startDateObj = new Date(convertedStartDate!);
      _endDateObj = new Date(convertedEndDate!);
    }

    // Load data for the selected page here
    this.getAllTransactions(this.clientId, this.itemsPerPage, this.currentPage, _startDateObj, _endDateObj, status, keyword, transactionType );
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

  getAllTransactions(clientId?: number, pageSize?: number, pageNumber?: number, startDate?: Date, endDate?: Date, status?: number, searchKeyword?:string,
    transactionType?: number) {
    this.isLoading = true;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.observable = this._transactionLogService.apiTransactionLogsGetTransactionSummaryGet(clientId, this.itemsPerPage, this.currentPage, startDate, endDate, status, searchKeyword, transactionType);
    this.subscription = this.observable.subscribe({
      next: (response: TransactionSummary) => {
        let tableData: any = [];
        this.topData.data[0].value = response.Total?.NetTotalCashin!;
        this.topData.data[1].value = response.Total?.NetTotalCashout!;
        this.topData.data[2].value = response.Total?.NetTotalWithdrawal!;
        this.topData.count[0].value = response.Total?.TotalSuccessfulTransaction!;
        this.topData.count[1].value = response.Total?.TotalFailedTransaction!;
        this.topData.count[2].value = response.Total?.TotalClosedTransaction!;
        this.topData.count[3].value = response.Total?.TotalCancelledTransaction!;
          
        if(response.Data?.length! > 0){
          this.transactionList = response;
          this.totalDataCount = response.TotalRecordCount!;
          this.totalItems = response.TotalRecordCount!;
          
          const startIndex = (this.currentPage - 1) * this.itemsPerPage;
           tableData = response.Data?.map((item: TransactionSummaryData, index) => ({
            Id : startIndex + index + 1, 
            Date:  formatDateUtc(item?.VendorResponseTime!, this._datepipe),
            TransactionNo: item.TransactionNo,
            ReferenceNo : item.ReferenceNumber,
            Client: item.ClientName,
            Type: item.Type,
            Method: item.PMethod,
            Merchant: item.MerchantName,
            Gross: item.GrossAmount,
            TranFee: item.FixFee,
            Net: item.NetAmount,
            Status: item.Status,
            VendorResponseTime: item.VendorResponseTime,
            ReferenceUserId : item.ReferenceUserId,
            HolderName : item.HolderName,
            AccountNumber : item.AccountNumber
          }));
          this.exportedData = response.Data?.map((item: TransactionSummaryData, index) => ({
            Id : index + 1, 
            Date:  formatDateUtc(item?.VendorResponseTime!, this._datepipe),
            TransactionNo: item.TransactionNo,
            Client: item.ClientName,
            Type: item.Type,
            Method: item.PMethod,
            Merchant: item.MerchantName,
            Gross: item.GrossAmount,
            TranFee: item.FixFee,
            Net: item.NetAmount,
            Status: item.Status,
          }));
          // Assign the table data to dataSource
          this.dataSource = new MatTableDataSource<any>(tableData);
          //this.dataSource.paginator = this.paginator;
          //this.dataSource.sort = this.sort;
          this.isLoading = false;
        }else{
          this.dataSource = new MatTableDataSource<any>(tableData);
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {
        console.log(this.isLoading);
       this.isLoading = false; 
      }
    });
  }

  exportToExcel(){
    if (!this.isReadAndWrite) {
      this._notification.showNotification("You don't have permission to download the data", 'close', 'error');
      return; // Exit if no permission
    }
    const formgroup = this.DateRangeForm;
    const convertedStartDate = this._datepipe.transform(formgroup.get('startDate')?.value, 'yyyy-MM-dd');
    const convertedEndDate = this._datepipe.transform(formgroup.get('endDate')?.value, 'yyyy-MM-dd');
    let _status = formgroup.get('status')?.value;
     let _startDate = new Date(convertedStartDate!);
    let  _endDate = new Date(convertedEndDate!);
    if(this.subscription){
      this.subscription.unsubscribe();
    }
    console.log(this.DateRangeForm.value);
    this.observable = this._transactionLogService.apiTransactionLogsExportTransactionLogCSVGet(this.clientId, _startDate, _endDate, _status);
    this.subscription = this.observable.subscribe({
      next:(response)=>{
      // Create a new Blob object using the response data
      const blob = new Blob([response], { type: 'text/csv' });
      // Create a link element
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DPay_TransactionLogs_${formatDateUtc(_startDate.toString(), this._datepipe)}_${formatDateUtc(_endDate.toString(), this._datepipe)}.csv`;
      document.body.appendChild(a);
      a.click();
      // Remove the link from the document
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      },
      error:(error:HttpErrorResponse)=>{
        this._notification.showNotification("Error:" + error.error, "close", "error");
      }
    })
  }

  onSearch(query: string): void {
    // Handle the search query, e.g., make an API call or filter data
    this.loadPage(1, query);
  }

}
