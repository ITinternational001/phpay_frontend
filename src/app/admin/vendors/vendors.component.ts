import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VendorFormComponent } from './vendor-form/vendor-form.component';
import { Observable, Subscription, catchError, map, of } from 'rxjs';
import { PaymentChannelDTO, PaymentChannelsService, VendorDTO, VendorsService } from 'src/shared/dataprovider/api';
import { HttpErrorResponse } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { getStatusName, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { Status, TableOption } from 'src/shared/dataprovider/local/data/common';
import { ConfirmationModalComponent } from 'src/shared/components/modals/confirmation-modal/confirmation-modal.component';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VendorPriorityModalComponent } from './vendor-priority-modal/vendor-priority-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';
import { VendorListDTO } from 'src/shared/dataprovider/api/model/vendorListDTO';

@Component({
  selector: 'app-vendors',
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.scss']
})
export class VendorsComponent implements OnInit {
  vendorList!: FormGroup;
  private obsVendor!: Observable<any>;
  private subsVendor!: Subscription;
  public tableOption = TableOption;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0]; 
  public isLoading: boolean = false;
  displayedColumns: string[] = [
    'Id',
    'Name',
    'SecretKey',
    'Status',
    'MinimumCI',
    'MaximumCI',
    'MinimumCO',
    'MaximumCO',
    // 'Url',
    'Actions'
  ];

  dataSource!: MatTableDataSource<any>;
  public isReadAndWrite : boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  language : string = ""
  constructor(
    private fb: FormBuilder,
    private _dialog: MatDialog,
    private _vendorService: VendorsService,
    private _paymentChannelService: PaymentChannelsService,
    private route: ActivatedRoute,
    private notification: NotificationService,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.vendorList = this.fb.group({
      search: [''] // Example control, adjust as necessary
    });
  }

  async ngOnInit() {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    await this.getAllVendor(''); // Provide default value for keyword
  }

  openForm(isViewOnly: boolean = false) {
    if (this.isReadAndWrite) {
      const dialogRef = this._dialog.open(VendorFormComponent, {
        data: { isViewOnly },
        width: '800px',
      });
  
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val) {
            this.notification.showNotification("Vendor added successfully", "close", "success");
            this.getAllVendor(''); // Refresh the vendor list
          }
        }
      });
    } else {
      this.notification.showNotification("You don't have permission to add a vendor", "close", "error");
    }
  }

  openSorting(isViewOnly: boolean = false) {
    if (this.isReadAndWrite) {
      const dialogRef = this._dialog.open(VendorPriorityModalComponent, {
        data: { isViewOnly },
        width: '1600px',
        panelClass: 'custom-dialog-container' // Add this line
      });
  
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val) {
            this.notification.showNotification("Error sorting priority list", "close", "error");
          }
        }
      });
    }
  }
  
  
  

  openEditForm(data?: any, isViewOnly?: boolean) {
    this.obsVendor = this._vendorService.apiVendorsGetVendorByIdGet(data.Id);
    this.subsVendor = this.obsVendor.subscribe({
      next: (data) => {
        const dialogRef = this._dialog.open(VendorFormComponent, { data: { item: data, isViewOnly }, width: '800px' });
        dialogRef.afterClosed().subscribe({
          next: (val) => {
            if (val) {
              this.getAllVendor(''); // Provide default value for keyword
            }
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error: fetching data " + error.error, "close", "error");
      },
      complete: () => {
        this.subsVendor.unsubscribe();
      }
    });
  }

  openDeleteForm(data: any) {
    if (data != null) {
      const dialogRef = this._dialog.open(ConfirmationModalComponent, { data: { data: data, type: 'Vendor' } });
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val.continue) {
            this.deleteMerchant(data.Id);
          }
        }
      });
    }
  }

  deleteMerchant(merchantId: number) {
    this.obsVendor = this._vendorService.apiVendorsDeleteVendorPost(merchantId);
    this.subsVendor = this.obsVendor.subscribe({
      next: (response) => {
        
        this.getAllVendor(''); // Provide default value for keyword
        this.notification.showNotification("Vendor data deleted successfully", "close", 'success');
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", 'error');
        
      },
      complete: () => {
        this.subsVendor.unsubscribe();
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getAllVendor(keyword: string) {
    this.isLoading = true;
  
    const page = this.currentPage;
    const limit = this.itemsPerPage;
  
    this.obsVendor = this._vendorService.apiVendorsGetAllVendorsGet(page, limit, keyword);
    
    this.subsVendor = this.obsVendor.subscribe({
      next: (response: VendorListDTO) => {
        if (response && response.Data) {
          const tableData: any = response.Data.map((res) => ({
            Id: res.Id,
            Name: res.Name,
            SecretKey: res.SecretKey,
            Status: getStatusName(res.Status!, Status),
            MaximumCI: res.MaximumCI,
            MinimumCI: res.MinimumCI,
            MaximumCO: res.MaximumCO,
            MinimumCO: res.MinimumCO,
            PriorityNumber: res.PriorityNumber,
          }));
          
          this.totalItems = response.TotalRecordCount || 0;
          this.dataSource = new MatTableDataSource(tableData);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
  

  getPaymentChannelNameById(paymentChannelId: number | undefined): Observable<string> {
    if (paymentChannelId === undefined) {
      return of('providerId not Found');
    }

    return this._paymentChannelService.apiPaymentChannelsGetPaymentChannelByIdGet(paymentChannelId).pipe(
      map((response: PaymentChannelDTO) => response?.Name ?? 'paymentChannelId not Found'),
      catchError(error => {
        console.log(error);
        return of('paymentChannelId not Found');
      })
    );
  }

  onSearch(query: string =''): void {
    this.loadPage(1, query); // Pass the search query
  }

  loadPage(page: number, keyword: string = ''): void { // Make keyword optional
    this.currentPage = page;
    this.getAllVendor(keyword);
  }

  onFirstPage(): void {
    this.loadPage(1, this.vendorList.getRawValue().search); // Pass search value
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, this.vendorList.getRawValue().search); // Pass search value
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1, this.vendorList.getRawValue().search); // Pass search value
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), this.vendorList.getRawValue().search); // Pass search value
  }

  onPageChange(page: number): void {
    this.loadPage(page, this.vendorList.getRawValue().search); // Pass search value
  }

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage);
  }
}
