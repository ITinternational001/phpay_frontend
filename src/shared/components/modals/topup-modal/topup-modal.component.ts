import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { MerchantsService, PaymentChannelsService, TransactionsService, VendorsService } from 'src/shared/dataprovider/api';
import { TransactionLogsService } from 'src/shared/dataprovider/api/api/transactionLogs.service';
import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'app-topup-modal',
  templateUrl: './topup-modal.component.html',
  styleUrls: ['./topup-modal.component.scss']
})
export class TopupModalComponent implements OnInit {
  
  topUpForm!: FormGroup;
  private observable! : Observable<any>;
  private subscription! : Subscription;
  private obsVendor! : Observable<any>;
  private subsVendor! : Subscription;
  private obsChannel! : Observable<any>;
  private subsChannel! : Subscription;
  public vendors : Array<any> = [];
  public channels : Array<any> = [];
  public isApproved : boolean = true;

  ngOnInit(): void {
    // Initialize the form group with VendorId and PaymentChannelId
    this.topUpForm = this._fb.group({
      VendorId: ['', Validators.required],
      PaymentChannelId: ['', Validators.required]
    });
  
    // Add Remarks control if the type is "Decline"
    if (this.data.type === 'Decline') {
      this.topUpForm.addControl(
        'Remarks',
        this._fb.control('', Validators.required) // Add required validation for Remarks
      );
      this.isApproved = false; // Set isApproved to false for Decline
    } else {
      this.isApproved = true; // Set isApproved to true for Proceed
    }
  
    this.getAllChannels();
    this.getAllVendors();
  }
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private _vendor:VendorsService, 
            private _fb:FormBuilder, private _channels:PaymentChannelsService,
            private _transaction:TransactionsService,
            private notification: NotificationService,
            private _dialogRef: MatDialogRef<TopupModalComponent>){

  }


  onSubmit() {
    if (this.isApproved) {
      if (this.topUpForm.valid) {
        const formGroup = this.topUpForm;
        const data = {
          continue: true,
          VendorId: formGroup.get('VendorId')?.getRawValue(),
          PaymentChannelId: formGroup.get('PaymentChannelId')?.getRawValue()
        };
  
        this._dialogRef.close(data);
      }
    } else {
      const remarks = this.topUpForm.get('Remarks')?.value || ''; // Retrieve Remarks value
      const data = {
        continue: false,
        Remarks: remarks // Include Remarks in the data
      };
  
      this._dialogRef.close(data);
    }
  }
  

  getAllVendors(){
    this.obsVendor = this._vendor.apiVendorsGetAllVendorsGet(0,100);
    this.subsVendor = this.obsVendor.subscribe({
      next:(response)=>{
        if(response != null && Array.isArray(response.Data)){
          this.vendors = response.Data;
        }    
      },
      error:(error: HttpErrorResponse)=>{
        this.notification.showNotification("Error:" + error.error, "close", "error")
      },
      complete:()=>{}
    });
  }

  getAllChannels(){
    this.obsChannel = this._channels.apiPaymentChannelsGetPaymentChannelsByPageGet();
    this.subsChannel = this.obsChannel.subscribe({
      next:(response)=>{
        console.log(response);
        if(response != null && Array.isArray(response)){
        this.channels = response;
        }
      },
      error:()=>{},
      complete:()=>{}
    });
  }
}
