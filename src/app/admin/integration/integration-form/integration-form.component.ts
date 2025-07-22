import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ProvidersService } from 'src/shared/dataprovider/api';

@Component({
  selector: 'app-integration-form',
  templateUrl: './integration-form.component.html',
  styleUrls: ['./integration-form.component.scss']
})
export class IntegrationFormComponent implements OnInit {
  integrationForm:FormGroup;
  language: string = "";
  private observable!: Observable<any>;
  private subscription!: Subscription;
  actionDisable: boolean = false;
  platform: string[] = [
    'provider'
  ]

  constructor(private _dialogRef : MatDialogRef<IntegrationFormComponent>,private _fb:FormBuilder, 
    private _providerService: ProvidersService, @Inject(MAT_DIALOG_DATA) public data:any,private notification :NotificationService,
    private translateService: TranslateService){
      this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);
    this.integrationForm = this._fb.group({
      Name:'',
      ServerIp:'',
      WhiteListedIp:'',
      CallbackUrl:'',
      RedirectUrl:'',
    })
  }

  onFormSubmit(){
    if(this.data){
      if(this.integrationForm.valid){
        const modifiedValue = {...this.integrationForm.value, Id:this.data.Id};
        this.observable = this._providerService.apiProvidersUpdateProviderPost(modifiedValue);
        this.subscription = this.observable.subscribe({
          next:(response)=>{
            this.actionDisable = true;
            this.notification.showNotification("Data Updated succcessfully","close",'success');
          },
          error:(error : HttpErrorResponse)=>{
            this.notification.showNotification("Error:" + error.error, "close", "error");
          },
          complete: ()=> {
            this._dialogRef.close(true);
          }
        })
      }
    }else{
      if(this.integrationForm.valid){
        console.log(this.integrationForm.value);
        this.observable = this._providerService.apiProvidersCreateProviderPost(this.integrationForm.value);
        this.subscription = this.observable.subscribe({
          next:(response)=>{
            this.actionDisable = true;
            this.notification.showNotification("Data Added Successfully","close",'success');
          },
          error:(error : HttpErrorResponse)=>{
            this.notification.showNotification("Error:" + error.error, "close", "error");
          },
          complete: ()=> {
            this._dialogRef.close(true);
          }
        })
      }
    }
  }
  ngOnInit(): void {
    this.integrationForm.patchValue(this.data);
  }
}
