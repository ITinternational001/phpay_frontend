import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ChartOptions } from 'chart.js';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService } from 'src/shared/dataprovider/api';
import { DailyTransactionPieChart } from 'src/shared/dataprovider/api/model/dailyTransactionPieChart';
import { DailyTransactionPieChartDataRequestDTO } from 'src/shared/dataprovider/api/model/dailyTransactionPieChartDataRequestDTO';
import { GraphColors } from 'src/shared/dataprovider/local/data/general';
import { getCurrentUserClientId } from 'src/shared/helpers/helper';

@Component({
  selector: 'app-daily-transaction',
  templateUrl: './daily-transaction.component.html',
  styleUrls: ['./daily-transaction.component.scss']
})

export class DailyTransactionComponent implements OnInit {
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private destroy$ = new Subject<void>();
  clientId: number = getCurrentUserClientId();
  dailyTransactionForm!: FormGroup;
  startDate!: Date;
  endDate!: Date;

  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: false,
    maintainAspectRatio: false
  };

  public pieChartLabels = [ [ 'Pending' ], ['Rejected'], [ 'Closed' ], 'Cancelled' ];
  public pieChartDatasets: Array<{ data: number[]; backgroundColor: string[] }> = [
    {
      data: [],
      backgroundColor: []
    }
  ];
  public pieChartLegend = true;
  public pieChartPlugins = [];

  legendLabels: string[] = ['pending', 'completed', 'rejected', 'closed'];

  getLegendColor(index: number): string {
    if (index >= 0 && index < GraphColors.getPieChartColors.length) {
      return GraphColors.getPieChartColors[index];
    }
    return 'black'; 
  }
  language: string = "";
  constructor(
    private clientService: ClientService,
    private notification: NotificationService,
    private fb: FormBuilder,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    const currentYear = new Date().getFullYear();
    this.startDate = new Date(currentYear, 0, 1);
    this.endDate = new Date(currentYear, 11, 31);

    this.dailyTransactionForm = fb.group({
      StartDate: [this.startDate],
      EndDate: [this.endDate],
      ClientId: [this.clientId]
    });
  }

  ngOnInit(): void {
    this.dailyTransactionForm.get('StartDate')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value) {
        this.startDate = this.convertToUTC(value);
        this.getPieChart();
      }
    });

    this.dailyTransactionForm.get('EndDate')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value) {
        this.endDate = this.convertToUTC(value);
        this.getPieChart();
      }
    });
    this.getPieChart();
  }

  private convertToUTC(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  }

  getPieChart() {
    const data: DailyTransactionPieChartDataRequestDTO = {
      ClientId: this.dailyTransactionForm.get('ClientId')?.value,
      StartDate: this.startDate,
      EndDate: this.endDate
    };

    this.observable = this.clientService.apiClientDashboardGetDailyTransactionPieChartPost(data);
    this.subscription = this.observable.subscribe({
      next: (response: DailyTransactionPieChart) => {
        if (response && response.Data) {
          this.pieChartLabels = response.Data.map(item => item.Label || 'Unknown');
          this.pieChartDatasets = [{
            data: response.Data.map(item => item.Value || 0),
            backgroundColor: this.getPieChartColors(response.Data.length)
          }];
        } else {
          this.pieChartLabels = [];
          this.pieChartDatasets = [{ 
            data: [], 
            backgroundColor: [] 
          }];
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error fetching pie chart data:" + error.error, "close", "error");
        this.pieChartLabels = [];
        this.pieChartDatasets = [{ 
          data: [], 
          backgroundColor: [] 
        }];
      }
    });
  }

  private getPieChartColors(length: number): string[] {
    const predefinedColors: { [key: string]: string } = {
      Pending: '#18A0FB',
      Completed: '#F5BC29',
      Rejected: '#F52929',
      Closed: '#008000'
    };

    return this.pieChartLabels.map(label => predefinedColors[label as string] || 'gray');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
