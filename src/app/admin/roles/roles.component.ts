import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PermissionData, RolesData, Status } from '../../../shared/dataprovider/local/data/common';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RolesFormComponent } from './roles-form/roles-form.component';
import { RolePermissionService } from 'src/shared/dataprovider/api/api/rolePermission.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { Role } from 'src/shared/dataprovider/api/model/role';
import { Permission } from 'src/shared/dataprovider/api/model/permission';
import { getStatusName, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  dataSourceRole!: MatTableDataSource<any>;
  dataSourcePermission!: MatTableDataSource<any>;
  displayedColumnsRoles: string[] = [
    'Id',
    'Role',
    'Description',
    'Status',
    'CreatedBy',
    'CreatedAt',
    'Actions'
  ];
  displayedColumnsPermissions: string[] = [
    'Id',
    'Permission',
    'Status',
    'CreatedBy',
    'CreatedAt',
    'Actions'
  ];

  public formType = ["role", "permission","assign"];
  private observable!: Observable<any>;
  private Subscription!: Subscription;
  private obsPermission!: Observable<any>;
  private subsPermission!: Subscription;
  accessibility: boolean = false;
  userPermissions: any = [];
  allChecked = false;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0]; 
  public isReadAndWrite:boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  language : string = "";

  constructor(private _dialog: MatDialog, 
    private _roleService: RolePermissionService, 
    private _notificationService: NotificationService,
    private route: ActivatedRoute,
    private translateService: TranslateService) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    }

  ngOnInit() {
    this.getAllRoles();
    this.getAllPermissions();
     this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
  }

  getAllRoles() {
    this.observable = this._roleService.apiRolePermissionListRolesGet(this.itemsPerPage, this.currentPage); 
    this.Subscription = this.observable.subscribe({
      next: (response: any) => { 
        if (response && response.Data) {
          this.totalItems = response.TotalRecordCount;
          let dataSource = response.Data.map((item: Role) => ({
            RoleID: item?.RoleID,
            RoleName: item?.RoleName,
            RoleDescription: item?.RoleDescription,
            Status: getStatusName(item.Status!, Status),
            CreatedBy: item?.CreatedBy,
            CreatedAt: item?.CreatedAt
          }));

          this.dataSourceRole = new MatTableDataSource(dataSource);
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notificationService.showNotification("Something went wrong loading roles." + error.error, "close", "error");
      }
    });
  }
  

  getAllPermissions() {
    this.obsPermission = this._roleService.apiRolePermissionListPermissionsGet(100,1);
    this.subsPermission = this.obsPermission.subscribe({
      next: (response: Array<Permission>) => {
        console.log(response);
        if (response) {
          let dataSource = response.map((item)=>({
              PermissionID : item?.PermissionID,
              PermissionName: item?.PermissionName,
              Status: getStatusName(item.Status!, Status),
              CreatedBy : item?.CreatedBy,
              CreatedAt : item?.CreatedAt
          }));
          this.dataSourcePermission = new MatTableDataSource(dataSource);
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notificationService.showNotification("Something went wrong loading permission." + error.error, "close", "error");
      }
    });
  }

  openForm(type: string) {
    if (this.isReadAndWrite) {
      let width;
      const dialogRef = this._dialog.open(RolesFormComponent, { 
        width: width, 
        data: { formType: type } 
      });
  
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val) {
            if (type === this.formType[0]) {
              this.getAllRoles();
            } else {
              this.getAllPermissions();
            }
          }
        },
        error: (error) => {
          this._notificationService.showNotification("Error: " + error.message, "close", "error");
        }
      });
    } else {
      this._notificationService.showNotification("You don't have permission to add new role", "close", "error");
    }
  }
  

  openEditForm(data: any, type: string) {
    console.log(type);
    let width;
    if (data != null) {
      if(type == 'assign') width="900px";
      const dialogRef = this._dialog.open(RolesFormComponent, { data:{data:data, formType:type}, width: width });
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val) {
            this.getAllRoles();
            this.getAllPermissions();
          }
        }
      });
    }
  }

  onFirstPage(): void {
    this.loadPage(1);
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1);
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1);
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage));
  }

  loadPage(page: number, keyword?: string): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    // Determine if it's the last page
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);

    // Load data for the selected page here
    this.getAllRoles();
  }
  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage);
  }

}
