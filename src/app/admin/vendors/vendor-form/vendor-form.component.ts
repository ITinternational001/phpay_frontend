import { DialogRef } from '@angular/cdk/dialog';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { PaymentChannelsService, VendorsService } from 'src/shared/dataprovider/api';
import { Status, StatusDropdown } from 'src/shared/dataprovider/local/data/common';
import { convertFormattedAmount, DecimalPipeConverter } from 'src/shared/helpers/helper';

@Component({
  selector: 'app-vendor-form',
  templateUrl: './vendor-form.component.html',
  styleUrls: ['./vendor-form.component.scss']
})
export class VendorFormComponent implements OnInit {
  private obsPaymentChannel! : Observable<any>;
  private subsPaymentChannel! : Subscription;
  private obsVendor! : Observable<any>;
  private subsVendor! : Subscription;
  private obsVendorUpdate! : Observable<any>;
  private subsVendorUpdate! : Subscription;
  public paymentChannelList : any;
  public statusEnum = StatusDropdown;
  vendorForm:FormGroup;
  public selectedStatus: { id: number; name: string} | null = null;
  language: string = "";
  actionDisable: boolean = false;
  constructor(private _fb:FormBuilder, private _paymentChannelService : PaymentChannelsService, 
    private _dialogRef : MatDialogRef<VendorFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any, @Inject(MAT_DIALOG_DATA) public isViewOnly :boolean,
    private notification: NotificationService,
    private _vendorService : VendorsService, private _decimalpipe: DecimalPipe,
    private translateService: TranslateService){
      this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);

      this.vendorForm = this._fb.group({
        Name: { value: "", disabled: this.data.isViewOnly },
        SecretKey: { value: "", disabled: this.data.isViewOnly },
        Status: [{ value: this.selectedStatus ? this.selectedStatus.id : "", disabled: this.data.isViewOnly }],
        ServerIp: { value: "", disabled: this.data.isViewOnly },
        MinimumCI: { value: "", disabled: this.data.isViewOnly },
        MinimumCO: { value: "", disabled: this.data.isViewOnly },
        MaximumCI: { value: "", disabled: this.data.isViewOnly },
        MaximumCO: { value: "", disabled: this.data.isViewOnly },
      });
  }

  ngOnInit(): void {
    this.getAllpaymentChannel();
  
    if(this.data.item){
      const item = this.data.item;
      this.selectedStatus = this.statusEnum.find(status => status.id === item.Status) || null;
      const patchValue = {
        Name: item.Name,
        SecretKey:item.SecretKey,
        Status: this.selectedStatus ? this.selectedStatus.id : "",
        ServerIp:item.ServerIp,
        MinimumCI: DecimalPipeConverter(item.MinimumCI,this._decimalpipe),
        MinimumCO: DecimalPipeConverter(item.MinimumCO,this._decimalpipe),
        MaximumCI: DecimalPipeConverter(item.MaximumCI,this._decimalpipe),
        MaximumCO: DecimalPipeConverter(item.MaximumCO,this._decimalpipe),
      }
      this.vendorForm.patchValue(patchValue);
    }
  }

  onFormSubmit(){
    var maxCi = this.vendorForm.get("MaximumCI")?.getRawValue();
    var minCi = this.vendorForm.get("MinimumCI")?.getRawValue();
    var maxCO = this.vendorForm.get("MaximumCO")?.getRawValue();
    var minCO = this.vendorForm.get("MinimumCO")?.getRawValue();
    
    this.vendorForm.patchValue({
      MaximumCI : convertFormattedAmount(maxCi),
      MinimumCI : convertFormattedAmount(minCi),
      MaximumCO : convertFormattedAmount(maxCO),
      MinimumCO : convertFormattedAmount(minCO)
    });

    if(this.data.item){
    const modifiedValue = {...this.vendorForm.value, Id:this.data.item.Id };
     this.obsVendorUpdate = this._vendorService.apiVendorsUpdateVendorPost(modifiedValue);
    this.subsVendorUpdate = this.obsVendorUpdate.subscribe({
      next:(response)=>{
        this.actionDisable = true;
        // this._dialogRef.close(true);
        this.notification.showNotification("Vendor Updated Successfully", "close", 'success');
      },
      error: (error: HttpErrorResponse)=>{
        this.notification.showNotification("Error: " + error.error, "close", 'error');
      },
      complete: ()=>{
        this._dialogRef.close(true);
        this.subsVendorUpdate.unsubscribe();
      }
    });
    }else{
  
      this.obsVendor = this._vendorService.apiVendorsCreateVendorPost(this.vendorForm.value);
      this.subsVendor = this.obsVendor.subscribe({
        next:(response)=>{
          this.actionDisable = true;
          // this._dialogRef.close(true);
          this.notification.showNotification("Vendor added Successfully", "close", 'success');
        },
        error: (error: HttpErrorResponse)=>{
          this.notification.showNotification("Error: " + error.error, "close", 'error');
        },
        complete: () => {
          this._dialogRef.close(true);
        }
      });
    }  
  }
  

  getAllpaymentChannel(){
    this.obsPaymentChannel = this._paymentChannelService.apiPaymentChannelsGetPaymentChannelsByPageGet();
    this.subsPaymentChannel = this.obsPaymentChannel.subscribe({
      next:(response)=>{
        this.paymentChannelList = response;
      },
      error: (error: HttpErrorResponse)=>{
        this.notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: ()=>{ 
      }
    });
  }

  onSelectStatus(selectedStatus: { id: number; name: string }) {
    this.selectedStatus = selectedStatus;
    this.vendorForm.patchValue({
      Status: selectedStatus.id, // Directly update Status field
    });
  }
}
