import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { VendorDTO, VendorsService } from 'src/shared/dataprovider/api';
import { PriorityVendor } from 'src/shared/dataprovider/api/model/priorityVendor';
import { VendorPrioRequestDTO } from 'src/shared/dataprovider/api/model/vendorPrioRequestDTO';
import { Status, TableOption } from 'src/shared/dataprovider/local/data/common';
import { getStatusName } from 'src/shared/helpers/helper';

@Component({
  selector: 'app-vendor-priority-modal',
  templateUrl: './vendor-priority-modal.component.html',
  styleUrls: ['./vendor-priority-modal.component.scss']
})
export class VendorPriorityModalComponent implements OnInit{
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public isLoading: boolean = false;
  public tableOption = TableOption;
  // public data:any
  private obsVendor!: Observable<any>;
  private subsVendor!: Subscription;
  private osbPrio!: Observable<any>;
  private subsPrio!: Subscription;
  private subs: Subscription[] = [];
  vendorList!: FormGroup;
  dataSource!: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'Actions',
    'Id',
    'Name',
    'SecretKey',
    'Status',
    'MinimumCI',
    'MaximumCI',
    'MinimumCO',
    'MaximumCO',
    // 'Url',
  ];

  currentPage: number = 1;
  totalItems: number = 10;
  itemsPerPage: number = this.tableOption.PageSize; // Number of items per page
  language: string = "";

  constructor(
    private _vendorService: VendorsService,
    private _notification: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data:any, @Inject(MAT_DIALOG_DATA) public isViewOnly :boolean,
    private translateService: TranslateService
  ){
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit(): void {
    this.getAllVendor('');
  }

  moveUp(row: any) {
    const index = this.dataSource.data.findIndex(v => v.Id === row.Id);
    if (index > 0) {
        const data = [...this.dataSource.data]; // Create a new array reference
        const temp = data[index - 1];

        // Swap Priority Numbers
        const tempPriority = row.PriorityNumber;
        row.PriorityNumber = temp.PriorityNumber;
        temp.PriorityNumber = tempPriority;

        // Swap rows
        data[index - 1] = row;
        data[index] = temp;

        this.dataSource.data = data; // Update dataSource
    }
}

moveDown(row: any) {
    const index = this.dataSource.data.findIndex(v => v.Id === row.Id);
    if (index < this.dataSource.data.length - 1) {
        const data = [...this.dataSource.data]; // Create a new array reference
        const temp = data[index + 1];

        // Swap Priority Numbers
        const tempPriority = row.PriorityNumber;
        row.PriorityNumber = temp.PriorityNumber;
        temp.PriorityNumber = tempPriority;

        // Swap rows
        data[index + 1] = row;
        data[index] = temp;

        this.dataSource.data = data; // Update dataSource
    }
}



    getAllVendor(keyword: string) { 
      this.isLoading = true;
  
      const page = this.currentPage;
      const limit = this.itemsPerPage;
      
      this.obsVendor = this._vendorService.apiVendorsGetAllVendorsGet(page, limit, keyword);
      this.subsVendor = this.obsVendor.subscribe({
        next: (response: any) => {
          if(response && Array.isArray(response.Data)){
            const tableData: any = response.Data.map((res:any) => ({
              Id: res.Id,
              Name: res.Name,
              SecretKey: res.SecretKey,
              Status: getStatusName(res.Status!, Status),
              MaximumCI: res.MaximumCI,
              MinimumCI: res.MinimumCI,
              MaximumCO: res.MaximumCO,
              MinimumCO: res.MinimumCO,
              PriorityNumber: res.PriorityNumber ?? 0,
            }));
            this.dataSource = new MatTableDataSource(tableData);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
          }
        },
        error: (error: HttpErrorResponse) => {
          this._notification.showNotification("Error:" + error.error, "close", "error")
        },
        complete: () => {
          this.isLoading = false;
        }
      });
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

  loadPage(page: number, keyword: string = ''): void { // Make keyword optional
    this.currentPage = page;
    this.getAllVendor(keyword);
  }

  onSortingSubmit() {
    const priorityUpdateList: PriorityVendor[] = this.dataSource.data.map((row: any) => ({
        VendorId: row.Id,
        PriorityNumber: row.PriorityNumber
    }));

    const requestBody: VendorPrioRequestDTO = {
        PriorityVendors: priorityUpdateList
    };

    this.osbPrio = this._vendorService.apiVendorsUpdatePriorityPost(requestBody);
    this.subsPrio = this.osbPrio.subscribe({
        next: (response) => {
            this._notification.showNotification("Priority updated successfully!", "close", "success");
        },
        error: (error: HttpErrorResponse) => {
            this._notification.showNotification("Error: " + error.error, "close", "error");
        }
    });
}


}
