import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientDTO, ProvidersService, UserService, ClientService, CreateUserRequestDTO } from 'src/shared/dataprovider/api';
import { RolePermissionService } from 'src/shared/dataprovider/api/api/rolePermission.service';
import { Role } from 'src/shared/dataprovider/api/model/role';
import { UserDTO } from 'src/shared/dataprovider/api/model/userDTO';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { ModalComponent } from 'src/shared/components/modals/modal/modal.component';
import { ClientWalletListDTO } from 'src/shared/dataprovider/api/model/clientWalletListDTO';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-list-form',
  templateUrl: './user-list-form.component.html',
  styleUrls: ['./user-list-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserListFormComponent implements OnInit {
  usersForm: FormGroup;
  private obsClient!: Observable<ClientWalletListDTO>;
  private subsClient!: Subscription;
  private obsUser!: Observable<any>;
  private subsUser!: Subscription;
  private obsRole! : Observable<any>;
  private subsRole! : Subscription;
  public clientsList!: Array<ClientDTO>;
  public roles : any;
  language: string = "";
  constructor(
    private _dialogRef: MatDialogRef<UserListFormComponent>,
    private _dialog: MatDialog,
    private _fb: FormBuilder,
    private _providerService: ProvidersService,
    private _userService: UserService,
    private _clientService: ClientService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _notificationService : NotificationService,
    private _roleService : RolePermissionService,
    private _notification : NotificationService,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.usersForm = this._fb.group({
      Username: ['', Validators.required],
      Password: [''],
      Email: ['', [Validators.required, Validators.email]],
      Name: ['', Validators.required],
      RoleId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.ClientId) {
      this.usersForm.patchValue(this.data);
    }else{
      this.getAllClients();
      this.getAllRoles();
    }
  }

  onFormSubmit() {
    if (!this.data) {
      const tempPass = Math.random().toString(36).slice(-12);
      const email = this.usersForm.get('Email')?.value;
      this.usersForm.patchValue({ Password: tempPass });
      let data : CreateUserRequestDTO = {
        Username: this.usersForm.get('Username')?.value,
        Password: tempPass,
        Email: this.usersForm.get('Email')?.value,
        Name: this.usersForm.get('Name')?.value,
        RoleId: this.usersForm.get('RoleId')?.value,
        ClientId: parseInt(SessionManager.getFromToken('ClientId'))
      }


      this.obsUser = this._userService.apiUserCreateUserPost(data);
      this.subsUser = this.obsUser.subscribe({
        next: (response: UserDTO) => {
          this._dialogRef.close(true);
        },
        error: (error: HttpErrorResponse) => {
          this._notification.showNotification("Something went wrong user: " + error.error, "close","success");
        },
        complete: ()=>{
          const dialogRef = this._dialog.open(ModalComponent, {
            data: {
              message: 'Register new user successful',
              formType: 'Password',
              value: tempPass,
              email: email
            }, width: '600px'
          });
        }
      });
    }
  }

  generatePassword(){
    this.usersForm.patchValue({Password:Math.random().toString(36).slice(-12)});
  }

  onSaveUserIp(ip:string, userid:number, email:string){
    let data = {
      UserId: userid,
      Ip: ip,
      Email: email
    }
    this.obsUser = this._userService.apiUserRegisterIPtoUserPost(data);
      this.subsUser = this.obsUser.subscribe({
        next: (response: CreateUserRequestDTO) => {
          this._dialogRef.close(true);
          this._notification.showNotification("User Added Successfully","close","success");
        },
        error: (error: HttpErrorResponse) => {
          this._notification.showNotification("Something went wrong IP: " + error.error, "close","success");
        },
      });
  }

  getAllClients() {
    this.obsClient = this._clientService.apiClientGetAllClientsGet();
    this.subsClient = this.obsClient.subscribe({
      next: (response:ClientWalletListDTO) => {
        if(response.Data != null){
          this.clientsList = response.Data;
        }
        
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
      complete: () => { },
    });
  }

  getAllRoles(): void {
    this.obsRole = this._roleService.apiRolePermissionListRolesGet();
    this.subsRole = this.obsRole.subscribe({
      next: (response: { Data: Role[] }) => {
        if (Array.isArray(response.Data)) {
          this.roles = response.Data.filter((role: Role) =>
            (role.RoleID === 2 || role.RoleID === 3 || role.RoleID === 5) ||
            (role.RoleName === "Customer Support" ||
            role.RoleName === "Financial Controller" ||
            role.RoleName === "Operator")
          );
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notificationService.showNotification(
          "Something went wrong loading roles: " + error.error,
          "close",
          "error"
        );
      }
    });
  }

}
