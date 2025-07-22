import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { Observable, Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService } from 'src/shared/dataprovider/api';
import { IncomeStatementChart } from 'src/shared/dataprovider/api/model/incomeStatementChart';
import { IncomeStatementChartData } from 'src/shared/dataprovider/api/model/incomeStatementChartData';
import { GraphColors } from 'src/shared/dataprovider/local/data/general';

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
  public clientId: number = 0;

  constructor(
    private _clientService: ClientService,
    private notification: NotificationService,
    private fb: FormBuilder
  ) {
    this.startDate = new Date();
    this.endDate = new Date();
    
    this.incomeStatementForm = fb.group({
      StartDate: [this.startDate],
      EndDate: [this.endDate],
      ClientId: [this.clientId]
    });
  }

  ngOnInit() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
    this.incomeStatementForm = this.fb.group({
      StartDate: [this.startDate],
      EndDate: [this.endDate],
      ClientId: [this.clientId]
    });
    this.getChart();
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
      StartDate: this.convertToUTC(this.startDate),
      EndDate: this.convertToUTC(this.endDate)
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

  getChartMonthly() {
    const data = {
      ClientId: this.incomeStatementForm.get('ClientId')?.value,
      StartDate: this.convertToUTC(this.startDate),
      EndDate: this.convertToUTC(this.endDate)
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
    datasets: []
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true, // Set to true for responsiveness
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  legendLabels: string[] = ['Cash-In', 'Cash-Out'];

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
