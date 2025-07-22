import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription, concatMap, mergeMap } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService, ProviderDTO, ProvidersService } from 'src/shared/dataprovider/api';
import { Status } from 'src/shared/dataprovider/local/data/common';

@Component({
  selector: 'app-clients-form',
  templateUrl: './clients-form.component.html',
  styleUrls: ['./clients-form.component.scss']
})
export class ClientsFormComponent implements OnInit {
  clientsForm:FormGroup;
  private obsProvider!: Observable<any>;
  private subsProvider!: Subscription;
  private subsClient!: Subscription;
  private obsClientUpdate!:Observable<any>;
  private subsClientUpdate!: Subscription;
  // public providerList :any;
  public statusEnum = Status;
  public providerList: Array<{ id: number; name: string }> = [];
  public selectedProviderName: { id: number; name: string} | null = null;
  public selectedProvider: { id: number; name: string} | null = null;
  actionDisable: boolean = false;
  constructor(private _dialogRef : MatDialogRef<ClientsFormComponent>, private _fb:FormBuilder, 
    private _providerService:ProvidersService, private _notification: NotificationService,
    private _clientService:ClientService,
     @Inject(MAT_DIALOG_DATA) public data:any,){
    this.clientsForm = this._fb.group({
      Name:'',
      ProviderId:'',
      CallbackUrl :'',
      RedirectUrl : '',
    })
  }

  ngOnInit(): void {
    this.initForm();
    this.getProviderList();
  }

  initForm() {
    this.clientsForm = this._fb.group({
      Name: '',
      ProviderId: 0, 
      CallbackUrl: '',
      RedirectUrl: ''
    });
  
    if (this.data) {
      this.clientsForm.patchValue({
        Name: this.data.Name ?? '',
        ProviderId: this.data.ProviderId ?? 0, 
        CallbackUrl: this.data.CallbackUrl ?? '',
        RedirectUrl: this.data.RedirectUrl ?? ''
      });
    }
  }
  
  onFormSubmit(){
    if(this.data){
     const modifiedValue = {...this.clientsForm.value, Id:this.data.Id};
      this.obsClientUpdate = this._clientService.apiClientUpdateClientPost(modifiedValue);
      this.subsClientUpdate = this.obsClientUpdate.subscribe({
        next:(response)=>{
          this.actionDisable = true;
          // this._dialogRef.close(true);
          this._notification.showNotification("Client Data Updated Successfully", "close", "success");
        },
        error: (error: HttpErrorResponse)=>{
          console.log(error);
        },
        complete: ()=>{
          this.subsClientUpdate.unsubscribe();
          this._dialogRef.close(true);
        }
      });
      }else{
      this._clientService.apiClientCreateClientPost(this.clientsForm.value).subscribe({
          next:(response)=>{
            this.actionDisable = true;
            // this._dialogRef.close(true);
            this._notification.showNotification("Client Data Added Successfully", "close", "success");
          },
          error: (error: HttpErrorResponse)=>{
            this._notification.showNotification("Error: " + error.error,"close","error");
          },
          complete: ()=>{ 
            this.subsClient.unsubscribe();
            this._dialogRef.close(true);
          }
        });
      }
  }

  getProviderList() {
    this.obsProvider = this._providerService.apiProvidersGetAllProvidersGet();
    this.subsProvider = this.obsProvider.subscribe({
      next: (response:any) => {
        if(response && Array.isArray(response.Data)){
          this.providerList = response.Data.map((provider:any) => ({
            id: provider.Id ?? 0,
            name: provider.Name ?? ''
          }));
    
          if (this.data?.ProviderId) {
            this.selectedProviderName = this.providerList.find(p => p.id === this.data.ProviderId) || { id: 0, name: 'Unknown' };
            this.clientsForm.patchValue({ ProviderId: this.selectedProviderName.id });
            console.log("Updated ProviderId from selectedProviderName:", this.selectedProviderName.id);
          } else {
            this.selectedProviderName = { id: 0, name: 'Unknown' };
          }
        }
       
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error: " + error.error, "close", "error");
      }
    });
  }
  

  onSelectProvider(selectedProvider: { id: number; name: string }) {
    this.selectedProviderName = selectedProvider;
    this.clientsForm.patchValue({ ProviderId: selectedProvider.id });
  }
}
