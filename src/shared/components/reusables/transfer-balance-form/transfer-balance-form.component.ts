import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../modals/notification/notification.service';
import { RemittanceService } from 'src/shared/dataprovider/api/api/remittance.service';
import { DropDownData, SelectOptions } from 'src/shared/dataprovider/local/interface/commonInterface';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientService, TransactionsService } from 'src/shared/dataprovider/api';
import { checkTransferType, convertFormattedAmount, getCurrentUserClientId, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientBalanceResultDTO } from 'src/shared/dataprovider/api/model/clientBalanceResultDTO';
import { ClientBalanceDTO } from 'src/shared/dataprovider/api/model/clientBalanceDTO';
import { BalanceTransferType, COFToRemittance, COFToWallet, remittanceToCOF, RemittanceToWallet, WalletToCOF, WalletToRemittance } from 'src/shared/dataprovider/local/data/common';

@Component({
  selector: 'app-transfer-balance-form',
  templateUrl: './transfer-balance-form.component.html',
  styleUrls: ['./transfer-balance-form.component.scss']
})
export class TransferBalanceFormComponent implements OnInit {
  @Input() isAdmin!: boolean;
  @Output() clientIdChange = new EventEmitter<number>();
  // @Output() transferSubmitted = new EventEmitter<void>();
  @Output() transactionSubmitted = new EventEmitter<void>();
  public isBalanceTopup: boolean = true;
  @Input() data: boolean = false;
  resetDropdown = false;
  amountTransfer!: FormGroup;
  balanceTransferForm!: FormGroup;
  public PaymentChannelsSource: { id: number; name: string; totalBalance: number; }[] = [];
  public PaymentChannelsDestination: { id: number; name: string; totalBalance: number; }[] = [];
  public clientsDropdown: Array<DropDownData> = [];
  public clientId: number = 0;
  public balance: string = "";
  public totalbalanceSource = 0;
  public totalbalanceDestination = 0;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  public defaultClientId: number = getCurrentUserClientId(); // Use default ClientId directly
  public defaultClientName: string = '';
  public isReadAndWrite: boolean = false;
  public clientsList: SelectOptions[] = [];
  public clientsData: Array<ClientBalanceDTO> = [];
  public transferTypes: SelectOptions[] = [];
  language: string = "";
  isHideSource : boolean = false;
  isHideDestination : boolean = false;
  actionDisable: boolean = false;
  constructor(
    private notification: NotificationService,
    private _remittanceService: RemittanceService,
    private _transactionService: TransactionsService,
    private _clientService: ClientService,
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit(): void {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    this.initializeForm();
    this.getClientsDropdown();

    if (this.isAdmin) {

      //5 is wallet to COF
      this.transferTypes = BalanceTransferType.filter(x => x.id != WalletToCOF);
    } else {
      this.setClientIdFromSession();
      this.balanceTransferForm.patchValue({TransferType:COFToRemittance});
      this.getFormsForRole(WalletToRemittance);
    }
  }

  initializeForm() {
    this.balanceTransferForm = this._fb.group({
      ClientId: [this.defaultClientId],
      TransferType: [''],
      Remarks: [''],
      ClientName: [''],
      SourceChannelId: [0],
      DestinationChannelId: [0],
      Amount: ['', [Validators.required, Validators.min(1)]],
    });

    this.amountTransfer = this._fb.group({
      Amount: ['', [Validators.required]],
    });
  }

  onSubmitBalanceTransfer() {
    if (this.balanceTransferForm.valid) {
      const inputAmount = convertFormattedAmount(this.balanceTransferForm.value.Amount);
      const formValue = {
        ...this.balanceTransferForm.value,
        Amount: inputAmount,
      };

       this._transactionService.createBalanceTransfer(formValue).subscribe({
        next: (response) => {
          this.actionDisable = true;
          this.notification.showNotification("Transfer Balance successfully submitted", "close", 'success');
          this.transactionSubmitted.emit();
          this.resetForm();
          this.resetDropdown = true;
          setTimeout(() => {
            this.resetDropdown = false;  // Reset the flag
          }, 100);
        },
        error: (error: HttpErrorResponse) => {
          this.notification.showNotification("Error: " + error.error, "close", "error");
        },
        complete: () => {
          this.actionDisable = false;
        }
      });
    }
  }

  resetForm() {
    this.clientsDropdown = [];
    this.PaymentChannelsSource = [];
    this.totalbalanceSource = 0;
    this.totalbalanceDestination = 0;
    this.balance = '';

    this.defaultClientId = getCurrentUserClientId();  // Restore default
    this.defaultClientName = '';

    this.balanceTransferForm.reset({
      ClientId: this.defaultClientId,
      TransferType: '',
      Remarks: '',
      ClientName: '',
      SourceChannelId: 0,
      DestinationChannelId: 0,
      Amount: '',
    });

    this.amountTransfer.reset({
      Amount: '',
    });
    
  }


  reloadClientData(): void {
    if (this.isAdmin) {
      this.getClientsDropdown();
    }

  }

  getClientsDropdown() {
    this._clientService.getBalanceForEachChannel().subscribe({
      next: (response: any) => {
        if (response && response.Clients) {
          this.clientsData = response.Clients;
          this.clientsList = response.Clients
            .filter((client: any) => client.ClientId !== 1 && client.ClientId !== 2)
            .map((client: ClientBalanceDTO) => ({
              id: client.ClientId,
              name: client.ClientName,
              balance: client.AvailableBalance
            }));
  
          const defaultClient = this.clientsList.find(client => client.id === this.defaultClientId);
          if (defaultClient) {
            this.balanceTransferForm.patchValue({
              ClientId: defaultClient.id,
              ClientName: defaultClient.name
            });
  
            // ✅ Auto-trigger onClientChange for client users
            if (!this.isAdmin) {
              this.onClientChange({ value: defaultClient.id });
              console.log("IS NOT ADMIN");
            }
          }
        } else {
          console.error('Unexpected response format for clients');
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", "error");
      }
    });
  }


  setClientIdFromSession() {
    const storedClientId = parseInt(sessionStorage.getItem('clientId') || '0', 10);
    this.clientId = storedClientId;
    this.balanceTransferForm.patchValue({ ClientId: storedClientId });
  }

  onClientChange(event: any) {
    const selectedClientId = event && event.value ? event.value : event.id;
    if (this.isAdmin) {
      this.clientIdChange.emit(selectedClientId);
      this.getClientNameById(selectedClientId);
      this.balanceTransferForm.patchValue({ ClientId: selectedClientId });
    }
  }

  onTransferTypeChange(event: any) {
    const selectedTypeId = event && event.value ? event.value : event.id;
    this.balanceTransferForm.patchValue({ TransferType: selectedTypeId });
  
    // Reset controls before applying new logic
    this.balanceTransferForm.get('SourceChannelId')?.enable();
    this.balanceTransferForm.get('DestinationChannelId')?.enable();
    this.getFormsForRole(selectedTypeId);
  }

  getFormsForRole(selectedTypeId:any){
    if (selectedTypeId === WalletToRemittance  || selectedTypeId === COFToRemittance) {
      this.isHideDestination = true;
      this.isHideSource = false;
    } else if (selectedTypeId === remittanceToCOF || selectedTypeId === RemittanceToWallet || selectedTypeId === COFToWallet) {
      this.isHideSource = true;
      this.isHideDestination = false;
    } else {
      this.isHideSource = false;
      this.isHideDestination = false;
    }
  }
  

  getClientNameById(clientId: number) {
    this._clientService.getBalanceForEachChannel().subscribe({
      next: (response: any) => {
        if (response && response.Clients) {
          const client = response.Clients.find((client: any) => client.ClientId === clientId);
          if (client) {
            this.balanceTransferForm.patchValue({ ClientName: client.ClientName });
          }
        } else {
          console.error('No clients found in the response.');
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error: " + error.error, "close", "error");
      }
    });
  }


  onChannelSourceSelected(selectedOption: { id: number, name: string, }) {
    const selectedChannel = this.PaymentChannelsSource.find(channel => channel.id === selectedOption.id);
    if (selectedChannel) {
      this.totalbalanceSource = selectedChannel.totalBalance;
      this.balance = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(this.totalbalanceSource);
      this.balanceTransferForm.patchValue({
        SourceChannelId: selectedChannel.id,
      });
    }
  }

  onChannelDestinationSelected(selectedOption: { id: number, name: string, }) {
    const selectedChannel = this.PaymentChannelsSource.find(channel => channel.id === selectedOption.id);
    if (selectedChannel) {
      this.totalbalanceDestination = selectedChannel.totalBalance;
      this.balance = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(this.totalbalanceDestination);
      this.balanceTransferForm.patchValue({
        DestinationChannelId: selectedChannel.id,
      });
    }
  }


}
