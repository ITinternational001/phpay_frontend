import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, INJECTOR, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { MerchantDTO, MerchantsService, ClientService } from 'src/shared/dataprovider/api';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { IncomeReport } from 'src/shared/dataprovider/api/model/incomeReport';
import { TransactionType, TableOption } from 'src/shared/dataprovider/local/data/common';
import { DropDownData } from 'src/shared/dataprovider/local/interface/commonInterface';
import { getWeekBeforeDateRange, convertToISO, formatDateUtc, DecimalPipeConverter, getCurrentUserClientId, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { generateReport } from 'src/shared/helpers/reportHelper';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { NotificationService } from '../../modals/notification/notification.service';
import { ActivatedRoute } from '@angular/router';
import { ClientWalletListDTO } from 'src/shared/dataprovider/api/model/clientWalletListDTO';
import { MerchantsListDTO } from 'src/shared/dataprovider/api/model/merchantsListDTO';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-common-income-report',
  templateUrl: './income-report.component.html',
  styleUrls: ['./income-report.component.scss']
})
export class IncomeReportComponent implements OnInit{
@Input() isAdmin :boolean = false;
@Input() clientId?: number;
dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private obsMerchant!: Observable<any>;
  private subsMerchant!: Subscription;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private obsClient!:Observable<any>;
  private subsClient!:Subscription;
  IncomeReportForm: FormGroup;
  displayedColumns: string[] = ['Date', 'Day','CICount', 'CIGross', 'CIFeeOT', 'CINet', 'COCount', 'COGross', 'COFeeOT', 'CONet', 'TotalGross', 'TotalFees','TotalNet']
  // public transactionType = TransactionType;
  public transactionType = [
    {id:0, name: "All"},
    {id: 1, name: "Cash-In"},
    {id: 2, name: "Cash-Out"},
  ];
  public merchantsList!: Array<MerchantDTO>;
  public merchants: Array<DropDownData> = [];
  public PaymentChannels:  Array<{id: number; name: string}> = [];
  public clients: Array<{id: number; name: string}> = [];
  public selectedMerchantPaymentChannels!: any;
  public tableData!: Array<IncomeData>;
  public isNoData: boolean = true;
  public isMethodEnabled: boolean = true;
  public reportType: number = 4;
  public isDownloadEnabled: boolean = false;
  public incomeReportData:any;
  public isLoading:boolean = false;
  public tableOption = TableOption;
  public totalData: any[] = [
    { label: 'totalGrossAmount', value: 0,},
    { label: 'totalTransactionFee', value: 0,},
    { label: 'totalNetAmount', value: 0,},
  ];

  public incomeTotals:any[] = [
    {label:'cashInIncome', value:0,},
    {label:'CashOutIncome', value:0,},
    {label: 'withdrawalIncome', value:0,}
  ];
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0];
  private defaultDateRange = getWeekBeforeDateRange(7);
  public isReadAndWrite : boolean = false;
  language: string = "";
  constructor(private _fb: FormBuilder, private _merchantService: MerchantsService, private notification: NotificationService,
    private _reportService: ReportsService, private _datepipe: DatePipe, private _decimalPipe:DecimalPipe, private _clientService:ClientService,
    private route: ActivatedRoute, private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);

    this.IncomeReportForm = this._fb.group({
      ClientId: 0,
      TypeEnum: 0,
      PaymentChannelId: 0,
      StartDate: this.defaultDateRange.startDate,
      EndDate: this.defaultDateRange.endDate,
    })

    this.setupFormValueChanges();
  }

  setupFormValueChanges() {
    this.IncomeReportForm.valueChanges.subscribe(() => {
      let formData = this.IncomeReportForm.getRawValue();
     
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
    let clientIdToUse = this.isAdmin ? 0 : getCurrentUserClientId();
  
    this.IncomeReportForm.patchValue({ ClientId: clientIdToUse });
    this.clientId = clientIdToUse;  // Ensure clientId is available for binding
  
    this.getAllClients();
    this.loadPage(1, this.IncomeReportForm.value);
  }
  

  loadPage(page: number, data?:any, search?:string): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    // Determine if it's the last page
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);

    // Load data for the selected page here
    this.getTotalIncomeReport(data, search);
  }

  onFirstPage(): void {
    this.loadPage(1, this.IncomeReportForm.getRawValue());
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, this.IncomeReportForm.getRawValue());
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1, this.IncomeReportForm.getRawValue());
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), this.IncomeReportForm.getRawValue());
  }

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage, this.IncomeReportForm.getRawValue());
  }

  onClientChange(selectedClient: { id: number; name: string }) {
    this.IncomeReportForm.patchValue({
      ClientId: selectedClient.id,
    });
    this.getMerchantByClientId(selectedClient.id);
  }
  
  onMethodSelect(selectedMethod: { id: number; name: string }) {
    const clientId = getCurrentUserClientId();
    
    if (clientId) {
      this.IncomeReportForm.patchValue({
        ClientId: clientId, 
        PaymentChannelId: selectedMethod.id,
      });
    } else {
      this.IncomeReportForm.patchValue({
        PaymentChannelId: selectedMethod.id,
      });
    }
  }
  

  onTransactionType(selectedType: { id: number; name: string }){
    this.IncomeReportForm.patchValue({
      TypeEnum: selectedType.id
    });
  }

  getMerchantByClientId(clientId: number) {
    if (this.subsMerchant) {
      this.subsMerchant.unsubscribe();
    }
  
    this.obsMerchant = this._merchantService.apiMerchantsGetMerchantsByClientIdGet(clientId, this.itemsPerPage, this.currentPage);
    this.subsMerchant = this.obsMerchant.subscribe({
      next: (response: MerchantsListDTO) => {
        this.totalItems = response.TotalRecordCount!;
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
  

  onDownloadExcel() {
    if (this.isReadAndWrite) {
      this.isLoading = true;
  
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
  
      const formGroup = this.IncomeReportForm.getRawValue();
      const _startDate = formGroup.StartDate;
      const _endDate = formGroup.EndDate;
  
      const convertedStartDate = this._datepipe.transform(_startDate, 'yyyy-MM-dd');
      const convertedEndDate = this._datepipe.transform(_endDate, 'yyyy-MM-dd');
  
      formGroup.StartDate = new Date(convertedStartDate!);
      formGroup.EndDate = new Date(convertedEndDate!);
  
      this.observable = this._reportService.apiReportsGetTotalIncomeReportPost(formGroup, undefined, undefined, undefined, true);
  
      this.subscription = this.observable.subscribe({
        next: (response) => {
          if (response) {
            // Create a Blob for the CSV
            const blob = new Blob([response], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `DPay_Income_Report_${formatDateUtc(_startDate.toString(), this._datepipe)}_${formatDateUtc(_endDate.toString(), this._datepipe)}.csv`;
  
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
  
            window.URL.revokeObjectURL(url);
            this.notification.showNotification("Income report downloaded successfully", "close", "success");
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
      this.notification.showNotification("You don't have permission to download the income report", "close", "error");
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
                    .filter((item) => item.Id !== 1 && item.Id !== 2) // Exclude clients with Id 1 and 2
                    .map((item) => ({
                        id: item.Id ?? 0, // Default to 0 if Id is undefined
                        name: item.Name ?? 'Unknown', // Default to 'Unknown' if Name is undefined
                    }));
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification(error.error, "close", "error");
      }
    });
  
    // Add "All" as the first client
    this.clients.unshift({ id: 0, name: "All" });
  }
  

  getPaymentChannels() {
    const formGroup = this.IncomeReportForm;
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

  getTotalIncomeReport(data?: any, search?: string) {
    this.isLoading = true;

    if (this.subscription) {
        this.subscription.unsubscribe();
    }

    data.StartDate = convertToISO(new Date(data.StartDate));
    data.EndDate = convertToISO(new Date(data.EndDate));

    // Set clientId based on user role (Admin or Client)
    const clientId = this.isAdmin ? 0 : getCurrentUserClientId();  // Use this.isAdmin

    this.observable = this._reportService.apiReportsGetTotalIncomeReportPost(
        data, this.itemsPerPage, this.currentPage, search
    );

    this.subscription = this.observable.subscribe({
        next: (response: IncomeReport) => {
            this.incomeReportData = response;

            if (response.Data) {
                this.tableData = response.Data.map((item, index) => ({
                    Id: index + 1,
                    Date: formatDateUtc(item?.Date?.toString()!, this._datepipe),
                    DayOfWeek: item.DayOfWeek,
                    CICount: item?.CICount,
                    CIGross: item?.CIGross,
                    CINet: item?.CINet,
                    COCount: item?.COCount,
                    CIFeeOnTop: item?.CIFeeOnTop,
                    CIFeeAtCost: item?.CIFeeAtCost,
                    COFeeOnTop: item?.COFeeOnTop,
                    COFeeAtCost: item?.COFeeAtCost,
                    COGross: item?.COGross,
                    CONet: item?.CONet,
                    WCount: item?.WCount,
                    WGross: item?.WGross,
                    WFeeonTop: item?.WFeeOnTop,
                    WFeeAtCost: item?.WFeeAtCost,
                    WNet: item?.WNet,
                    TotalGross: item?.TotalGross,
                    TotalFeeOT: item?.TotalFee_OT,
                    TotalNet: item?.TotalNet,
                }));

                this.dataSource = new MatTableDataSource(this.tableData);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;

                this.isNoData = false;
                this.reportType = this.IncomeReportForm.get('TypeEnum')?.value;
                this.isDownloadEnabled = true;

                this.totalData[0].value = DecimalPipeConverter(response.FilteredTotalGrossAmount!, this._decimalPipe);
                this.totalData[1].value = DecimalPipeConverter(response.FilteredTotalOnTopFee!, this._decimalPipe);
                this.totalData[2].value = DecimalPipeConverter(
                    response.FilteredTotalAtCostFee! + response.FilteredTotalOnTopFee!, this._decimalPipe
                );

                if (this.isAdmin) {  
                    this.incomeTotals = [
                        { label: 'cashInIncome', value: DecimalPipeConverter(response?.FilteredTotalCIIncome!, this._decimalPipe) },
                        { label: 'cashOutIncome', value: DecimalPipeConverter(response?.FilteredTotalCOIncome!, this._decimalPipe) },
                        { label: 'grandTotalIncome', value: DecimalPipeConverter(response?.FilteredTotalIncome!, this._decimalPipe) }
                    ];
                } else {
                    this.incomeTotals = [
                        { label: 'cashInIncome', value: DecimalPipeConverter(response?.FilteredTotalCIIncome!, this._decimalPipe) },
                        { label: 'cashOutIncome', value: '0.00' },
                        { label: 'grandTotalIncome', value: DecimalPipeConverter(response?.FilteredTotalIncome!, this._decimalPipe) }
                    ];
                }

            } else {
                this.isNoData = true;
            }
        },
        error: (error: HttpErrorResponse) => {
            this.notification.showNotification(error.error, "close", "error");
        },
        complete: () => {
            this.isLoading = false;
        }
    });
}

  downloadReport(){
    generateReport('reportIncome',
    formatDateUtc(this.IncomeReportForm.get("StartDate")?.value, this._datepipe, true),
    formatDateUtc(this.IncomeReportForm.get("EndDate")?.value, this._datepipe, true), 
    this.incomeReportData, this.displayedColumns, this.IncomeReportForm.value
     )
   }

   onSearch(query: string): void {
    // Handle the search query, e.g., make an API call or filter data
    this.loadPage(1, this.IncomeReportForm.getRawValue(), query);
  }
}

export interface IncomeData {
  Date?: String;
  DayOfWeek?: string;
  CICount?: number;
  CIGross?: number;
  CIFee?: number;
  CINet?: number;
  COCount?: number;
  COGross?: number;
  COFee?: number;
  CONet?: number;
  TotalGross?: number;
  TotalFee?: number;
  TotalNet?: number;
}
