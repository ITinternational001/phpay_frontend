import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription, catchError, forkJoin, map, of } from 'rxjs';
import { ClientDTO, ClientService, MerchantDTO, MerchantsService, VendorDTO, VendorsService } from 'src/shared/dataprovider/api';
import { MerchantsFormComponent } from './merchants-form/merchants-form.component';
import { getCurrentUserClientId, getStatusName, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { Status, TableOption } from 'src/shared/dataprovider/local/data/common';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ConfirmationModalComponent } from 'src/shared/components/modals/confirmation-modal/confirmation-modal.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MerchantsListDTO } from 'src/shared/dataprovider/api/model/merchantsListDTO';
import { ClientWalletListDTO } from 'src/shared/dataprovider/api/model/clientWalletListDTO';
import { ClientWalletDTO } from 'src/shared/dataprovider/api/model/clientWalletDTO';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-merchants',
  templateUrl: './merchants.component.html',
  styleUrls: ['./merchants.component.scss']
})
export class MerchantsComponent implements OnInit {
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private obsMerchant!: Observable<MerchantsListDTO>;
  private subsMerchant!: Subscription;
  private obsMerchantDelete!: Observable<any>;
  private subMerchantDelete!: Subscription;  
  merchantTable!: FormGroup;
  public clientName!: string;
  public clientId : number = getCurrentUserClientId();
  public vendorName!: string;
  public tableOption = TableOption;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0]; 
  public isReadAndWrite: boolean = false;
  selectedClientId: number | null = null;
  selectedClientName: string | null = null;
  isReadonly: boolean = true;
  public isLoading: boolean = false;
  displayedColumns: string[] = [
    'Id',
    'VendorId',
    'PaymentChannelId',
    'Merchant',
    'TotalCashIn',
    'TotalCashOut',
    'Balance',
    'Status',
    'ClientId',
    'Actions'
  ];

  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  clientsList: Array<{ id: number; name: string }> = [];
  language: string = "";

  constructor(private _dialog: MatDialog,
    private _merchantService: MerchantsService,
    private _vendorService: VendorsService,
    private _clientService: ClientService,
    private notification :NotificationService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private translateService: TranslateService) {
      this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);
      
      this.merchantTable = this.fb.group({
        clientControl: [null], // Initialize form controls as needed
        // Add more controls as required
      });
     }


 async ngOnInit() {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    await this.getAllMerchants(this.clientId);
    await this.getAllClients();

  }

  openForm() {
    if (this.isReadAndWrite) {
      const dialogRef = this._dialog.open(MerchantsFormComponent, { width: '800px' });
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val) {
            this.notification.showNotification("Merchant Added successfully", "close", "success");
            this.getAllMerchants(this.clientId);
          }
        }
      });
    } else {
      this.notification.showNotification("You don't have permission to add a merchant", "close", "error");
    }
  }
  
  
  

  openEditForm(data: any) {
    if (data != null) {
      const merchantId = data.Id;
      this.observable = this._merchantService.apiMerchantsGetMerchantByIdGet(merchantId);
      this.subscription = this.observable.subscribe({
        next: (response: MerchantDTO) => {
          // Set readonly to false when editing
          this.isReadonly = true;
  
          console.log("Read Only:", this.isReadonly);
          const dialogRef = this._dialog.open(MerchantsFormComponent, { 
            data: { 
              ...response,
              isReadonly: this.isReadonly 
            } 
          });
  
          dialogRef.afterClosed().subscribe({
            next: (val) => {
              if (val) {
                this.notification.showNotification("Merchant data updated successfully", "close", 'success');
                // this.getAllMerchants(this.clientId);
              }
            }
          });
        },
        error: (error: HttpErrorResponse) => {
          this.notification.showNotification("Error:" + error.error, "close", 'error');
        }
      });
    }
  }
  

  getAllMerchants(clientId: number, keyword?: string) { 
    this.isLoading = true;
  
    if (clientId) { // Use the provided clientId
      this.obsMerchant = this._merchantService.apiMerchantsGetMerchantsByClientIdGet(clientId, this.itemsPerPage, this.currentPage, keyword);
      this.subsMerchant = this.obsMerchant.subscribe({
        next: (response: MerchantsListDTO) => {
          if (response) {
            this.totalItems = response.TotalRecordCount!;
            if (response.Data!.length > 0) {
              const tableData: any = response.Data!.map((element, index) => ({
                Id: element.Id,
                Name: element.Name,
                TotalCashIn: element.TotalCashIn,
                TotalCashOut: element.TotalCashOut,
                Balance: element.Balance,
                Status: getStatusName(element.Status!, Status),
                VendorId: element.Vendor?.Id,
                ClientId: element.Client?.Id,
                PaymentChannelId: element.PaymentChannel?.Id,
                VendorName: element.Vendor?.Name,
                ClientName: element.Client?.Name,
                PaymentChannelName: element.PaymentChannel?.Name,
              }));
  
              // If a keyword is provided, filter the table data
              if (keyword) {
                const lowerCaseKeyword = keyword.toLowerCase();
                this.dataSource = new MatTableDataSource(
                  tableData.filter((item: any) =>
                    item.Name.toLowerCase().includes(lowerCaseKeyword) || 
                    item.VendorId?.toString().includes(lowerCaseKeyword) ||
                    item.ClientId?.toString().includes(lowerCaseKeyword)
                  )
                );
              } else {
                this.dataSource = new MatTableDataSource(tableData);
              }
  
              this.dataSource.sort = this.sort;
              this.dataSource.paginator = this.paginator;
            } else {
              this.dataSource = new MatTableDataSource();
            }
          }
        },
        error: (error: HttpErrorResponse) => {
          this.notification.showNotification("Error:" + error.error, "close", 'error');
        },
        complete: () => {
          this.isLoading = false;
          this.subsMerchant.unsubscribe();
        }
      });
    }
  }
  
  getAllClients() {
    this.observable = this._clientService.apiClientGetAllClientsGet();
    this.subscription = this.observable.subscribe({
      next: (response: ClientWalletListDTO) => {
        const clients = response.Data || [];
        this.clientsList = clients
          .filter((item) => item.Id !== 1 && item.Id !== 2)
          .map((item) => ({
            id: item.Id ?? 0,
            name: item.Name ?? 'Unknown',
          }));
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification(
          "Error:" + error.error,
          "close",
          "error"
        );
      },
      complete: () => {},
    });
  }
  
 onSelectClient(clientId: { id: number; name: string }) {
    this.selectedClientId = clientId.id; 
    this.getAllMerchants(this.selectedClientId);
  }
  

  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
// Status value
  getStatusValue(status: string | undefined, transactionType: string | undefined): boolean {
    if (status == 'Active') {
      return true;
    } else {
      return false;
    }
  }

  getClientNameById(clientId: number | undefined): Observable<string> {
    if (clientId === undefined) {
      return of('Vendor not Found');
    }
    return this._clientService.apiClientGetClientByIdGet(clientId).pipe(
      map((response: ClientDTO) => response?.Name ?? 'Client not Found'),
      catchError(error => {
        console.log(error);
        return of('Client not Found');
      })
    );
  }

  getVendorNameById(vendorId: number | undefined): Observable<string> {

    if (vendorId === undefined) {
      return of('Vendor not Found');
    }

    return this._vendorService.apiVendorsGetVendorByIdGet(vendorId).pipe(
      map((response: VendorDTO) => response?.Name ?? 'Vendor not Found'),
      catchError(error => {
        console.log(error);
        return of('Vendor not Found');
      })
    );
  }

  
  deleteMerchant(merchantId: number) {
    this.obsMerchantDelete = this._merchantService.apiMerchantsDeleteMerchantPost(merchantId);
  
    this.subMerchantDelete = this.obsMerchantDelete.subscribe({
      next: () => {
        this.getAllMerchants(this.clientId); 
        this.notification.showNotification("Merchant data deleted successfully", "close", 'success');
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error" +error.error, "close", 'error');
        console.error(error.error);
      },
      complete: () => {
        if (this.subMerchantDelete) this.subMerchantDelete.unsubscribe();
      }
    });
  }
  
  onDropdownValueChanged(selectedValue: string) {
    this.clientId = selectedValue ? parseInt(selectedValue) : 1;
    this.getAllMerchants(this.clientId);
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

  
  
  loadPage(page: number, keyword?: string): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);
    const clientId = this.selectedClientId ?? 2; 
    this.getAllMerchants(clientId, keyword);
  }
  
  onSearch(query: string): void {
    this.loadPage(1, query);
  }

}
