import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { MerchantsService, ClientService, TransactionsService, MerchantDTO } from 'src/shared/dataprovider/api';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { allowedChannel, ConfigFeeMethod, MerchantCardData, } from 'src/shared/dataprovider/local/data/common';
import { getWeekBeforeDateRange, convertFormattedAmount, DecimalPipeConverter, getCurrentUserClientId } from 'src/shared/helpers/helper';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { RemittanceService } from 'src/shared/dataprovider/api/api/remittance.service';
import { ClientBalanceResultDTO } from 'src/shared/dataprovider/api/model/clientBalanceResultDTO';
import { DropDownData } from 'src/shared/dataprovider/local/interface/commonInterface';
import { TranslateService } from '@ngx-translate/core';
import { WallettransferHistoryComponent } from 'src/shared/components/reusables/wallettransfer-history/wallettransfer-history.component';

@Component({
  selector: 'app-client-transfers',
  templateUrl: './client-transfers.component.html',
  styleUrls: ['./client-transfers.component.scss']
})
export class ClientTransfersComponent implements OnInit {
  
  dataSource = new MatTableDataSource<any>([]);
  @Input() selectedClientId!: number;  
  @Input() selectedClientName!: string;  
  @Input() isAdmin: boolean = false; 
  @Output() refreshData = new EventEmitter<void>(); 
  private clientObservable!: Observable<any>;
  private clientSubscription!: Subscription;
  isLoading = false;
  walletBalanceCompleted: any = []; 
  currentPage: number = 1;
  displayedClientList: string[] = ['ClientID', 'ClientName', 'RemittanceWallet', 'GcashBalance', 'MayaBalance', 'QRPHBalance'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  balanceTransferForm!: FormGroup;
  public MerchantCard = MerchantCardData.merchantCard;
  public totalbalance: number = 0;
  public transferMethod = ConfigFeeMethod;
  public PaymentChannels: any = [];
  public clientsDropdown: Array<DropDownData> = [];
  
  private observable!: Observable<any>;
  private subscription!: Subscription;

  // New properties to resolve errors
  public transferFormDropdown: any; // Initialize appropriately
  public topData: any[] = []; // Initialize with the correct type if needed
  public showTransferBalanceRequest: boolean = false; // Initialize with default value
  public isTransferChanged: boolean = false; // Initialize with default value
  clientId: number;
  language: string ="";
  @ViewChild(WallettransferHistoryComponent)
  walletTransferHistoryComponent!: WallettransferHistoryComponent;

  constructor(
    private _notification: NotificationService,
    private _fb: FormBuilder,
    private notification: NotificationService,
    private _merchantService: MerchantsService,
    private _clientService: ClientService,
    private _decimalpipe: DecimalPipe,
    private _remittanceService: RemittanceService,
    private _datepipe: DatePipe,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
      this.clientId = 0; // Default clientId
    }

  ngOnInit() {
    // Get the currently logged-in user's client ID
    this.clientId = getCurrentUserClientId(); // Assuming this function fetches the current user's client ID
    if (this.clientId) {
      this.initializeForm(); // Initialize form before loading data
    }
  }
  

  
  initializeForm() {
    this.balanceTransferForm = this._fb.group({
      ClientId: [this.clientId, Validators.required], // Set default ClientId
      ChannelId: ['', Validators.required],
      Amount: ['', [Validators.required]],
      Remarks: ['Request Transfer Balance']
    });
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
      return ''; // No icon for channels that are not Gcash, Maya, or QRPH
  }
}


  onSubmitBalanceTransfer() {
    if (this.balanceTransferForm.valid) {
      const inputAmount = convertFormattedAmount(this.balanceTransferForm.value.Amount);
      const selectedChannel = this.PaymentChannels.find((channel: any) => channel.ChannelId === this.balanceTransferForm.value.ChannelId);
      const currentBalance = selectedChannel ? selectedChannel.WalletBalance : 0;

      if (inputAmount > currentBalance) {
        this._notification.showNotification("Insufficient balance!", "close", "error");
        return; 
      }

      const formValue = {
        ...this.balanceTransferForm.value,
        Amount: inputAmount,
        Remarks: 'Request Transfer Balance'
      };

      this._remittanceService.apiRemittanceTransferFundsPost(formValue).subscribe({
        next: () => {
          this._notification.showNotification("Transfer Balance successfully submitted", "close", 'success');
          this.resetForm();
          this.refreshData.emit(); 
        },
        error: (error: HttpErrorResponse) => {
          let errorMessage = "An error occurred during transfer.";
          if (error.status === 400) {
            errorMessage = "Invalid request. Please check the details and try again.";
          } else if (error.status === 500) {
            errorMessage = "Server error. Please try again later.";
          }
          this._notification.showNotification(errorMessage, "close", "error");
        }
      });
    }
  }

  resetForm() {
    this.balanceTransferForm.reset();
    this.initializeForm(); 
  }

  getClientsDropdown() {
    this._clientService.getBalanceForEachChannel().subscribe({
      next: (response: any) => {
        if (response && response.Clients) {
          this.clientsDropdown = response.Clients.map((client: any) => ({
            Id: client.ClientId,
            Name: client.ClientName
          }));
        } else {
          console.error('Unexpected response format for clients');
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error: " + error.error,"close","error");
      }
    });
  }

  // Implement onClientIdChange method
  onClientIdChange(clientId: number) {
    this.selectedClientId = clientId;
  }

  onTransactionSubmitted(): void {
    this.isTransferChanged = !this.isTransferChanged; // toggle value to trigger Input change
  }
  
}





