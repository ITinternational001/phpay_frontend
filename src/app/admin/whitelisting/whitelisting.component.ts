import { Component, ViewChild } from '@angular/core';
import { TableOption, TopCardData, TotalNumberOfDataPerTable, whiteListingData } from '../../../shared/dataprovider/local/data/common';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { WhitelistingFormComponent } from './whitelisting-form/whitelisting-form.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from 'src/shared/dataprovider/api';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { IPWhitelist } from 'src/shared/dataprovider/api/model/iPWhitelist';
import { IPWhitelistDTO } from 'src/shared/dataprovider/api/model/iPWhitelistDTO';
import { DatePipe } from '@angular/common';
import { formatDateUtc, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { IPWhitelistResponseListDTO } from 'src/shared/dataprovider/api/model/iPWhitelistResponseListDTO';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';
@Component({
  selector: 'app-whitelisting',
  templateUrl: './whitelisting.component.html',
  styleUrls: ['./whitelisting.component.scss']
})
export class WhitelistingComponent {
  topData = TopCardData.ipWhitelisting;
  private obsUserIpWhiteList!: Observable<any>;
  private subsUserIpWhiteList!: Subscription;
  private UserIpWhiteList!: Observable<any>;
  private clientId:number = 0;
  dataSource!: MatTableDataSource<any>;
  displayedColumns: string[] = ['Id','username', 'client', 'role', 'ip', 'lastdate', 'verification', 'status'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public isLoading:boolean = false;
  public tableOption = TableOption;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0]; 
  public isReadAndWrite : boolean = false;
  language : string = ""
  
  constructor(
    private _dialog: MatDialog, 
    private _userService : UserService, 
    private datePipe: DatePipe, 
    private _notificationService : NotificationService,
    private route: ActivatedRoute,
    private translateService: TranslateService) { 
    this.clientId = parseInt(SessionManager.getFromToken('ClientId'));

    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit() {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    this.loadPage(1);
   }

   openForm() {
    if (this.isReadAndWrite) {
      const dialogRef = this._dialog.open(WhitelistingFormComponent, { 
        width: '600px', 
        height: '486px' 
      });
  
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val) {
            this.getUserEnrolledUsersIpWhitelist();
          }
        },
        error: (error) => {
          this._notificationService.showNotification("Error: " + error.message, "close", "error");
        }
      });
    } else {
      this._notificationService.showNotification("You don't have permission to add user in whitelist", "close", "error");
    }
  }
  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getUserEnrolledUsersIpWhitelist(keyword?:string){
    if(this.subsUserIpWhiteList){
      this.subsUserIpWhiteList.unsubscribe()
    }
    this.isLoading = true;
    this.obsUserIpWhiteList = this._userService.apiUserGetEnrolledUsersIPWhitelistGet(undefined, this.currentPage, this.itemsPerPage, keyword);
    this.subsUserIpWhiteList = this.obsUserIpWhiteList.subscribe({
      next:(response : IPWhitelistResponseListDTO)=>{
        this.topData[0].value = response.TotalWhitelisted!;
        const data = response.Data!;
        this.totalItems = response.TotalWhitelisted!;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        let tableData: any = data.map((item, index)=>({
          Id : startIndex + index + 1, 
          Username: item?.Username,
          LastLogin : item?.LastLogin !== null ? formatDateUtc(item?.LastLogin!.toString(), this.datePipe) : 'No Activity',
          ClientName : item.ClientName,
          Role : item?.Role,
          Ip : item?.Ip !== null ? item?.Ip : "No Binded IP",
          Verification: item?.Verification,
          Status : item?.Status
        }));
        this.dataSource = new MatTableDataSource(tableData);    
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;  
      },
      error:(error:HttpErrorResponse)=>{
        this._notificationService.showNotification("Something went wrong, "+ error.error,"close","success");
      },
      complete:()=>{
        this.isLoading = false
      }
    });
  }

  loadPage(page: number, keyword?:string): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    // Determine if it's the last page
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);

    // Load data for the selected page here
    this.getUserEnrolledUsersIpWhitelist(keyword);
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
