import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { ConfirmationModalComponent } from 'src/shared/components/modals/confirmation-modal/confirmation-modal.component';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService, VendorsService, MerchantsService, TransactionsService, MerchantDTO } from 'src/shared/dataprovider/api';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { BankDTO } from 'src/shared/dataprovider/api/model/bankDTO';
import { MerchantsListDTO } from 'src/shared/dataprovider/api/model/merchantsListDTO';
import { WithdrawalFeeDTO } from 'src/shared/dataprovider/api/model/withdrawalFeeDTO';
import { ConfigFeeMethod, TableOption, TopUpStatus } from 'src/shared/dataprovider/local/data/common';
import { formatDateUtc, getStatusName, getWeekBeforeDateRange } from 'src/shared/helpers/helper';
import { SessionManager } from 'src/shared/helpers/session-manager';

@Component({
  selector: 'app-client-funds',
  templateUrl: './client-funds.component.html',
  styleUrls: ['./client-funds.component.scss']
})
export class ClientFundsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  fileNames: string[] = [];
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private observableClient!: Observable<any>;
  private subscriptionClient!: Subscription;
  private obsBalanceTransfer!: Observable<any>;
  private subsBalanceTransfer!: Subscription;
  private obsCo!: Observable<any>;
  private subsCo!: Subscription;

  requestForm!: FormGroup;
  balanceTransferForm!: FormGroup;
  TopUpForm!: FormGroup;
  selectedFiles: Blob[] = [];
  public clientId: number = 0;
  public listOfWallet: { Id: number, Name: string, VendorId: number, Balance: number, TotalCashIn: number, TotalCashOut: number }[] = [];
  public listOfDestination: { Id: number, Name: string }[] = [];
  public transferMethod = ConfigFeeMethod;
  public merchantBalance: number = 0;
  public merchantFee: number = 0;
  public topData: any;
  public vendorId: number = 0;
  public method: number = 0;
  public isManualTopUp: boolean = true;
  public Banks!: any;
  public Clients: any = [];
  public ClientsBalanceTransfer: any = [];
  public balance: number = 0;
  public PaymentChannels: any = [];
  public CoTransactionData: any;
  public isLoading: boolean = false;
  public headerTop = [
    { id: 1, isActive: true, label: "Manual Top-up" },
    { id: 2, isActive: false, label: "Balance Transfer" },
  ]
  public tableOption = TableOption;
  displayedColumns: string[] = ['id', 'clientName', 'transactionNo', 'referenceNo', 'amount', 'createdDate', 'completedDate', 'requestee', 'status', 'type', 'action'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource!: MatTableDataSource<any>;

  constructor(
    private _notification: NotificationService,
    private _fb: FormBuilder,
    private _merchantService: MerchantsService,
    private _clientService: ClientService,
    private _transactionService: TransactionsService,
    private _reportsService: ReportsService,
    private _dialog: MatDialog,
    private _datepipe: DatePipe) {
    this.clientId = parseInt(SessionManager.getFromToken('ClientId'));
    this.requestForm = this._fb.group({
      merchantId: 28,
      amount: '',
      modeOfPayment: '',
      referenceNumber: '',
      dateOfDepositSlip: '',
      remarks: '',
      depositSlips: [[]]
    });

    this.balanceTransferForm = this._fb.group({
      ClientId: this.clientId,
      ChannelId: '',
      Amount: 0,
      Remarks: ''
    });

    this.TopUpForm = _fb.group({
      StartDate: getWeekBeforeDateRange().startDate,
      EndDate: getWeekBeforeDateRange().endDate,
      ClientId: this.clientId
    });

    this.TopUpForm.get("EndDate")?.valueChanges.subscribe(() => {
      this.getCoFundTransactions(this.TopUpForm.value);
    });
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files).map(file => file as File);
      this.fileNames = Array.from(input.files).map(file => file.name);
      this.requestForm.patchValue({ depositSlips: this.selectedFiles });
    }
  }

  async ngOnInit() {
    await this.getClientDropdown();
    await this.getBanks();
    await this.getCoFundTransactions(this.TopUpForm.value)
  }

  onSubmitBalanceTransfer() {
    const dialogRef = this._dialog.open(ConfirmationModalComponent, { data: { type: 'BalanceTransfer' } });
    dialogRef.afterClosed().subscribe({
      next: async (val) => {
        if (val.continue) {
          this.TopUpForm.patchValue({remarks:val.remarks})
          await this.balanceTransfer();
          await this.delay(1000); // Delay for 1 second
          this.getCoFundTransactions(this.TopUpForm.value);
        }
      }
    });
  }
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  balanceTransfer() {
    if (this.subsBalanceTransfer) {
      this.subsBalanceTransfer.unsubscribe();
    }
    this.obsBalanceTransfer = this._transactionService.apiTransactionsBalanceTransferRequestFundForCOPost(this.balanceTransferForm.value);
    this.subsBalanceTransfer = this.obsBalanceTransfer.subscribe({
      next: (response) => {
      
        this._notification.showNotification("Balance Transfer has been successfull", "close", "success");
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("There's an error on transferring account " + error.error, "close", "error");
      },
      complete:()=>{
        this.subsBalanceTransfer.unsubscribe();
      }
    });
  }

  onSubmitManualTopUp() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.requestForm.valid) {
      this.observable = this._transactionService.apiTransactionsCashinsManualTopUpPostForm(
        this.requestForm.get('merchantId')?.value,
        this.requestForm.get('amount')?.value,
        this.requestForm.get('modeOfPayment')?.value,
        this.requestForm.get('referenceNumber')?.value,
        this.selectedFiles,
        this.requestForm.get('dateOfDepositSlip')?.value,
        this.requestForm.get('remarks')?.value
      );
      this.subscription = this.observable.subscribe({
        next: (response) => {
          this._notification.showNotification("Request for top up has been submitted", "close", "success");
        },
        error: (error: HttpErrorResponse) => {
          this._notification.showNotification("Request encountered an error " + error.error, "close", "error");

        }
      });
    }
  }

  getCoFundTransactions(data:any) {
    this.isLoading = true;
    if (this.obsBalanceTransfer) {
      this.subsBalanceTransfer.unsubscribe();
    }
    this.obsBalanceTransfer = this._reportsService.apiReportsGetTopUpSummaryReportPost(data);
    this.subsBalanceTransfer = this.obsBalanceTransfer.subscribe({
      next: (response) => {
        this.CoTransactionData = response;
        let tableData: any = [];
        tableData = response.TopUpData.map((item : any) => ({
          Id: item.Id,
          Amount: item.Amount,
          TransactionNo: item.InternalTransactionNumber,
          CompletedDate: formatDateUtc(item.CompletedDate!.toString(), this._datepipe),
          CreatedDate: formatDateUtc(item.CreatedDate!.toString(), this._datepipe),
          ReferenceNo: item.ReferenceNumber,
          Type: item.Type,
          ClientName: item.ClientName,
          ClientId: item.ClientId,
          Requestee: item.Requestee,
          RequesteeName: item.RequesteeName,
          Status: getStatusName(item.Status!, TopUpStatus)
        }));
        this.dataSource = new MatTableDataSource(tableData);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: (error: HttpErrorResponse) => {

      },
      complete: () => {
        this.isLoading = false;
        this.subsBalanceTransfer.unsubscribe();
      }
    })
  }


  getBanks() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.observable = this._clientService.apiClientGetBanksGet();
    this.subscription = this.observable.subscribe({
      next: (response: BankDTO) => {
        this.Banks = response;
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("No available bank" + error.error,"close","error");
      }
    });
  }

  onChannelChange(event: any) {
    const channel = this.PaymentChannels.find((channel: any) => channel.Id === event.value);
    this.balance = channel.Balance;
  }

  getClientDropdown() {
    this.observableClient = this._merchantService.apiMerchantsGetMerchantsByClientIdGet(this.clientId);
    this.subscriptionClient = this.observableClient.subscribe({
      next: (response: MerchantsListDTO) => {
        const merchants = response.Data || []; 
        const target = merchants.find((merchant: any) =>
          merchant.Vendor.Name === "Digipay" && merchant.PaymentChannel.Name === "Instapay"
        );
  
        const clientForBalanceTransfer = merchants.find((merchant: any) =>
          merchant.Balance > 0
        );
  
        merchants.forEach((item: MerchantDTO) => {
          const channelId = item.PaymentChannel?.Id;
          const channelExists = this.PaymentChannels.some((channel: any) => channel.Name === item.PaymentChannel?.Name);
          if (!channelExists) {
            this.PaymentChannels.push({ Id: channelId, Name: item.PaymentChannel?.Name, Balance: item.Balance });
          }
        });
        if (target && target.Vendor) {
          target.Vendor.Name = "DynastyPay COF";
          this.Clients.push(target);
        }
        if (clientForBalanceTransfer) {
          this.ClientsBalanceTransfer.push(clientForBalanceTransfer);
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {
      }
    });
  }
  

  changeActiveHeader(selectedItem: any) {
    this.headerTop.forEach(item => {
      item.isActive = (item === selectedItem);
    });
    if (selectedItem.id == 1) {
      this.isManualTopUp = true;
    }
    else {
      this.isManualTopUp = false;
    }
  }
}
