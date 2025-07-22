import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService } from 'src/shared/dataprovider/api';
import { TransferMethod, ConfigFeeMethod } from 'src/shared/dataprovider/local/data/common';

@Component({
  selector: 'app-wfee-add-form',
  templateUrl: './wfee-add-form.component.html',
  styleUrls: ['./wfee-add-form.component.scss'],
})
export class WfeeAddFormComponent {
  withdrawalForm:FormGroup;
  public TransferMethod = ConfigFeeMethod;
  private observable! : Observable<any>;
  private subscription! : Subscription;

  
  constructor(
    private _dialogRef : MatDialogRef<WfeeAddFormComponent>, 
    private _fb:FormBuilder,
     @Inject(MAT_DIALOG_DATA) 
     public data:any, 
     private clientService:ClientService,
     private notification: NotificationService){

    this.withdrawalForm = this._fb.group({
      Method: 0,
      FeeOnTopPercent: 0,
      FeeOnTopFixed: 0,
      FeeAtCostPercent: 0,
      FeeAtCostFixed: 0,
      Status: 1
    });
  }

  atCostPercent = new FormControl('', [Validators.required]);

  onFormSubmit(){
    if(this.data){
      const modifiedData = {...this.withdrawalForm.value, ClientId: this.data.clientId };
      this.observable = this.clientService.apiClientCreateWithdrawalFeePost(modifiedData);
      this.subscription = this.observable.subscribe({
        next:(res)=>{
          this._dialogRef.close(true);
        },
        error:(error: HttpErrorResponse)=>{
          this.notification.showNotification("Error: " + error.error,"close","error");
        }
      });
    }
  }
}
