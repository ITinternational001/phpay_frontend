import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { VendorReport } from 'src/shared/dataprovider/api/model/vendorReport';

@Component({
  selector: 'app-co-vendor-summary',
  templateUrl: './co-vendor-summary.component.html',
  styleUrls: ['./co-vendor-summary.component.scss']
})
export class CoVendorSummaryComponent implements OnInit  {
  @Input() isLoading: boolean = false;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  dataSource!: MatTableDataSource<any>;
  GrandTotalGross: number = 0;
  GrandTotalACNet: number = 0;
  GrandTotalNet: number = 0;
  displayedColumns: string[] = ['COvendor', 'COchannel', 'COgross', 'COacFees', 'COcount', 'COnet'];
  @Input() startDate: string = '';

  constructor(
    private notification: NotificationService,
    private reportService: ReportsService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    const today = this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;
    this.startDate = this.startDate || today;
    this.getVendorCashIn(this.startDate);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDate'] && !changes['startDate'].firstChange) {
      this.getVendorCashIn(this.startDate); 
      this.loadPage(1, ''); 
    }
  }

  getVendorCashIn(startDate?: string, keyword?: string): void {
    this.isLoading = true;
    const formattedStartDate = startDate || this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;
    
    this.observable = this.reportService.apiReportsGetEODVendorCashoutSummaryReportGet(new Date(formattedStartDate), keyword);
    this.subscription = this.observable.subscribe({
      next: (response) => {
        if (response.Reports && response.Reports.length > 0) {
          this.dataSource = new MatTableDataSource(response.Reports);

          // Calculate grand totals
          this.GrandTotalGross = response.Reports.reduce((total: number, report: VendorReport) => total + (report.Gross || 0), 0);
          this.GrandTotalACNet = response.Reports.reduce((total: number, report: VendorReport) => total + (report.ACFees || 0), 0);
          this.GrandTotalNet = response.Reports.reduce((total: number, report: VendorReport) => total + (report.Net || 0), 0);
        } else {
          this.dataSource = new MatTableDataSource<VendorReport>([]);
          this.GrandTotalGross = 0;
          this.GrandTotalACNet = 0;
          this.GrandTotalNet = 0;
        }

        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification('Error: ' + error.error, "closed", "error");
        this.isLoading = false;
        this.dataSource = new MatTableDataSource<VendorReport>([]);
        this.GrandTotalGross = 0;
        this.GrandTotalACNet = 0;
        this.GrandTotalNet = 0;
      }
    });
  }

  loadPage(page: number, keyword: string): void {
    this.getVendorCashIn(this.startDate, keyword);
  }

  onSearch(query: string): void {
    this.loadPage(1, query);  
  }
}
