
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService } from 'src/shared/dataprovider/api';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { AgentBankType } from 'src/shared/dataprovider/api/model/agentBankType';
import { AgentCard } from 'src/shared/dataprovider/api/model/agentCard';
import { AgentCardTransaction } from 'src/shared/dataprovider/api/model/agentCardTransaction';
import { AgentListData } from 'src/shared/dataprovider/api/model/agentListData';
import { AgentListDTO } from 'src/shared/dataprovider/api/model/agentListDTO';
import { AgentTypeEnum } from 'src/shared/dataprovider/api/model/agentTypeEnum';
import { AgentUsernameDTO } from 'src/shared/dataprovider/api/model/agentUsernameDTO';
import { BrandNameDTO } from 'src/shared/dataprovider/api/model/brandNameDTO';
import { CardListDTO } from 'src/shared/dataprovider/api/model/cardListDTO';
import { CardTransactionRequest } from 'src/shared/dataprovider/api/model/cardTransactionRequest';
import { CardIdList, CardPhilId, CardPhilIdRemittance, ConfigFeeMethod, ConfigFeeMethodRemittance } from 'src/shared/dataprovider/local/data/common';
import { DropDownData } from 'src/shared/dataprovider/local/interface/commonInterface';
import { getAgentId, getCurrentUserId, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { SessionManager } from 'src/shared/helpers/session-manager';

@Component({
  selector: 'app-agent-remittance-transferbalance-form',
  templateUrl: './remittance-transferbalance-form.component.html',
  styleUrls: ['./remittance-transferbalance-form.component.scss']
})
export class RemittanceTransferbalanceFormComponent implements OnInit, OnDestroy {
  @Output() transactionSubmitted = new EventEmitter<void>();
  @Output() clientIdChange = new EventEmitter<number>();
  @Input() isLoading: boolean = false;
  @Input() isAdmin: boolean = false;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private cardsObservable!: Observable<any>;
  private cardsSubscription!: Subscription;
  private ObserveRemit!: Observable<any>;
  private SubscriptionRemit!: Subscription;
  private ObsCard!: Observable<any>;
  private SubsCard!: Subscription;
  private ObsFee!: Observable<any>;
  private SubsFee!: Subscription;
  private ObSubmit!: Observable<any>;
  private SubsSubmit!: Subscription;
  public isReadAndWrite:boolean = false;
  remittanceForm!: FormGroup;
  balanceTransferForm!: FormGroup;
  public bankWithdrawalFee: number | undefined;
  public usdtWithdrawalFee: number | undefined;
  public cashPickUpWithdrawalFee: number | undefined;
  public agentCards: AgentCard[] = [];
  selectedCashPickUpMethod: { id: number; name: string } | null = null;
  public listOfDestination: { 
    cardId: number, 
    id: number, 
    name: string, 
    accountname: string, 
    WithdrawalFees?: { 
      CashPickUpWithdrawalFee?: number; 
    } 
  }[] = [];
  selectAgent: {id: number; name: string} | null = null;
  public isReadonly: boolean = true;
  public isNoAvailableCard: boolean = false;
  public method: number = 0;
  public transferMethod: any = [];
  public refreshHistoryTable = false;
  public balance: string = "";
  public totalbalance = 0;
  public defaultAgentId: number = getAgentId('some-id') ?? 0;
  public getCurrentUserId: number = getCurrentUserId() ?? 0;
  public defaultClientName: string = '';
  public clientsDropdown: Array<{ id: number; name: string }> = [];
  public adminAgentDropdown: Array<{ id: number; name: string}> =[];
  public isAgentForm: boolean = true;
  public isBalanceTransfer = true;
  public isRemittance = false;
  public isTransfer = true;
  public isPickUp = false;
  resetFormTrigger = false;
  public headerTop = [
    { id: 1, isActive: true, label: "balanceTransfer" },
    { id: 2, isActive: false, label: "remitance" },
  ]
  public RemittanceHeader = [
    {id: 1, isActive: true, label: "transfer"},
    {id: 2, isActive: false, label: "pickUp"}
  ]
  cashPickUpForm!: FormGroup;
  public selectedMethod: any = null;
  cashPickupMethod = ConfigFeeMethodRemittance;
  selectedCardId: number | undefined;
  cardPhilIds = CardPhilIdRemittance;
  selectedCard: number | null = null;
  selectedFilesId: Blob[] = [];
  selectedFilesLetter: Blob[] = [];
  fileNamesId: string[] = [];
  fileNamesLetter: string[] = [];
  @ViewChild('fileInputId') fileInputId!: ElementRef;
  @ViewChild('fileInputLetter') fileInputLetter!: ElementRef;
  language: string = "";
  actionDisable: boolean = false;
  constructor(
    private _clientService: ClientService,
    private _agentService: AgentService,
    private _notification: NotificationService,
    private _fb: FormBuilder,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.initializeBalanceTransferForm();
    this.initializeRemittanceForm();
    this.initializePickUpForm();
  }

  ngOnInit() {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    this.selectedCashPickUpMethod = this.cashPickupMethod.find(method => method.id === 3) || null;
    this.getClientsDropdown();
    this.getTransferMethod(this.defaultAgentId); 
    this.getSelectAgentList();
    this.initializePickUpForm();

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.SubsSubmit) {
      this.SubsSubmit.unsubscribe();
    }
    if (this.SubsFee) {
      this.SubsFee.unsubscribe();
    }
  }

  initializePickUpForm() {
    const requesteeAdmin = this.isAdmin ? (this.getCurrentUserId ?? 0) : null;
    const agentId = this.isAdmin ? this.selectAgent?.id : this.defaultAgentId;
  
    this.cashPickUpForm = this._fb.group({
      AgentId: [agentId, Validators.required], 
      IdCardDestination: "",
      RequesterUserId: parseInt(SessionManager.getFromToken('Id')),
      RequesterAdminId: getCurrentUserId(),
      RequesterName: SessionManager.getFromToken('Name'),
      COPMethod: [{ value: 3, disabled: true }],
      CardIDType: [null, Validators.required],
      AuthorizedPerson: ['', Validators.required],
      IdNumber: ['', Validators.required],
      COPWithdrawalFee: "",
      Amount: ['', Validators.required],
      NetAmount: [{ value: '', disabled: true }], // Auto-calculated
      CardId: "", 
      Remarks: "",
      RequesteeAdmin: [requesteeAdmin]
    });
  
    console.log("Initialized Form AgentId:", this.cashPickUpForm.get('AgentId')?.value);
  
    this.cashPickUpForm.get('AgentId')?.valueChanges.subscribe(agentId => {
      const method = this.cashPickUpForm.get('COPMethod')?.value;
      this.getSelectCard(agentId, method);
    });
  
    this.cashPickUpForm.get('COPMethod')?.valueChanges.subscribe(method => {
      const agentId = this.cashPickUpForm.get('AgentId')?.value;
      this.getSelectCard(agentId, method);
    });
  
    // Update NetAmount for cashPickUpForm when Amount or COPWithdrawalFee changes
    this.cashPickUpForm.get('Amount')?.valueChanges.subscribe(() => {
      this.updateCashPickUpNetAmount();
    });
  
    this.cashPickUpForm.get('COPWithdrawalFee')?.valueChanges.subscribe(() => {
      this.updateCashPickUpNetAmount();
    });
  
    // Update NetAmount for remittanceForm when Amount or TransferWithdrawalFee changes
    this.remittanceForm.get('Amount')?.valueChanges.subscribe(() => {
      this.updateRemittanceNetAmount();
    });
  
    this.remittanceForm.get('TransferWithdrawalFee')?.valueChanges.subscribe(() => {
      this.updateRemittanceNetAmount();
    });
  }


  initializeBalanceTransferForm(clientId?: string) {
    const selectedClientId = this.isAdmin 
      ? this.selectAgent?.id ?? null
      : this.defaultAgentId;
    const requestee = this.selectAgent?.id ?? this.defaultAgentId;
    const requesteeAdmin = this.isAdmin ? this.getCurrentUserId : null;
    this.balanceTransferForm = this._fb.group({
      ClientId: [clientId ?? selectedClientId, Validators.required],  
      ChannelId: [''], 
      Amount: ['', Validators.required],
      Remarks: [''],
      Requestee: [requestee, Validators.required],  // ✅ Ensure correct assignment
      RequesteeAdmin: [requesteeAdmin]  // ✅ Set admin ID only if user is an admin
    });
}


initializeRemittanceForm() {
  const agentId = this.isAdmin ? this.selectAgent?.id || null : this.defaultAgentId;
  const requesteeAdmin = this.isAdmin ? this.getCurrentUserId : null;
  
  this.remittanceForm = this._fb.group({
    AgentId: [agentId, Validators.required],  
    ClientId: "",
    IdCardDestination: "",
    RequesterUserId: parseInt(SessionManager.getFromToken('Id')),
    RequesterName: SessionManager.getFromToken('Username'),
    TransferMethod: "",
    Amount: ['', Validators.required],
    CardId: "",
    NetAmount: [{ value: '', disabled: true }], 
    TransferWithdrawalFee: [{ value: '', disabled: false }], 
    Remarks: "",
    RequesteeAdmin: [requesteeAdmin]
  });

  // Subscribe to changes in Amount and TransferWithdrawalFee
  this.remittanceForm.get('Amount')?.valueChanges.subscribe(() => {
    this.updateRemittanceNetAmount();
  });

  this.remittanceForm.get('TransferWithdrawalFee')?.valueChanges.subscribe(() => {
    this.updateRemittanceNetAmount();
  });
}

formatAmount(amountValue: string) {
  if (!amountValue) return;
  let formattedValue = amountValue.replace(/[^0-9.]/g, '');
  const splitValue = formattedValue.split('.');
  if (splitValue.length > 2) {
      formattedValue = `${splitValue[0]}.${splitValue.slice(1).join('')}`;
  }
  const integerPart = splitValue[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPart = splitValue[1] ? '.' + splitValue[1].substring(0, 2) : '';
  const finalFormattedValue = integerPart + decimalPart;
  this.remittanceForm.get('Amount')?.setValue(finalFormattedValue, { emitEvent: false });
}


changeActiveHeader(item: any, type: string) {
  if (type === 'top') {
      this.headerTop.forEach(header => (header.isActive = false));
      item.isActive = true;

      if (item.label === 'balanceTransfer') {
          this.isBalanceTransfer = true;
          this.isRemittance = false;
      } else if (item.label === 'remitance') {
          this.isBalanceTransfer = false;
          this.isRemittance = true;
      }
  } else if (type === 'remittance') {
      this.RemittanceHeader.forEach(header => (header.isActive = false));
      item.isActive = true;

      this.isTransfer = item.label === 'transfer';
      this.isPickUp = item.label === 'pickUp';
  }
}

getTransferMethod(agentId: number) {
  this.ObserveRemit = this._agentService.apiAgentCardListGet(agentId);
  this.SubscriptionRemit = this.ObserveRemit.subscribe({
    next: (response: AgentCard[]) => {
      const uniqueTypes = new Set<number>();

      response.forEach(agentCard => {
        if (agentCard.Type !== undefined) {
          uniqueTypes.add(agentCard.Type);
        }
      });
      this.transferMethod = Array.from(uniqueTypes)
        .filter(type => type === 1 || type === 2)  
        .map(type => ({
          id: type,
          name: this.mapTypeToDescription(type)
        }));
      if (this.cashPickUpForm.get('COPMethod')?.value === 3) {
        const filteredCards = response.filter(card => card.Type === 3);  
        if (filteredCards.length > 0) {
          const firstCard = filteredCards[0];
          this.cashPickUpForm.patchValue({ CardId: firstCard.CardId });
        }
      }
      this.setMethodToThree();
    },
    error: (error: HttpErrorResponse) => {
      this._notification.showNotification("Error:" + error.error, "close", "error");
    }
  });
}

mapTypeToDescription(type: number): string {
  switch (type) {
    case 1:
      return 'Bank';
    case 2:
      return 'USDT';
    default:
      return '';  
  }
}
  

getSelectCard(agentId: number, type: number) {
  this.ObsCard = this._agentService.apiAgentCardListGet(agentId, type);
  this.SubsCard = this.ObsCard.subscribe({
    next: (response: AgentCard[]) => {
      if (response && response.length > 0) {
        let filteredCards: AgentCard[] = [];

        if (type === 1) {
          filteredCards = response.filter(card => card.Type === 1);
          console.log('Filtered Bank Cards:', filteredCards);
        } else if (type === 2) {
          filteredCards = response.filter(card => card.Type === 2);
          console.log('Filtered USDT Cards:', filteredCards);
        }

        this.listOfDestination = filteredCards.map(card => ({
          id: card.AgentId,
          cardId: card.CardId ?? 0, 
          name: card.BankName || card.BinanceWalletAddress || 'Unknown Name', 
          accountname: card.AccountName || 'Unknown Account' 
        }));

        if (this.listOfDestination.length > 0) {
          this.cashPickUpForm.patchValue({ CardId: this.listOfDestination[0].cardId });
        }

        this.isNoAvailableCard = filteredCards.length === 0;
      } else {
        this.listOfDestination = [];
        this.isNoAvailableCard = true;
      }
    },
    error: (error: HttpErrorResponse) => {
      this._notification.showNotification('Error fetching agent cards: ' + error.error, "close", "error");
      this.isNoAvailableCard = true;
    }
  });
}

onSelectCard(selectedOption: any) {
  if (!selectedOption || typeof selectedOption.cardId !== 'number') {
    console.error('Invalid selection:', selectedOption);
    return;
  }
  const cardId = selectedOption.cardId;
  this.selectedCardId = cardId;
  this.remittanceForm.patchValue({ CardId: cardId }); 
  const foundCard = this.listOfDestination.find(card => card.cardId === cardId);

  if (foundCard) {
    console.log('User Selected Card:', selectedOption);
    console.log('Updated Form CardId:', this.remittanceForm.get('CardId')?.value);
    if (foundCard.WithdrawalFees && foundCard.WithdrawalFees.CashPickUpWithdrawalFee !== undefined) {
      this.remittanceForm.patchValue({ COPWithdrawalFee: foundCard.WithdrawalFees.CashPickUpWithdrawalFee });
      console.log('COPWithdrawalFee autofilled:', foundCard.WithdrawalFees.CashPickUpWithdrawalFee);
    } else {
      console.warn('COPWithdrawalFee or CashPickUpWithdrawalFee not available for this card.');
    }
  } else {
    console.warn('Card not found in listOfDestination');
  }
}

onClientPhilId(selectedCard: { id: number; name: string }) {
  if (selectedCard && selectedCard.id !== undefined) {
    this.selectedCard = selectedCard.id;
    this.cashPickUpForm.patchValue({
      CardIDType: selectedCard.id
    });
  }
}


onSelectChange(selectedTransferMethod: { id: number; name: string }) {
  if (!selectedTransferMethod) return;
  this.selectedMethod = selectedTransferMethod.id;
  this.method = selectedTransferMethod.id;
  this.isNoAvailableCard = false;
  if (this.remittanceForm) {
    this.remittanceForm.get('TransferMethod')?.setValue(selectedTransferMethod.id);
    const agentId = this.isAdmin ? this.selectAgent?.id || this.defaultAgentId : this.selectAgent?.id || this.defaultAgentId;
    this.getRemittanceFee(agentId, this.method);
    if ([1, 2].includes(this.method)) {
      this.getSelectCard(agentId, this.method);
    }
    const transferFeeControl = this.remittanceForm.get('TransferWithdrawalFee');
    this.method === 3 ? transferFeeControl?.disable() : transferFeeControl?.enable();
  }
}


getRemittanceFee(agentId: number, type: number) {
  this.ObsFee = this._agentService.apiAgentCardListGet(agentId, 1, 100, '');
  this.SubsFee = this.ObsFee.subscribe({
    next: (response: CardListDTO[]) => {
      const card = response?.[0];
      if (card && card.WithdrawalFees) {
        const { BankWithdrawalFee, USDTWithdrawalFee, CashPickUpWithdrawalFee } = card.WithdrawalFees;
        this.remittanceForm.patchValue({ TransferWithdrawalFee: 0 });
        switch (type) {
          case 1: 
            this.remittanceForm.patchValue({ TransferWithdrawalFee: BankWithdrawalFee });
            break;
          case 2: 
            this.remittanceForm.patchValue({ TransferWithdrawalFee: USDTWithdrawalFee });
            break;
          case 3: 
            this.remittanceForm.patchValue({ TransferWithdrawalFee: 0 }); 
            if (this.cashPickUpForm) {
              this.cashPickUpForm.patchValue({
                COPWithdrawalFee: CashPickUpWithdrawalFee,
                WithdrawalType: type 
              });
            }
            break;
          default:
            console.error('Unknown withdrawal type selected.');
        }
      } else {
        console.error('No withdrawal fees available for this card.');
      }
    },
    error: (error: HttpErrorResponse) => {
      this._notification.showNotification("Error:" + error.error, "close", "error");
    }
  });
}


setMethodToThree() {
  this.cashPickUpForm.get('COPMethod')?.setValue(3);

  if (this.isAdmin) {
    if (this.selectAgent) {
      this.getRemittanceFee(this.selectAgent.id, 3);
    } else {
      console.warn("Admin has not selected an agent yet.");
    }
  } else {
    this.getRemittanceFee(this.defaultAgentId, 3);
  }
}

updateCashPickUpNetAmount() {
  const amountValue = this.cleanAndParseNumber(this.cashPickUpForm.get('Amount')?.value);
  const feeValue = this.cleanAndParseNumber(this.cashPickUpForm.get('COPWithdrawalFee')?.value);
  const netAmount = amountValue;

  this.cashPickUpForm.get('NetAmount')?.setValue(this.formatNumberWithCommas(netAmount), { emitEvent: false });
}

updateRemittanceNetAmount() {
  const amountValue = this.cleanAndParseNumber(this.remittanceForm.get('Amount')?.value);
  const feeValue = this.cleanAndParseNumber(this.remittanceForm.get('TransferWithdrawalFee')?.value);
  const netAmount = amountValue;

  this.remittanceForm.get('NetAmount')?.setValue(this.formatNumberWithCommas(netAmount), { emitEvent: false });
}

// Utility function to clean and parse numbers
cleanAndParseNumber(value: any): number {
  if (!value) return 0;
  const cleanedValue = value.toString().replace(/,/g, '').trim();
  return isNaN(parseFloat(cleanedValue)) ? 0 : parseFloat(cleanedValue);
}

// Utility function to format numbers with commas and two decimal places
formatNumberWithCommas(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

onSubmitRemittance() {
  let agentId = this.isAdmin ? this.remittanceForm.get('AgentId')?.value : this.defaultAgentId;
  agentId = agentId !== null && agentId !== undefined ? Number(agentId) : 0;
  const requestedByAdmin = this.isAdmin ? this.getCurrentUserId : undefined;
  const amount = Number(this.remittanceForm.get('Amount')?.value) || 0;
  const withdrawalFee = Number(this.remittanceForm.get('TransferWithdrawalFee')?.value) || 0;
  const totalAmount = amount + withdrawalFee;
  const remarks = this.remittanceForm.get('Remarks')?.value || '';
  const selectedMethod = this.remittanceForm.get('TransferMethod')?.value;
  const remittanceType = this.transferMethod.find((method: { Name: any }) => method.Name === selectedMethod)?.Type;
  this.ObSubmit = this._agentService.apiAgentCardTransactionRemittanceRequestPostForm(
    agentId, 
    amount,                      
    withdrawalFee,                
    totalAmount,                  
    selectedMethod as AgentBankType, 
    this.selectedCardId,          
    remarks, 
    undefined, // authorizedPerson
    undefined, // idType
    undefined, // idNumber
    undefined, // uploadId
    undefined, // uploadAuthorizationLetter
    requestedByAdmin 
  );
  this.SubsSubmit = this.ObSubmit.subscribe({
    next: (response: AgentCardTransaction) => {
      this.actionDisable = true;
      this._notification.showNotification(
        'Transaction successful!', 'Close', 'success'
      );
      this.resetForm();
    },
    error: (error: HttpErrorResponse) => {
      if (error.status === 400 && error.error?.message === 'Insufficient balance') {
        this._notification.showNotification(
          'Insufficient balance for this transaction. Please check your wallet.', 'Close', 'error'
        );
      } else {
        console.error('Error:', error);
      }
    },
    complete: () => {
      this.actionDisable = false;
    }
  });
}


resetForm() {
  const agentId = this.isAdmin ? this.selectAgent?.id || null : this.defaultAgentId;
  const requesteeAdmin = this.isAdmin ? this.getCurrentUserId : null;

  // Toggle resetFormTrigger to ensure reset
  this.resetFormTrigger = false;
  setTimeout(() => {
    this.resetFormTrigger = true;
  }, 0);

  // Reset Balance Transfer Form
  this.balanceTransferForm.reset({
    ClientId: '',
    ChannelId: '',
    Amount: '',
    Remarks: '',
    Requestee: '',
    RequesteeAdmin: requesteeAdmin
  });

  // Reset Remittance Form
  this.remittanceForm.reset({
    AgentId: agentId,
    ClientId: "",
    IdCardDestination: "",
    RequesterUserId: parseInt(SessionManager.getFromToken('Id')),
    RequesterName: SessionManager.getFromToken('Username'),
    TransferMethod: "",
    Amount: '',
    CardId: "",
    NetAmount: "",
    TransferWithdrawalFee: { value: "", disabled: true },
    Remarks: "",
    RequesteeAdmin: requesteeAdmin
  });

  // Reset Cash Pickup Form
  this.cashPickUpForm = this._fb.group({
    AgentId: agentId,
    IdCardDestination: "",
    RequesterUserId: parseInt(SessionManager.getFromToken('Id')),
    RequesterAdminId: "",
    RequesterName: SessionManager.getFromToken('Name'),
    COPMethod: [{ value: 3, disabled: true }],
    CardIDType: [null, Validators.required],
    AuthorizedPerson: ['', Validators.required],
    IdNumber: ['', Validators.required],
    COPWithdrawalFee: "",
    Amount: ['', Validators.required],
    NetAmount: "",
    CardId: "",
    Remarks: "",
    RequesteeAdmin: requesteeAdmin
  });

  // Reset file uploads
  this.selectedFilesId = [];
  this.fileNamesId = [];
  this.selectedFilesLetter = [];
  this.fileNamesLetter = [];
  this.cashPickUpForm.patchValue({
    depositSlipsId: null,
    depositSlipsLetter: null
  });

  // Update Net Amount when values change
  this.cashPickUpForm.get('Amount')?.valueChanges.subscribe(() => this.updateRemittanceNetAmount());
  this.cashPickUpForm.get('COPWithdrawalFee')?.valueChanges.subscribe(() => this.updateRemittanceNetAmount());
  this.remittanceForm.get('Amount')?.valueChanges.subscribe(() => this.updateRemittanceNetAmount());
  this.remittanceForm.get('TransferWithdrawalFee')?.valueChanges.subscribe(() => this.updateRemittanceNetAmount());
}



  onSubmitBalanceTransfer() {
    if (this.balanceTransferForm.invalid) {
      return;
    }
    const clientId = this.balanceTransferForm.get('ClientId')?.value;
    const amount = this.balanceTransferForm.get('Amount')?.value;
    const remarks = this.balanceTransferForm.get('Remarks')?.value || 'Transfer request';
    const requestee = this.balanceTransferForm.get('Requestee')?.value;
    const requesteeAdmin = this.balanceTransferForm.get('RequesteeAdmin')?.value || undefined; 

    this.observable = this._agentService.apiAgentRequestBalanceForTransferCreatePost(
      requestee, clientId, amount, remarks, requesteeAdmin
    );

    this.subscription = this.observable.subscribe({
      next: () => {
        this.actionDisable = true;
        this._notification.showNotification("Transfer Balance successfully submitted", "close", 'success');
        this.refreshHistoryTable = true;
        this.resetForm();
        this.transactionSubmitted.emit(); 
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", 'error');
      },
      complete: ()=> {
        this.actionDisable = false;
      }
    });
}

  reloadClientData(): void {
    this.getClientsDropdown();
  }

  getSelectAgentList() {
    this.subscription = this._agentService.apiAgentManagementGetAllAgentsForAdminGet().subscribe({
      next: (response: AgentUsernameDTO[]) => {
        this.adminAgentDropdown = response.map(agent => ({
          id: agent.Id ?? 0, 
          name: agent.Name ?? "Unknown",
          agentType: agent.AgentType,
        }));
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error: " + error.error, "close", "error");
      }
    });
  }

  onSelectAgent(selectAgent: { id: number; name: string }) {
    this.selectAgent = selectAgent;

    // ✅ Update the form instead of reinitializing it
    this.remittanceForm.patchValue({ AgentId: this.selectAgent.id });
    this.cashPickUpForm.patchValue({ AgentId: this.selectAgent.id });


    // Pass the selected agent's ID to getClientsDropdown
    this.getClientsDropdown(this.selectAgent.id);
    this.getTransferMethod(this.selectAgent.id);
    this.getSelectCard(this.selectAgent.id, this.method || 1);
}

  

  onClientChange(selectedClient: { id: number; name: string }) {
    if (selectedClient) {
      this.balanceTransferForm.patchValue({ 
        ClientName: selectedClient.name,
        ChannelId: '' 
      });
  
      // Reset balances
      this.balance = "0";
      this.totalbalance = 0;
      this.clientIdChange.emit(selectedClient.id);
      this.initializeBalanceTransferForm(selectedClient.id.toString());
  
      console.log("Client changed:", selectedClient);
    } else {
      console.error("Invalid client selected.");
    }
  }
  
  


  getClientsDropdown(agentId?: number, agentType?: AgentTypeEnum) {
    const selectedAgentId = agentId ?? this.defaultAgentId;
  
    this.observable = this._agentService.apiAgentManagementGetAllBrandNamesGet(selectedAgentId, agentType);
    this.subscription = this.observable.subscribe({
      next: (response: Array<BrandNameDTO>) => {
        if (response && response.length > 0) {
          this.clientsDropdown = response
            .filter(client => client.Id !== 1 && client.Id !== 2) 
            .map((client: BrandNameDTO) => ({
              id: client.Id || 0,
              name: client.BrandName || '',
            }));
  
          // If the user is an agent, auto-select their default agent
          if (!agentId) {  // This means the user is an agent (not admin)
            const defaultClient = this.clientsDropdown.find(client => client.id === this.defaultAgentId);
            if (defaultClient) {
              this.defaultClientName = defaultClient.name ?? ''; 
              this.balanceTransferForm.patchValue({ ClientName: this.defaultClientName });
            }
          }
        } else {
          console.error('Unexpected response format or empty clients list');
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching clients:', error);
      }
    });
  }
  

  //CashPickUpFrom
  onSubmitcashPickup() {
    if (this.cashPickUpForm.invalid) {
      console.error('Form is invalid');
      return;
    }

    const formData = this.cashPickUpForm.value;
    const requestedByAdmin = this.isAdmin ? this.getCurrentUserId : undefined;

    // Ensure NetAmount is correctly formatted before passing it as totalAmount
    const totalAmount = this.cleanAndParseNumber(this.cashPickUpForm.get('NetAmount')?.value);

    const requestPayload = {
      agentId: formData.AgentId,
      amount: this.cleanAndParseNumber(formData.Amount), // Ensure number format
      withdrawalFee: this.cleanAndParseNumber(formData.COPWithdrawalFee),
      totalAmount: totalAmount, // ✅ Pass NetAmount as totalAmount
      remittanceMethod: AgentBankType.NUMBER_3,  
      cardId: formData.CardId,
      remarks: formData.Remarks,
      authorizedPerson: formData.AuthorizedPerson,
      idType: formData.CardIDType,
      idNumber: formData.IdNumber,
      uploadId: this.selectedFilesId,
      uploadAuthorizationLetter: this.selectedFilesLetter,
      requestedByAdmin: requestedByAdmin // ✅ Assign correctly based on admin/agent
    };

    this.observable = this._agentService.apiAgentCardTransactionRemittanceRequestPostForm(
      requestPayload.agentId,
      requestPayload.amount,
      requestPayload.withdrawalFee,
      requestPayload.totalAmount, // ✅ Ensure NetAmount is passed correctly
      requestPayload.remittanceMethod,
      requestPayload.cardId,
      requestPayload.remarks,
      requestPayload.authorizedPerson,
      requestPayload.idType,
      requestPayload.idNumber,
      requestPayload.uploadId,               
      requestPayload.uploadAuthorizationLetter,
      requestPayload.requestedByAdmin // ✅ Pass requestedByAdmin correctly
    );

    this.subscription = this.observable.subscribe({
      next: (response) => {
        this.actionDisable = true;
        this._notification.showNotification('Transaction successful!', 'close', 'success');
        this.resetForm(); // ✅ Reset form after successful submission
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification('Error: ' + error.error, "close", "error");
      },
      complete: () => {
        this.actionDisable = false;
      }
    });
}


  
  onFilesSelectedId(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFilesId = Array.from(input.files).map(file => file as File);
      this.fileNamesId = Array.from(input.files).map(file => file.name);
      this.cashPickUpForm.patchValue({ depositSlipsId: this.selectedFilesId });
    }
  }
  
  onFilesSelectedLetter(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFilesLetter = Array.from(input.files).map(file => file as File);
      this.fileNamesLetter = Array.from(input.files).map(file => file.name);
      this.cashPickUpForm.patchValue({ depositSlipsLetter: this.selectedFilesLetter });
    }
  }
  
  triggerUploadId(): void {
    this.fileInputId.nativeElement.click();
  }
  
  triggerUploadLetter(): void {
    this.fileInputLetter.nativeElement.click();
  }
  
  
  
}

