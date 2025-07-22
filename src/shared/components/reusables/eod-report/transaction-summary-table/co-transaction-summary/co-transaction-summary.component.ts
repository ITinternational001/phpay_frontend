import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { EODTransactionSummaryReport } from 'src/shared/dataprovider/api/model/eODTransactionSummaryReport';

@Component({
  selector: 'app-co-transaction-summary',
  templateUrl: './co-transaction-summary.component.html',
  styleUrls: ['./co-transaction-summary.component.scss']
})
export class CoTransactionSummaryComponent implements OnInit {
  @Input() isLoading: boolean = false;
  @Input() startDate: string = ''; 
  @Input() endDate: string = '';
  displayedColumns: string[] = ['client', 'merchant', 'count', 'gross', 'fees', 'net',];
  dataSource!: MatTableDataSource<any>;
  GrandTotalGross: number = 0;
  GrandTotalFees: number = 0;
  GrandTotalNet: number = 0;
  private observable!: Observable<any>;
  private subscription!: Subscription;

  constructor(
    private notification: NotificationService,
    private reportService: ReportsService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    const today = this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;
    this.startDate = today; 
    this.getTransactionSummary(today);
  }

  ngOnChanges(changes: SimpleChanges): void {
      if (changes['startDate'] && !changes['startDate'].firstChange) {
        this.getTransactionSummary(this.startDate);  
        this.loadPage(1);  
      }
    }

    getTransactionSummary(startDate?: string, keywords?: string): void {
      const dateToUse = startDate || this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;
      this.observable = this.reportService.apiReportsGetEODTransactionCashoutSummaryReportGet(new Date(dateToUse), keywords);
      
      this.subscription = this.observable.subscribe({
        next: (response: EODTransactionSummaryReport) => {
          if (response.Reports) {
            const transformedReports = response.Reports.map(report => ({
              ...report,
              TypeLabel: report.Type === 1 ? 'Cash In' : report.Type === 2 ? 'Cash Out' : 'Unknown'
            }));
  
            // Sum the Gross and Net
            const totalGross = transformedReports.reduce((sum, report) => sum + (report.Gross || 0), 0);
            const totalNet = transformedReports.reduce((sum, report) => sum + (report.Net || 0), 0);
            const totalFees = transformedReports.reduce((sum, report) => sum + (report.Fees || 0), 0);
  

            this.GrandTotalGross = totalGross;
            this.GrandTotalNet = totalNet;
            this.GrandTotalFees = 0;
  
            // Assign the transformed reports to the dataSource
            this.dataSource = new MatTableDataSource(transformedReports);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.notification.showNotification('Error:' + error.error, "closed", "error");
        }
      });
    }
    
  

  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
  loadPage(page: number, keyword?: string): void {
    this.getTransactionSummary(this.startDate, keyword);
  }
  

  onDateChange(selectedDate: string): void {
    this.startDate = selectedDate;
    this.getTransactionSummary(selectedDate); 
  }
  
  onSearch(query: string): void {
    this.loadPage(1, query);  
  }
}
