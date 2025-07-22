import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { TransactionLogsService } from 'src/shared/dataprovider/api/api/transactionLogs.service';
import { TransactionSummary } from 'src/shared/dataprovider/api/model/transactionSummary';
import { TransactionSummaryIncomeTotal } from 'src/shared/dataprovider/api/model/transactionSummaryIncomeTotal';


@Component({
  selector: 'app-income-report',
  templateUrl: './income-report.component.html',
  styleUrls: ['./income-report.component.scss']
})
export class IncomeReportComponent implements OnChanges {
  isLoading: boolean = false;
  public Summary: TransactionSummaryIncomeTotal = {
    IncomeToday: 0,
    NetIncomeToday: 0,
    IncomeYesterday: 0,
    NetIncomeYesterday: 0,
    IncomeThisWeek: 0,
    NetIncomeThisWeek: 0,
    IncomeThisMonth: 0,
    NetIncomeThisMonth: 0,
    Income: 0,
    NetIncome: 0,
  };
  @Input() data!: TransactionSummary;
  language: string = "";
  constructor( private translateService: TranslateService) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
   }

  ngOnChanges(changes: SimpleChanges) {
    // Check if data changed
    if (changes['data'] && changes['data'].currentValue) {
      // Load data automatically
      this.loadData();
    }
  }

  loadData() {
    if (this.data != null && this.data.TotalIncome != null) {
      this.Summary = {
        IncomeToday: this.data.TotalIncome.IncomeToday,
        NetIncomeToday: this.data.TotalIncome.NetIncomeToday,
        IncomeYesterday: this.data.TotalIncome.IncomeYesterday,
        NetIncomeYesterday: this.data.TotalIncome.NetIncomeYesterday,
        IncomeThisWeek: this.data.TotalIncome.IncomeThisWeek,
        NetIncomeThisWeek: this.data.TotalIncome.NetIncomeThisWeek,
        IncomeThisMonth: this.data.TotalIncome.IncomeThisMonth,
        NetIncomeThisMonth: this.data.TotalIncome.NetIncomeThisMonth,
        Income: this.data.TotalIncome.Income,
        NetIncome: this.data.TotalIncome.NetIncome,
      };
      console.log('this.data income:', this.Summary);
    }
  }
}
