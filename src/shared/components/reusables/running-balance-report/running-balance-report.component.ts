import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { EODVendorSummaryReport } from 'src/shared/dataprovider/api/model/eODVendorSummaryReport';
import { TopCardData } from 'src/shared/dataprovider/local/data/common';
import { NotificationService } from '../../modals/notification/notification.service';
import { EODTopCards } from 'src/shared/dataprovider/api/model/eODTopCards';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChartData, ChartOptions } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-running-balance-report',
  templateUrl: './running-balance-report.component.html',
  styleUrls: ['./running-balance-report.component.scss']
})
export class RunningBalanceReportComponent implements OnInit {
  @Input() isAdmin: boolean = false;
  @Input() clientId!: number;
  @Input() isLoading: boolean = false;
  private subscription!: Subscription;
  private observable!: Observable<any>;
  topData = TopCardData.EOD;
  displayedColumns: string[] = ['column1', 'column2', 'column3'];
  tableData: any[] = [];
  dataSource: any[] = [];
  grandTotalGross: number = 0;
  grandTotalACNet: number = 0;
  grandTotalNet: number = 0;
  startDate!: Date;
  endDate!: Date;
  EODReportForm!: FormGroup;
  currentKeyword: string = '';
  defaultDateRange = {
    startDate: new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  };
  language: string = "";
  searchKeyword : string = "";
  constructor(
    private reportService: ReportsService,
    private notification: NotificationService,
    private fb: FormBuilder,
    private translateService: TranslateService
  ){
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.EODReportForm = fb.group({
      StartDate: [this.defaultDateRange.startDate], 
      EndDate: [this.defaultDateRange.endDate],
      ClientId: [this.clientId]
    });
  }

  ngOnInit(): void {
    this.startDate = new Date(this.convertToUTC(new Date(this.EODReportForm.get('StartDate')?.value))) || new Date(this.convertToUTC(new Date(this.defaultDateRange.startDate)));
    this.endDate = new Date(this.convertToUTC(new Date(this.EODReportForm.get('EndDate')?.value))) || new Date(this.convertToUTC(new Date(this.defaultDateRange.endDate)));
  
    this.EODReportForm.get('StartDate')?.valueChanges.subscribe((startDate: string) => {
      this.startDate = new Date(this.convertToUTC(new Date(startDate)));
      this.getEODReportData(this.startDate, this.endDate, this.clientId);
    });
  
    this.EODReportForm.get('EndDate')?.valueChanges.subscribe((endDate: string) => {
      this.endDate = new Date(this.convertToUTC(new Date(endDate)));
      this.getEODReportData(this.startDate, this.endDate, this.clientId);
    });
  
    this.EODReportForm.get('ClientId')?.valueChanges.subscribe((clientId: number) => {
      this.clientId = clientId;
      this.getEODReportData(this.startDate, this.endDate, this.clientId);
    });
  
    this.loadPage(1, undefined, undefined);
  }
  
  // TopCard
  getEODReportData(startDate: Date, endDate: Date, clientId?: number): void {
    this.isLoading = true;
  
    this.subscription = this.reportService.apiReportsGetVendorReportTabGet(startDate, endDate).subscribe({
      next: (response: EODVendorSummaryReport) => {
        if (response && response.EODTopCards) {
          this.TopData(response.EODTopCards);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching EOD report data:', error);
        this.isLoading = false;
      }
    });
  }
  
  TopData(topCards: EODTopCards): void {
    if (topCards) {
      TopCardData.EOD.forEach((card, index) => {
        switch (index) {
          case 0:
            card.value = topCards.TotalDpayProfit || 0;
            break;
          case 1:
            card.value = topCards.TotalCashinProfit || 0;
            break;
          case 2:
            card.value = topCards.TotalCashoutProfit || 0;
            break;
        }
      });
    }
  }


  private convertToUTC(date: Date): string {
    const utcDate = new Date(date);
    utcDate.setMinutes(utcDate.getMinutes() - utcDate.getTimezoneOffset());
    return utcDate.toISOString();
  }

  loadPage(page: number, data?: any, keyword?: string): void {
    this.currentKeyword = keyword || '';
    const selectedDate = this.EODReportForm.get('SelectDate')?.value || new Date().toISOString(); // Use today's date if SelectDate is empty
    const formattedDate = this.convertToUTC(new Date(selectedDate)); 
    this.getEODReportData(this.startDate, this.endDate);  
  }

  onSearch(query: string){
    this.searchKeyword = query;
  }

}
