import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChartOptions } from 'chart.js';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService } from 'src/shared/dataprovider/api';
import { DailyTransactionPieChart } from 'src/shared/dataprovider/api/model/dailyTransactionPieChart';
import { DailyTransactionPieChartDataRequestDTO } from 'src/shared/dataprovider/api/model/dailyTransactionPieChartDataRequestDTO';
import { GraphColors } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-daily-transaction',
  templateUrl: './daily-transaction.component.html',
  styleUrls: ['./daily-transaction.component.scss']
})
export class DailyTransactionComponent implements OnInit, OnDestroy {
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private destroy$ = new Subject<void>();
  public clientId: number = 0;
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

  legendLabels: string[] = ['Pending', 'Completed', 'Rejected', 'Closed'];

  getLegendColor(index: number): string {
    if (index >= 0 && index < GraphColors.getLineChartColors.length) {
      return GraphColors.getLineChartColors[index];
    }
    return 'black';
  }

  constructor(
    private clientService: ClientService,
    private notification: NotificationService,
    private fb: FormBuilder,
  ) {
    const currentDate = new Date(); 
    this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); 
    this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); 
    
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
      StartDate: this.convertToUTC(this.startDate),
      EndDate: this.convertToUTC(this.endDate)
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
