import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { isArray, TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { ModalComponent } from 'src/shared/components/modals/modal/modal.component';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import {
  ClientDTO,
  ClientService,
  CreateUserRequestDTO,
  ProvidersService,
  UserService,
} from 'src/shared/dataprovider/api';
import { RolePermissionService } from 'src/shared/dataprovider/api/api/rolePermission.service';
import { ClientWalletDTO } from 'src/shared/dataprovider/api/model/clientWalletDTO';
import { ClientWalletListDTO } from 'src/shared/dataprovider/api/model/clientWalletListDTO';
import { PermissionDTO } from 'src/shared/dataprovider/api/model/permissionDTO';
import { Role } from 'src/shared/dataprovider/api/model/role';
import { UpdateUserRequestDTO } from 'src/shared/dataprovider/api/model/updateUserRequestDTO';
import { RoleAcessEnum, TotalNumberOfDataPerTable } from 'src/shared/dataprovider/local/data/common';

@Component({
  selector: 'app-users-form',
  templateUrl: './users-form.component.html',
  styleUrls: ['./users-form.component.scss'],
})
export class UsersFormComponent implements OnInit {
  
  usersForm: FormGroup;
  private obsClient!: Observable<ClientWalletListDTO>;
  private subsClient!: Subscription;
  private obsUser!: Observable<any>;
  private subsUser!: Subscription;
  private obsRole!: Observable<any>;
  private subsRole!: Subscription;
  private obsPermission!: Observable<any>;
  private subsPermission!: Subscription;
  private obsUserPermission!: Observable<any>;
  private subsUserPermission!: Subscription;
  public clientsList: Array<ClientWalletDTO> = [];
  public selectedClient: number = 1;
  public ArrRoles: any[] = [];
  public ArrPermissions: any[] = [];
  public ArrRolePermissionUser: any[] = [];
  public disableGeneratePassword = false;
  public roleAccessEnum = RoleAcessEnum;
  public type : string = "";
  public action : string = "";
  public title : string = "";
  language: string = "";
  actionDisable : boolean = false;
  constructor(
    private _dialogRef: MatDialogRef<UsersFormComponent>,
    private _dialog: MatDialog,
    private _fb: FormBuilder,
    private _providerService: ProvidersService,
    private _userService: UserService,
    private _clientService: ClientService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _notificationService: NotificationService,
    private _roleService: RolePermissionService,
    private _notification: NotificationService,
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
      ClientId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getAllClients();
    this.getAllRoles();
 
     this.type = this.data.type;
     const data = this.data.user;
     this.checkAction(this.type);
    if (this.data.user) {
      this.usersForm.patchValue({
        Username: data.Username,
        Password: '',
        Email: data.Email,
        Name: data.Name,
        RoleId: data.RoleId,
        ClientId: data.ClientId
      });
      this.usersForm.get('Password')?.disable();
      this.getPermissionsByRoleId(data.RoleId);
      this.getRolePermissionByUserId(data.UserId)
      this.disableGeneratePassword = true;
    }
  }


  onFormSubmit() {
   
    if (this.type =='userAdd') {
      if(this.usersForm.valid){
        this.onSaveUserDetails();
      }
    } else if (this.data.user && this.type =='userupdate'){
      if(this.usersForm.valid){
        this.onUpdateUserDetails(this.data.user);
      }
    }
    else {
      this.onSaveUserPermissions();
    }
  }

  onSaveUserDetails(){
    if(this.obsUser){this.subsUser.unsubscribe();}
    const tempPass = Math.random().toString(36).slice(-12);
      const email = this.usersForm.get('Email')?.value;
      this.usersForm.patchValue({ Password: tempPass });
      this.obsUser = this._userService.apiUserCreateUserPost(this.usersForm.value);
      this.subsUser = this.obsUser.subscribe({
        next: (response: CreateUserRequestDTO) => {
          this.actionDisable = true;
          // this._dialogRef.close(true);
          this._notification.showNotification("User Added Successfully", "close", "success");
        },
        error: (error: HttpErrorResponse) => {
          this._notification.showNotification("Error: " + error.error, "close", "success");
        },
        complete: () => {
          this.actionDisable = false;
          this._dialogRef.close(true);
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

  onUpdateUserDetails(data:any){
    if(this.obsUser){this.subsUser.unsubscribe();}
    const formData : UpdateUserRequestDTO = {
      UserId: data.UserId,
      NewStatus: data.StatusId,
      NewName: this.usersForm.get("Name")?.getRawValue(),
      NewUsername: this.usersForm.get("Username")?.getRawValue(),
      NewEmail: this.usersForm.get("Email")?.getRawValue(),
      RoleId: this.usersForm.get("RoleId")?.getRawValue(),
    }
    this.obsUser = this._userService.apiUserUpdateUserPost(formData);
    this.subsUser = this.obsUser.subscribe({
      next: (response: CreateUserRequestDTO) => {
        this.actionDisable = true;
        // this._dialogRef.close(true);
        this._notification.showNotification("User details updated Successfully", "close", "success");
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error: " + error.error, "close", "success");
      },
      complete: () => {
       this.actionDisable = false;
       this._dialogRef.close(true);
      }
    });
  }

  checkAction(type:string){
    switch(type){
      case 'userAdd':
        this.action = "saveNewUser";
        this.title = "registerNewUser";
        break;
      case 'userupdate':
        this.action = "saveChanges";
        this.title = "updateUserDetails";
        break;
      case 'permission':
        this.action = "savePermission";
        this.title = "updateUserPermission";
        break;
      default:
        this.action = "saveNewUser";
        this.title = "registerNewUser";

    }
  }

  getAllClients() {
    this.obsClient = this._clientService.apiClientGetAllClientsGet();
    this.subsClient = this.obsClient.subscribe({
      next: (response: ClientWalletListDTO) => {
       if(response != null){
        if(response.Data != null && response.Data.length > 0){
          this.clientsList = response.Data;
        }
       }
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {},
    });
  }
  
  

  onSelectChange(event: any) {
    if (event) {
      this.getPermissionsByRoleId(event?.value);
    }
  }

  onSaveUserPermissions() {
    const dataArray = this.ArrRolePermissionUser.map(obj => {
      const { PermissionName, ...otherProperty } = obj;
      return otherProperty
    })
    this.obsRole = this._roleService.apiRolePermissionUpdateMultiplePermissionsUserIDPost(this.data.user.UserId, dataArray);
    this.subsRole = this.obsRole.subscribe({
      next: (response) => {
        this.actionDisable = true;
        // this._dialogRef.close(true);
        this._notification.showNotification("User permission updated successfully", "close", "success");
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error: " + error.error, "close", "success");
      },
      complete: () => { 
        this.actionDisable = false;
        this._dialogRef.close(true)
      },
    });
  }

  getCombinedRolesAndPermission() {
    const combinedArray: any = [];
    if (this.ArrPermissions !== null && this.ArrRoles !== null) {
      this.ArrRoles.forEach((role: any) => {
        this.ArrPermissions.forEach((permission: any) => {
          // Create a new object with required properties
          const combinedObj = {
            RoleID: role.RoleID,
            Enabled: permission.Enabled,
            PermissionID: permission.Permission.PermissionID,
            RoleAccessEnum: 0 // Always set to 0
          };
          // Push the combined object to the array
          combinedArray.push(combinedObj);
        });
      });
    }
  }

  getAllRoles() {
    this.obsRole = this._roleService.apiRolePermissionListRolesGet(TotalNumberOfDataPerTable, 1);
    this.subsRole = this.obsRole.subscribe({
      next: (response: any) => {
        if (response && response.Data.length > 0) {
          this.ArrRoles = response.Data;
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notificationService.showNotification("Something went wrong loading roles." + error.error, "close", "error");
      }
    });
  }

  getRolePermissionByUserId(userId: number) {
    if (userId) {
      this.obsUserPermission = this._roleService.apiRolePermissionUserUserIDGet(userId);
      this.subsUserPermission = this.obsUserPermission.subscribe({
        next: (response) => {
          this.ArrRolePermissionUser = response.map((role: any) => ({
            Enabled: role.Enabled,
            PermissionID: role.PermissionID,
            PermissionName: role.PermissionName,
            RoleAccessEnum: role.RoleAccessEnum
          }));


        }
      });
    }
  }

  togglePermission(permission: any, type: string, event?: any) {
    const permissionIndex = this.ArrRolePermissionUser.findIndex((p: any) => p.PermissionID === permission.PermissionID);

    if (permissionIndex !== -1) {
      if (type == 'toggle') {
        this.ArrRolePermissionUser[permissionIndex].Enabled = !this.ArrRolePermissionUser[permissionIndex].Enabled;
      } else if (type == 'radio') {
        this.ArrRolePermissionUser[permissionIndex].RoleAccessEnum = parseInt(event?.value);
      }
    }
  }

  getPermissionsByRoleId(roleId: number) {
    this.obsPermission = this._roleService.apiRolePermissionRoleRoleIDGet(roleId);
    this.subsPermission = this.obsPermission.subscribe({
      next: (response) => {
        this.ArrPermissions = response;
        this.getCombinedRolesAndPermission();
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Something went wrong loading permissions" + error.error, "close", "error");
      }
    });
  }
}
