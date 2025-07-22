import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TransactionSummary } from 'src/shared/dataprovider/api/model/transactionSummary';
import { TransactionSummaryDataTotal } from 'src/shared/dataprovider/api/model/transactionSummaryDataTotal';

@Component({
  selector: 'app-transaction-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnChanges {
  @Input() data!: TransactionSummary;
  public summary: TransactionSummaryDataTotal = {
    TotalCashin: 0,
    TotalCashout: 0,
    TotalWithdrawal: 0
  };
  public topData: Array<{ label: string; value: number }> = [];
  language: string ="";
  constructor(private translateService: TranslateService){
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && changes['data'].currentValue) {
      this.loadData();
    }
  }

  loadData() {
    if (this.data != null && this.data.Total != null) {
      this.summary = {
        TotalCashin: this.data.Total.TotalCashin,
        TotalCashout: this.data.Total.TotalCashout,
        TotalWithdrawal: this.data.Total.TotalWithdrawal
      };
      
      // Update topData array based on summary
      this.topData = [
        { label: 'totalCashIn', value: this.summary.TotalCashin || 0 },
        { label: 'totalCashOut', value: this.summary.TotalCashout || 0},
        { label: 'totalWithdrawal', value: this.summary.TotalWithdrawal || 0}
      ];
    }
  }
}
