import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { EODAgentComms } from 'src/shared/dataprovider/api/model/eODAgentComms';

@Component({
  selector: 'app-agent-comms-table',
  templateUrl: './agent-comms-table.component.html',
  styleUrls: ['./agent-comms-table.component.scss']
})
export class AgentCommsTableComponent implements OnInit {
  @Input() isLoading: boolean = false;
  @Input() startDate: string = ''; 
  @Input() endDate: string = ''; 
  GrandTotalEODComms = 0;
  GrandTotalWalletBalance = 0;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  dataSource!: MatTableDataSource<any>;
  displayedColumns: string[] = ['agent', 'CIgross', 'COgross', 'eodComms', 'walletBalance'];

  constructor(
    private notification: NotificationService,
    private reportService: ReportsService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    // Set startDate to today's date if undefined
    const today = this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;
    this.startDate = this.startDate || today;
    this.getComms(this.startDate);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDate'] && !changes['startDate'].firstChange) {
      this.getComms(this.startDate); 
      this.loadPage(1, ''); 
    }
  }

  getComms(startDate?: string, keyword?: string): void {
    this.isLoading = true;
    const formattedStartDate = startDate || this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;
    this.observable = this.reportService.apiReportsGetEODAgentCommSummaryReportGet(new Date(formattedStartDate), keyword);

    this.subscription = this.observable.subscribe({
      next: (response) => {
        if (response.Reports && response.Reports.length > 0) {
          // Calculate sums for EODComms and WalletBalance
          const totalEODComms = response.Reports.reduce((sum: number, report: EODAgentComms) => sum + (report.EODComms || 0), 0);
          const totalWalletBalance = response.Reports.reduce((sum: number, report: EODAgentComms) => sum + (report.WaletBalance || 0), 0);
          this.GrandTotalEODComms = totalEODComms;
          this.GrandTotalWalletBalance = totalWalletBalance;
          this.dataSource = new MatTableDataSource(response.Reports);
        } else {
          this.dataSource = new MatTableDataSource<EODAgentComms>([]);
        }
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification('Error: ' + error.error, "closed", "error");
        this.isLoading = false;
      }
    });
  }

  loadPage(page: number, keyword: string): void {
    this.getComms(this.startDate, keyword);
  }

  onSearch(query: string): void {
    this.loadPage(1, query);  
  }
}
