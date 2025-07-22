import { Component, OnInit } from '@angular/core';
import { TopCardData } from '../../../../../shared/dataprovider/local/data/common';
import { ActivatedRoute } from '@angular/router';
import { ClientService, MerchantsService } from 'src/shared/dataprovider/api';
import { Observable, Subscription } from 'rxjs';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CreateWithdrawalFeesRequestDTO } from 'src/shared/dataprovider/api/model/createWithdrawalFeesRequestDTO';
import { HttpErrorResponse } from '@angular/common/http';
import { WfeeAddFormComponent } from '../wfee-add-form/wfee-add-form.component';
import { MatDialog } from '@angular/material/dialog';
import { ClientConfigureFeesDTO } from 'src/shared/dataprovider/api/model/clientConfigureFeesDTO';
import { VendorConfigureFeesDTO } from 'src/shared/dataprovider/api/model/vendorConfigureFeesDTO';
import { MerchantConfigureFeesDTO } from 'src/shared/dataprovider/api/model/merchantConfigureFeesDTO';
import { WithdrawalFeeConfigureDTO } from 'src/shared/dataprovider/api/model/withdrawalFeeConfigureDTO';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-client-configure',
  templateUrl: './client-configure.component.html',
  styleUrls: ['./client-configure.component.scss']
})
export class ClientConfigureComponent implements OnInit {
  public textFieldLenght = "80";
  public Name: string = "";
  private vendorId: number = 0;
  private clientId: number = 0;
  private obsClient!: Observable<any>;
  private subsClient!: Subscription;
  private obsMerchant!: Observable<any>;
  private subsMerchant!: Subscription;
  configurationForm!: FormGroup;
  public clientData!: any;
  public client: any;
  public topData: any;
  public cashInStatus: boolean = false;
  public cashOutStatus: boolean = false;
  public merchantStatus: boolean = false;
  public cashInStatuses : any = [];
  public cashOutStatuses : any = [];
  public isLoading: Boolean = false;
  language: string ="";
  constructor(private route: ActivatedRoute,
    private clientService: ClientService,
    private merchantService: MerchantsService, 
    private _fb: FormBuilder, 
    private _dialog: MatDialog, 
    private notificationService: NotificationService,
    private translateService: TranslateService) {
      this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);
      this.initializedForm();
  }

  onKey(event: any, type?: string, type_index?: number, vendor_index?: number, property?: string) {
    if (type && vendor_index !== undefined && type_index !== undefined && property) {
      let control;
      if (type == 'cashin') {
        control = this.configurationForm.get(`Vendors.${vendor_index}.Merchants.${type_index}.CashInFee.${property}`);
      } else if (type == 'cashout') {
        control = this.configurationForm.get(`Vendors.${vendor_index}.Merchants.${type_index}.CashOutFee.${property}`);
      } else if (type == 'withdrawal' && vendor_index == 100) {
        control = this.configurationForm.get(`WithdrawalFees.${type_index}.${property}`);
      }

      if (control) {
        control.setValue(parseFloat(event.target.value));
      }
    }
  }

  initializedForm() {
    this.configurationForm = this._fb.group({
      Id: '',
      Name: '',
      Vendors: this._fb.array([]),
      WithdrawalFees: this._fb.array([])
    });
  }


  ngOnInit(): void {
    this.initializeData();
  }

  initializeData() {
    this.route.queryParams.subscribe(params => {
      this.client = JSON.parse(params['data']);
      this.topData = [{
        label: "clientName",
        value: this.client.Name,
        icon: "fa fa-users"
      }];
      this.clientId = this.client.Id;
      this.getFeesConfigurationByClientId(this.clientId);
    });
  }

  openForm() {
    const dialogRef = this._dialog.open(WfeeAddFormComponent, { data: { clientId: this.clientId } });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getFeesConfigurationByClientId(this.clientId);
        }
      }
    });
  }

  onFormSubmit() {
    this.obsClient = this.clientService.apiClientUpdateFeesConfigurationClientIdPut(this.clientId, this.configurationForm.value);
    this.subsClient = this.obsClient.subscribe({
      next: () => {
        this.notificationService.showNotification("Configuration Updated Successfully! ", "Close", "success");
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification("Error: " + error.error, "Close", "error");
      }
    });
  }

  getFeesConfigurationByClientId(clientId: number) {
    this.isLoading = true;
    if (this.subsClient) {
      this.subsClient.unsubscribe();
    }
    this.obsClient = this.clientService.apiClientGetFeesConfigurationGet(clientId);
    this.subsClient = this.obsClient.subscribe({
      next: (response: ClientConfigureFeesDTO) => {
        this.getMerchantStatuses(response);
        this.clientData = response;
        this.getConfigurationFormData(response);
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification("Error: " + error.error, "close", "error");
      },
      complete:()=>{
        this.isLoading = false;
      }
    });
  }

  getMerchantStatuses(data:any){
     data.Vendors.map((v:any)=>{
      let a = v.Merchants.some((item:any) => item['CashInFee'].Status === 1);
      let b = v.Merchants.some((item:any) => item['CashOutFee'].Status === 1);
        this.cashInStatuses.push(a);
        this.cashOutStatuses.push(b);
    })
  }

  getConfigurationFormData(response:any){
    this.configurationForm.get('Id')?.setValue(response?.Id);
    this.configurationForm.get('Name')?.setValue(response?.Name);
    const vendorsArray = <FormArray>this.configurationForm.get('Vendors');
    const withdrawalFeesArray = <FormArray>this.configurationForm.get('WithdrawalFees');
    response.Vendors?.forEach((vendor: VendorConfigureFeesDTO) => {
      if (vendor.Merchants) {
        //MERCHANTS
        const merchantsArray = this._fb.array([]);
        vendor.Merchants?.forEach((merchant: MerchantConfigureFeesDTO) => {
          const merchantGroup = this._fb.group({
            Id: merchant.Id,
            Name: merchant.Name,
            Status: merchant.Status,
            VendorId: merchant.VendorId,
            CashInFee: this._fb.group({
              Id: merchant.CashInFee?.Id,
              TransactionType: merchant.CashInFee?.TransactionType,
              FeeOnTopPercent: merchant.CashInFee?.FeeOnTopPercent,
              FeeOnTopFixed: merchant.CashInFee?.FeeOnTopFixed,
              FeeAtCostPercent: merchant.CashInFee?.FeeAtCostPercent,
              FeeAtCostFixed: merchant.CashInFee?.FeeAtCostFixed,
              Status: merchant.CashInFee?.Status,
              LastUpdatedDate: merchant.CashInFee?.LastUpdatedDate
            }),
            CashOutFee: this._fb.group({
              Id: merchant.CashOutFee?.Id,
              TransactionType: merchant.CashOutFee?.TransactionType,
              FeeOnTopPercent: merchant.CashOutFee?.FeeOnTopPercent,
              FeeOnTopFixed: merchant.CashOutFee?.FeeOnTopFixed,
              FeeAtCostPercent: merchant.CashOutFee?.FeeAtCostPercent,
              FeeAtCostFixed: merchant.CashOutFee?.FeeAtCostFixed,
              Status: merchant.CashOutFee?.Status,
              LastUpdatedDate: merchant.CashInFee?.LastUpdatedDate
            }),
            PaymentChannel: this._fb.group({
              Id: merchant.PaymentChannel?.Id,
              Name: merchant.PaymentChannel?.Name
            })
          });
          (merchantsArray as FormArray).push(merchantGroup);
        });
        const vendorGroup = this._fb.group({
          Id: vendor.Id,
          Name: vendor.Name,
          Merchants: merchantsArray
        });
        vendorsArray.push(vendorGroup);
      }
    });
    //WITHDRAWAL FEES
    response.WithdrawalFees?.forEach((withdrawal: WithdrawalFeeConfigureDTO) => {
      if (withdrawal) {
        const withdrawalGroup = this._fb.group({
          Id: withdrawal.Id,
          ClientId: withdrawal.ClientId,
          Method: withdrawal.Method,
          MethodDescription: withdrawal.MethodDescription,
          FeeOnTopPercent: withdrawal.FeeOnTopPercent,
          FeeOnTopFixed: withdrawal.FeeOnTopFixed,
          FeeAtCostPercent: withdrawal.FeeAtCostPercent,
          FeeAtCostFixed: withdrawal.FeeAtCostFixed,
          Status: withdrawal.Status
        });
        (withdrawalFeesArray as FormArray).push(withdrawalGroup);
      }
    })
  }

  hasFeeWithStatusOne(data: any[], type: string): boolean {
    let a = data.some(item => item[type].Status === 1);
    this.merchantStatus = a;

    return this.merchantStatus;
  }

  toggleMerchantStatus(event: MatSlideToggleChange, data: any[], index:number ,type: string) {
    let vendorIndex = index;
    if (type === 'CashInFee' || type === 'CashOutFee') {
      const statusProperty = type === 'CashInFee' ? 'cashInStatus' : 'cashOutStatus';
      this[statusProperty] = event.checked;

      if (data) {
        data.forEach((merchant, index) => {
          merchant[type].Status = event.checked ? 1 : 2;    
          this.configurationForm.get(`Vendors.${vendorIndex}.Merchants.${index}.${type}`)?.patchValue({Status: event.checked ? 1: 2});
        });
      }
    }
  }

  toggleCICOStatus(data: any, event: any, type?: string, type_index?: number, vendor_index?: number, property?: string) {
    if (type && vendor_index !== undefined && type_index !== undefined && property) {
      let control;
      let merchantStatus = this.configurationForm.get(`Vendors.${vendor_index}.Merchants.${type_index}.Status`);
      if (type == 'cashin') {
        control = this.configurationForm.get(`Vendors.${vendor_index}.Merchants.${type_index}.CashInFee.${property}`);
      } else if (type == 'cashout') {
        control = this.configurationForm.get(`Vendors.${vendor_index}.Merchants.${type_index}.CashOutFee.${property}`);
      }
    
      if (control) {
        control.setValue(event.checked ? 1 : 2);
        if (event.checked) {
          merchantStatus?.setValue(1);
          let a = this.configurationForm.get(`Vendors.${vendor_index}.Merchants`)?.value;
          if(type=='cashin'){
            this.cashInStatuses[vendor_index] = true;  
          }else if(type=='cashout'){
            this.cashOutStatuses[vendor_index] = true;
          }
        }else{
          this.cashInStatuses = [];
          this.cashOutStatuses = [];
          this.getMerchantStatuses(this.configurationForm.value);
         
        }1
      }
    }
  }

  getStatusValue(status: number | undefined, transactionType: string | undefined): boolean {
    if (status == 1) {
      return true;
    } else {
      return false;
    }
  }
}
