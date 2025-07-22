import { Component, OnInit } from '@angular/core';
import { TopCardData, vendorWithdrawalFees, merchantTransFees, clientTransaction } from '../../../shared/dataprovider/local/data/common';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { Observable, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-client-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  displayedColumns: string[] = ['Id', 'Client', 'Transaction', 'Method', 'Merchant', 'StartDate', 'EndDate'];
  private observable!: Observable<any>;
  private subscription!: Subscription;
  selectedReport: number = 1;
  isSummary: boolean = false;
  isRemittance: boolean = false;
  isTotalIncome: boolean = false;
  public clientId :number = parseInt(SessionManager.getFromToken('ClientId'));
  title : string = "Select type of";
  language: string = "";
  constructor(private _reportService: ReportsService, private notification: NotificationService,
    private translateService: TranslateService
  ) { 
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  reports = [
    { key: 1, value: 'Summary Per Transaction' },
    { key: 2, value: 'Remittance Report' },
    { key: 3, value: 'Total Income Report' }
  ];

  ngOnInit(): void {
    this.getReportType();
  }

  getReportType() {
    if (this.selectedReport == 1) {
      this.isSummary = true;
      this.isRemittance = false;
      this.isTotalIncome = false;
      this.title = "transactionSummary"
    } else if (this.selectedReport == 2) {
      this.isSummary = false;
      this.isRemittance = true;
      this.isTotalIncome = false;
      this.title = "remittances"
    } else if (this.selectedReport == 3) {
      this.isSummary = false;
      this.isRemittance = false;
      this.isTotalIncome = true;
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
        this.notification.showNotification("Error:" + error.error, "close", "error")
      }
    })
  }

}
