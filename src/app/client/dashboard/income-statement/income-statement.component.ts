import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService } from 'src/shared/dataprovider/api';
import { IncomeStatementChart } from 'src/shared/dataprovider/api/model/incomeStatementChart';
import { IncomeStatementChartData } from 'src/shared/dataprovider/api/model/incomeStatementChartData';
import { GraphColors } from 'src/shared/dataprovider/local/data/general';
import { getCurrentUserClientId } from 'src/shared/helpers/helper';

@Component({
  selector: 'app-income-statement',
  templateUrl: './income-statement.component.html',
  styleUrls: ['./income-statement.component.scss']
})

export class IncomeStatementComponent implements OnInit, OnDestroy {
  incomeStatementForm!: FormGroup;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private destroy$ = new Subject<void>();
  startDate!: Date;
  endDate!: Date;
  clientId: number = getCurrentUserClientId();
  language: string = "";
  constructor(
    private _clientService: ClientService,
    private notification: NotificationService,
    private fb: FormBuilder,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.startDate = new Date();
    this.endDate = new Date();
    
    this.incomeStatementForm = fb.group({
      StartDate: [this.startDate],
      EndDate: [this.endDate],
      ClientId: [this.clientId]
    });
  }

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.startDate = new Date(currentYear, 0, 1);
    this.endDate = new Date(currentYear, 11, 31);
  
    this.incomeStatementForm = this.fb.group({
      StartDate: [this.startDate],
      EndDate: [this.endDate],
      ClientId: [this.clientId]
    });
  
    this.getChartMonthy();
  
    this.incomeStatementForm.get('StartDate')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value) {
        this.startDate = this.convertToUTC(value);
        this.getChart();
      }
    });
  
    this.incomeStatementForm.get('EndDate')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value) {
        this.endDate = this.convertToUTC(value);
        this.getChart();
      }
    });
  }
  private convertToUTC(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  }

  getChart() {
    const data = {
      ClientId: this.incomeStatementForm.get('ClientId')?.value,
      StartDate: this.startDate,
      EndDate: this.endDate
    };
  
    this.observable = this._clientService.apiClientDashboardGetIncomeStatementChartPost(data);
    this.subscription = this.observable.subscribe({
      next: (response: IncomeStatementChart) => {
        const dayLabels = response.Labels?.map((label: string) => {
          const date = new Date(label);
          return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }) || [];
  
        dayLabels.sort((a, b) => {
          const dateA = new Date(a);
          const dateB = new Date(b);
          return dateA.getTime() - dateB.getTime();
        });
  
        const dataSets = response.DataSets?.map((dataSet: IncomeStatementChartData, index: number) => ({
          data: dataSet.Data || [],
          label: dataSet.Label || `Dataset ${index + 1}`,
          tension: 0.5,
          borderColor: GraphColors.getLineChartColors[index % GraphColors.getLineChartColors.length]
        })) || [];
  
        this.lineChartData = {
          labels: dayLabels,
          datasets: dataSets
        };
      },
      error: (error: HttpErrorResponse) => {
        console.error("Error fetching daily chart data", error.error);
      }
    });
  }

  getChartMonthy() {
    const data = {
      ClientId: this.incomeStatementForm.get('ClientId')?.value,
      StartDate: this.startDate,
      EndDate: this.endDate
    };
  
    this.observable = this._clientService.apiClientDashboardGetIncomeStatementChartMonthlyPost(data);
    this.subscription = this.observable.subscribe({
      next: (response: IncomeStatementChart) => {
        const monthLabels = response.Labels?.map((label: string) => {
          const [year, month] = label.split('-');
          return new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'long' });
        }).reverse() || [];
  
        const dataSets = response.DataSets?.map((dataSet: IncomeStatementChartData, index: number) => ({
          data: dataSet.Data || [],
          label: dataSet.Label || `Dataset ${index + 1}`,
          tension: 0.5,
          borderColor: GraphColors.getLineChartColors[index % GraphColors.getLineChartColors.length]
        })) || [];
  
        this.lineChartData = {
          labels: monthLabels,
          datasets: dataSets
        };
      },
      error: (error: HttpErrorResponse) => {
        console.error("Error fetching monthly chart data", error.error, 'close', 'error');
      }
    });
  }
 
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Label from API or default',
        tension: 0.5,
        borderColor: GraphColors.getLineChartColors[0],
      },
      {
        data: [],
        label: 'Label from API or default',
        tension: 0.5,
        borderColor: GraphColors.getLineChartColors[1],
      },
      {
        data: [],
        label: 'Label from API or default',
        tension: 0.5,
        borderColor: GraphColors.getLineChartColors[2],
      },
      {
        data: [],
        label: 'Label from API or default',
        tension: 0.5,
        borderColor: GraphColors.getLineChartColors[3],
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: false,
    maintainAspectRatio: false
  };

  legendLabels: string[] = ['cashIn', 'cashOut'];

  getLegendColor(index: number): string {
    if (index >= 0 && index < GraphColors.getLineChartColors.length) {
      return GraphColors.getLineChartColors[index];
    }
    return 'black';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}