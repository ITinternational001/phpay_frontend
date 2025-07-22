import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { WallettransferHistoryComponent } from 'src/shared/components/reusables/wallettransfer-history/wallettransfer-history.component';
import { ClientService, VendorsService, MerchantsService, MerchantDTO } from 'src/shared/dataprovider/api';
import { CardDTO } from 'src/shared/dataprovider/api/model/cardDTO';
import { ClientBalanceDTO } from 'src/shared/dataprovider/api/model/clientBalanceDTO';
import { ClientBalanceResultDTO } from 'src/shared/dataprovider/api/model/clientBalanceResultDTO';
import { ClientWalletDTO } from 'src/shared/dataprovider/api/model/clientWalletDTO';
import { ClientWalletListDTO } from 'src/shared/dataprovider/api/model/clientWalletListDTO';
import { MerchantsListDTO } from 'src/shared/dataprovider/api/model/merchantsListDTO';
import { WithdrawalFeeDTO } from 'src/shared/dataprovider/api/model/withdrawalFeeDTO';
import { MerchantCardData, ConfigFeeMethod, CardIdList, CardPhilId, ConfigFeeMethodRemittance, CardPhilIdRemittance } from 'src/shared/dataprovider/local/data/common';
import { DropDownData } from 'src/shared/dataprovider/local/interface/commonInterface';
import { getCurrentUserClientId, DecimalPipeConverter, convertFormattedAmount, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { SessionManager } from 'src/shared/helpers/session-manager';

@Component({
  selector: 'app-client-remittances',
  templateUrl: './client-remittances.component.html',
  styleUrls: ['./client-remittances.component.scss']
})
export class ClientRemittancesComponent implements OnInit {
  @Input() isAdmin: boolean = false;
  isLoading = false;
  resetDropdown = false;
  dataSource = new MatTableDataSource<any>([]);
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private clientObservable!: Observable<any>;
  private clientSubscription!: Subscription;
  private vendorObservable!: Observable<any>;
  private vendorSubscription!: Subscription;
  private pickUpObservable!: Observable<any>;
  private pickUpSubscription!: Subscription;
  private merchantObservable!: Observable<any>;
  private merchantSubscription!: Subscription;
  private cardsObservable!: Observable<any>;
  private cardsSubscription!: Subscription;
  private feeObservable!: Observable<any>;
  private feeSubscription!: Subscription;
  private obsClient!: Observable<any>;
  private subsClient!: Subscription;
  public isRemittances: boolean = true;
  public MerchantCard = MerchantCardData.merchantCard;
  displayedColumns: string[] = ['id', 'status', 'timestamp', 'transactionId', 'walletSource', 'totalAmount', 'balanceAfterTransfer'];
  requestForm!: FormGroup;
  cashPickUpForm!: FormGroup;
  displayedClientList: string[] = ['ClientName', 'WalletBalance', 'RemittanceWallet'];
  totalItems: number = 0;
  itemsPerPage: number = 100;
  currentPage: number = 1;
  public isReadAndWrite: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Output() refreshData = new EventEmitter<void>(); // Add this line
  clientList!: FormGroup;
  public listOfWallet: { Id: number, Name: string, VendorId: number, Balance: number, TotalCashIn: number, TotalCashOut: number }[] = [];
  public listOfDestination: { id: number, name: string }[] = [];
  public transferMethod: any = [];
  public merchantBalance: number = 0;
  public merchantFee: number = 0;
  public topData: any;
  cashPickupMethod = ConfigFeeMethodRemittance;
  cardPhilIds = CardPhilIdRemittance;
  public vendorId: number = 0;
  public method: number = 0;
  public isRemittanceChanged: boolean = false;
  actionDisable: boolean = false;
  public isReadonly: boolean = true;
  public selectedClientId: number | null = null;
  transferHistoryData: any;
  public isNoAvailableCard: boolean = false;
  selectedFilesId: Blob[] = [];
  selectedFilesLetter: Blob[] = [];
  fileNamesId: string[] = [];
  fileNamesLetter: string[] = [];
  @ViewChild('fileInputId') fileInputId!: ElementRef;
  @ViewChild('fileInputLetter') fileInputLetter!: ElementRef;
  public clientId: number = parseInt(SessionManager.getFromToken('ClientId'));
  public headerTop = [
    { id: 1, isActive: true, label: "transfer" },
    { id: 2, isActive: false, label: "pickUp" },
  ]
  clientsDropdown: Array<{ id: number; name: string; balance?: number }> = [];
  selectedIdCard!: { id: number; name: string };
  selectedCashPickUpMethod: { id: number; name: string } | null = null;
  selectedClient: number | null = null;
  selectedCard: number | null = null;
  language: string = "";
  amountErrorMessage = "This field is required";
  isInsufficient: boolean = false;
  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private clientService: ClientService,
    private notification: NotificationService,
    private _fb: FormBuilder,
    private vendorService: VendorsService,
    private merchantService: MerchantsService,
    private _decimalpipe: DecimalPipe,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.clientId = getCurrentUserClientId();
  }

  initializeForm(): void {
    this.requestForm = this._fb.group({
      ClientId: "",
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
      ClientId: 0,
      IdCardDestination: "",
      RequesterUserId: parseInt(SessionManager.getFromToken('Id')),
      RequesterName: SessionManager.getFromToken('Name'),
      Method: [{ value: 3, disabled: this.isReadonly }],
      CardIDType: [null,],
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
  }

  ngOnInit() {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    this.getWithdrawalFeesByClientId();
    this.initializeForm();
    this.selectedCashPickUpMethod = this.cashPickupMethod.find(method => method.id === 3) || null;
    this.getMerchantByClientId();
    this.initializeForm();
    this.onClientCardList(this.clientId);
    this.setupFormListeners();
    this.getClientWallet('');
    this.getAllClients();
    this.clientList = new FormGroup({
      firstName: new FormControl(''),
    });
    this.refreshData.subscribe(() => this.loadPage(1, this.clientList.getRawValue()));
  }

  refreshTable(): void {
    this.refreshData.emit();
  }

  onSelectChange(selectedTransferMethod: { id: number, name: string }) {
    if (selectedTransferMethod.id) {
      this.method = selectedTransferMethod.id;
      this.isNoAvailableCard = false;
      this.getCardsByClientId(selectedTransferMethod?.id);
      this.requestForm.patchValue({ Method: selectedTransferMethod.id })
    }
  }
  onClientChange(selectedClient: { id: number, name: string }) {
    this.selectedClient = selectedClient.id;
    this.transferMethod = [];
    this.transferMethod = ConfigFeeMethodRemittance;
    this.requestForm.patchValue({
      Method: 0,
      ClientId: selectedClient.id
    })
  }
  onSelectIdDestination(selectedIdCard: { id: number; name: string }) {
    this.selectedIdCard = selectedIdCard;
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


  onClientRemittanceChange(selectedClientCOF: { id: number; name: string }) {

    this.transferMethod = [];
    this.transferMethod = CardIdList;
    const currentMethodValue = this.cashPickUpForm.get('Method')?.value;

    // Patch ClientId in form
    this.cashPickUpForm.patchValue({
      Method: currentMethodValue || 0,
      ClientId: selectedClientCOF.id,
    });

    this.computeNetAmount('cashPickUpForm', selectedClientCOF);

    // Pass selectedClientId.id to onClientCardList
    if (selectedClientCOF?.id) {
      this.onClientCardList(selectedClientCOF.id);
    } else {
    }
  }





  onRequestRemittance() {
    if (this.requestForm.valid) {
      this.isRemittanceChanged = false;
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
          this.resetDropdown = true;
          // setTimeout(() => {
          //   this.resetDropdown = false;  // Reset the flag
          // }, 100);

        },
        error: (error: HttpErrorResponse) => {
          this.notification.showNotification("Error: " + error.error, "close", 'error');
          this.resetForm();
          this.resetDropdown = true;
          setTimeout(() => {
            this.resetDropdown = false;  // Reset the flag
          }, 100);

        },
        complete: () => {
          this.actionDisable = false;
        }
      })
    }
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

  getMerchantByClientId() {
    this.merchantObservable = this.merchantService.apiMerchantsGetMerchantsByClientIdGet(this.clientId);
    this.merchantSubscription = this.merchantObservable.subscribe({
      next: (response: MerchantsListDTO) => {
        if (response.Data && Array.isArray(response.Data)) {
          this.listOfWallet = response.Data.map((item: MerchantDTO) => {
            return {
              Id: item.Id ?? 0,
              Name: item.Name ?? '',
              VendorId: item.Vendor?.Id ?? 0,
              Balance: item.Balance ?? 0,
              TotalCashIn: item.TotalCashIn ?? 0,
              TotalCashOut: item.TotalCashOut ?? 0
            };
          });
        } else {
          this.notification.showNotification("No merchants data available", "close", "error");
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error: " + error.error, "close", "error");
      },
      complete: () => {
        this.merchantSubscription.unsubscribe();
      }
    });
  }

  getCardsByClientId(type: number) {
    //display the cards/wallet ito ung sa BANK
    const formGroup = this.requestForm;
    const id: number = formGroup.get("ClientId")?.getRawValue();
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
          let clientbalance = this.clientsDropdown.find(x => x.id == this.selectedClient)?.balance ?? 0;
          let convertedAmount = convertFormattedAmount(amount);
          console.log(amount);
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


  computeNetAmount(formType: 'requestForm' | 'cashPickUpForm', selectedClient?: { id: number, name: string }): void {
    const form = formType === 'requestForm' ? this.requestForm : this.cashPickUpForm;
    let rawAmount = form.get('Amount')?.value;
    let clientId = selectedClient?.id || form.get("ClientId")?.getRawValue(); // Ensure clientId is correctly assigned
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


  getClientWallet(keyword: string): void {
    this.isLoading = true;
    const page = this.currentPage;
    const limit = this.itemsPerPage;
    const clientId: number | undefined = undefined;

    this.subscription = this.clientService.getBalanceForEachChannel(clientId, limit, page, keyword).subscribe({
      next: (response: ClientBalanceResultDTO) => {
        if (response && Array.isArray(response.Clients)) {
          this.totalItems = response.TotalRecords!;
          console.log("asdasd", response);
          const tableData = response.Clients.map((client: ClientBalanceDTO) => {

            return {
              ClientID: client.ClientId,
              ClientName: client.ClientName,
              RemittanceWallet: client.SettlementWalletBalance,
              AvailableBalance: client.AvailableBalance,
            };
          });
          this.dataSource = new MatTableDataSource(tableData);
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }

          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        } else {
          console.error('Response.Clients is not an array', response);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error: " + error.error, "close", "error");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  openTransferHistory(): void {
    const dialogRef = this.dialog.open(WallettransferHistoryComponent, {
      width: '80%',
      height: '80%',
      data: {

      }
    });

    dialogRef.afterClosed().subscribe(result => {
    });
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


  loadPage(page: number, keyword: string): void {
    this.currentPage = page;
    this.getClientWallet(keyword);
  }

  onFirstPage(): void {
    this.loadPage(1, this.clientList.getRawValue());
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, this.clientList.getRawValue());
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1, this.clientList.getRawValue());
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), this.clientList.getRawValue());
  }
  onPageChange(page: number): void {
    this.loadPage(page, this.clientList.getRawValue());

  }
  onSearch(query: string): void {
    this.loadPage(1, query);
  }


  resetForm(): void {
    this.requestForm.reset({
      ClientId: "",
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
    this.cashPickUpForm.reset({
      ClientId: 0,
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
    this.fileNamesId = [];
    this.fileNamesLetter = [];
    const fileInputId = document.querySelector('#fileInputId') as HTMLInputElement | null;
    const fileInputLetter = document.querySelector('#fileInputLetter') as HTMLInputElement | null;
    if (fileInputId) {
      fileInputId.value = '';
    }

    if (fileInputLetter) {
      fileInputLetter.value = '';
    }
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

  onSubmitcashPickup() {
    this.isRemittanceChanged = false;
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
    console.log('ID Type to be sent:', idType);
    const remarks = this.cashPickUpForm.get('Remarks')?.value;
    const feeOnTopPercent = this.cashPickUpForm.get('FeeOnTopPercent')?.value;
    const feeOnTopFixed = this.cashPickUpForm.get('FeeOnTopFixed')?.value;
    const feeAtCostPercent = this.cashPickUpForm.get('FeeAtCostPercent')?.value;
    const feeAtCostFixed = this.cashPickUpForm.get('FeeAtCostFixed')?.value;
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
        this.isRemittanceChanged = true;
        this.resetForm();
        this.resetDropdown = true;
        // setTimeout(() => {
        //   this.resetDropdown = false;  // Reset the flag
        // }, 100);
        this.notification.showNotification("Withdrawal Request Submitted!", "close", 'success');
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error: " + error.error, "close", 'error');
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






  onClientCardList(clientId: number): void {
    const cardType = 3;
    this.observable = this.clientService.apiClientGetCardsByClientIdGet(clientId, undefined, undefined, undefined, cardType);
    this.subscription = this.observable.subscribe({
      next: (response: CardDTO[]) => {
        if (response && response.length > 0) {
          const idCardDestination = response[0]?.Id;
          if (idCardDestination) {
            this.cashPickUpForm.patchValue({ IdCardDestination: idCardDestination });
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification('Error' + error.error, "closed", "error");
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


