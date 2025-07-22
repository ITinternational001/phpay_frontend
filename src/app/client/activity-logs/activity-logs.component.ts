import { Component, OnInit, ViewChild } from '@angular/core';
import { TotalNumberOfDataPerTable, activityLogsData } from '../../../shared/dataprovider/local/data/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ActivityLogsService } from 'src/shared/dataprovider/api';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivityLogDTO } from 'src/shared/dataprovider/api/model/activityLogDTO';
import { formatDateUtc, getWeekBeforeDateRange } from 'src/shared/helpers/helper';
import { DatePipe } from '@angular/common';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { TranslateService } from '@ngx-translate/core';
import { ActivityLogListDTO } from 'src/shared/dataprovider/api/model/activityLogListDTO';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-activity-logs',
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.scss'],
})
export class ActivityLogsComponent implements OnInit {
  displayedColumns: string[] = ['Timestamp', 'Username', 'ClientName', 'Role', 'ActionType', 'Description'];
  private observable! : Observable<any>;
  private subscription! : Subscription;
  dataSource!: MatTableDataSource<any>;
  DateRangeForm!:FormGroup;
  public isLoading:boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  totalItems: number = 0;
  itemsPerPage = itemsPerPageOptions[0]; 
  currentPage: number = 1;
  language: string = "";
  constructor(private _logService : ActivityLogsService, 
    private _notification: NotificationService, 
    private _fb:FormBuilder, 
    private datepipe:DatePipe,
    private translateService: TranslateService){

    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.DateRangeForm = this._fb.group({
      StartDate:'',
      EndDate:''
    })

    this.DateRangeForm.get("EndDate")?.valueChanges.subscribe(() => {
      this.loadPage(1);
    });
  }

  ngOnInit() {
    this.getActivityLogs(SessionManager.getFromToken("ClientId"), undefined, 
    getWeekBeforeDateRange().startDate,getWeekBeforeDateRange().endDate,undefined,undefined,undefined,undefined,1, TotalNumberOfDataPerTable);
    this.DateRangeForm.patchValue({StartDate: getWeekBeforeDateRange().startDate, EndDate:getWeekBeforeDateRange().endDate});
  }

  getDateRange(){
    let formgroup = this.DateRangeForm;
    let convertedStartDate = this.datepipe.transform(formgroup.get("StartDate")?.value, "YYYY-MM-dd");
    let convertedEndDate = this.datepipe.transform(formgroup.get("EndDate")?.value, "YYYY-MM-dd");
    let _startDateObj = new Date(convertedStartDate!);
    let _endDateObj = new Date(convertedEndDate!);
    this.getActivityLogs(SessionManager.getFromToken("ClientId"),undefined,_startDateObj, _endDateObj,undefined,undefined,undefined,undefined,1, TotalNumberOfDataPerTable);
  }


  getActivityLogs(
    clientId?: number,
    clientName?: string,
    startDate?: Date,
    endDate?: Date,
    userName?: string,
    Keyword?: string,
    action?: string,
    role?: string,
    page?: number,
    limit?: number
  ) {
    this.observable = this._logService.apiActivityLogsGetActivityLogsGet(
      Keyword, startDate, endDate, userName, clientName, clientId, action, role, this.itemsPerPage, this.currentPage
    );
    
    this.subscription = this.observable.subscribe({
      next: (response: ActivityLogListDTO) => {
        if (response && response.Data) {
          let tableData: any[] = response.Data.map((item: ActivityLogDTO) => ({
            UserName: item?.UserName,
            ClientName: item?.ClientName,
            RoleName: item?.RoleName,
            Action: item?.Action,
            Description: item?.Description,
            Timestamp: formatDateUtc(item?.Timestamp?.toString()!, this.datepipe)
          }));
  
          this.totalItems = response.TotalRecordCount || 0;
  
          this.dataSource = new MatTableDataSource(tableData);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Something went wrong " + error.error, "close", "error");
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
  loadPage(page: number, data?: any, keyword: string = ''): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
     const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);
     let convertedStartDate = this.datepipe.transform(this.DateRangeForm.get("StartDate")?.value, "YYYY-MM-dd");
    let convertedEndDate = this.datepipe.transform(this.DateRangeForm.get("EndDate")?.value, "YYYY-MM-dd");
    let _startDateObj = new Date(convertedStartDate!);
    let _endDateObj = new Date(convertedEndDate!);
    this.getActivityLogs(undefined, undefined, _startDateObj, _endDateObj, undefined, keyword, undefined, undefined, this.currentPage, this.itemsPerPage);
}

onFirstPage(): void {
  this.loadPage(1, this.DateRangeForm.getRawValue(), '');
}

onPreviousPage(): void {
  if (this.currentPage > 1) {
    this.loadPage(this.currentPage - 1, this.DateRangeForm.getRawValue(), '');
  }
}

onNextPage(): void {
  if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
    this.loadPage(this.currentPage + 1, this.DateRangeForm.getRawValue(), '');
  }
}

onLastPage(): void {
  this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), this.DateRangeForm.getRawValue(), '');
}

onPageChange(page: number): void {
    this.loadPage(page, this.DateRangeForm.getRawValue(), ''); 
}

onItemsPerPageChanged(selectedItemsPerPage: number): void {
  this.itemsPerPage = selectedItemsPerPage;
  this.loadPage(this.currentPage, this.DateRangeForm.getRawValue(), '');
}

onSearch(query: string): void {
    this.loadPage(1, this.DateRangeForm.getRawValue(), query);
}

 
}
