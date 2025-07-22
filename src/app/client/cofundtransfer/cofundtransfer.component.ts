import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService, VendorsService, MerchantsService, MerchantDTO, TransactionsService } from 'src/shared/dataprovider/api';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { BankDTO } from 'src/shared/dataprovider/api/model/bankDTO';
import { MerchantsListDTO } from 'src/shared/dataprovider/api/model/merchantsListDTO';
import { TopUpSummaryData } from 'src/shared/dataprovider/api/model/topUpSummaryData';
import { WithdrawalFeeDTO } from 'src/shared/dataprovider/api/model/withdrawalFeeDTO';
import { ConfigFeeMethod } from 'src/shared/dataprovider/local/data/common';
import { formatDateUtc, getWeekBeforeDateRange } from 'src/shared/helpers/helper';
import { SessionManager } from 'src/shared/helpers/session-manager';

@Component({
  selector: 'app-cofundtransfer',
  templateUrl: './cofundtransfer.component.html',
  styleUrls: ['./cofundtransfer.component.scss']
})
export class CofundtransferComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  fileNames: string[] = [];
  private observable! : Observable<any>;
  private subscription! : Subscription;
  private observableClient! : Observable<any>;
  private subscriptionClient! : Subscription;
  private obsBalanceTransfer!: Observable<any>;
  private subsBalanceTransfer!: Subscription;
  private obsCo! : Observable<any>;
  private subsCo! : Subscription;

  requestForm!: FormGroup;
  balanceTransferForm!:FormGroup;
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
  public Banks! : any;
  public Clients : any= [];
  public ClientsBalanceTransfer : any= [];
  public PaymentChannels : any = [];
  public CoTransactionData : any;
  public balance : number =0;
  public isLoading: boolean = false;
  public headerTop = [
    { id: 1, isActive: true, label: "Manual Top-up" },
    { id: 2, isActive: false, label: "Balance Transfer" },
  ]

  constructor(
    private _notification: NotificationService,
    private _fb: FormBuilder,
    private _merchantService: MerchantsService,
    private _clientService : ClientService,
    private _transactionService : TransactionsService,
    private _reportsService: ReportsService) {
    this.clientId = parseInt(SessionManager.getFromToken('ClientId'));
    this.requestForm = this._fb.group({
      merchantId: 28,
      amount: '',
      modeOfPayment:'',
      referenceNumber:'',
      dateOfDepositSlip:'',
      remarks:'', 
      depositSlips: [[]]
    });

    this.balanceTransferForm = this._fb.group({
      ClientId: this.clientId,
      ChannelId:'',
      Amount:0,
      Remarks:''
    });

    this.TopUpForm = _fb.group({
      StartDate: getWeekBeforeDateRange().startDate,
      EndDate: getWeekBeforeDateRange().endDate,
      ClientId: this.clientId
    });

    this.TopUpForm.get("EndDate")?.valueChanges.subscribe(() => {
      this.getCoFundTransactions();
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

  async ngOnInit(){
    await this.getClientDropdown();
    await this.getBanks();
    await this.getCoFundTransactions();
  }

  onSubmitBalanceTransfer(){
    this.obsBalanceTransfer = this._transactionService.apiTransactionsBalanceTransferRequestFundForCOPost(this.balanceTransferForm.value);
    this.subsBalanceTransfer = this.obsBalanceTransfer.subscribe({
      next:(response)=>{
        if(response != null){
          this.getCoFundTransactions();
        }
        this._notification.showNotification("Balance Transfer has been successfull" ,"close","success");

      },
      error:(error:HttpErrorResponse)=>{
        this._notification.showNotification("There's an error on transferring account " + error.error,"close","error");
      }
    });
  }

  onSubmitManualTopUp(){
    if(this.subscription){
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
        next:(response)=>{
          if(response != null){
            this.getCoFundTransactions();
          }
          this._notification.showNotification("Request for top up has been submitted","close","success");
        },
        error:(error:HttpErrorResponse)=>{
          this._notification.showNotification("Request encountered an error "+error.error,"close","error");

        }
      });
    }
  }

  getCoFundTransactions() {
    this.isLoading=true;
    if(this.subsCo){
      this.subsCo.unsubscribe();
    }
    this.obsCo = this._reportsService.apiReportsGetRequestFundForCOListPost(this.TopUpForm.value);
    this.subsCo = this.obsCo.subscribe({
      next: (response) => {
        this.CoTransactionData = response; 
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "cancel", "error");
      },
      complete:()=>{
        this.isLoading = false;
      }
    })
  }

  getBanks(){
    if(this.subscription){
      this.subscription.unsubscribe();
    }
    this.observable = this._clientService.apiClientGetBanksGet();
    this.subscription = this.observable.subscribe({
      next:(response : BankDTO)=>{
        this.Banks = response;
      },
      error:(error:HttpErrorResponse)=>{
        this._notification.showNotification("No banks available" +error.error,"close","error");
      }
    });
  }

  onChannelChange(event : any){
    const channel = this.PaymentChannels.find((channel:any) => channel.Id === event.value);
    this.balance = channel.Balance;
  }

  getClientDropdown(){  
    this.observableClient = this._merchantService.apiMerchantsGetMerchantsByClientIdGet(this.clientId);
    this.subscriptionClient = this.observableClient.subscribe({
      next: (response: MerchantsListDTO) => { // Assuming response is an array of MerchantDTO
        const target = response.Data?.find((merchant: any) => 
          merchant.Vendor.Name === "Digipay" && merchant.PaymentChannel.Name === "Instapay"
        );
        
        const clientForBalanceTransfer = response.Data?.find((merchant: any) => 
          merchant.Balance > 0
        );
  
        response.Data?.map((item: MerchantDTO) => {
          const channelId = item.PaymentChannel?.Id;
          const channelExists = this.PaymentChannels.some((channel: any) => channel.Name === item.PaymentChannel?.Name);
          if (!channelExists) {
            this.PaymentChannels.push({Id: channelId, Name: item.PaymentChannel?.Name, Balance: item.Balance});
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
        this._notification.showNotification("No client available" + error.error, "close", "error");
      },
      complete: () => {
        // Do any necessary completion tasks here
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
