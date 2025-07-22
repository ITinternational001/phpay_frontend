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
import { ReportSummaryRequestDTO } from 'src/shared/dataprovider/api/model/reportSummaryRequestDTO';
import { SummaryReport } from 'src/shared/dataprovider/api/model/summaryReport';
import { TransactionType, TableOption, TransactionStatus } from 'src/shared/dataprovider/local/data/common';
import { DropDownData } from 'src/shared/dataprovider/local/interface/commonInterface';
import { getWeekBeforeDateRange, convertToISO, formatDateUtc, getStatusName, DecimalPipeConverter, getCurrentUserClientId, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { NotificationService } from '../../modals/notification/notification.service';
import { ActivatedRoute } from '@angular/router';
import { ClientWalletListDTO } from 'src/shared/dataprovider/api/model/clientWalletListDTO';
import { MerchantsListDTO } from 'src/shared/dataprovider/api/model/merchantsListDTO';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-common-summary-report',
  templateUrl: './summary-report.component.html',
  styleUrls: ['./summary-report.component.scss']
})
export class SummaryReportComponent implements OnInit {
  @Input() isAdmin: boolean = false;
  @Input() clientId: number = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private obsMerchant!: Observable<any>;
  private subsMerchant!: Subscription;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private obsClient!: Observable<any>;
  private subsClient!: Subscription;
  private downloadObs!: Observable<any>;
  private downloadSubs!: Subscription;
  SummaryReportForm: FormGroup;
  displayedColumns: string[] = ['Id', 'Date', 'TransactionNo', 'UserID', 'Client', 'Type', 'Merchant', 'Channel', 'Gross', 'CIFee', 'CIFixFee', 'Net', 'Status'];
  // public transactionType = TransactionType;
  public transactionType = [
    {id:0, name: "All"},
    {id: 1, name: "Cash-In"},
    {id: 2, name: "Cash-Out"},
  ];
  public merchantsList!: Array<MerchantDTO>;
  public PaymentChannels:  Array<{id: number; name: string}> = [];
  public merchants: Array<DropDownData> = [];
  public clients: Array<{id: number; name: string}> = [];
  public tableData!: Array<SummaryReportData>;
  public isNoData: boolean = true;
  public isMethodEnabled: boolean = true;
  public reportType: number = 4;
  public isDownloadEnabled: boolean = false;
  public dataSource!: MatTableDataSource<any>;
  public reportSummaryData: any;
  public isLoading: Boolean = false;
  public tableOption = TableOption;
  public totalData: any[] = [
    { label: 'totalGrossAmount', value: 0, img: './assets/icons/transaction-30.png' },
    { label: 'totalTransactionFee', value: 0, img: './assets/icons/fee.png' },
    { label: 'totalNetAmount', value: 0, img: './assets/icons/money-30.png' },
  ];

  public channels: any[] = [
    { name: 'Gcash', value: 0, img: './assets/icons/gcash-30.png' },
    { name: 'Maya', value: 0, img: './assets/icons/maya-30.png' },
    { name: 'Insta Pay', value: 0, img: './assets/icons/instapay-30.png' },
    { name: 'QRPH', value: 0, img: './assets/icons/instapay-30.png' },
  ];
  private defaultDateRange = getWeekBeforeDateRange(7);
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0];
  public isReadAndWrite : boolean = false;
  language: string = "";
  constructor(private _fb: FormBuilder, private _merchantService: MerchantsService,
    private _reportService: ReportsService, private _datepipe: DatePipe,
    private _clientService: ClientService, private _decimalpipe: DecimalPipe,
    private notification: NotificationService, private route: ActivatedRoute,
    private translateService: TranslateService) {
      this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);
    this.SummaryReportForm = this._fb.group({
      ClientId: 0,
      TypeEnum: 0,
      PaymentChannelId: 0,
      StartDate: this.defaultDateRange.startDate,
      EndDate: this.defaultDateRange.endDate,
      Status: 3
    });
    this.setupFormValueChanges();
  }

  setupFormValueChanges() {
    this.SummaryReportForm.valueChanges.subscribe(() => {
      let formData = this.SummaryReportForm.getRawValue();

      // Convert StartDate and EndDate to UTC if they are not null
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
    if (!this.isAdmin) {
      this.SummaryReportForm.patchValue({ ClientId: this.clientId });
      this.getMerchantByClientId(this.clientId);
    }
    this.getAllClients();

    this.loadPage(1, this.SummaryReportForm.value);

  }

  loadPage(page: number, data?: any, search?: string): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    // Determine if it's the last page
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);
    // Load data for the selected page here
    this.getSummaryReport(data, search);
  }

  onFirstPage(): void {
    this.loadPage(1, this.SummaryReportForm.getRawValue());
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, this.SummaryReportForm.getRawValue());
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1, this.SummaryReportForm.getRawValue());
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), this.SummaryReportForm.getRawValue());
  }

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage, this.SummaryReportForm.getRawValue());
  }



  getSummaryReport(data?: any, search?: string, generateCsv?: boolean) {
    this.isLoading = true;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.observable = this._reportService.apiReportsGetSummaryReportPost(data, this.itemsPerPage, this.currentPage, search, generateCsv);
    this.subscription = this.observable.subscribe({
      next: (response: SummaryReport) => {
        if (response != null) {
          if (response.Data != null && response.Data.length > 0) {
            this.tableData = [];
            this.totalItems = response.TotalRecordCount!;
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            this.tableData = response.Data.map((item, index) => ({
              Id: startIndex + index + 1,
              Date: formatDateUtc(item?.VendorResponseTime !== undefined ? item?.VendorResponseTime.toString() : '', this._datepipe),
              TransactionNo: item?.InternalTransactionNumber,
              UserID: item?.UserID,
              Client: item?.ClientName,
              Type: item?.Type,
              Merchant: "DynastyPay",
              Method: item?.PMethod,
              GrossAmount: item?.GrossAmount,
              CIFee: item?.FeesPercent,
              CIFixed: item?.FixFee,
              NetAmount: item?.NetAmount,
              Status: getStatusName(item?.Status!, TransactionStatus)
            }));
            this.isNoData = false;
            this.isDownloadEnabled = true;
            this.dataSource = new MatTableDataSource(this.tableData);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;

          } else {
            this.tableData = [];
            this.dataSource = new MatTableDataSource(this.tableData);;
            this.isNoData = true;
          }
          this.reportType = this.SummaryReportForm.get('TypeEnum')?.value;
          this.totalData[0].value = DecimalPipeConverter(response.TotalGrossAmount!, this._decimalpipe);
          this.totalData[1].value = DecimalPipeConverter(response.TotalOnTopFee!, this._decimalpipe);
          this.totalData[2].value = DecimalPipeConverter(response.TotalNetAmount!, this._decimalpipe);
          // this.channels[0].value = DecimalPipeConverter(response.TotalGcash!, this._decimalpipe);
          // this.channels[1].value = DecimalPipeConverter(response.TotalMaya!, this._decimalpipe);
          this.channels[2].value = DecimalPipeConverter(response.TotalInstaPay!, this._decimalpipe);
          this.channels[3].value = DecimalPipeConverter(response.TotalQRPH!, this._decimalpipe);

        } else {
          this.isNoData = true;
        }


      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {
        this.isLoading = false;
      }
    })
  }

  onSearch(query: string): void {
    this.loadPage(1, this.SummaryReportForm.getRawValue(), query);
  }

  onDownloadExcel() {
    if (this.isReadAndWrite) {
      this.isLoading = true;
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
      const formGroup = this.SummaryReportForm.getRawValue();
      const _startDate = formGroup.StartDate;
      const _endDate = formGroup.EndDate;
      const convertedStartDate = this._datepipe.transform(_startDate, 'yyyy-MM-dd');
      const convertedEndDate = this._datepipe.transform(_endDate, 'yyyy-MM-dd');
      formGroup.StartDate = new Date(convertedStartDate!);
      formGroup.EndDate = new Date(convertedEndDate!);
      this.observable = this._reportService.apiReportsGetSummaryReportPost(formGroup, undefined, undefined, undefined, true);
      this.subscription = this.observable.subscribe({
        next: (response) => {
          if (response) {
            const blob = new Blob([response], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `DPay_Summary_Report_${formatDateUtc(_startDate.toString(), this._datepipe)}_${formatDateUtc(_endDate.toString(), this._datepipe)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            this.notification.showNotification("Summary report downloaded successfully", "close", "success");
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
      this.notification.showNotification("You don't have permission to download the summary report", "close", "error");
    }
  }
  
  

    getAllClients() {
      if (this.subsClient) {
        this.subsClient.unsubscribe();
      }
      this.obsClient = this._clientService.apiClientGetAllClientsGet();
      this.subsClient = this.obsClient.subscribe({
        next: (response: ClientWalletListDTO) => {
          const clients = response.Data || [];
          this.clients = clients
              .filter((item) => item.Id !== 1 && item.Id !== 2) 
              .map((item) => ({
                  id: item.Id ?? 0, 
                  name: item.Name ?? 'Unknown', 
              }));
        },
        error: (error: HttpErrorResponse) => {
          this.notification.showNotification("Error: " + error.error, "close", "error");
        }
      });
      this.clients.unshift({ id: 0, name: "All" });
    }
    
    onClientChange(selectedClient: { id: number; name: string }) {
      this.SummaryReportForm.patchValue({
        ClientId: selectedClient.id, 
      });
      this.getMerchantByClientId(selectedClient.id);
    }
    

    getMerchantByClientId(clientId: number) {
      if (this.subsMerchant) {
        this.subsMerchant.unsubscribe();
      }

      this.obsMerchant = this._merchantService.apiMerchantsGetMerchantsByClientIdGet(clientId);
      this.subsMerchant = this.obsMerchant.subscribe({
        next: (response: MerchantsListDTO) => {
          this.merchantsList = response.Data || [];
          const vendorIdTracker: { [key: number]: boolean } = {};
          this.PaymentChannels = [];

          this.merchantsList.map((item: MerchantDTO) => {
            const vendorId = item.Vendor?.Id;
            const channelId = item.PaymentChannel?.Id;
            const channelName = item.PaymentChannel?.Name ?? ''; 

            if (vendorId !== undefined && !vendorIdTracker[vendorId]) {
              vendorIdTracker[vendorId] = true;
              this.merchants.push({
                Id: item.Vendor?.Id ?? 0, 
                Name: "DynastyPay" + (item.Vendor?.Id ?? 0),
              });
            }

            const channelExists = this.PaymentChannels.some(channel => channel.name === channelName); 
            if (!channelExists) {
              this.PaymentChannels.push({ id: channelId ?? 0, name: channelName }); 
            }
          });

          this.PaymentChannels.unshift({ id: 0, name: "All" });
          this.merchants.unshift({ Id: 0, Name: "All" });
          if (this.merchants.length > 0) {
            const firstMerchant = this.merchants[0]; 
            this.onMethodSelect({
              id: firstMerchant.Id || 0, 
              name: firstMerchant.Name || '', 
            });
          }
        }
      });
    }

getPaymentChannels() {
  const formGroup = this.SummaryReportForm;
  let hasNullEmptyValue = false;
  formGroup.get('VendorId')?.valueChanges.subscribe(vendorId => {
    this.PaymentChannels = [];
    this.merchantsList.map((item) => {
      if (vendorId === item.Vendor?.Id) {
        const channelId = item.PaymentChannel?.Id ?? 0; 
        const channelName = item.PaymentChannel?.Name ?? ''; 
        this.PaymentChannels.push({
          id: channelId,
          name: channelName, 
        });
      }
    });

    if (vendorId === 0) {
      this.PaymentChannels.push({ id: 0, name: "All" });
    }
  });
}

onMethodSelect(selectedMethod: { id: number; name: string }) {
  this.SummaryReportForm.patchValue({
    PaymentChannelId: selectedMethod.id, 
  });
}

onTransactionType(selectedType: { id: number; name: string }){
  this.SummaryReportForm.patchValue({
    TypeEnum: selectedType.id
  });
}

}

export interface SummaryReportData {
  Date?: String;
  TransactionNo?: string;
  UserID?: string;
  Client?: string;
  Type?: string;
  Merchant?: string;
  Method?: string;
  GrossAmount?: number;
  CIFee?: number;
  CIFixed?: number;
  NetAmount?: number;
  Status?: string;
}
