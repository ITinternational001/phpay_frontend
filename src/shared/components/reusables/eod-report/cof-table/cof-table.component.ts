import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';

@Component({
  selector: 'app-cof-table',
  templateUrl: './cof-table.component.html',
  styleUrls: ['./cof-table.component.scss']
})
export class CofTableComponent implements OnInit, OnChanges {
  @Input() isLoading: boolean = false;
  @Input() startDate: string = ''; 
  @Input() endDate: string = '';
  
  private observable!: Observable<any>;
  private subscription!: Subscription;
  dataSource!: MatTableDataSource<any>;
  displayedColumns: string[] = ['client', 'coCount', 'totalCO', 'remaining'];
  grandTotalCO = 0;
  grandRemainingCOF = 0;

  constructor(
    private notification: NotificationService,
    private reportService: ReportsService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    // Set startDate to today's date if undefined
    const today = this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;
    this.startDate = this.startDate || today;
    this.getCOFSummary(this.startDate);  // Initial data load
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDate'] && !changes['startDate'].firstChange) {
      this.getCOFSummary(this.startDate);  // Fetch new data when startDate changes
      this.loadPage(1, '');  // Reload the page with empty search query
    }
  }

  getCOFSummary(startDate?: string, keywords?: string): void {
    this.isLoading = true;
    const formattedStartDate = startDate || this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;
    this.observable = this.reportService.apiReportsGetEODCOFSummaryReportGet(new Date(formattedStartDate), keywords);
  
    this.subscription = this.observable.subscribe({
      next: (response) => {
        if (response.Reports && response.Reports.length > 0) {
          // Calculate sums for RemainingCOF and TotalCO
          const totalRemainingCOF = response.Reports.reduce((sum: number, report: any) => sum + (report.RemainingCOF || 0), 0);
          const totalTotalCO = response.Reports.reduce((sum: number, report: any) => sum + (report.TotalCO || 0), 0);
  
          // Set the calculated totals to the component properties
          this.grandRemainingCOF = totalRemainingCOF;
          this.grandTotalCO = totalTotalCO;
  
          // Set the dataSource for the table
          this.dataSource = new MatTableDataSource(response.Reports);
        } else {
          this.dataSource = new MatTableDataSource<Report>([]);
        }
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification('Error: ' + error.error, 'closed', 'error');
        this.isLoading = false;
      }
    });
  }
  

  loadPage(page: number, keyword: string): void {
    this.getCOFSummary(this.startDate, keyword);  // Pass startDate and keyword for API call
  }

  onSearch(query: string): void {
    this.loadPage(1, query);  // Pass query as the keyword to reload the data
  }

  // Helper function to convert string startDate to a Date object if needed
  private convertToDate(date: string): Date {
    return new Date(date); 
  }

}
