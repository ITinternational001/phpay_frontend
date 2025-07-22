import { Component, OnInit, ViewChild } from '@angular/core';
import { integrationData, platformData } from 'src/shared/dataprovider/local/data/common';
import { MatDialog } from '@angular/material/dialog';
import { IntegrationFormComponent } from './integration-form/integration-form.component';
import { ProvidersService } from 'src/shared/dataprovider/api';
import { Observable, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { buttonLabels, itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ActivatedRoute } from '@angular/router';
import { getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { TranslateService } from '@ngx-translate/core';
import { ProviderListDTO } from 'src/shared/dataprovider/api/model/providerListDTO';

@Component({
  selector: 'app-integration',
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.scss']
})
export class IntegrationComponent implements OnInit {
  public isReadAndWrite : boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0]; // Number of items per page
  tableData: any[] = [];
  isLoading = false;
  displayedColumns : string[] =[
    'Id',
    'Name',
    'ServerIp',
    'WhiteListedIp',
    'CallbackUrl',
    'RedirectUrl',
    'Actions'
  ];
  btnplatform=buttonLabels.Platform;
  displayColumn = platformData.header;
  language: string = "";
  private observable!: Observable<any>;
  private subscription!: Subscription;
  dataSource!: MatTableDataSource<any>;

  constructor(private _dialog : MatDialog, private _providerService : ProvidersService, private notification: NotificationService,
    private route: ActivatedRoute, private translateService: TranslateService){
      this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);
    }

    openForm(): void {
      // Check if the user has read and write permissions
      if (!this.isReadAndWrite) {
        this.notification.showNotification("You don't have permission to add new platform", "close", "error");
        return; // Exit if no permission
      }
      const dialogRef = this._dialog.open(IntegrationFormComponent, { width: '700px' });
    
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val) {
            this.getProviderList();
          }
        }
      });
    }
    

  openEditForm(data : any){
    this.observable = this._providerService.apiProvidersGetProviderByIdGet(data.Id);
    this.subscription = this.observable.subscribe({
      next:(data)=>{
        console.log(data);
        const dialogRef = this._dialog.open(IntegrationFormComponent, { data,width:'700px' });
        dialogRef.afterClosed().subscribe({
          next: (val) => {
            if (val) {
              this.getProviderList();
            }
          }
        });
      },
      error:(error : HttpErrorResponse) =>{
        this.notification.showNotification("Error:" + error.error, "close", "error");
      }
    })    
   }


   getProviderList(keyword?: string) {
    this.isLoading = true;
  
    this.observable = this._providerService.apiProvidersGetAllProvidersGet(this.itemsPerPage, this.currentPage, keyword);
  
    this.subscription = this.observable.subscribe({
      next: (response: ProviderListDTO) => {
        const providers = response.Data || [];
        this.totalItems = response.TotalRecordCount || 0;
  
        this.tableData = providers.map((item, index) => ({
          Id: item.Id ?? 0,
          Name: item.Name ?? '-',
          CreatedDate: item.CreatedDate ?? null,
          UpdatedDate: item.UpdatedDate ?? null,
          ServerIp: item.ServerIp ?? '-',
          WhiteListedIp: item.WhiteListedIp ?? '-',
          CallbackUrl: item.CallbackUrl ?? '-',
          RedirectUrl: item.RedirectUrl ?? '-',
          index: index
        }));
  
        this.dataSource = new MatTableDataSource(this.tableData);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: (error: HttpErrorResponse) => {
        console.error("Failed to fetch providers:", error);
        this.notification?.showNotification("Failed to load provider data. Please try again.", "close", "error");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  

  ngOnInit(): void {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    this.getProviderList();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
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


  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage);
  }

  onSearch(query: string): void {
    // Handle the search query, e.g., make an API call or filter data
    this.loadPage(1, query);
  }
  loadPage(page: number,keyword?:string): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    // Determine if it's the last page
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);

    // Load data for the selected page here
    this.getProviderList(keyword);
  }

}
