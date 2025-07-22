import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';

@Component({
  selector: 'app-admin-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  displayedColumns: string[] = ['Id', 'Client', 'Transaction', 'Method', 'Merchant', 'StartDate', 'EndDate'];
  private observable!: Observable<any>;
  private subscription!: Subscription;
  selectedReport: any = 1;
  isSummary: boolean = false;
  isRemittance: boolean = false;
  isTotalIncome: boolean = false;
  isEodReport: boolean = false;
  public clientId :number = 0;
  title : string = "Select type of";
  language: string = "";
  constructor(private _reportService: ReportsService, private notification: NotificationService,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
   }

  reports = [
    { key: 1, value: 'Running Balance Report' },
    { key: 2, value: 'Summary Per Merchant Report' },
    { key: 3, value: 'Withdrawal Per Client Report' },
    { key: 4, value: 'Total Income Report'}
  ];

  ngOnInit(): void {
    this.getReportType();
  }

  getReportType() {
    if (this.selectedReport == 1) {
      this.isSummary = false;
      this.isRemittance = false;
      this.isTotalIncome = false;
      this.isEodReport = true;
      this.title = "runningBalanceReport"
    } else if (this.selectedReport == 2) {
      this.isSummary = true;
      this.isRemittance = false;
      this.isTotalIncome = false; 
      this.isEodReport = false;
      this.title = "summaryPerMerchantReport"
    } else if (this.selectedReport == 3) {
      this.isSummary = false;
      this.isRemittance = true;
      this.isTotalIncome = false;
      this.isEodReport = false;
      this.title = "withdrawalPerClientReport"
    }
    else if (this.selectedReport == 4) {
      this.isSummary = false;
      this.isRemittance = false;
      this.isTotalIncome = true;
      this.isEodReport = false;
      this.title = "totalIncomeReport"
    }
  }

  initializedData() {
    this.observable = this._reportService.apiReportsGetSummaryReportPost();
    this.subscription = this.observable.subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", "error");

      }
    })
  }
}
