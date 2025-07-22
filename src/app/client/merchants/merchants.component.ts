import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { ClientDTO, ClientService, MerchantsService } from 'src/shared/dataprovider/api';
import { MerchantCardData, TableOption, TopCardData } from 'src/shared/dataprovider/local/data/common';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ClientBalanceResultDTO } from 'src/shared/dataprovider/api/model/clientBalanceResultDTO';
import { SuccessRateSummary } from 'src/shared/dataprovider/api/model/successRateSummary';
import { ClientConfigureFeesDTO } from 'src/shared/dataprovider/api/model/clientConfigureFeesDTO';
import { MerchantConfigureFeesDTO } from 'src/shared/dataprovider/api/model/merchantConfigureFeesDTO';
import { WithdrawalFeeConfigureDTO } from 'src/shared/dataprovider/api/model/withdrawalFeeConfigureDTO';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SuccessRateData } from 'src/shared/dataprovider/api/model/successRateData';
import { ActivatedRoute } from '@angular/router';
import { getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-merchants',
  templateUrl: './merchants.component.html',
  styleUrls: ['./merchants.component.scss']
})
export class MerchantsComponent implements OnInit {
  private observable!: Observable<any>;
  private subscription!: Subscription;
  public clientName!: string;
  public clientId: number = parseInt(SessionManager.getFromToken('ClientId'));
  public vendorName!: string;
  public tableOption = TableOption;
  public vendorTable: boolean = true;
  public MerchantCard = MerchantCardData.merchantCard;
  public topData = TopCardData.TotalWalletBalance;
  transferFormCondition: boolean = false;

  @Input() label: string = "";
  @Input() value: number = 0;
  @Input() icon: string = "";
  @Input() buttonlabel: string = "";
  @Input() imageSrc: string = "";
  @Input() isVisible: boolean = false;
  @Input() isVisiblebtn: boolean = true;
  @Input() isLoading: boolean = false;
  ClientName: string = ''; // Define ClientName property
  successRateForm!: FormGroup;
  displayedColumnsDeposits: string[] = ['Deposits', 'Status', 'Fee', 'FixedFee'];
  displayedColumnsWithdrawals: string[] = ['Withdrawals', 'Status', 'Fee', 'FixedFee'];
  displayedColumnsRemittances: string[] = ['Method', 'Settlement', 'Fees'];
  displayedColumnsSuccessRate: string[] = ['Transaction', 'TotalCount', 'Complete', 'SuccessRate'];
  depositsDataSource = new MatTableDataSource<any>();
  withdrawalsDataSource = new MatTableDataSource<any>();
  remittancesDataSource = new MatTableDataSource<any>();
  successRateDataSource = new MatTableDataSource<any>();
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>(); // Initialize dataSource as MatTableDataSource
  overAlltotalSuccessRate: number = 0;
  clients: any[] = [];
  public isReadAndWrite:boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  clientsList: Array<ClientDTO> = [];
  language: string = "";
  constructor(
    private _dialog: MatDialog,
    private _merchantService: MerchantsService,
    private _clientService: ClientService,
    private notification: NotificationService,
    private _decimalpipe: DecimalPipe,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit(): void {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    // Initialize the form and set startDate and endDate to today's date
    this.successRateForm = this.fb.group({
      StartDate: [new Date()], // Set to today's date
      EndDate: [new Date()] // Set to today's date
    });

    // Fetch success rates using today's date
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0); // Start of today
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59); // End of today
    this.getSuccessRates(this.clientId, startDate, endDate);

    this.getClientConfig(this.clientId);
  }

  getIconForChannel(channelName: string): string {
    switch (channelName) {
      case 'Gcash':
        return 'assets/icons/Gcash-New.png';
      case 'Maya':
        return 'assets/icons/Maya-New.png';
      case 'QRPH':
        return 'assets/icons/QRPH-New.png';
      default:
        return '';
    }
  }

  getClientConfig(clientId: number) {
    this.subscription = this._clientService.apiClientGetFeesConfigurationGet(clientId).subscribe({
        next: (response: ClientConfigureFeesDTO) => {
            const depositsData = this.processClientConfigData(response, true);
            const withdrawalsData = this.processClientConfigData(response, false);
            const remittancesData = this.processWithdrawalFees(response.WithdrawalFees || []);

            this.depositsDataSource.data = depositsData; // Set data for deposits
            this.withdrawalsDataSource.data = withdrawalsData; // Set data for withdrawals
            this.remittancesDataSource.data = remittancesData; // Set data for remittances
        },
        error: (error: HttpErrorResponse) => {
            this.notification.showNotification("Error:" + error.error, "close", "error");
        }
    });
}

private processClientConfigData(response: ClientConfigureFeesDTO, isDeposit: boolean): any[] {
    const validDepositChannels = ['Gcash', 'Maya', 'QRPH'];
    const validWithdrawalChannels = ['Instapay'];
    const result: any[] = [];

    response.Vendors?.forEach((vendor) => {
        vendor.Merchants?.forEach((merchant: MerchantConfigureFeesDTO) => {
            const channelName = merchant.PaymentChannel?.Name || '';

            if (isDeposit) {
                const cashInFee = merchant.CashInFee;
                const isActive = cashInFee?.Status === 1;

                // Filter valid deposit channels and add data
                if (isActive && validDepositChannels.includes(channelName)) {
                    result.push({
                        Name: channelName,
                        Status: this.getStatusDescription(cashInFee.Status),
                        CIFee: (cashInFee.FeeOnTopPercent || 0) + (cashInFee.FeeAtCostPercent || 0),
                        CIFeeFixed: (cashInFee.FeeOnTopFixed || 0) + (cashInFee.FeeAtCostFixed || 0),
                    });
                }
            } else {
                const cashOutFee = merchant.CashOutFee;
                const isActive = cashOutFee?.Status === 1;

                // Filter valid withdrawal channels and add data
                if (isActive && validWithdrawalChannels.includes(channelName)) {
                    result.push({
                        Name: channelName,
                        Status: this.getStatusDescription(cashOutFee.Status),
                        COFee: (cashOutFee.FeeOnTopPercent || 0) + (cashOutFee.FeeAtCostPercent || 0),
                        COFeeFixed: (cashOutFee.FeeOnTopFixed || 0) + (cashOutFee.FeeAtCostFixed || 0),
                    });
                }
            }
        });
    });

    return result;
}

// New method to process withdrawal fees for remittances
private processWithdrawalFees(withdrawalFees: WithdrawalFeeConfigureDTO[]): any[] {
    const result: any[] = [];

    withdrawalFees.forEach((fee) => {
        if (fee.Status === 1) { // Only consider active fees
            result.push({
                Method: fee.MethodDescription || 'Unknown', // Display Method Description
                Fees: (fee.FeeOnTopFixed || 0) + (fee.FeeAtCostFixed || 0),
                Settlement: fee.Settlement // Sum of Fees
            });
        }
    });

    return result;
}

private getStatusDescription(status: number | undefined): string {
    switch (status) {
        case 1:
            return 'Active';
        case 2:
            return 'Inactive';
        case 3:
            return 'Disable';
        default:
            return 'Unknown';
    }
}

getSuccessRates(clientId: number, startDate: Date, endDate: Date) {
  this.isLoading = true;

  // Ensure the API call returns the correct type
  this.observable = this._clientService.apiClientGetSuccessRateGet(clientId, startDate, endDate);
  this.subscription = this.observable.subscribe({
    next: (response: SuccessRateSummary) => {
      // Process the new response structure
      const successData = this.processSuccessRateData(response); 
      
      this.successRateDataSource.data = successData;
      this.isLoading = false; 
    },
    error: (error: HttpErrorResponse) => {
      this.notification.showNotification('Error fetching success rates' + error.error, "close", "error");
      this.isLoading = false; 
    }
  });
}

private processSuccessRateData(response: SuccessRateSummary): { Type: string; TotalCount: number; successCount: number; successPercentage: number; }[] {

  const cashInTotals = {
    transCount: response.TotalTransactionCI || 0,
    successCount: response.TotalSuccessCountCI || 0,
    successPercentage: 0 
  };

  const cashOutTotals = {
    transCount: response.TotalTransactionCO || 0,
    successCount: response.TotalSuccessCountCO || 0,
    successPercentage: 0 
  };


  cashInTotals.successPercentage = cashInTotals.transCount > 0 
    ? (cashInTotals.successCount / cashInTotals.transCount) * 100 
    : 0;

  cashOutTotals.successPercentage = cashOutTotals.transCount > 0 
    ? (cashOutTotals.successCount / cashOutTotals.transCount) * 100 
    : 0;

  return [
    {
      Type: 'Cash-In',
      TotalCount: cashInTotals.transCount,
      successCount: cashInTotals.successCount,
      successPercentage: cashInTotals.successPercentage
    },
    {
      Type: 'Cash-Out',
      TotalCount: cashOutTotals.transCount,
      successCount: cashOutTotals.successCount,
      successPercentage: cashOutTotals.successPercentage
    }
  ];
}



loadPage(page: number, data?: any): void {
  const convertedStartDate = this.datePipe.transform(data.StartDate, 'yyyy-MM-dd');
  const convertedEndDate = this.datePipe.transform(data.EndDate, 'yyyy-MM-dd');
  const startDate = convertedStartDate ? new Date(convertedStartDate) : undefined;  
  const endDate = convertedEndDate ? new Date(convertedEndDate) : undefined;  
  if (startDate && endDate && startDate > endDate) {
    this.isLoading = false; // Use this.isloading for consistency
    return;
  }

  const clientId = data.clientId; // Assuming you get clientId from data

  this.getSuccessRates(clientId, startDate ?? new Date(0), endDate ?? new Date()); 
}



ngOnDestroy(): void {
  if (this.subscription) {
    this.subscription.unsubscribe();
  }
}



  
}
