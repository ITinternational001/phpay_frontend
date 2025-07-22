import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService } from 'src/shared/dataprovider/api';
import { PaymentChannelSummaryData } from 'src/shared/dataprovider/api/model/paymentChannelSummaryData';
import { TableOption } from 'src/shared/dataprovider/local/data/common';
import { getCurrentUserClientId } from 'src/shared/helpers/helper';
import { PaymentchannelModalComponent } from '../paymentchannel-modal/paymentchannel-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-channel-summary',
  templateUrl: './payment-channel-summary.component.html',
  styleUrls: ['./payment-channel-summary.component.scss']
})
export class PaymentChannelSummaryComponent implements OnInit {
  paymentChannelForm!: FormGroup;
  dataSource!: MatTableDataSource<any>;
  @Input() isLoading: boolean = false;
  displayedColumns: string[] = [
    'paymentChannel',
    'cashIn',
    'totalCI',
    'cashOut',
    'totalCO',
    'action'
  ];
  clientId: number = getCurrentUserClientId();
  startDate!: Date;
  endDate!: Date;
  totalItems: number = 0;
  itemsPerPage: number = 100;
  currentPage: number = 1;

  private selectedStartDate!: string;
  private selectedEndDate!: string;
  private selectedChannelId!: number;
  private status: number = 0; // Default status
  private observable!: Observable<any>;
  private subscription!: Subscription;
  public isReadAndWrite:boolean = false;
  language: string = "";
  constructor(
    private notification: NotificationService,
    private fb: FormBuilder,
    private clientService: ClientService,
    private datePipe: DatePipe,
    private _dialog: MatDialog,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.startDate = new Date();
    this.endDate = new Date();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
  }

  initializeForm(): void {
  this.paymentChannelForm = this.fb.group({
    StartDate: [this.startDate],
    EndDate: [this.endDate],
    ClientId: [this.clientId]
  });

  this.paymentChannelForm.valueChanges.subscribe(() => {
    const formValues = this.paymentChannelForm.getRawValue();
    if (formValues.StartDate && formValues.EndDate) {
      const formattedStartDate = this.formatDate(formValues.StartDate);
      const formattedEndDate = this.formatDate(formValues.EndDate);
      this.getPaymentSummary(this.clientId, formattedStartDate, formattedEndDate);
    } else {
      console.warn('StartDate or EndDate is null or undefined.');
    }
  });
}

  loadInitialData(): void {
    const formattedStartDate = this.formatDate(this.startDate);
    const formattedEndDate = this.formatDate(this.endDate);
    this.getPaymentSummary(this.clientId, formattedStartDate, formattedEndDate);
  }

  getPaymentSummary(clientId: number, startDate: string, endDate: string): void {
    this.isLoading = true;
    this.observable = this.clientService.apiClientDashboardPaymentChannelsSummaryGet(clientId, startDate, endDate);
    this.subscription = this.observable.subscribe({
      next: (response) => {
        console.log("PAYMENT CHANNEL DATA:", response);
        if (response.Data) {
          const allowedChannels = ['Gcash', 'Maya', 'Instapay', 'QRPH'];
          const filteredData = response.Data.filter((channel: PaymentChannelSummaryData) => 
            allowedChannels.includes(channel.PaymentChannelName || '')
          );
  
          console.log("Filtered Data (table rows):", filteredData);
  
          this.dataSource = new MatTableDataSource(filteredData);
  
          this.totalItems = response.TotalItems || 0;
          this.itemsPerPage = response.ItemsPerPage || 100;
          this.currentPage = response.CurrentPage || 1;
          this.selectedStartDate = startDate;
          this.selectedEndDate = endDate;
  
          this.isLoading = false;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error fetching payment summary:" + error.error, 'closed', 'error');
        this.isLoading = false;
      }
    });
  }

  onViewWallet(row: any): void {
   
    const selectedChannelId = row.PaymentChannelId || ''; 
    const selectedChannelName = row.PaymentChannelName || ''; 
    const width = '1500px';
    if (!selectedChannelId) {
    }
  
    try {
      const dialogRef = this._dialog.open(PaymentchannelModalComponent, {
        width: width,
        panelClass: 'custom-modal',
        data: {
          clientId: this.clientId,
          startDate: this.selectedStartDate,
          endDate: this.selectedEndDate,
          status: this.status,
          selectedChannelId: selectedChannelId,
          selectedChannelName: selectedChannelName
        },
      });
  
      dialogRef.afterClosed().subscribe({
        next: (data) => {
          console.log("Payment Modal closed with data:", data);
          if (data && data.release) {
            this.getPaymentSummary(data.clientId, data.startDate, data.endDate);
          }
        }
      });
    } catch (error) {
      console.error("Error opening payment channel modal", error);
    }
  }
  
  
  
  
  

  private formatDate(date: Date | null | undefined): string {
    if (!date) {
      return '';
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  

  onFirstPage(): void {
    this.loadPage(1);
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1);
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1);
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage));
  }

  loadPage(page: number): void {
    this.currentPage = page;
    // Trigger data load with updated date range when paginating
    const formValues = this.paymentChannelForm.getRawValue();
    const formattedStartDate = this.formatDate(formValues.StartDate);
    const formattedEndDate = this.formatDate(formValues.EndDate);
    this.getPaymentSummary(this.clientId, formattedStartDate, formattedEndDate);
  }
}
