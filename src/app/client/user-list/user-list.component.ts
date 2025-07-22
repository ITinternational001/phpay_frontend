import { Component, OnInit, ViewChild } from '@angular/core';
import { Status, TableOption, TopCardData, TotalNumberOfDataPerTable, usersData } from '../../../shared/dataprovider/local/data/common';
import { Observable, Subscription, catchError, forkJoin, map, of } from 'rxjs';
import { ClientDTO, ClientService, UserService, VendorsService } from 'src/shared/dataprovider/api';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { UserListFormComponent } from './user-list-form/user-list-form.component';
import { activityLogsData } from '../../../shared/dataprovider/local/data/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { UserDTO } from 'src/shared/dataprovider/api/model/userDTO';
import { formatDateUtc, getRoleNameById, getStatusName, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { DatePipe } from '@angular/common';
import { IPWhitelistDTO } from 'src/shared/dataprovider/api/model/iPWhitelistDTO';
import { RolePermissionService } from 'src/shared/dataprovider/api/api/rolePermission.service';
import { Role } from 'src/shared/dataprovider/api/model/role';
import { UsersListDTO } from 'src/shared/dataprovider/api/model/usersListDTO';
import { ClientPasswordResetComponent } from './client-password-reset/client-password-reset.component';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  topData = TopCardData.users;
  clientId :number = parseInt(SessionManager.getFromToken("ClientId"));
  displayedColumns: string[] = [
    'Name',
    'Username',
    'Email',
    'Status',
    'ClientId',
    'RoleId',
    'Actions'
  ];
  clientsList: Array<ClientDTO> = [];
  dataSource!: MatTableDataSource<any>;
  private obsClientUsers!: Observable<any>;
  private subsClientUsers!: Subscription;
  private observables!: Observable<any>;
  private subscription!: Subscription;
  private obsRole!: Observable<any>;
  private subsRole!: Subscription;
  private arrRole: any = [];
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0];
  public isLoading:boolean = false;
  public isReadAndWrite:boolean = false;
  public roles: any[] = [];
 
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  language: string = "";
  constructor(private _userService: UserService,
    private _dialog: MatDialog, private _notification: NotificationService,
    private _clientService: ClientService,
    private datepipe: DatePipe,
    private _roleService: RolePermissionService,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) { 
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  async ngOnInit(): Promise<void> {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    await this.getAllRoles(); 
    this.getAllUserByClientId();

  }

  openResetPasswordForm(data: any) {
    const dialogRef = this._dialog.open(ClientPasswordResetComponent, { data, width: '600px' });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getAllUserByClientId();
        }
      }
    });
  }

  private async getAllUserByClientId(keyword?: string) {
    this.isLoading = true;
    this.obsClientUsers = this._userService.apiUserFindUsersByClientIdGet(this.clientId, this.currentPage, this.itemsPerPage, keyword);
  
    this.subsClientUsers = this.obsClientUsers.subscribe({
      next: (response: UsersListDTO) => {
        this.topData[0].value = response?.TotalUsers!;
        this.totalItems = response.TotalUsers!;
        // const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const data: Array<UserDTO> = response.Data!;
        const observables = data.map(element => this.getClientNameById(element.ClientId));
        forkJoin([...observables]).subscribe(([...result]) => {
  
          let tableData: any = data.map((element, index) => ({
            Name: element.Name,
            Username: element.Username,
            Email: element.Email,
            Status: getStatusName(element.Status!, Status),
            Client: result[index],
            Role: this.getRoleNameById(element.RoleId!, this.arrRole),
            RoleId: element.RoleId,
            ClientId: element.ClientId,
            UserId: element.Id,
            StatusId: element.Status,
          }));
  
          this.dataSource = new MatTableDataSource(tableData);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        });
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", "error")
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }


  getClientNameById(clientId: number | undefined): Observable<string> {
    if (clientId === undefined) {
      return of('Client not Found');
    }

    return this._clientService.apiClientGetClientByIdGet(clientId).pipe(
      map((response: ClientDTO) => response?.Name ?? 'Client not Found'),
      catchError(error => {
        console.log(error);
        return of('Client not Found');
      })
    );
  }

  getAllRoles() {
    this.obsRole = this._roleService.apiRolePermissionListRolesGet(100, 1);
    this.subsRole = this.obsRole.subscribe({
      next: (response: any) => { 
        if (response && Array.isArray(response.Data)) {
          this.arrRole = response.Data.map((item: Role) => ({
            RoleID: item?.RoleID,
            RoleName: item?.RoleName,
            RoleDescription: item?.RoleDescription,
            Status: getStatusName(item.Status!, Status),
            CreatedBy: item?.CreatedBy,
            CreatedAt: item?.CreatedAt
          }));
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", "error");
      }
    });
  }
  getRoleNameById(roleId: number, roles: any) {
    const filteredRole = roles.find((role: { RoleID: number; }) => role.RoleID === roleId);
    return filteredRole ? filteredRole.RoleName : 'Role not found';
  }
  

  openForm() {
    if (!this.isReadAndWrite) {
      this._notification.showNotification("You don't have permission to add new user", 'close', 'error');
      return; 
    }
    const dialogRef = this._dialog.open(UserListFormComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getAllUserByClientId();
        }
      }
    });
  }
  

  openEditForm(data: any) {
    const dialogRef = this._dialog.open(UserListFormComponent, { data });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getAllUserByClientId();
        }
      }
    });
  }

  loadPage(page: number, keyword?:string): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);
    this.getAllUserByClientId(keyword);
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

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage);
  }
  onSearch(query: string): void {
    // Handle the search query, e.g., make an API call or filter data
    this.loadPage(1, query);
  }
  
}
