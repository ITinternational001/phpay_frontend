import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription, catchError, forkJoin, map, of } from 'rxjs';
import { UserService, ClientDTO, ClientService } from 'src/shared/dataprovider/api';
import { UserDTO } from 'src/shared/dataprovider/api/model/userDTO';
import { UsersFormComponent } from './users-form/users-form.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Status, TableOption, TotalNumberOfDataPerTable } from 'src/shared/dataprovider/local/data/common';
import { TopCardData, usersData } from '../../../shared/dataprovider/local/data/common';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { PasswordResetFormComponent } from './password-reset-form/password-reset-form.component';
import { RolePermissionService } from 'src/shared/dataprovider/api/api/rolePermission.service';
import { getStatusName, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { Role } from 'src/shared/dataprovider/api/model/role';
import { UsersListDTO } from 'src/shared/dataprovider/api/model/usersListDTO';
import { ConfirmationModalComponent } from 'src/shared/components/modals/confirmation-modal/confirmation-modal.component';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientWalletListDTO } from 'src/shared/dataprovider/api/model/clientWalletListDTO';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  topData = TopCardData.users;
  TotalUsers: number = 0;
  TotalWhiteListed: number = 0;
  private observables!: Observable<any>;
  private subscription!: Subscription;
  public clientName!: string;
  public statusEnum = Status;
  private obsUsers!: Observable<any>;
  private subsUsers!: Subscription;
  private obsRoles!: Observable<Array<Role>>;
  private subsRoles!: Subscription;
  private arrRole: any = [];
  public isLoading: boolean = false;
  public UserList!: FormGroup;
  public tableOption = TableOption;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0]; 
  public clients = [];
  public isReadAndWrite: boolean = false;
  displayedColumns: string[] = [
    'Id',
    'Name',
    'Username',
    'Email',
    'Role',
    'Status',
    'Client',
    'Actions'
  ];
  language : string = ""
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  clientsList: Array<ClientDTO> = [];

  constructor(private _dialog: MatDialog,
    private _userService: UserService,
    private _clientService: ClientService,
    private _roleService: RolePermissionService,
    private notification: NotificationService,
    private fb: FormBuilder, 
    private route: ActivatedRoute, 
    private translateService: TranslateService) {
      this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);
  }


  async ngOnInit(): Promise<void> {
    this.initializedData();
    this.loadPage(1);
    this.initializeForm();
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
  }

  initializedData() {
    this.getAllRoles();
    this.getAllClient();
  }
  private initializeForm() {
    this.UserList = this.fb.group({
      searchTerm: ['', Validators.required],

    });
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openForm() {
    if (this.isReadAndWrite) {
      const dialogRef = this._dialog.open(UsersFormComponent, {
        data: { type: 'userAdd' },
        width: '800px'
      });

      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val) {
            this.getAllUserByClientId();
          }
        },
        error: (error) => {
          this.notification.showNotification("Error: " + error.message, "close", "error");
        }
      });
    } else {
      this.notification.showNotification("You don't have permission to add new user", "close", "error");
    }
  }


  openEditForm(data: any, type?: string) {
    const dialogRef = this._dialog.open(UsersFormComponent, { data: { user: data, type }, width: '1000px' });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getAllUserByClientId();
        }
      }
    });
  }
  openResetPasswordForm(data: any) {
    const dialogRef = this._dialog.open(PasswordResetFormComponent, { data, width: '600px' });
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
    this.obsUsers = this._userService.apiUserFindUsersByClientIdGet(undefined, this.currentPage, this.itemsPerPage, keyword);
    this.subsUsers = this.obsUsers.subscribe({
      next: (response: UsersListDTO) => {
        this.topData[0].value = response?.TotalUsers!;
        this.totalItems = response.TotalUsers!;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const data: Array<UserDTO> = response.Data!;
  
          const tableData: any = data.map((element, index) => ({
            Id: element.Id,
            Name: element.Name,
            Username: element.Username,
            Email: element.Email,
            Status: getStatusName(element.Status!, Status),
            Client: element.ClientName,
            Role: this.getRoleNameById(element.RoleId!, this.arrRole),
            RoleId: element.RoleId,
            ClientId: element.ClientId,
            UserId: element.Id,
            StatusId: element.Status,
          }));
  
          this.dataSource = new MatTableDataSource(tableData);

      },
      error: (error: HttpErrorResponse) => {
        if (keyword == null) {
          this.notification.showNotification("Error:" + error.error, "close", "error");
        }
        this.isLoading = false;
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

  private async getAllClient() {
    this.observables = this._clientService.apiClientGetAllClientsGet();
    this.subscription = this.observables.subscribe({
      next: (response: ClientWalletListDTO) => {
        if(response.Data != null){
          this.clientsList = response.Data;
        }    
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {

      }
    });
  }

  getClientName(clientId: number): string | undefined {
    const client = this.clientsList.find(c => c.Id === clientId); // Assuming 'id' is the property name for client ID
    return client ? client.Name : '';
  }

  getAllRoles() {
    this.obsRoles = this._roleService.apiRolePermissionListRolesGet(100, 1);
    this.subsRoles = this.obsRoles.subscribe({
      next: (response: any) => {  // 'any' is to handle different response structures
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
        this.notification.showNotification("Error:" + error.error, "close", "error");
      }
    });
  }
  

  //Private functions
  getRoleNameById(roleId: number, roles: any) {
    const filteredRole = roles.find((role: { RoleID: number; }) => role.RoleID === roleId);
    return filteredRole ? filteredRole.RoleName : 'Role not found';
  }

  openDeleteForm(data: any) {
    if (data != null) {
      const dialogRef = this._dialog.open(ConfirmationModalComponent, { data: { data: data, type: 'User' } });
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val.continue) {
            this.disableUser(data);
          }
        }
      });
    }
  }

  disableUser(data: any) {
    this.obsUsers = this._userService.apiUserUpdateUserPost({ 
      UserId: data.UserId, NewName: data.Name, NewUsername: data.Username, 
      NewEmail: data.Email, RoleId: data.RoleId,  NewStatus: data.Status === "Active" ? 3 : 1 });
    this.subsUsers = this.obsUsers.subscribe({
      next: async (response) => {
        const message = data.Status === "Active" ? "User was disabled successfully" : "User was Enabled successfully"
        this.notification.showNotification(message, "close", 'success');
        await this.initializedData();
        this.getAllUserByClientId();
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error: " + error.error, "close", 'error');
      },
    });
  }

  loadPage(page: number, keyword?: string): void {
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

export interface UserTopCard {
  label: String,
  value: number,
  icon: "fa-solid fa-user",
  buttonlabel: "Add New User"
}