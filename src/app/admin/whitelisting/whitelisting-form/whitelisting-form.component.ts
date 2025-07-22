import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { WhitelistingComponent } from '../whitelisting.component';
import { ClientService, UserService } from 'src/shared/dataprovider/api';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { DropDownData, SelectOptions } from 'src/shared/dataprovider/local/interface/commonInterface';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-whitelisting-form',
  templateUrl: './whitelisting-form.component.html',
  styleUrls: ['./whitelisting-form.component.scss']
})
export class WhitelistingFormComponent {
  whitelistForm: FormGroup;
  private obsClientUsers!: Observable<any>;
  private subClistUsers!: Subscription;
  private obsClientsList!: Observable<any>;
  private subsClientsList!: Subscription;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private clientId: number = 0;
  public usersList: any[] = [];
  public usersOptions: SelectOptions[] = [];
  public clientsList: any[] = [];
  language: string = "";
  actionDisable : boolean = false;
  constructor(private _dialogRef: MatDialogRef<WhitelistingFormComponent>,
    private _fb: FormBuilder, private _userService: UserService, private _clientService: ClientService,
    private _notification: NotificationService, private translateService: TranslateService) {
      this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);
    this.whitelistForm = this._fb.group({
      Ip: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
          ),
        ],
      ],
      Email: '',
      UserId: ''
    });

    this.clientId = parseInt(SessionManager.getFromToken('ClientId'));
  }


  ngOnInit() {
    this.getClientsList();
  }

  get Ip() {
    return this.whitelistForm.get('Ip');
  }

  onSelectChange(option: { id: number, name: string }) {
    let method = 0;
    if (option) {
      console.log(option);
      method = option.id;
      this.getClientUsers(option.id);
    } else {
      this.getClientUsers(method);
    }
  }

  onUserChange(option: { id: number, name: string }) {
    if (option) {
      console.log(option)
      console.log(this.usersList);

      let data = this.usersList.find(item => item.Id === option.id); 
      console.log(data);

      this.whitelistForm.patchValue({UserId:option.id, Email: data?.Email });
    }
  }

  getClientsList() {
    this.obsClientsList = this._clientService.apiClientGetAllClientsGet();
    this.subsClientsList = this.obsClientsList.subscribe({
      next: (response) => {
        response.Data?.map((item: any) => {
          this.clientsList.push({
            id: item.Id ?? 0,  // Use 0 if Id is undefined
            name: item.Name ?? 'Unknown',  // Use 'Unknown' if Name is undefined
          });
        });
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Something went wrong, please refresh the page: " + error.error, "close", "error");
      }
    });
}


  getClientUsers(clientId: number) {
    this.obsClientUsers = this._userService.apiUserFindUsersByClientIdGet(clientId, 1, 100);
    this.subClistUsers = this.obsClientUsers.subscribe({
      next: (response) => {
        this.usersList = response.Data;
        this.usersOptions = [];
        response.Data.map((item:any)=>{
          this.usersOptions.push({id:item.Id ?? item.Id, name:item.Username ?? item.Username});
        });        
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Something went wrong," + error.error, "close", "error");
      }
    })
  }


  onFormSubmit() {
    if(this.whitelistForm.valid){
      this.observable = this._userService.apiUserRegisterIPtoUserPost(this.whitelistForm.value);
      this.subscription = this.observable.subscribe({
        next: (response) => {
          this.actionDisable = true;
          this._notification.showNotification("IP Address binded Successfully", "close", "success");
          // this._dialogRef.close(true);
        },
        error: (error: HttpErrorResponse) => {
          this._notification.showNotification("Error: please check the information " + error.error, "close", "error");
        },
        complete: () => {
          this.actionDisable = false;
          this._dialogRef.close(true);
        }
      });
    }else{
      this._notification.showNotification("Warning: make sure that the IP address is in correct format ", "close", "error");
    }  
  }

}