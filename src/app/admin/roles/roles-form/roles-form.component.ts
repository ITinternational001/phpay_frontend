import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { WhitelistingFormComponent } from '../../whitelisting/whitelisting-form/whitelisting-form.component';
import { Navigation, Status } from 'src/shared/dataprovider/local/data/common';
import { RolePermissionService } from 'src/shared/dataprovider/api/api/rolePermission.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { Role } from 'src/shared/dataprovider/api/model/role';
import { CreateRoleDTO } from 'src/shared/dataprovider/api/model/createRoleDTO';
import { CreatePermissionDTO } from 'src/shared/dataprovider/api/model/createPermissionDTO';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { getStatusName, getStatusId } from 'src/shared/helpers/helper';
import { Permission } from 'src/shared/dataprovider/api/model/permission';
import { DefaultRolePermission } from 'src/shared/dataprovider/api/model/defaultRolePermission';
import { UpdateRoleDto } from 'src/shared/dataprovider/api/model/updateRoleDto';
import { UpdatePermissionDTO } from 'src/shared/dataprovider/api/model/updatePermissionDTO';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-roles-form',
  templateUrl: './roles-form.component.html',
  styleUrls: ['./roles-form.component.scss']
})
export class RolesFormComponent implements OnInit {
  rolesForm: FormGroup;
  private observable!: Observable<any>;
  private subscriber!: Subscription;
  private obsPermission!: Observable<any>;
  private subsPermission!: Subscription;
  private obsRoleById!: Observable<any>;
  private subsRoleById!: Subscription;
  public providerList: any;
  public statusEnum = Status;
  public permissionList: any[] = [];
  assignedPermissions: any[] = [];
  public roleToAssign: string = "";
  navigationValues: string[] = [];
  message: string = '';
  language: string = "";
  actionDisable : boolean = false;
  rolePermissionsByRoleId!: Array<DefaultRolePermission>;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private _dialogRef: MatDialogRef<RolesFormComponent>,
    private _fb: FormBuilder, private _roleService: RolePermissionService, private _notificationService: NotificationService,
    private translateService: TranslateService) {
      this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);
    this.rolesForm = this._fb.group({
      role: '',
      description: '',
      status: '',
      permission: '',
      enabled: '',
      roleId: '',
    })
  }

  togglePermission(permission: any) {
    const permissionIndex = this.assignedPermissions.findIndex((p: any) => p.PermissionId === permission.PermissionID);
    if (permissionIndex !== -1) {
      this.assignedPermissions[permissionIndex].Enabled = !this.assignedPermissions[permissionIndex].Enabled;
    }
  }

  async ngOnInit() {
    if (this.data.data) {
      if (this.data.formType == 'role') {
        this.rolesForm.patchValue(
          {
            role: this.data.data.RoleName,
            description: this.data.data.RoleDescription,
            status: getStatusId(this.data.data.Status, Status),
          });
      } else if (this.data.formType == 'permission') {
        this.rolesForm.patchValue(
          {
            permission: this.data.data.PermissionName,
            status: getStatusId(this.data.data.Status, Status)
          });
      } else if (this.data.formType == 'assign') {
        this.rolesForm.patchValue({ roleId: this.data.data.RoleID });
        this.roleToAssign = this.data.data.RoleName;
        await this.getAllPermissionByRoleId(this.data.data.RoleID);
      }
    }
    const excludedItems = [Navigation.Logout, Navigation.Help, Navigation.Translation];
    this.navigationValues = Object.values(Navigation).filter(value => !excludedItems.includes(value));
  }


  onFormSubmit() {
    if (this.data.formType == 'role') {
      this.onSubmitRole();
    } else if (this.data.formType == 'permission') {
      this.onSubmitPermission();
    } else if (this.data.formType == 'assign') {
      let RoleID = this.rolesForm.get('roleId')?.value;
      if (this.assignedPermissions != null) {
       this.onAssignPermission(RoleID);
      }
      this.message = "Successfully assigned permissions to " + this.data.data.RoleName + "!";
    }
    
  }

  onAssignPermission(RoleID:any){
    this.observable = this._roleService.apiRolePermissionAssignDefaultRolePermissionsRoleIDPost(RoleID, this.assignedPermissions);
    this.subscriber = this.observable.subscribe({
      next: (response) => {
       
        if(response){
          this.actionDisable = true;
          //this._dialogRef.close(true);
          this._notificationService.showNotification(this.message, "close", "success");
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notificationService.showNotification("Something went wrong " + error.error, "close", "error");
      },
      complete: () => {
        this._dialogRef.close(true);
      }
    });
  }

  onSubmitRole() {
    if (!this.data.data) {
      let roleData: CreateRoleDTO = {
        RoleName: this.rolesForm?.get('role')?.value,
        RoleDescription: this.rolesForm?.get('description')?.value,
        Status: this.rolesForm?.get('status')?.value,
        CreatedBy: SessionManager.getFromToken("Username")
      }
      this.observable = this._roleService.apiRolePermissionAddRolePost(roleData);
      this.message = "New " + this.data.formType + " save successfully";
    } else {
      let updateRoleData: UpdateRoleDto = {
        RoleName: this.rolesForm?.get('role')?.value,
        RoleDescription: this.rolesForm?.get('description')?.value,
        Status: this.rolesForm?.get('status')?.value,
      }
      this.observable = this._roleService.apiRolePermissionUpdateRoleRoleIDPut(this.data.data.RoleID, updateRoleData);
      this.message = "Role was udpated successfully";
    }
  }

  onSubmitPermission() {
    if (!this.data.data) {
      let permissionData: CreatePermissionDTO = {
        PermissionName: this.rolesForm?.get('permission')?.value,
        Status: this.rolesForm?.get('status')?.value,
        CreatedBy: SessionManager.getFromToken("Username")
      }
      this.observable = this._roleService.apiRolePermissionAddPermissionPost(permissionData);
      this.message = "New permission was Added successfully";
    } else {
      let updatePermissionData: UpdatePermissionDTO = {
        PermissionName: this.rolesForm?.get('permission')?.value,
        Status: this.rolesForm?.get('status')?.value,
      }
      this.observable = this._roleService.apiRolePermissionUpdatePermissionPermissionIDPut(this.data.data.PermissionID, updatePermissionData);
      this.message = "Permission was udpated successfully";
    }
  }

  async getAllPermissions() {
    if (this.obsPermission) { this.subsPermission.unsubscribe() }
    this.obsPermission = this._roleService.apiRolePermissionListPermissionsGet(50, 1);
    this.subsPermission = this.obsPermission.subscribe({
      next: (response) => {
        //fetch all the  permissions if the ROLE is newly Created
        this.permissionList = response.map((item: any) => ({
          PermissionID: item?.PermissionID,
          PermissionName: item?.PermissionName,
          Enabled: false
        }));
        response.map((item: any) => {
          this.assignedPermissions.push({ PermissionId: item?.PermissionID, Enabled: false });
        });
      }
    })
  }


  async getAllPermissionByRoleId(roleId: number) {
    this.obsRoleById = this._roleService.apiRolePermissionRoleRoleIDGet(roleId);
    this.subsPermission = this.obsRoleById.subscribe({
      next: (response: Array<DefaultRolePermission>) => {
        if (response != null) {
          this.permissionList = response.map((item) => ({
            PermissionID: item?.PermissionID,
            PermissionName: item?.Permission?.PermissionName,
            Status: getStatusName(item.Permission?.Status!, Status),
            CreatedBy: item?.Permission?.CreatedBy,
            CreatedAt: item?.Permission?.CreatedAt,
            Enabled: item?.Enabled
          }));

          if(this.permissionList.length > 0){
            response.map((item) => {
              this.assignedPermissions.push({ PermissionId: item?.PermissionID, Enabled: item.Enabled });
            });
          }else{
            this.getAllPermissions();   
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notificationService.showNotification("Error:" + error.error, "close", "error");
      }
    });
  }

  checkPermissionInAssignedPermissions(permissionId: number | undefined): boolean {
    // Ensure rolePermissionsByRoleId is defined before accessing it
    if (!this.rolePermissionsByRoleId) {
      return false;
    }

    // Handle undefined case by returning false if permissionId is undefined
    if (permissionId === undefined) {
      return false;
    }
    // Check if the permission exists in assigned permissions
    let test = this.rolePermissionsByRoleId.some(rolePermission => {
      return rolePermission.PermissionID === permissionId && rolePermission.Enabled === true;
    });

    return test;
  }
}