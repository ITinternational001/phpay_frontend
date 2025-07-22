import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { TransferMethod, TopCardData, remittanceTransData, ConfigFeeMethod, MerchantCardData, CardIdList, CardPhilId, ConfigFeeMethodRemittance, CardPhilIdRemittance } from '../../../shared/dataprovider/local/data/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ClientService, MerchantDTO, MerchantsService, VendorsService, } from 'src/shared/dataprovider/api';
import { debounceTime, Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { convertFormattedAmount, DecimalPipeConverter, getClientId, getCurrentUserClientId, getUserPermissionsAccess } from 'src/shared/helpers/helper';

import { SessionManager } from 'src/shared/helpers/session-manager';
import { WithdrawalFeeDTO } from 'src/shared/dataprovider/api/model/withdrawalFeeDTO';
import { DecimalPipe } from '@angular/common';
import { TransferModalComponent } from 'src/shared/components/modals/transfer-modal/transfer-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { WallettransferHistoryComponent } from 'src/shared/components/reusables/wallettransfer-history/wallettransfer-history.component';
import { ClientBalanceResultDTO } from 'src/shared/dataprovider/api/model/clientBalanceResultDTO';
import { DropDownData } from 'src/shared/dataprovider/local/interface/commonInterface';
import { CardDTO } from 'src/shared/dataprovider/api/model/cardDTO';
import { ActivatedRoute } from '@angular/router';
import { ClientWalletListDTO } from 'src/shared/dataprovider/api/model/clientWalletListDTO';
import { MerchantsListDTO } from 'src/shared/dataprovider/api/model/merchantsListDTO';
import { TranslateService } from '@ngx-translate/core';
import { ClientWalletDTO } from 'src/shared/dataprovider/api/model/clientWalletDTO';




@Component({
  selector: 'app-remittance',
  templateUrl: './remittance.component.html',
  styleUrls: ['./remittance.component.scss']
})
export class RemittanceComponent implements OnInit {
  @Input() isAdmin: boolean = false;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private clientObservable!: Observable<any>;
  private clientSubscription!: Subscription;
  private vendorObservable!: Observable<any>;
  private vendorSubscription!: Subscription;
  private merchantObservable!: Observable<any>;
  private merchantSubscription!: Subscription;
  private pickUpObservable!: Observable<any>;
  private pickUpSubscription!: Subscription;
  private cardsObservable!: Observable<any>;
  private cardsSubscription!: Subscription;
  private feeObservable!: Observable<any>;
  private feeSubscription!: Subscription;
  private obsClient!: Observable<any>;
  private subsClient!: Subscription;
  public MerchantCard = MerchantCardData.merchantCard;
  displayedColumns: string[] = ['id', 'status', 'timestamp', 'transactionId', 'walletSource', 'totalAmount', 'balanceAfterTransfer'];
  requestForm!: FormGroup;
  cashPickUpForm!: FormGroup;
  public listOfWallet: { Id: number, Name: string, VendorId: number, Balance: number, TotalCashIn: number, TotalCashOut: number }[] = [];
  public transferMethod = ConfigFeeMethodRemittance;
  public merchantBalance: number = 0;
  public merchantFee: number = 0;
  public topData: any;
  public vendorId: number = 0;
  public method: number = 0;
  public clientId: number = parseInt(SessionManager.getFromToken('ClientId'));
  public isRemittances: boolean = true;
  public isRemittanceChanged: boolean = false;
  public clientsDropdown: Array<{ id: number; name: string; balance?: number }> = [];
  public isReadAndWrite: boolean = false;
  actionDisable: boolean = false;
  cardPhilIds = CardPhilIdRemittance;
  transferHistoryData: any;
  cashPickupMethod = ConfigFeeMethodRemittance;
  selectedCashPickUpMethod: { id: number; name: string } | null = null;
  selectedCard: number | null = null;
  selectedIdCard!: { id: number; name: string };
  public listOfDestination: { id: number, name: string }[] = [];
  public isNoAvailableCard: boolean = false;
  selectedFilesId: Blob[] = [];
  selectedFilesLetter: Blob[] = [];
  fileNamesId: string[] = [];
  fileNamesLetter: string[] = [];
  amountErrorMessage = "This field is required";
  isInsufficient: boolean = false;
  @ViewChild('fileInputId') fileInputId!: ElementRef;
  @ViewChild('fileInputLetter') fileInputLetter!: ElementRef;

  public headerTop = [
    { id: 1, isActive: true, label: "transfer" },
    { id: 2, isActive: false, label: "pickUp" },
  ]
  language: string = "";
  constructor(
    private dialog: MatDialog,
    private clientService: ClientService,
    private notification: NotificationService,
    private _fb: FormBuilder,
    private vendorService: VendorsService,
    private merchantService: MerchantsService,
    private _decimalpipe: DecimalPipe,
    private route: ActivatedRoute,
    private translateService: TranslateService) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.clientId = getCurrentUserClientId();
  }

  initializeForm(): void {
    this.requestForm = this._fb.group({
      ClientId: getCurrentUserClientId(),
      IdCardDestination: 0,
      RequesterUserId: parseInt(SessionManager.getFromToken('Id')),
      RequesterName: SessionManager.getFromToken('Name'),
      Method: "",
      FeeOnTop: "",
      FeeOnTopPercent: "",
      FeeOnTopFixed: "",
      FeeAtCost: "",
      FeeAtCostPercent: "",
      FeeAtCostFixed: "",
      WithdrawalFee: "",
      Amount: ['', Validators.required],
      NetAmount: "",
      Remarks: "",
    });
    this.cashPickUpForm = this._fb.group({
      ClientId: getCurrentUserClientId(),
      IdCardDestination: "",
      RequesterUserId: parseInt(SessionManager.getFromToken('Id')),
      RequesterName: SessionManager.getFromToken('Name'),
      Method: [{ value: 3, disabled: true }],
      CardIDType: 0,
      AuthorizedPerson: ['', Validators.required],
      IdNumber: ['', Validators.required],
      FeeOnTop: "",
      FeeOnTopPercent: "",
      FeeOnTopFixed: "",
      FeeAtCost: "",
      FeeAtCostPercent: "",
      FeeAtCostFixed: "",
      WithdrawalFee: "",
      Amount: ['', Validators.required],
      NetAmount: "",
      Remarks: "",
    });
    this.onClientCardList();
  }

  ngOnInit() {
    this.selectedCashPickUpMethod = this.cashPickupMethod.find(method => method.id === 3) || null;
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    this.getWithdrawalFeesByClientId();
    this.getMerchantByClientId();
    this.initializeForm();
    this.setupFormListeners();
    this.getClientById(this.clientId);
    this.getAllClients();
  }



  onWalletChange(event: any) {
    const foundWallet = this.listOfWallet.find(wallet => wallet.Id === event.value);
    if (foundWallet) {
      this.requestForm.patchValue({ VendorId: foundWallet.VendorId });
      this.vendorId = foundWallet.VendorId;
      this.topData = [
        {
          label: "walletBalance",
          value: 0,
          icon: "fa-solid fa-coins",
        },
        {
          label: "remittanceBalance",
          value: 0,
          icon: "fa-solid fa-coins",
        },

      ];
    } else {
    }
  }

  onSelectChange(selectedTransferMethod: { id: number, name: string }) {
    if (selectedTransferMethod.id) {
      this.method = selectedTransferMethod.id;
      this.isNoAvailableCard = false;
      this.getCardsByClientId(selectedTransferMethod?.id);
      this.requestForm.patchValue({ Method: selectedTransferMethod.id })
    }
  }

  onSelectIdDestination(selectedIdCard: { id: number; name: string }) {
    this.selectedIdCard = selectedIdCard; // Store the selected card data
    console.log("Selected Card:", this.selectedIdCard);
    this.requestForm.patchValue({
      IdCardDestination: selectedIdCard.id
    });
  }

  onClientPhilId(selectedCard: { id: number; name: string }) {
    if (selectedCard && selectedCard.id !== undefined) {
      this.selectedCard = selectedCard.id;
      this.cashPickUpForm.patchValue({
        CardIDType: selectedCard.id // Ensure only the ID is passed
      });
    }
  }

  onRequestRemittance() {
    let amount = this.requestForm.get('Amount')?.getRawValue();
    let fee = this.requestForm.get('WithdrawalFee')?.getRawValue();
    let parsedAmount = convertFormattedAmount(amount);
    let parsedFee = convertFormattedAmount(fee);
    this.requestForm.patchValue({ Amount: parsedAmount, WithdrawalFee: parsedFee });
    this.clientObservable = this.clientService.apiClientRequestWithdrawalPost(this.requestForm.value);
    this.clientSubscription = this.clientObservable.subscribe({
      next: (response) => {
        this.actionDisable = true;
        this.notification.showNotification("Withdrawl Request Submitted!", "close", 'success');
        this.isRemittanceChanged = true;
        this.resetForm();
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error: " + error.error, "close", 'error');
        this.resetForm();
      },
      complete: () => {
        this.actionDisable = false;
      }
    })
  }

  getWithdrawalFeesByClientId() {
    this.feeObservable = this.clientService.apiClientGetWithdrawalFeesByClientGet(this.clientId);
    this.feeSubscription = this.feeObservable.subscribe({
      next: (response) => { },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error loading fees: " + error.error + "please refresh the page.", "close", "error");
      },
      complete: () => {
      }
    });
  }

  getClientById(clientId: number) {
    this.clientObservable = this.clientService.apiClientGetClientByIdGet(clientId);
    this.clientSubscription = this.clientObservable.subscribe({
      next: (response) => {
        this.topData = [
          {
            label: "walletBalance",
            value: DecimalPipeConverter(response.TopUpBalance, this._decimalpipe),
            icon: "fa-solid fa-coins",
          },
          {
            label: "remittanceBalance",
            value: DecimalPipeConverter(response.RemittanceWalletBalance, this._decimalpipe),
            icon: "fa-solid fa-coins",
          }
        ];
      },
      error: () => { },
      complete: () => {
        this.clientSubscription.unsubscribe();
      }
    });
  }

  getMerchantByClientId() {
    this.merchantObservable = this.merchantService.apiMerchantsGetMerchantsByClientIdGet(this.clientId);
    this.merchantSubscription = this.merchantObservable.subscribe({
      next: (response: MerchantsListDTO) => {  // If MerchantsListDTO is an array
        if (response.Data != null) {
          this.listOfWallet = response.Data.map((item: any) => {
            return { Id: item.Id, Name: item.Name, VendorId: item.Vendor.Id, Balance: item.Balance, TotalCashIn: item.TotalCashIn, TotalCashOut: item.TotalCashOut };
          });
        }
      },
      error: () => { },
      complete: () => {
        this.merchantSubscription.unsubscribe();
      }
    });
  }

  getCardsByClientId(type: number) {
    //display the cards/wallet ito ung sa BANK
    const id: number = getCurrentUserClientId();
    this.cardsObservable = this.clientService.apiClientGetCardsByClientIdGet(id);
    this.cardsSubscription = this.cardsObservable.subscribe({
      next: (response) => {
        this.listOfDestination = [];
        if (response != null && Array.isArray(response.Data)) {
          response.Data.map((item: any) => {
            if (item.Type == type) {
              this.listOfDestination.push({ id: item.Id, name: item.NickName })
            }
          });
          if (this.listOfDestination.length <= 0) {
            this.isNoAvailableCard = true;
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error loading client cards: " + error.error, "close", "error");
      },
      complete: () => {
      }
    });
  }


  setupFormListeners(): void {
    this.requestForm.get('Amount')?.valueChanges
      .pipe(debounceTime(300))
      .subscribe(amount => {
        if (this.clientsDropdown) {
          let clientbalance = this.clientsDropdown.find(x => x.id == getCurrentUserClientId())?.balance ?? 0;
          let convertedAmount = convertFormattedAmount(amount);
          console.log(convertedAmount);
          if (convertedAmount <= clientbalance) {
            this.isInsufficient = false;
            this.computeNetAmount('requestForm');
          } else {
            this.isInsufficient = true;
            this.amountErrorMessage = "Insuficient amount to withdraw";
          }
        }
      });

    this.cashPickUpForm.get('Amount')?.valueChanges
      .pipe(debounceTime(300))
      .subscribe(amount => {
        this.computeNetAmount('cashPickUpForm');
      });
  }


  computeNetAmount(formType: 'requestForm' | 'cashPickUpForm'): void {
    const form = formType === 'requestForm' ? this.requestForm : this.cashPickUpForm;
    let rawAmount = form.get('Amount')?.value;
    let clientId = getCurrentUserClientId() || form.get("ClientId")?.getRawValue(); // Ensure clientId is correctly assigned
    let method = form.get("Method")?.value;
    if (formType === 'cashPickUpForm' && method !== 3) {
      console.warn("Incorrect Method for cashPickUpForm. Setting Method to 3 for 'CASH PICK-UP'.");
      form.patchValue({ Method: 3 });
      method = 3;
    }

    let feeAtCost = 0, feeOnTop = 0, netAmount = 0, withdrawalFee = 0;
    let FeeAtCostPercent = 0, FeeAtCostFixed = 0, FeeOnTopPercent = 0, FeeOnTopFixed = 0,
      computedFeeAtCostPercent = 0, computedFeeOnTopPercent = 0,
      computedFeeAtCostFixed = 0, computedFeeOnTopFixed = 0;
    if (rawAmount && typeof rawAmount === 'string') {
      let amount = convertFormattedAmount(rawAmount);
      if (amount) {
        this.clientObservable = this.clientService.apiClientGetWithdrawalFeesByClientGet(clientId);
        this.clientSubscription = this.clientObservable.subscribe({
          next: (response: Array<WithdrawalFeeDTO>) => {
            if (response && response.length > 0) {
              const selectedFee = response.find(item => item.ClientId === clientId && item.Method === method);
              if (selectedFee) {
                FeeAtCostPercent = selectedFee?.FeeAtCostPercent || 0;
                FeeAtCostFixed = selectedFee?.FeeAtCostFixed || 0;
                FeeOnTopPercent = selectedFee?.FeeOnTopPercent || 0;
                FeeOnTopFixed = selectedFee?.FeeOnTopFixed || 0;

                const chunks = Math.ceil(amount / 50000);

                computedFeeAtCostFixed = chunks * FeeAtCostFixed;
                computedFeeOnTopFixed = chunks * FeeOnTopFixed;
                computedFeeAtCostPercent = (amount * (FeeAtCostPercent / 100));
                computedFeeOnTopPercent = (amount * (FeeOnTopPercent / 100));

                feeAtCost = computedFeeAtCostPercent + computedFeeAtCostFixed;
                feeOnTop = computedFeeOnTopPercent + computedFeeOnTopFixed;

                withdrawalFee = feeAtCost + feeOnTop;
                form.patchValue({ FeeAtCost: feeAtCost, FeeOnTop: feeOnTop });
              } else {
                console.warn("No fee data found for this client and method.");
                withdrawalFee = 0;
                form.patchValue({ NetAmount: 0, WithdrawalFee: 0 });
              }
            } else {
              withdrawalFee = 0;
              form.patchValue({ NetAmount: 0, WithdrawalFee: 0 });
            }

            netAmount = amount;
            form.patchValue({
              NetAmount: netAmount > 0 ? netAmount.toFixed(2) : 0,
              WithdrawalFee: DecimalPipeConverter(withdrawalFee, this._decimalpipe),
              FeeOnTopPercent: computedFeeOnTopPercent,
              FeeOnTopFixed: computedFeeOnTopFixed,
              FeeAtCostPercent: computedFeeAtCostPercent,
              FeeAtCostFixed: computedFeeAtCostFixed,
            });
          },
          error: (error: HttpErrorResponse) => {
            //this.notification.showNotification("Error: " + error.error, "close", "success");
          },
          complete: () => { }
        });
      } else {
        form.patchValue({ NetAmount: 0, WithdrawalFee: 0 });
      }
    }
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
  openTransferHistory(): void {
    const dialogRef = this.dialog.open(WallettransferHistoryComponent, {
      width: '80%', // Adjust the width as needed
      height: '80%', // Adjust the height as needed
      data: {

      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Handle any result from the dialog if necessary
      console.log('Dialog closed with result:', result);
    });
  }

  resetForm(): void {
    // Resetting the requestForm
    this.requestForm.reset({
      ClientId: getCurrentUserClientId(),
      IdCardDestination: 0,
      RequesterUserId: parseInt(SessionManager.getFromToken('Id')),
      RequesterName: SessionManager.getFromToken('Username'),
      Method: "",
      FeeOnTop: "",
      FeeOnTopPercent: "",
      FeeOnTopFixed: "",
      FeeAtCost: "",
      FeeAtCostPercent: "",
      FeeAtCostFixed: "",
      WithdrawalFee: "",
      Amount: "",
      NetAmount: "",
      Remarks: "",
    });

    // Resetting the cashPickUpForm
    this.cashPickUpForm.reset({
      ClientId: getCurrentUserClientId(),
      IdCardDestination: "",
      RequesterUserId: parseInt(SessionManager.getFromToken('Id')),
      RequesterName: SessionManager.getFromToken('Name'),
      Method: 3,
      CardIDType: 0,
      AuthorizedPerson: "",
      IdNumber: "",
      FeeOnTop: "",
      FeeOnTopPercent: "",
      FeeOnTopFixed: "",
      FeeAtCost: "",
      FeeAtCostPercent: "",
      FeeAtCostFixed: "",
      WithdrawalFee: "",
      Amount: "",
      NetAmount: "",
      Remarks: "",
    });

    // Resetting the file names and clearing the file input values
    this.fileNamesId = [];
    this.fileNamesLetter = [];

    // Resetting file input elements with null check
    const fileInputId = document.querySelector('#fileInputId') as HTMLInputElement | null;
    const fileInputLetter = document.querySelector('#fileInputLetter') as HTMLInputElement | null;

    if (fileInputId) {
      fileInputId.value = ''; // Clear file input for ID
    }

    if (fileInputLetter) {
      fileInputLetter.value = ''; // Clear file input for Authorization Letter
    }
  }

  onFilesSelectedId(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFilesId = Array.from(input.files).map(file => file as File);
      this.fileNamesId = Array.from(input.files).map(file => file.name);
      // Handle the uploaded ID files (you can patch the form if necessary)
      this.cashPickUpForm.patchValue({ depositSlipsId: this.selectedFilesId });
    }
  }

  onFilesSelectedLetter(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFilesLetter = Array.from(input.files).map(file => file as File);
      this.fileNamesLetter = Array.from(input.files).map(file => file.name);
      // Handle the uploaded Authorization Letter files
      this.cashPickUpForm.patchValue({ depositSlipsLetter: this.selectedFilesLetter });
    }
  }

  triggerUploadId(): void {
    this.fileInputId.nativeElement.click();
  }

  triggerUploadLetter(): void {
    this.fileInputLetter.nativeElement.click();
  }

  changeActiveHeader(selectedItem: any) {
    this.headerTop.forEach(item => {
      item.isActive = (item === selectedItem);
    });
    if (selectedItem.id == 1) {
      this.isRemittances = true;
    }
    else {
      this.isRemittances = false;
    }
  }

  getAllClients() {
    if (this.subsClient) {
      this.subsClient.unsubscribe();
    }
    this.obsClient = this.clientService.apiClientGetAllClientsGet();
    this.subsClient = this.obsClient.subscribe({
      next: (response: ClientWalletListDTO) => {
        if (response && Array.isArray(response.Data)) {
          const clients = response.Data || [];
          this.clientsDropdown = clients
            .filter((item) => item.Id !== 1 && item.Id !== 2)
            .map((item: ClientWalletDTO) => ({
              id: item.Id ?? 0,
              name: item.Name ?? 'Unknown',
              balance: item.SettlementWalletBalance
            }));
        }
      },
      error: (error: HttpErrorResponse) => {
        //this.notification.showNotification("Error: " + error.error, "close", "error");
      }
    });
  }

  onSubmitcashPickup() {
    let amount = this.cashPickUpForm.get('Amount')?.getRawValue();
    let fee = this.cashPickUpForm.get('WithdrawalFee')?.getRawValue();
    let parsedAmount = convertFormattedAmount(amount);
    let parsedFee = convertFormattedAmount(fee);
    const clientId = this.cashPickUpForm.get('ClientId')?.value;
    const idCardDestination = this.cashPickUpForm.get('IdCardDestination')?.value;
    const requesterUserId = parseInt(SessionManager.getFromToken('Id'));
    const requesterName = SessionManager.getFromToken('Name');
    const method = 3;
    const netAmount = parsedAmount - parsedFee;
    const idNumber = this.cashPickUpForm.get('IdNumber')?.value;
    const fullNameIdHolder = this.cashPickUpForm.get('AuthorizedPerson')?.value;
    const idType = this.cashPickUpForm.get('CardIDType')?.value;
    const remarks = this.cashPickUpForm.get('Remarks')?.value;
    const feeOnTopPercent = this.cashPickUpForm.get('FeeOnTopPercent')?.value;
    const feeOnTopFixed = this.cashPickUpForm.get('FeeOnTopFixed')?.value;
    const feeAtCostPercent = this.cashPickUpForm.get('FeeAtCostPercent')?.value;
    const feeAtCostFixed = this.cashPickUpForm.get('FeeAtCostFixed')?.value;

    // Get the uploaded files
    const validIdFiles = this.selectedFilesId.map(file => file as Blob);
    const letterFiles = this.selectedFilesLetter.map(file => file as Blob);

    this.pickUpObservable = this.clientService.apiClientRequestWithdrawalByCashPickupPostForm(
      idCardDestination,
      clientId,
      requesterUserId,
      requesterName,
      method,
      feeOnTopPercent,
      feeOnTopFixed,
      feeAtCostPercent,
      feeAtCostFixed,
      parsedAmount,
      netAmount,
      idNumber,
      fullNameIdHolder,
      idType,
      remarks,
      validIdFiles,
      letterFiles
    );

    this.pickUpSubscription = this.pickUpObservable.subscribe({
      next: (response) => {
        this.actionDisable = true;
        this.notification.showNotification("Withdrawal Request Submitted!", "close", 'success');
        this.isRemittanceChanged = true;
        this.resetForm();
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error: " + error.error, "close", 'error');
        this.resetForm();
      },
      complete: () => {
        this.actionDisable = false;
      }
    });
  }
  onClientCardList() {
    const cardType = 3;
    const clientId = getCurrentUserClientId();
    console.log('Fetching cards for ClientId:', clientId);
    this.observable = this.clientService.apiClientGetCardsByClientIdGet(
      clientId,
      undefined,
      undefined,
      undefined,
      cardType
    );
    this.subscription = this.observable.subscribe({
      next: (response: CardDTO[]) => {
        console.log('Card API response:', response);
        if (response && response.length > 0) {
          const idCardDestination = response[0]?.Id;
          if (idCardDestination) {
            this.cashPickUpForm.patchValue({ IdCardDestination: idCardDestination });
            console.log('IdCardDestination updated:', idCardDestination);
          } else {
            console.warn('No Id found in the first card response.');
          }
        } else {
          console.warn('No cards found for the specified clientId and cardType.');
        }
      },
      error: (err) => {
        console.error('Error fetching cards:', err);
      }
    });
  }

  onClientRemittanceChange(event: any) {
    this.transferMethod = [];
    this.transferMethod = ConfigFeeMethodRemittance;
    this.cashPickUpForm.patchValue({ Method: 0 })
  }



}
