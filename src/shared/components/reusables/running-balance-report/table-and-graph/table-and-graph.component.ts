import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChartData, ChartOptions } from 'chart.js';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { EODAgentComms } from 'src/shared/dataprovider/api/model/eODAgentComms';
import { EODAgentCommsGrandTotals } from 'src/shared/dataprovider/api/model/eODAgentCommsGrandTotals';
import { EODAgentCommsSummary } from 'src/shared/dataprovider/api/model/eODAgentCommsSummary';
import { EODTransactionSummaryReport } from 'src/shared/dataprovider/api/model/eODTransactionSummaryReport';
import { EODVendorSummaryReport } from 'src/shared/dataprovider/api/model/eODVendorSummaryReport';
import { TransactionEODGrandTotals } from 'src/shared/dataprovider/api/model/transactionEODGrandTotals';
import { TransactionReportEOD } from 'src/shared/dataprovider/api/model/transactionReportEOD';
import { VendorGrandTotals } from 'src/shared/dataprovider/api/model/vendorGrandTotals';
import { VendorReport } from 'src/shared/dataprovider/api/model/vendorReport';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-table-and-graph',
  templateUrl: './table-and-graph.component.html',
  styleUrls: ['./table-and-graph.component.scss']
})
export class TableAndGraphComponent implements OnInit {
  @Input() startDate!: Date;
  @Input() endDate!: Date;
  @Input() searchKeyword: string = "";
  displayedColumns: string[] = [];
  tableData: any[] = [];
  dataMap: { [key: string]: any[] } = {};
  public obsDeposit!: Observable<any>;
  public subsDeposit!: Subscription;
  public obsWithdrawal!: Observable<any>;
  public subsWithdrawal!: Subscription;
  public obsVendor!: Observable<any>;
  public subsVendor!: Subscription;
  public obsAgent!: Observable<any>;
  public subsAgent!: Subscription;
  language: string = "";
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0];
  reportRecordCounts: { [key: string]: number } = {};
  private getBarColors(count: number): string[] {
  const colors = ['#EE82EE', '#800080'];
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
}
  constructor(
    private reportService: ReportsService,
    private notificationService: NotificationService,
    private datePipe: DatePipe,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit(): void {
    this.updateTable(this.selectedTab);
    this.loadPage(1, this.startDate, this.endDate);
  }

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Net Amount',
      data: [],
      backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#F0F33F', '#9F33FF', '#EE82EE', '#800080'],
    }]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'x',
    scales: {
      x: { min: 0, max: 100000 },
      y: { beginAtZero: true }
    }
  };

  legendLabels: string[] = [];
  selectedTab: string = 'Deposit'; 

  onTabSelect(tab: string): void {
  this.selectedTab = tab;
  this.updateTable(tab);
}

  updateTable(title: string) {
    if (title !== this.selectedTab) return;
    this.totalItems = this.reportRecordCounts[title] ?? 0;
    if (this.dataMap[title] && this.dataMap[title].length > 0) {
        this.displayedColumns = Object.keys(this.dataMap[title][0]);
        this.tableData = [...this.dataMap[title]]; 
        let grandTotal = null;
         if (title === 'AgentComms' && this.dataMap['AgentGrandTotals']) {
            grandTotal = {
                'Agent Name': 'Grand Total:',
                'Deposit Gross': this.dataMap['AgentGrandTotals'][0]?.['Grand Deposit Gross'] || 0,
                'Withdrawal Gross': this.dataMap['AgentGrandTotals'][0]?.['Grand Withdrawal Gross'] || 0,
                'EOD Comms': this.dataMap['AgentGrandTotals'][0]?.['Grand EOD Comms'] || 0,
                'Wallet Balance': this.dataMap['AgentGrandTotals'][0]?.['Grand Wallet Balance'] || 0
            };
        } else if (title === 'Vendor' && this.dataMap['VendorGrandTotals']) {
            grandTotal = {
                'Vendor Name': 'Grand Total:',
                'Type': '',  
                'Channel': '',
                'Count': '', 
                'Fees': '',
                'Gross': this.dataMap['VendorGrandTotals'][0]?.['Grand Total Gross'] || 0,
                'Net Amount': this.dataMap['VendorGrandTotals'][0]?.['Grand Total Net'] || 0,
                'Total Profit': this.dataMap['VendorGrandTotals'][0]?. ['Grand Total Profit'] || 0,
            };
        } else if (title === 'COF' && this.dataMap['COFGrandTotals']) {
            grandTotal = {
                'Client': 'Grand Total:',
                'Gross': this.dataMap['COFGrandTotals'][0]?.['Grand Total Gross'] || 0,
                'Net Amount': this.dataMap['COFGrandTotals'][0]?.['Grand Total Net'] || 0,
                'Remaining COF': this.dataMap['COFGrandTotals'][0]?.['Grand Remaining COF'] || 0,
            };
        } else if (title === 'Withdrawal' && this.dataMap['WithdrawalGrandTotals']) {
            grandTotal = {
                'Client': 'Grand Total:',
                'Gross': this.dataMap['WithdrawalGrandTotals'][0]?.['Grand Total Gross'] || 0,
                'Fees': this.dataMap['WithdrawalGrandTotals'][0]?.['Grand Total Fees'] || 0,
                'Net Amount': this.dataMap['WithdrawalGrandTotals'][0]?.['Grand Total Net'] || 0,
                'Total Profit': this.dataMap['WithdrawalGrandTotals'][0]?.['Grand Total Profit'] || 0,
            };
        } else if (title === 'Deposit' && this.dataMap['DepositGrandTotals']) {
            grandTotal = {
                'Client': 'Grand Total:',
                'Gross': this.dataMap['DepositGrandTotals'][0]?.['Grand Total Gross'] || 0,
                'Fees': this.dataMap['DepositGrandTotals'][0]?.['Grand Total Fees'] || 0,
                'Net Amount': this.dataMap['DepositGrandTotals'][0]?.['Grand Total Net'] || 0,
                'Total Profit': this.dataMap['DepositGrandTotals'][0]?.['Grand Total Profit'] || 0,
            };
        }

        if (grandTotal) {
            this.tableData.push(grandTotal);
        }
        const filteredData = this.tableData.filter(item =>
          item['Client'] !== 'Grand Total:' &&
          item['Vendor'] !== 'Grand Total:' &&
          item['Vendor Name'] !== 'Grand Total:' &&
          item['Agent Name'] !== 'Grand Total:'
        );
        this.legendLabels = filteredData.map(item => 
            item['Client'] || item['Vendor Name'] || item['Agent Name'] || 'Unknown'
        );
        let dataField = 'Net Amount';
        if (title === 'AgentComms') {
            dataField = 'Wallet Balance';
        } 

        const chartData = filteredData.map(item => item[dataField] || 0);

        this.barChartData = {
          labels: this.legendLabels,
          datasets: [{
            label: dataField,
            data: chartData,
            backgroundColor: this.getBarColors(chartData.length),
          }]
        };

    } else {
        this.displayedColumns = [];
        this.tableData = [];
        this.legendLabels = [];
        this.barChartData = { labels: [], datasets: [{ label: 'EOD Comms', data: [], backgroundColor: [] }] };
    }
}

getColumnTotal(column: string): number {
  if (!this.tableData || !this.tableData.length) {
    return 0;
  }
  return this.tableData.reduce((acc, row) => {
    const val = row[column];
    return acc + (typeof val === 'number' ? val : 0);
  }, 0);
}



ngOnChanges(changes: SimpleChanges): void {
  if (changes['startDate'] || changes['endDate']) {
    this.loadPage(this.currentPage, this.startDate, this.endDate);
  }else if (changes['searchKeyword']){
     this.loadPage(1, this.startDate, this.endDate, this.searchKeyword);
  }
}

getDepositReportData(startDate?: Date, endDate?: Date, keyword?: string): void {
  this.obsDeposit = this.reportService.apiReportsGetDepositReportTabGet(startDate, endDate, keyword, this.itemsPerPage, this.currentPage);
  this.subsDeposit = this.obsDeposit.subscribe({
    next: (response: EODTransactionSummaryReport) => {
     this.reportRecordCounts['Deposit'] = response.TotalRecordCount ?? 0;
      this.processDepositReport(response);
      this.processDepositGrandTotals(response.GrandTotals);
      this.updateTable('Deposit');
    },
    error: (error: HttpErrorResponse) => {
      this.notificationService.showNotification("Error:" + error.error, "close", "error");
      this.dataMap['Deposit'] = [];
      this.dataMap['DepositGrandTotals'] = [];
      this.updateTable('Deposit');
    }
  });
}

private processDepositReport(response: EODTransactionSummaryReport): void {
  this.dataMap['Deposit'] = response.Reports?.map((report: TransactionReportEOD) => ({
    Client: report.Client || '',
    Channel: report.Merchant || '',
    Gross: report.Gross || 0,
    Count: report.Count || 0,
    Fees: report.Fees || 0,
    'Net Amount': report.Net || 0,
    'Total Profit': report.TotalProfit || 0,
  })) || [];
}

private processDepositGrandTotals(grandTotals?: TransactionEODGrandTotals): void {
  this.dataMap['DepositGrandTotals'] = grandTotals ? [{
    'Grand Total Gross': grandTotals.GrandTotalGross || 0,
    'Grand Total Net': grandTotals.GrandTotalNet || 0,
    'Grand Total Fees': grandTotals.GrandTotalFees || 0,
    'Grand Total Profit': grandTotals.GrandTotalProfit || 0,
  }] : [];
}


  getWithdrawalReportData(startDate?: Date, endDate?: Date, keyword?: string): void {
    this.obsWithdrawal = this.reportService.apiReportsGetWithdrawalReportTabGet(startDate, endDate, keyword, this.itemsPerPage, this.currentPage);
    this.subsWithdrawal = this.obsWithdrawal.subscribe({
      next: (response: EODTransactionSummaryReport) => {
        this.reportRecordCounts['Withdrawal'] = response.TotalRecordCount ?? 0;
        this.processWithdrawalReport(response);
        this.processWithdrawalGrandTotals(response.GrandTotals);
        this.updateTable('Withdrawal');
        
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification("Error:" + error.error, "close", "error");
        this.dataMap['Withdrawal'] = [];
        this.dataMap['WithdrawalGrandTotals'] = [];
        this.updateTable('Withdrawal');
      }
    });
  }
  
  private processWithdrawalReport(response: EODTransactionSummaryReport): void {
    this.dataMap['Withdrawal'] = response.Reports?.map((report: TransactionReportEOD) => ({
      Client: report.Client || '',
      Channel: report.Merchant || '',
      Gross: report.Gross || 0,
      Count: report.Count || 0,
      Fees: report.Fees || 0,
      'Net Amount': report.Net || 0,
      'Total Profit': report.TotalProfit || 0,
    })) || [];
  }
  
  private processWithdrawalGrandTotals(grandTotals?: TransactionEODGrandTotals): void {
    this.dataMap['WithdrawalGrandTotals'] = grandTotals ? [{
      'Grand Total Gross': grandTotals.GrandTotalGross || 0,
      'Grand Total Net': grandTotals.GrandTotalNet || 0,
      'Grand Total Fees': grandTotals.GrandTotalFees || 0,
      'Grand Total Profit': grandTotals.GrandTotalProfit || 0,
    }] : [];
  }
   

  getVendorReportData(startDate?: Date, endDate?: Date, keyword?: string): void {
    this.obsVendor = this.reportService.apiReportsGetVendorReportTabGet(startDate, endDate, keyword, this.itemsPerPage, this.currentPage);
    this.subsVendor = this.obsVendor.subscribe({
      next: (response: EODVendorSummaryReport) => {
        this.reportRecordCounts['Vendor'] = response.TotalRecordCount ?? 0;
        const totalProfit = this.processVendorReport(response);
        this.processVendorGrandTotals(response.GrandTotals, totalProfit);
        this.updateTable('Vendor');
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showNotification("Error:" + error.error, "close", "error");
        this.dataMap['Vendor'] = [];
        this.dataMap['VendorGrandTotals'] = [];
        this.updateTable('Vendor');
      }
    });
  }

  private processVendorReport(response: EODVendorSummaryReport): number {
    let totalProfit = 0;

    this.dataMap['Vendor'] = response.Reports?.map((report: VendorReport) => {
      const profit = report.OTFees || 0;
      totalProfit += profit;

      return {
        'Vendor Name': report.Vendor || '',
        'Type': this.getTypeLabel(report.Type),
        'Channel': report.Channel || '',
        'Gross': report.Gross || 0,
        'Count': report.Count || 0,
        'Fees': report.ACFees || 0,
        'Net Amount': report.Net || 0,
        'Total Profit': profit,
      };
    }) || [];

    return totalProfit;
  }

  private processVendorGrandTotals(grandTotals?: VendorGrandTotals, totalProfitFromReports: number = 0): void {
    this.dataMap['VendorGrandTotals'] = [{
      'Grand Total Fees': grandTotals?.GrandTotalFees || 0,
      'Grand Total Gross': grandTotals?.GrandTotalGross || 0,
      'Grand Total ACNet': grandTotals?.GrandTotalACNet || 0,
      'Grand Total Net': grandTotals?.GrandTotalNet || 0,
      'Grand Total Profit': totalProfitFromReports, // Overridden with computed OTFees sum
    }];
  }


  private getTypeLabel(type: number | undefined): string {
    switch (type) {
      case 1: return 'Cash-In';
      case 2: return 'Cash-Out';
      default: return `${type ?? ''}`;
    }
  }
  

getAgentReportData(startDate?: Date, endDate?: Date, keyword?: string): void {
  this.obsAgent = this.reportService.apiReportsGetAgentCommReportTabGet(startDate, endDate, keyword, this.itemsPerPage, this.currentPage);
  this.subsAgent = this.obsAgent.subscribe({
    next: (response: EODAgentCommsSummary) => {
      this.reportRecordCounts['AgentComms'] = response.TotalRecordCount ?? 0;
      this.processAgentReport(response);
      this.processAgentGrandTotals(response.GrandTotals);
      this.updateTable('AgentComms');
    },
    error: (error: HttpErrorResponse) => {
      this.notificationService.showNotification("Error:" + error.error, "close", "error");
      this.dataMap['AgentComms'] = [];
      this.dataMap['AgentGrandTotals'] = []; 
      this.updateTable('AgentComms');
    }
  });
}

private processAgentReport(response: EODAgentCommsSummary): void {
  this.dataMap['AgentComms'] = response?.Reports?.length
    ? response.Reports.map((report: EODAgentComms) => ({
        'Agent Name': report.Agent || '',
        'Deposit Gross': report.DepositGross || 0,
        'Withdrawal Gross': report.WithdrawalGross || 0,
        'EOD Comms': report.EODComms || 0,
        'Wallet Balance': report.WaletBalance || 0,
      }))
    : [];
}

private processAgentGrandTotals(grandTotals?: EODAgentCommsGrandTotals): void {
  this.dataMap['AgentGrandTotals'] = grandTotals
    ? [
        {
          'Grand Deposit Gross': grandTotals.GrandDepositGross || 0,
          'Grand Withdrawal Gross': grandTotals.GrandWithdrawalGross || 0,
          'Grand EOD Comms': grandTotals.GrandEODComms || 0,
          'Grand Wallet Balance': grandTotals.GrandWaletBalance || 0,
        }
      ]
    : [];
}

isNumberColumn(column: string): boolean {
  const numberColumns = ['Gross', 'Fees', 'Net Amount', 'Total Profit', 'Remaining COF', 'Total Fees', 'Fees', 'OT Fees', 'Deposit Gross', 'Withdrawal Gross', 'EOD Comms', 'Wallet Balance',
    'Deposit', 'Withdrawal',];
  return numberColumns.includes(column);
}

getGrandTotal(column: string): number {
  return this.tableData.reduce((sum, row) => sum + (row[column] || 0), 0);
}

loadPage(page: number, startDate: Date, endDate: Date, keyword?: string): void {
  this.currentPage = page;
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  this.getDepositReportData(startDate, endDate, keyword);
  this.getWithdrawalReportData(startDate, endDate, keyword);
  // this.getCOFReportData(startDate, endDate, keyword);
  this.getVendorReportData(startDate, endDate, keyword);
  this.getAgentReportData(startDate, endDate, keyword);
  // this.getProfitReportData(startDate, endDate, keyword);
}

  onFirstPage(): void {
    this.loadPage(1, this.startDate, this.endDate);
  }
  
  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, this.startDate, this.endDate);
    }
  }
  
  onNextPage(): void {
    const totalPages = Math.ceil((this.reportRecordCounts[this.selectedTab] ?? 0) / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.loadPage(this.currentPage + 1, this.startDate, this.endDate);
    }
  }

  onLastPage(): void {
    const totalPages = Math.ceil((this.reportRecordCounts[this.selectedTab] ?? 0) / this.itemsPerPage);
    this.loadPage(totalPages, this.startDate, this.endDate);
  }

    onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
     this.loadPage(this.currentPage, this.startDate, this.endDate);
  }
}
