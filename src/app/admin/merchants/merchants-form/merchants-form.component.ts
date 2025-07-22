import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService, FeesService, MerchantDTO, MerchantsService, PaymentChannelDTO, PaymentChannelsService, StatusEnum, VendorDTO, VendorsService } from 'src/shared/dataprovider/api';
import { ClientWalletListDTO } from 'src/shared/dataprovider/api/model/clientWalletListDTO';
import { Status, StatusDropdown } from 'src/shared/dataprovider/local/data/common';
import { getUserPermissionsAccess } from 'src/shared/helpers/helper';

@Component({
  selector: 'app-merchants-form',
  templateUrl: './merchants-form.component.html',
  styleUrls: ['./merchants-form.component.scss']
})
export class MerchantsFormComponent implements OnInit {
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private obsMerchant!: Observable<any>;
  private subsMerchant!: Subscription;
  private obsMerchantUpdate!: Observable<any>;
  private subsMerchantUpdate!: Subscription;
  private obsPaymentChannel!: Observable<any>;
  private subsPaymentChannel!: Subscription;
  public clientsList: Array<{ id: number; name: string }> = [];
  public vendorsList: Array<{id: number; name: string}> = [];
  public statusEnum = StatusDropdown;
  public isReadonly: boolean = false;
  public isReadAndWrite: boolean = false;
  public paymentChannelList: Array<{id: number; name: string}> = [];
  public selectedChannel: { id: number; name: string } | null = null;
  public selectedVendor: { id: number; name: string} | null = null;
  public selectedClient: { id: number; name: string} | null = null;
  public selectedStatus: { id: number; name: string} | null = null;
  actionDisable: boolean = false;
  merchantForm: FormGroup;
  language: string ="";
  constructor(private _fb: FormBuilder,
    private _dialogRef: MatDialogRef<MerchantsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _vendorService: VendorsService,
    private _merchantService: MerchantsService,
    private _clietService: ClientService,
    private _feeService: FeesService,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private _paymentChannelService: PaymentChannelsService,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.merchantForm = this._fb.group({
      Merchant: this._fb.group({
        Id: '',
        Name: '',
        Status: '',
        VendorId: '',
        ClientId: '',
        PaymentChannelId: '',
        CashInFee: this._fb.group({
          FeeAtCostFixed: 0,
          FeeAtCostPercent: 0,
          FeeOnTopFixed: 0,
          FeeOnTopPercent: 0,
          TransactionType: 1,
          Status: 0
        }),
        CashOutFee: this._fb.group({
          FeeAtCostFixed: 0,
          FeeAtCostPercent: 0,
          FeeOnTopFixed: 0,
          FeeOnTopPercent: 0,
          TransactionType: 2,
          Status: 0
        })
      })
    });
  }    

  ngOnInit() {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    this.getAllClient();
    this.getAllVendor();
    this.getAllPaymentChannels();
    if (this.data) {
      this.initializePatchData();
    }
  }

  initializePatchData() {
    this.isReadonly = this.data.isReadonly;
    this.selectedStatus = this.statusEnum.find(status => status.id === this.data.Status) || null;
    this.merchantForm.patchValue({
      Merchant: {
        ReadOnly: this.isReadonly,
        Id: this.data.Id,
        Name: this.data.Name,
        Status: this.selectedStatus ? this.selectedStatus.id : null,
        VendorId: this.selectedVendor ? this.selectedVendor.id : this.data.Vendor?.Id,
        ClientId: this.selectedClient ? this.selectedClient.id : this.data.Client?.Id, 
        PaymentChannelId: this.selectedChannel ? this.selectedChannel.id : this.data.PaymentChannel?.Id,
        CashInFee: {
          FeeAtCostFixed: this.data?.CashInFee?.FeeAtCostFixed,
          FeeAtCostPercent: this.data?.CashInFee?.FeeAtCostPercent,
          FeeOnTopFixed: this.data?.CashInFee?.FeeOnTopFixed,
          FeeOnTopPercent: this.data?.CashInFee?.FeeOnTopPercent,
          TransactionType: this.data?.CashInFee?.TransactionType,
          Status: this.data.Status
        },
        CashOutFee: {
          FeeAtCostFixed: this.data?.CashOutFee?.FeeAtCostFixed,
          FeeAtCostPercent: this.data?.CashOutFee?.FeeAtCostPercent,
          FeeOnTopFixed: this.data?.CashOutFee?.FeeOnTopFixed,
          FeeOnTopPercent: this.data?.CashOutFee?.FeeOnTopPercent,
          TransactionType: this.data?.CashOutFee?.TransactionType,
          Status: this.data.Status
        }
      },
    });
  }

  onFormSubmit() {
    if (this.data) {
      if (this.merchantForm) {
        const formValue = { ...this.merchantForm.value };
        formValue.Merchant.CashInFee.Id = this.data?.CashInFee?.Id; 
        formValue.Merchant.CashOutFee.Id = this.data?.CashOutFee?.Id; 
        formValue.Merchant.Id = this.data?.Id; 
        formValue.Merchant.CashInFee.Status = formValue.Merchant.Status;
        formValue.Merchant.CashOutFee.Status = formValue.Merchant.Status;
      }
      this.obsMerchantUpdate = this._merchantService.apiMerchantsUpdateMerchantWithFeesPost(this.merchantForm.value);
      this.subsMerchantUpdate = this.obsMerchantUpdate.subscribe({
        next: (response) => {
          this.actionDisable = true;
          // this._dialogRef.close(true);
          this.notification.showNotification("Data Updated Successfully", "close", 'success');
        },
        error: (error: HttpErrorResponse) => {
          this.notification.showNotification(error.error, "close", 'error');
        },
        complete: () => {
          this.actionDisable = false;
          this._dialogRef.close(true);
         }
      });
    } else {
      if (this.merchantForm) {
        const cashInFeeStatusControl = this.merchantForm.get('Merchant.CashInFee.Status');
        const cashOutFeeStatusControl = this.merchantForm.get('Merchant.CashOutFee.Status');
        const merchantStatusControl = this.merchantForm.get('Merchant.Status')?.value;
        cashInFeeStatusControl?.setValue(merchantStatusControl);
        cashOutFeeStatusControl?.setValue(merchantStatusControl);
      }

      this.obsMerchant = this._merchantService.apiMerchantsCreateMerchantWithFeesPost(this.merchantForm.value);
      this.subsMerchant = this.obsMerchant.subscribe({
        next: (response) => {
          this.actionDisable = true;
          // this._dialogRef.close(true);
          this.notification.showNotification("Data Added Successfully", "close", 'success');
        },
        error: (error: HttpErrorResponse) => {
          this.notification.showNotification("Error:"+ error.error, "close", 'error');
        },
        complete: () => { 
          this._dialogRef.close(true);
        }
      });
    }

  }

  getAllPaymentChannels() {
    this.obsPaymentChannel = this._paymentChannelService.apiPaymentChannelsGetPaymentChannelsByPageGet();
    this.subsPaymentChannel = this.obsPaymentChannel.subscribe({
      next: (response: PaymentChannelDTO[]) => {
        this.paymentChannelList = response
          .filter((channel) => channel.Id !== undefined && channel.Name !== undefined)
          .map((channel) => ({
            id: channel.Id!,
            name: channel.Name!,
          }));
        if (this.data?.PaymentChannel?.Id) {
          const selectedChannel = this.paymentChannelList.find(channel => channel.id === this.data.PaymentChannel.Id);
          if (selectedChannel) {
            this.selectedChannel = selectedChannel;
            this.initializePatchData();
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification(`Error: ${error.error}`, "close", "error");
      },
      complete: () => {
      },
    });
  }
  
  onPaymentChannelChange(selectedChannel: { id: number; name: string }) {
    this.selectedChannel = selectedChannel;
    this.merchantForm.patchValue({
      Merchant: {
        PaymentChannelId: selectedChannel.id
      }
    });
    this.initializePatchData();
  }
  
  getAllClient() {
    this.observable = this._clietService.apiClientGetAllClientsGet();
    this.subscription = this.observable.subscribe({
      next: (response: ClientWalletListDTO) => {
        const clients = response.Data || [];
        this.clientsList = clients
          .filter((item) => item.Id !== undefined && item.Id !== undefined)
          .map((item) => ({
            id: item.Id ?? 0,
            name: item.Name ?? 'Unknown',
          }));
          if (this.data.Client?.Id) {
            const selectedClient = this.clientsList.find(client => client.id === this.data.Client.Id);
            if (selectedClient) {
              this.selectedClient = selectedClient;
              this.initializePatchData();
            }
          }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification(
          "Error:" + error.error,
          "close",
          "error"
        );
      },
      complete: () => {}
    });
  }

onClientChange(selectedClient: { id: number; name: string }) {
  if (selectedClient && selectedClient.id) {
    this.selectedClient = selectedClient;
    this.merchantForm.patchValue({
      Merchant: {
        ClientId: selectedClient.id,
        name: selectedClient.name 
      }
    });
  } else {
    console.error('Selected Client is invalid:', selectedClient);
  }
}
  getAllVendor() {
    this.observable = this._vendorService.apiVendorsGetAllVendorsGet();
    this.subscription = this.observable.subscribe({
      next: (response:any) => {
        if (response && Array.isArray(response.Data)) {
          this.vendorsList = response.Data
            .filter((vendor: VendorDTO) => vendor.Id !== undefined && vendor.Name !== undefined)
            .map((vendor: VendorDTO) => ({
              id: vendor.Id!,
              name: vendor.Name!,
            }));
            if (this.data?.Vendor?.Id) {
              const selectedVendor = this.vendorsList.find(vendor => vendor.id === this.data.Vendor.Id);
              if (selectedVendor) {
                this.selectedVendor = selectedVendor;
                this.initializePatchData();
              }
            }
        } else {
          this.notification.showNotification("Error: Invalid response format", "close", "error");
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {
      },
    });
  }
  

    onVendorChange(selectedVendor: { id: number; name: string }){
      const selectedvendor = selectedVendor.id;
      this.merchantForm.patchValue({
        Merchant: {
          VendorId: selectedVendor.id
        }
    });
    this.initializePatchData();
  }

  onSelectStatus(selectedStatus: { id: number, name: string }) {
    this.selectedStatus = selectedStatus;
    this.merchantForm.patchValue({
      Merchant: {
        Status: selectedStatus.id,
      }
    });
  }
  
}
