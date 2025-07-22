import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { RolePermissionService } from 'src/shared/dataprovider/api/api/rolePermission.service';
import { Permission } from 'src/shared/dataprovider/api/model/permission';
import { Role } from 'src/shared/dataprovider/api/model/role';
import { getStatusName, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { Status } from '../../dashboard/clients-summary/clients-summary.component';
import { RolesFormComponent } from '../roles-form/roles-form.component';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-page-access',
  templateUrl: './page-access.component.html',
  styleUrls: ['./page-access.component.scss']
})
export class PageAccessComponent implements OnInit {
  dataSourceRole!: MatTableDataSource<any>;
  dataSourcePermission!: MatTableDataSource<any>;
  public isReadAndWrite : boolean = false;
  displayedColumnsPermissions: string[] = [
    'Id',
    'Permission',
    'Status',
    'CreatedBy',
    'CreatedAt',
    'Actions'
  ];

  public formType = ["role", "permission","assign"];
  private obsPermission!: Observable<any>;
  private subsPermission!: Subscription;
  accessibility: boolean = false;
  userPermissions: any = [];
  allChecked = false;
  totalItems: number = 0;
  itemsPerPage: number = 100;
  currentPage: number = 1;
  language: string = "";

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private _dialog: MatDialog, 
    private _roleService: RolePermissionService, 
    private _notificationService: NotificationService,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) { 
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit() {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    this.loadPage(1);
  }

  getAllPermissions() {
    this.obsPermission = this._roleService.apiRolePermissionListPermissionsGet(this.itemsPerPage,this.currentPage);
    this.subsPermission = this.obsPermission.subscribe({
      next: (response: Array<Permission>) => {
        if (response) {
          this.totalItems = response.length;
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
            this.getAllPermissions();
          }
        },
        error: (error) => {
          this._notificationService.showNotification("Error: " + error.message, "close", "error");
        }
      });
    } else {
      this._notificationService.showNotification("You don't have permission to add new permission for the page access", "close", "error");
    }
  }
  

  openEditForm(data: any, type: string) {
    let width;
    if (data != null) {
      if(type == 'assign') width="900px";
      const dialogRef = this._dialog.open(RolesFormComponent, { data:{data:data, formType:type}, width: width });
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val) {
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
    this.getAllPermissions();
  }
}
