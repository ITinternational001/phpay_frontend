import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Status, TableOption, clientListData, clientsData } from 'src/shared/dataprovider/local/data/common';
import { ClientsFormComponent } from './clients-form/clients-form.component';
import { Observable, Subscribable, Subscription, catchError, forkJoin, map, of } from 'rxjs';
import { ClientDTO, ClientService, ProviderDTO, ProvidersService } from 'src/shared/dataprovider/api';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TopCardData } from '../../../shared/dataprovider/local/data/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GenerateFormComponent } from './generate-form/generate-form.component';
import { DecimalPipeConverter, getStatusName, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { StatusFormComponent } from './status-form/status-form.component';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ClientWalletDTO } from 'src/shared/dataprovider/api/model/clientWalletDTO';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientWalletListDTO } from 'src/shared/dataprovider/api/model/clientWalletListDTO';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  topData = TopCardData.clients;
  private obsClient!: Observable<ClientWalletListDTO>;
  private subsClient!: Subscription;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  public tableOption = TableOption;
  public isLoading:boolean = false;
  TransferHistoryRequest!: FormGroup;
  TransferHistoryCompleted!: FormGroup;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0]; 
  clientList!: FormGroup;
  public isReadAndWrite : boolean = false;
  language: string = "";

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'Id',
    'Name',
    'TransactionCount',
    'TotalCashIn',
    'TotalCashOut',
    'Balance',
    'ProviderId',
    'Status',
    'Actions'
  ];

  dataSource!: MatTableDataSource<any>;

  constructor(
    private _dialog: MatDialog, 
    private _clientService: ClientService, 
    private _providerService: ProvidersService, 
    private router: Router,
    private notification: NotificationService, 
    private route: ActivatedRoute,
    private _decimalpipe:DecimalPipe,
    private translateService: TranslateService
    ) { 
      this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);

    }

  navigateToConfigurePage(data: any): void {
    this.router.navigate(['/admin/phpayclients/configure'], {
      queryParams: { data: JSON.stringify(data) }
    });
  }

  ngOnInit(): void {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    this.getAllClients();
  }

  openForm() {
    if (this.isReadAndWrite) {
      const dialogRef = this._dialog.open(ClientsFormComponent, { width: '600px' });
  
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val) {
            this.notification.showNotification("Client added successfully", "close", "success");
            this.getAllClients();
          }
        }
      });
    } else {
      this.notification.showNotification("You don't have permission to add a client", "close", "error");
    }
  }
  

  openEditForm(data: any) {
    this.observable = this._clientService.apiClientGetClientByIdGet(data.Id);
    this.subscription = this.observable.subscribe({
      next: (data) => {
        const dialogRef = this._dialog.open(ClientsFormComponent, { data });
        dialogRef.afterClosed().subscribe({
          next: (val) => {
            if (val) {
              this.getAllClients();
            }
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error: " + error.error,"close","error");
      }
    })
  }

  openGenerateForm(data: any) {
    this.observable = this._clientService.apiClientGetClientByIdGet(data.Id);
    this.subscription = this.observable.subscribe({
      next: (data) => {
        const dialogRef = this._dialog.open(GenerateFormComponent, { data, width: '600px' });
        dialogRef.afterClosed().subscribe({
          next: (val) => {
            if (val) {
              this.getAllClients();
            }
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error: " + error.error,"close","error");
      }
    })
  }

  openStatusForm(data: any) {
    this.observable = this._clientService.apiClientGetClientByIdGet(data.Id);
    this.subscription = this.observable.subscribe({
      next: (data) => {
        const dialogRef = this._dialog.open(StatusFormComponent, { data });
        dialogRef.afterClosed().subscribe({
          next: (val) => {
            if (val) {
              this.getAllClients();
            }
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error: " + error.error,"close","error");
      }
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getAllClients(keyword: string = '', startDate?: Date, endDate?: Date) {
    this.isLoading = true;
    const pageSize = this.itemsPerPage;
    const pageNumber = this.currentPage;

     let startDateISO = startDate?.toISOString().split('T')[0];
    let endDateISO = endDate?.toISOString().split('T')[0];
  
    // Call the API with startDate and endDate as parameters
    this.obsClient = this._clientService.apiClientGetAllClientsGet(pageSize, pageNumber, startDateISO ?? undefined,
       endDateISO ?? undefined, keyword ?? undefined);
    this.subsClient = this.obsClient.subscribe({
      next: (response: ClientWalletListDTO) => {
        this.totalItems = response.TotalRecordCount!;
        if(response.Data != null){
          const tableData: any = response.Data!.map((element, index) => ({
            Id: element.Id,
            Name: element.Name,
            TransactionCount: element.TransactionCount,
            TotalCashIn: element.TotalCashIn,
            TotalCashOut: element.TotalCashOut,
            Balance: element.AvailableBalance,
            Status: getStatusName(element.Status!, Status),
            ProviderId: element.Provider?.Id,
            ProviderName: element.Provider?.Name  
          }));
          this.dataSource = new MatTableDataSource(tableData);
          this.topData[0].value = response.Data!.length;
          let top1 = 0, top2 = 0, top3 = 0;
          response.Data!.map((item) => {
            top1 += item.TotalCashIn!;
            top2 += item.TotalCashOut!;
            top3 += item.TotalCashOut!;
          })
          this.topData[1].value = DecimalPipeConverter(top1, this._decimalpipe)!;
          this.topData[2].value = DecimalPipeConverter(top2, this._decimalpipe)!;
          this.topData[3].value = DecimalPipeConverter(top3, this._decimalpipe)!;
        }
                },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error: " + error.error,"close","error");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
  onSearch(query: string): void {
    // Handle the search query, e.g., make an API call or filter data
    this.loadPage(1, query);
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



loadPage(page: number, keyword?:string): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    // Determine if it's the last page
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);

    // Load data for the selected page here
    this.getAllClients(keyword);
  }



}
