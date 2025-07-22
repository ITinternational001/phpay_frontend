import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { ClientService, MerchantDTO, MerchantsService } from 'src/shared/dataprovider/api';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { WithdrawalsReport } from 'src/shared/dataprovider/api/model/withdrawalsReport';
import { TransferMethod, TableOption } from 'src/shared/dataprovider/local/data/common';
import { getWeekBeforeDateRange, convertToISO, formatDateUtc, DecimalPipeConverter, getCurrentUserClientId, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { generateReport } from 'src/shared/helpers/reportHelper';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { NotificationService } from '../../modals/notification/notification.service';
import { DropDownData } from 'src/shared/dataprovider/local/interface/commonInterface';
import { ClientWalletDTO } from 'src/shared/dataprovider/api/model/clientWalletDTO';
import { MatSelectChange } from '@angular/material/select';
import { WithdrawalHistoryReportRequestDTO } from 'src/shared/dataprovider/api/model/withdrawalHistoryReportRequestDTO';
import { ActivatedRoute } from '@angular/router';
import { ClientWalletListDTO } from 'src/shared/dataprovider/api/model/clientWalletListDTO';
import { MerchantsListDTO } from 'src/shared/dataprovider/api/model/merchantsListDTO';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-common-remittance-report',
  templateUrl: './remittance-report.component.html',
  styleUrls: ['./remittance-report.component.scss']
})
export class RemittanceReportComponent implements OnInit {
  @Input() isAdmin: boolean = false;
  @Input() clientId?: number;
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private obsMerchant!: Observable<any>;
  private subsMerchant!: Subscription;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  WithdrawalsForm: FormGroup;
  displayedColumns: string[] = [
    'Type', 
    'Requested',
    'RemittanceId',
    'Requestee',
    'Client', 
    'Method',  
    'BankDetails',
    'Source',
    'ReferenceNo', 
    'RequestedAmount', 
    'WFee' , 
    'onTopFee' , 
    'AtCostFee',
    'NetAmount',  
    'Released', 
    'ApproveBy',
    'Status'];
  
  public methods = [
    {id: 0, name: "All"},
    {id: 1, name: "BANK"},
    {id: 2, name: "USDT-BINANCE"},
    {id: 3, name: "CASH PICK-UP"},
  ];
  public merchantsList!: Array<MerchantDTO>;
  public selectedMerchantPaymentChannels!: any;
  public tableData!: Array<RemittanceData>;
  public isNoData: boolean = true;
  public isMethodEnabled: boolean = true;
  public reportType: number = 4;
  public isDownloadEnabled: boolean = false;
  public remittanceReportData: any;
  public isLoading: boolean = false;
  public tableOption = TableOption;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0];
  public totalData: any[] = [
    { label: 'totalGrossAmount', value: 0, img: './assets/icons/transaction-30.png' },
    { label: 'totalTransactionFee', value: 0, img: './assets/icons/fee.png' },
    { label: 'totalNetAmount', value: 0, img: './assets/icons/money-30.png' },
  ];

  public incomeTotals: any[] = [
    { label: 'bankTransfer', value: 0, img: './assets/icons/bank-transfer-30.png' },
    { label: 'usdt', value: 0, img: './assets/icons/usdt-30.png' },
    { label: 'cashPickUp', value: 0, img: './assets/icons/cash-pickup-30.png' },
  ];

  private defaultDateRange = getWeekBeforeDateRange(7);
  public clients: Array<{id: number; name: string}> = [];
  public isReadAndWrite : boolean = false;
  constructor(
    private _fb: FormBuilder, 
    private _merchantService: MerchantsService,
    private _clientService: ClientService,
     private _reportService: ReportsService, 
     private _datepipe: DatePipe, 
     private _decimalpipe: DecimalPipe,
     private notification: NotificationService,
     private route: ActivatedRoute,) {
    this.WithdrawalsForm = this._fb.group({
      ClientId: getCurrentUserClientId(),
      Method: 0,
      StartDate: this.defaultDateRange.startDate,
      EndDate: this.defaultDateRange.endDate,
    })

    this.setupFormValueChanges();
  }

  setupFormValueChanges() {
    this.WithdrawalsForm.valueChanges.subscribe(() => {
      let formData = this.WithdrawalsForm.getRawValue();

      if (formData.StartDate) {
        const convertedStartDate = this._datepipe.transform(formData.StartDate, 'yyyy-MM-dd');
        formData.StartDate = new Date(convertedStartDate!);
      }
      if (formData.EndDate) {
        const convertedEndDate = this._datepipe.transform(formData.EndDate, 'yyyy-MM-dd');
        formData.EndDate = new Date(convertedEndDate!);
      }
      this.loadPage(1, formData);
    });
  }

  ngOnInit() {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
        const excludedColumnsForClients = ['onTopFee', 'AtCostFee', 'ApproveBy'];
        if (this.isAdmin) {
          this.WithdrawalsForm.patchValue({ ClientId: 0 });
        } else {
          this.displayedColumns = this.displayedColumns.filter(column => !excludedColumnsForClients.includes(column));
        }
    this.getPaymentChannels();
    this.getMerchantByClientId();
    this.getListOfClients();
    this.loadPage(1, this.WithdrawalsForm.getRawValue());
  }


  loadPage(page: number, data?: any, keyword?: string): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;

    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);


    this.getRemittanceReport(data, keyword);
  }

  onFirstPage(): void {
    this.loadPage(1, this.WithdrawalsForm.getRawValue());
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, this.WithdrawalsForm.getRawValue());
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1, this.WithdrawalsForm.getRawValue());
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), this.WithdrawalsForm.getRawValue());
  }

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage, this.WithdrawalsForm.getRawValue());
  }

  onSearch(query: string): void {

    this.loadPage(1, this.WithdrawalsForm.getRawValue(), query);
  }

  getListOfClients(): void {
    this._clientService.apiClientGetAllClientsGet().subscribe({
      next: (response: ClientWalletListDTO) => {
        if(response.Data != null)
          {
            this.clients = response.Data
            .filter(client => client.Id !== 1 && client.Id !== 2) 
            .map(client => ({
              id: client.Id ?? 0,
              name: client.Name ?? 'Unknown'
            }));
          }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification('Error:'+ error.error, "closed", "error");
      }
    });
  }
  
  onClientChange(selectedClient: { id: number; name: string }): void {
    // const selectedClient = event.value; 
    this.WithdrawalsForm.patchValue({
      ClientId: selectedClient.id
    });
   
  }

  onMethodSelect(selectedMethod: {id: number, name: string}){
    this.WithdrawalsForm.patchValue({
      Method: selectedMethod.id

    });

  }
  

  getMerchantByClientId() {
    this.obsMerchant = this._merchantService.apiMerchantsGetMerchantsByClientIdGet(this.clientId);
    this.subsMerchant = this.obsMerchant.subscribe({
      next: (response: MerchantsListDTO) => {
        if(response.Data != null){
          this.merchantsList = response.Data.map((item: MerchantDTO) => ({
            Id: item.Id,
            Name: item.Name?.replace("DPayDynastyPay ", ""),
          }));
        }
      }
    })
  }
  

  getPaymentChannels() {
    const formGroup = this.WithdrawalsForm;

    let hasNullEmptyValue = false;

    formGroup.get('MerchantID')?.valueChanges.subscribe(merchantId => {
  
      const selectedMerchant = this.merchantsList.find(merchant => merchant.Id === merchantId)?.PaymentChannel;
      this.selectedMerchantPaymentChannels = selectedMerchant ? [selectedMerchant] : '';
      
      this.isMethodEnabled = !!this.selectedMerchantPaymentChannels; 

  
      if (this.isMethodEnabled) {
        formGroup.get('Method')?.enable(); 
      } else {
        formGroup.get('Method')?.disable(); 
      }
    });


    Object.values(formGroup.controls).forEach(control => {
      if (control.value === null || control.value === '') {
        hasNullEmptyValue = true;
      }
    });

    if (!hasNullEmptyValue) {
      this.getRemittanceReport(this.WithdrawalsForm.getRawValue());
    }
  }

  getRemittanceReport(data?: any, keyword?: string) {
    this.isLoading = true;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  
    // Convert dates to ISO format
    data.StartDate = convertToISO(new Date(data.StartDate));
    data.EndDate = convertToISO(new Date(data.EndDate));
  
    const pageSize = this.itemsPerPage;
    const pageNumber = this.currentPage;
  
    // Call the API
    this.observable = this._reportService.apiReportsGetWithdrawalsReportPost(data, this.itemsPerPage, this.currentPage, keyword);
    this.subscription = this.observable.subscribe({
      next: (response: WithdrawalsReport) => {
        this.remittanceReportData = response;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        this.totalItems = response.TotalRecordCount!;
  
        if (response.Data != null && response.Data.length > 0) {
          this.tableData = response.Data.map((item) => {
            const WFeeFixed = (item?.FeeACFixed ?? 0) + (item?.FeeOTFixed ?? 0);
            const NetAmount = (item?.RequestedAmount ?? 0) + WFeeFixed;
  
            return {
              TransactionCount: item?.TransactionCount,
              ClientName: item?.ClientName,
              Type: item?.Type,
              Method: item?.Method,
              AtCostFee: item?.FeeACFixed,
              OnTopFee: item?.FeeOTFixed,
              DateRequested: formatDateUtc(item?.DateRequested?.toString() ?? '', this._datepipe),
              Requestee: item?.Requestee,
              ReferenceNumber: item?.ReferenceNumber,
              TotalGrossAmount: response.TotalGrossAmount, 
              NetAmount: NetAmount, 
              Status: item?.Status,
              ApproverName: item?.ApproverName,
              CardBankName: item?.CardBankName,
              CardAccountName: item?.CardAccountName,
              CardAccountNumber: item?.CardAccountNumber,
              MotherCardBankName: item?.MotherCardBankName,
              MotherCardAccountName: item?.MotherCardAccountName,
              MotherCardAccountNumber: item?.MotherCardAccountNumber,
              WFeeFixed: WFeeFixed, 
              WFeePercent: (item?.FeeACPercent ?? 0) + (item?.FeeOTPercent ?? 0),
              RemittanceId: item?.RemittanceId,
              DateRemitted: item?.DateRemitted,
              RequestedAmount: item?.RequestedAmount,
            };
          });
  
          this.dataSource = new MatTableDataSource(this.tableData);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.isNoData = false;
          this.reportType = this.WithdrawalsForm.get('TypeEnum')?.value;
          this.isDownloadEnabled = true;
  
          // Accessing top-level totals from WithdrawalsReport
          this.totalData[0].value = DecimalPipeConverter(response.TotalGrossAmount!, this._decimalpipe);
          this.totalData[1].value = DecimalPipeConverter(response.TotalOnTopFee! + response.TotalAtCostFee!, this._decimalpipe);
          this.totalData[2].value = DecimalPipeConverter(response.TotalNetAmount!, this._decimalpipe);
          this.incomeTotals[0].value = DecimalPipeConverter(response?.TotalBank!, this._decimalpipe);
          this.incomeTotals[1].value = DecimalPipeConverter(response?.TotalUsdt!, this._decimalpipe);
          this.incomeTotals[2].value = DecimalPipeConverter(response?.TotalCashPickup!, this._decimalpipe);
        } else {
          this.tableData = [];
          this.dataSource = new MatTableDataSource(this.tableData);
          this.isNoData = true;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", "error")
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onDownloadExcel() {
    if (this.isReadAndWrite) {
      this.isLoading = true;
  
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
  
      let formGroup = this.WithdrawalsForm.getRawValue();
      let _startDate = formGroup.StartDate;
      let _endDate = formGroup.EndDate;
  
      const convertedStartDate = this._datepipe.transform(_startDate, 'yyyy-MM-dd');
      const convertedEndDate = this._datepipe.transform(_endDate, 'yyyy-MM-dd');
  
      formGroup.StartDate = new Date(convertedStartDate!);
      formGroup.EndDate = new Date(convertedEndDate!);
  
      this.observable = this._reportService.apiReportsGetWithdrawalsReportPost(formGroup, undefined, undefined, undefined, true);
  
      this.subscription = this.observable.subscribe({
        next: (response) => {
          if (response) {
            // Create a new Blob object using the response data
            const blob = new Blob([response], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `DPay_Withdrawals_Report_${formatDateUtc(_startDate.toString(), this._datepipe)}_${formatDateUtc(_endDate.toString(), this._datepipe)}.csv`;
  
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
  
            this.notification.showNotification("Withdrawals report downloaded successfully", "close", "success");
          } else {
            this.notification.showNotification("No data available for the selected dates", "close", "error");
          }
        },
        error: (error: HttpErrorResponse) => {
          this.notification.showNotification("Error: " + error.message, "close", "error");
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    } else {
      this.notification.showNotification("You don't have permission to download the withdrawals report", "close", "error");
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  openForm() {
    // Implement the logic to open the form here
    console.log('Open form method called');
  }

  wrapReferenceNumber(referenceNumber: string): string[] {
    if (!referenceNumber) return [];
    // Split the string into chunks of 15 characters
    return referenceNumber.match(/.{1,25}/g) || [];
  }
}

export interface RemittanceData {
  Type?: string;
  DateRequested?: String;
  // TransactionNo?: string;
  UserID?: string;
  Requestee?: string;
  ClientName?: string;
  WalletSource?: string;
  Method?: string;
  DateReleased?: String;
  ReferenceNumber?: string;
  TotalGrossAmount?: number;
  WFeePercent?: number;
  WFeeFixed?: number;
  NetAmount?: number;
  Status?: string;
}