import { DecimalPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable, Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService } from 'src/shared/dataprovider/api';
import { SuccessRate } from 'src/shared/dataprovider/api/model/successRate';
import { SuccessRateData } from 'src/shared/dataprovider/api/model/successRateData';
import { SuccessRateSummary } from 'src/shared/dataprovider/api/model/successRateSummary';
import { convertToFormattedDate, getWeekBeforeDateRange } from 'src/shared/helpers/helper';
import { SessionManager } from 'src/shared/helpers/session-manager';

@Component({
  selector: 'app-total-income',
  templateUrl: './total-income.component.html',
  styleUrls: ['./total-income.component.scss']
})
export class TotalIncomeComponent implements OnInit, OnDestroy {
  private observable!: Observable<any>;
  @Input() isLoading: boolean = false;
  private subscription!: Subscription;
  private destroy$ = new Subject<void>();
  isloading: boolean = false;
  openClientIndex: number | null = null;
  clients: any[] = [];
  successRateForm!: FormGroup;
  public clientId: number = 0;
  isStartDateSelectedManually = false;
  isEndDateSelectedManually = false;
  public defaultDateRange = getWeekBeforeDateRange(7);
  startDate: Date | undefined;
  endDate: Date | undefined;
  overAlltotalSuccessRate: number = 0;

  constructor(
    private _clientService: ClientService,
    private _decimalPipe: DecimalPipe,
    private _datePipe: DatePipe,
    private fb: FormBuilder,
    private notification: NotificationService
  ) { 
    
    this.successRateForm = fb.group({
      StartDate: [this.defaultDateRange.startDate],
      EndDate: [this.defaultDateRange.endDate],
      ClientId: [this.clientId]
    });
  }
 
  ngOnInit(): void {
    // Set default values
    this.startDate = this.defaultDateRange.startDate;
    this.endDate = this.defaultDateRange.endDate;

    // Patch form with default dates
    this.successRateForm.patchValue({
      StartDate: this.startDate,
      EndDate: this.endDate
    });

    // ✅ Call API on first load using default range
    this.getSuccessRates(this.clientId, this.startDate, this.endDate);

    // ✅ When user selects a StartDate manually
    this.successRateForm.get('StartDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.isStartDateSelectedManually = true;

        if (value) {
          this.startDate = this.convertToUTC(value);
        } else {
          this.startDate = undefined;
        }

        // Only call API when both dates are selected manually
        if (
          this.startDate && this.endDate &&
          this.isStartDateSelectedManually &&
          this.isEndDateSelectedManually
        ) {
          this.getSuccessRates(this.clientId, this.startDate, this.endDate);
        }
      });

    // ✅ When user selects an EndDate manually
    this.successRateForm.get('EndDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.isEndDateSelectedManually = true;

        if (value) {
          this.endDate = this.convertToUTC(value);
        } else {
          this.endDate = undefined;
        }

        // Only call API when both dates are selected manually
        if (
          this.startDate && this.endDate &&
          this.isStartDateSelectedManually &&
          this.isEndDateSelectedManually
        ) {
          this.getSuccessRates(this.clientId, this.startDate, this.endDate);
        }
      });
  }


  convertToUTC(date: Date): Date {
    // Create a new Date object in UTC format
    const utcDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ));
    return utcDate;
  }
  
  getSuccessRates(clientId: number, startDate?: Date, endDate?: Date) {
    this.isloading = true;

    this.observable = this._clientService.apiClientGetSuccessRateGet(clientId, startDate, endDate);
    this.subscription = this.observable.subscribe({
        next: (response: SuccessRateSummary[]) => {
            let totalTransactionCount = 0;
            let totalSuccessRate = 0;

            this.clients = response
                .filter(client => client.ClientId !== 1 && client.ClientId !== 2)
                .map(client => {
                    // Initialize totals for Cash In and Cash Out
                    const cashInTotals = {
                        type: "Deposit",
                        transCount: client.TotalTransactionCI ?? 0,
                        successCount: client.TotalSuccessCountCI ?? 0,
                        pendingCount: client.TotalPendingCountCI ?? 0,
                        successPercentage: (client.TotalTransactionCI ?? 0) > 0 
                            ? ((client.TotalSuccessCountCI ?? 0) / (client.TotalTransactionCI ?? 0)) * 100 
                            : 0
                    };

                    const cashOutTotals = {
                        type: "Withdrawal",
                        transCount: client.TotalTransactionCO ?? 0,
                        successCount: client.TotalSuccessCountCO ?? 0,
                        pendingCount: client.TotalPendingCountCO ?? 0,
                        successPercentage: (client.TotalTransactionCO ?? 0) > 0 
                            ? ((client.TotalSuccessCountCO ?? 0) / (client.TotalTransactionCO ?? 0)) * 100 
                            : 0
                    };

                    // Calculate the overall transaction count and success rate for this client
                    totalTransactionCount += cashInTotals.transCount + cashOutTotals.transCount;
                    totalSuccessRate += cashInTotals.successCount + cashOutTotals.successCount;

                    return {
                        ClientId: client.ClientId,
                        ClientName: client.ClientName,
                        TotalSuccessCountCICO: client.TotalSuccessCountCICO ?? 0,
                        TotalTransactionCICO: client.TotalTransactionCICO ?? 0,
                        AverageSuccessRateCICO: client.AverageSuccessRateCICO ?? 0,
                        Transactions: [cashInTotals, cashOutTotals]
                    };
                }).sort((a, b) => b.AverageSuccessRateCICO - a.AverageSuccessRateCICO); 
            this.overAlltotalSuccessRate = totalTransactionCount > 0 
                ? (totalSuccessRate / totalTransactionCount) * 100 
                : 0;

            this.isloading = false;
        },
        error: (error: HttpErrorResponse) => {
            this.notification.showNotification("Error:" + error.error, "close", "error");
            this.isloading = false;
        }
    });
}




  toggle(index: number): void {
    this.openClientIndex = this.openClientIndex === index ? null : index;
  }
  
  isOpen(index: number): boolean {
    return this.openClientIndex === index;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
} 
