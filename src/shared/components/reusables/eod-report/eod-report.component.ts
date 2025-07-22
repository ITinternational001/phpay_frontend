import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from '../../modals/notification/notification.service';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { getWeekBeforeDateRange } from 'src/shared/helpers/helper';
import { TopCardData } from 'src/shared/dataprovider/local/data/common';
import { HttpErrorResponse } from '@angular/common/http';
import { EODVendorSummaryReport } from 'src/shared/dataprovider/api/model/eODVendorSummaryReport';
import { EODTopCards } from 'src/shared/dataprovider/api/model/eODTopCards';
import { VendorReport } from 'src/shared/dataprovider/api/model/vendorReport';

@Component({
  selector: 'app-eod-report',
  templateUrl: './eod-report.component.html',
  styleUrls: ['./eod-report.component.scss']
})
export class EodReportComponent implements OnInit {
  @Input() isAdmin: boolean = false;
  @Input() clientId!: number;
  @Input() isLoading: boolean = false;
  startDate: string = '';
  displayedColumns: string[] = ['vendor', 'type', 'channel', 'gross', 'transactionFees' ,'net'];
  currentKeyword: string = '';
  dataSource = new MatTableDataSource<VendorReport>([]);
  EODReportForm!: FormGroup;
  topData = TopCardData.EOD;
  TotalCashinProfit: number = 0;
  grandTotalGross: number = 0;
  grandTotalACNet: number = 0;
  grandTotalNet: number = 0;
  getTotal(column: string): number {
    return this.dataSource.data.reduce((acc: number, curr: any) => acc + (curr[column] || 0), 0);
  }

  private subscription!: Subscription;
  private observable!: Observable<any>;
  defaultDateRange = {
    startDate: new Date().toISOString().split('T')[0]
  };

  constructor(
    private notification: NotificationService,
    private reportService: ReportsService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
  ) {
    this.EODReportForm = fb.group({
      SelectDate: [this.defaultDateRange.startDate], 
      ClientId: [this.clientId]
    });
  }

  ngOnInit(): void {
    this.EODReportForm.get('SelectDate')?.valueChanges.subscribe((selectedDate: string) => {
      this.startDate = this.convertToUTC(new Date(selectedDate));
      this.getEODReportData(this.startDate, this.currentKeyword);
    });
    this.EODReportForm.get('ClientId')?.valueChanges.subscribe((clientId: number) => {
      this.clientId = clientId;
      this.getEODReportData(this.startDate, this.currentKeyword);
    });
    this.loadPage(1, undefined, undefined);
  }

  private convertToUTC(date: Date): string {
    const utcDate = new Date(date);
    utcDate.setMinutes(utcDate.getMinutes() - utcDate.getTimezoneOffset());
    return utcDate.toISOString();
  }

  getEODReportData(selectedDate: string, keyword?: string): void {
    this.isLoading = true;
    const dateToSend = new Date(this.convertToUTC(new Date(selectedDate)));
    this.subscription = this.reportService
      .apiReportsGetEODSummaryReportDPAYGet(dateToSend, keyword)
      .subscribe({
        next: (response: EODVendorSummaryReport) => {
          // Process the top data
          this.TopData(response.EODTopCards);

          // Process the vendor table data
          this.VendorTableData(response.Reports);

          // Ensure `Reports` is defined and calculate the totals for Gross, ACNet, and Net
          const { grossTotal, acNetTotal, netTotal } = (response.Reports || []).reduce(
            (totals, report) => {
              return {
                grossTotal: totals.grossTotal + (report.Gross || 0),
                acNetTotal: totals.acNetTotal + (report.ACFees || 0),
                netTotal: totals.netTotal + (report.Net || 0),
              };
            },
            { grossTotal: 0, acNetTotal: 0, netTotal: 0 } // Initialize totals
          );
          this.grandTotalGross = grossTotal;
          this.grandTotalACNet = acNetTotal;
          this.grandTotalNet = netTotal;
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.notification.showNotification('Error: ' + error.error, 'closed', 'error');
        }
      });
  }

  TopData(topCards?: EODTopCards): void {
    if (topCards) {
      TopCardData.EOD.forEach((card, index) => {
        if (index === 0) card.value = topCards.TotalCashinProfit || 0;
        if (index === 1) card.value = topCards.TotalCashoutProfit || 0;
        if (index === 2) card.value = topCards.TotalDpayProfit || 0;
      });
      
    }
  }

  VendorTableData(reports?: VendorReport[]): void {
    if (reports) {
      const transformedReports = reports.map(report => ({
        ...report,
        TypeLabel: report.Type === 1 ? 'Cash In' : report.Type === 2 ? 'Cash Out' : 'Unknown'
      }));
      this.dataSource.data = transformedReports;
    } else {
      this.dataSource.data = [];
    }
  }

  loadPage(page: number, data?: any, keyword?: string): void {
    this.currentKeyword = keyword || '';
    const selectedDate = this.EODReportForm.get('SelectDate')?.value || new Date().toISOString(); // Use today's date if SelectDate is empty
    const formattedDate = this.convertToUTC(new Date(selectedDate)); 
  
    this.getEODReportData(formattedDate, keyword);  
  }

  onSearch(query: string): void {
    this.loadPage(1, undefined, query);
  }
}
