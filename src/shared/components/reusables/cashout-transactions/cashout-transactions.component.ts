import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { MerchantsService, ClientService, TransactionsService, MerchantDTO } from 'src/shared/dataprovider/api';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { BankDTO } from 'src/shared/dataprovider/api/model/bankDTO';
import { ConfigFeeMethod, TableOption, TopUpStatus, WalletToCOF } from 'src/shared/dataprovider/local/data/common';
import { getWeekBeforeDateRange, formatDateUtc, getStatusName, convertFormattedAmount, getUserPermissionsAccess, getCurrentUserClientId } from 'src/shared/helpers/helper';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { ConfirmationModalComponent } from '../../modals/confirmation-modal/confirmation-modal.component';
import { NotificationService } from '../../modals/notification/notification.service';
import Validation from 'src/shared/helpers/validation';
import { DropDownData, SelectOptions } from 'src/shared/dataprovider/local/interface/commonInterface';
import { ClientCOFundsBalanceDTO } from 'src/shared/dataprovider/api/model/clientCOFundsBalanceDTO';
import { ClientWalletDTO } from 'src/shared/dataprovider/api/model/clientWalletDTO';
import { ActivatedRoute } from '@angular/router';
import { ClientWalletListDTO } from 'src/shared/dataprovider/api/model/clientWalletListDTO';
import { ClientBalanceResultDTO } from 'src/shared/dataprovider/api/model/clientBalanceResultDTO';
import { TranslateService } from '@ngx-translate/core';
import { BalanceTransferDataDTO } from 'src/shared/dataprovider/api/model/balanceTransferDataDTO';
import { BalanceTransferRequestDTO } from 'src/shared/dataprovider/api/model/balanceTransferRequestDTO';

@Component({
  selector: 'app-cashout-transactions',
  templateUrl: './cashout-transactions.component.html',
  styleUrls: ['./cashout-transactions.component.scss']
})
export class CashoutTransactionsComponent implements OnInit {
  @Input() isAdmin: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  fileNames: string[] = [];
  resetDropdown = false;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private observableClient!: Observable<any>;
  private subscriptionClient!: Subscription;
  private obsBalanceTransfer!: Observable<any>;
  private subsBalanceTransfer!: Subscription;
  private obsClient!: Observable<any>;
  private subsClient!: Subscription;
  public isReadAndWrite: boolean = false;
  public totalbalanceSource = 0;
  public totalbalanceDestination = 0;
  public PaymentChannelsSource: { id: number; name: string; totalBalance: number; }[] = [];
  public PaymentChannelsDestination: { id: number; name: string; totalBalance: number; }[] = [];
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
  topData: any[] = [];
  public vendorId: number = 0;
  public method: number = 0;
  public isManualTopUp: boolean = true;
  public Banks: any;
  selectedBank: { id: number; name: string } | null = null;
  public Clients: any = [];
  public ClientsBalanceTransfer: any = [];
  public clientsDropdown: SelectOptions[] = [];
  public selectedClientId: number | null = null; // Ensure it's a number
  public balance: string = "";
  // public PaymentChannels: any = [];
  public balanceTransferData: any;
  public isLoading: boolean = false;
  public isTopUpChanged: boolean = false;
  public isTransferChanged: boolean = false;
  public headerTop = [
    { id: 1, isActive: true, label: "manualTopUp" },
  ]
  public tableOption = TableOption;
  language: string = "";
  actionDisable: boolean = false;
  constructor(
    private _notification: NotificationService,
    private _fb: FormBuilder,
    private _merchantService: MerchantsService,
    private _clientService: ClientService,
    private _transactionService: TransactionsService,
    private _reportsService: ReportsService,
    private _dialog: MatDialog,
    private _datepipe: DatePipe,
    private _decimalPipe: DecimalPipe,
    private route: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private translateService: TranslateService) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);

    this.clientId = parseInt(SessionManager.getFromToken('ClientId'));
    this.requestForm = this._fb.group({
      merchantId: [0, Validators.required],
      amount: ['', Validators.required],
      modeOfPayment: ['', Validators.required],
      referenceNumber: ['', Validators.required],
      dateOfDepositSlip: ['', Validators.required],
      remarks: ['', Validators.maxLength(200)],
      depositSlips: [[]]
    });

    this.balanceTransferForm = this._fb.group({
      ClientId: [0, Validators.required],
      SourceId: ['', Validators.required],
      DestinationId: [this.isAdmin ? '':0 , Validators.required],
      Amount: ['', Validators.required],
      Remarks: ['', Validators.maxLength(200)]
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
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    await this.getBanks();
    await this.getAllClients();
    this.getTotalCoWallet();
    if (!this.isAdmin) { this.onClientChange(); }
    if (!this.isAdmin) { this.onClientTopUp(); }
  }

  onSubmitBalanceTransfer(): void {
    if (this.balanceTransferForm.valid) {
      const dialogRef = this._dialog.open(ConfirmationModalComponent, { data: { type: 'TransferBalance' } });
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val.continue) {
            this.saveBalanceTransfer();
          }
        }
      });
    }
  }
  resetBalance() {
    this.balance = '0.00';
  }

  saveBalanceTransfer() {
    this.isTopUpChanged = false;
    const params: BalanceTransferRequestDTO = {
      clientId: this.balanceTransferForm.get('ClientId')?.getRawValue(),
      sourceChannelId: this.balanceTransferForm.get("SourceId")?.getRawValue(),
      destinationChannelId: this.balanceTransferForm.get("DestinationId")?.getRawValue(),
      amount: convertFormattedAmount(this.balanceTransferForm.get('Amount')?.value),
      remarks: this.balanceTransferForm.get("Remarks")?.getRawValue(),
      transferType: WalletToCOF,
      
    };
    this._transactionService.createBalanceTransfer(params).subscribe({
      next: () => {
        this.actionDisable = true;
        this.isTransferChanged = true;
        this.isTopUpChanged = true;
          this.resetForm();
          this.resetDropdown = true;
          setTimeout(() => {
            this.resetDropdown = false;  // Reset the flag
          }, 100);
        this._notification.showNotification("Balance Transfer has been successful", "close", "success");
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {
        this.resetDropdown = false;
        this.actionDisable = false;
        this.resetForm();
        this.resetDropdown = true;
        setTimeout(() => {
        this.resetDropdown = false;  // Reset the flag
        }, 100);
      }
    });
  }


  onSubmitManualTopUp() {
    if (this.requestForm.valid) {
      const dialogRef = this._dialog.open(ConfirmationModalComponent, { data: { type: 'TopUp' } });
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val.continue) {
            this.saveManualTopUp();
          }
        }
      });
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
  }

  saveManualTopUp() {
    this.isTopUpChanged = false;

    if (this.requestForm.valid) {
      let merchantId = this.requestForm.get('merchantId')?.value;
      let amount: number = convertFormattedAmount(this.requestForm.get('amount')?.value);
      let modeOfPayment = this.requestForm.get('modeOfPayment')?.value;
      let referenceNumber = this.requestForm.get('referenceNumber')?.value;
      let depositSlips = this.selectedFiles;
      let dateOfDeposit = this.requestForm.get('dateOfDepositSlip')?.value;
      let remarks = this.requestForm.get('remarks')?.value;


      this.observable = this._transactionService.apiTransactionsCashinsManualTopUpPostForm(
        merchantId,
        amount,
        modeOfPayment,
        referenceNumber,
        depositSlips,
        dateOfDeposit,
        remarks
      );
      this.subscription = this.observable.subscribe({
        next: (response) => {
          this.actionDisable = true;
          this.isTopUpChanged = true;
          this._notification.showNotification("Request for top up has been submitted", "close", "success");
          this.resetForm();
          this.resetDropdown = true;
          setTimeout(() => {
            this.resetDropdown = false;  // Reset the flag
          }, 100);
        },
        error: (error: HttpErrorResponse) => {
          this._notification.showNotification("Request encountered an error " + error.message, "close", "error");
          this.resetForm();
          this.resetDropdown = true;
          setTimeout(() => {
            this.resetDropdown = false;  // Reset the flag
          }, 100);
        },
        complete: () => {
          this.actionDisable = false;
        }
      });
    }
  }


  getBanks(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.observable = this._clientService.apiClientGetBanksGet();
    this.subscription = this.observable.subscribe({
      next: (response: BankDTO[]) => {
        this.Banks = response.map(bank => ({
          id: bank.Code || '', // Assign Code as id
          name: bank.Name || '' // Assign Name as name
        }));
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification(
          `No banks available: ${error.message || 'Unknown error'}`,
          "close",
          "error"
        );
      }
    });
  }

  onBanks(selectedBank: { id: number; name: string }): void {
    this.selectedBank = selectedBank;
    console.log("Selected Bank:", this.selectedBank);
    this.requestForm.patchValue({ modeOfPayment: this.selectedBank })
  }


  onClientChange(selectedClient?: { id: number; name: string }) {
    if (!this.isAdmin) {
      // Automatically set the logged-in client ID if the user is not an admin
      this.selectedClientId = getCurrentUserClientId() ?? 0;
    } else if (selectedClient && selectedClient.id) {
      // If admin, allow selection
      this.selectedClientId = selectedClient.id;
    }

    // Ensure the form updates
    this.balanceTransferForm.patchValue({ ClientId: this.selectedClientId });
    this.balanceTransferForm.patchValue({ ChannelId: 0 });
    this.balance = "0";

  }




  onClientTopUp(selectedClient?: { id: number; name: string }) {
    if (!this.isAdmin) {
      this.selectedClientId = getCurrentUserClientId() ?? 0;
    } else if (selectedClient && selectedClient.id) {
      this.selectedClientId = selectedClient.id;
    }
    this.requestForm.patchValue({ merchantId: this.selectedClientId });
  }




  onChannelSourceChange(selectedOption: { id: number; name: string }) {
    let selectedChannel;

    if (this.isAdmin) {
      selectedChannel = this.PaymentChannelsSource.find(channel => channel.id === selectedOption.id);
    } else {
      const clientId = getCurrentUserClientId();
      selectedChannel = this.PaymentChannelsSource.find(channel => channel.id === selectedOption.id);
    }

    if (selectedChannel) {
      this.totalbalanceSource = selectedChannel.totalBalance;
      this.balance = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(this.totalbalanceSource);

      this.balanceTransferForm.patchValue({
        SourceId: selectedChannel.id,
      });
    }
  }

  onChannelDestinationChange(selectedOption: { id: number; name: string }) {
    let selectedChannel;
    if (this.isAdmin) {
      selectedChannel = this.PaymentChannelsDestination.find(channel => channel.id === selectedOption.id);
    } else {
      const clientId = getCurrentUserClientId();
      selectedChannel = this.PaymentChannelsDestination.find(channel => channel.id === selectedOption.id);
    }

    if (selectedChannel) {
      this.totalbalanceDestination = selectedChannel.totalBalance;
      this.balance = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(this.totalbalanceDestination);

      this.balanceTransferForm.patchValue({
        DestinationId: selectedChannel.id,
      });
    }
  }




  getAllClients() {
    if (this.subsClient) {
      this.subsClient.unsubscribe();
    }
    this.obsClient = this._clientService.apiClientGetAllClientsGet();
    this.subsClient = this.obsClient.subscribe({
      next: (response: ClientWalletListDTO) => {
        if (response.Data) {
          this.clientsDropdown = response.Data
            .filter((item: ClientWalletDTO) => item.Id !== 1 && item.Id !== 2)
            .map((item: ClientWalletDTO) => ({
              id: item.Id ?? 0,
              name: item.Name || ""
            }));
        } else {
          this._notification.showNotification("No client data available.", "close", "error");
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error: " + error.error, "close", "error");
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

  resetForm() {
    this.PaymentChannelsSource = [];
    this.PaymentChannelsDestination = [];
    this.balanceTransferForm.patchValue({
      selectedClientId: 0,
      ClientId: [0],
      channelId: [''],
      Amount: [''],
      Remarks: ['']
    })
    this.requestForm.patchValue({
      merchantId: [0],
      amount: [''],
      modeOfPayment: [''],
      referenceNumber: [''],
      dateOfDepositSlip: [''],
      remarks: [''],
      depositSlips: [['']]

    })
  }

  getTotalCoWallet(pageSize: number = 100, pageNumber: number = 1) {
    this.isLoading = true;
    let totalCOFundBalance = 0;
    this.observable = this._clientService.apiClientGetAllClientsCOFundsGet(pageSize, pageNumber);
    this.subscription = this.observable.subscribe({
      next: (response: ClientCOFundsBalanceDTO[]) => {
        if (this.isAdmin) {
          totalCOFundBalance = response.reduce((sum, client) => sum + (client.AvailableBalance || 0), 0);
        } else {
          var client = response.find((client) => client.ClientId === this.clientId);
          if (client != null) {
            totalCOFundBalance = client?.AvailableBalance!
          }
        }

        const formattedTotalCOFundBalance = this._decimalPipe.transform(totalCOFundBalance, '1.2-2');

        this.topData = [{ label: 'availableBalance', value: formattedTotalCOFundBalance }];

      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching CO Funds data:', err.error, "close", "error");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
