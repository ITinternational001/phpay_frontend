import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, Subscription } from 'rxjs';
import { ClientDTO, ClientService } from 'src/shared/dataprovider/api';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { ClientWalletDTO } from 'src/shared/dataprovider/api/model/clientWalletDTO';
import { takeUntil } from 'rxjs/operators'; // Import takeUntil operator
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { getWeekBeforeDateRange } from 'src/shared/helpers/helper';
import { ClientWalletListDTO } from 'src/shared/dataprovider/api/model/clientWalletListDTO';
import { TranslateService } from '@ngx-translate/core';

export const Status = [
  { Id: 1, Type: 'Active' },
  { Id: 2, Type: 'Inactive' },
  { Id: 3, Type: 'Disabled' },
];

@Component({
  selector: 'app-clients-summary',
  templateUrl: './clients-summary.component.html',
  styleUrls: ['./clients-summary.component.scss'],
})
export class ClientsSummaryComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean = false;
  private Observable!: Observable<any>;
  private Subscription!: Subscription;
  displayedColumns: string[] = [
    'ClientID',
    'ClientName',
    'TotalDeposit',
    'TotalWithdrawal',
    'TotalRemittance',
  ];
  stickyColumns: string[] = [
    'ClientName',
    'TotalCashIn',
    'TotalCashOut',
    'TotalWithdrawal'
  ];
  dataSource = new MatTableDataSource<{
    Id: number | undefined;
    Name: string | undefined;
    Status: string;
    Balance: number | undefined;
  }>();
  totalItems: number = 0;
  itemsPerPage: number = 100;
  currentPage: number = 1;
  totalBalance: number = 0;
  clientSummaryForm!: FormGroup;
  totalCashIn: number = 0;
  totalCashOut: number = 0;
  totalWalletWithdrawn: number = 0;
  totalRemittanceWalletBalance: number = 0;
  public defaultDateRange = getWeekBeforeDateRange(7);
  clientId: any;
  startDate: any;
  endDate: any;
  destroy$ = new Subject<void>(); // Initialize destroy$ properly

  
  constructor(
    private clientService: ClientService,
    private _decimalpipe: DecimalPipe,
    private _datepipe: DatePipe,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private notification: NotificationService,
   
  ) {
   
    
    this.clientSummaryForm = fb.group({
      StartDate: [this.defaultDateRange.startDate],
      EndDate: [this.defaultDateRange.endDate],
      ClientId: [this.clientId]
    });
  }

  ngOnInit(): void {
    this.startDate = this.clientSummaryForm.get('StartDate')?.value;
    this.endDate = this.clientSummaryForm.get('EndDate')?.value;
    this.getAllClientId(this.clientId, this.startDate, this.endDate); 
    
    this.clientSummaryForm.get('StartDate')?.valueChanges
      .pipe(takeUntil(this.destroy$)) // Use takeUntil with destroy$
      .subscribe(value => {
        if (value) {
          this.startDate = this.convertToUTC(value);
        }
        this.getAllClientId(this.clientId, this.startDate, this.endDate);
      });
    
    this.clientSummaryForm.get('EndDate')?.valueChanges
      .pipe(takeUntil(this.destroy$)) // Use takeUntil with destroy$
      .subscribe(value => {
        if (value) {
          this.endDate = this.convertToUTC(value);
        }
        this.getAllClientId(this.clientId, this.startDate, this.endDate);
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

  ngOnDestroy() {
    this.destroy$.next(); // Emit a value to complete the observables
    this.destroy$.complete(); // Complete the subject
  }

    getAllClientId(keyword?: string, startDate?: Date, endDate?: Date): void {
      this.isLoading = true;

      // Define pagination parameters
      const pageSize = this.itemsPerPage;
      const pageNumber = this.currentPage;

      //convert dates
      let startDateISO = startDate?.toISOString().split('T')[0];
      let endDateISO = endDate?.toISOString().split('T')[0];

      // Call the API with provided parameters
      this.Observable = this.clientService.apiClientGetAllClientsGet(
          pageSize, 
          pageNumber, 
          startDateISO ?? undefined, 
          endDateISO ?? undefined,
          keyword ?? undefined
      );

      this.Subscription = this.Observable.subscribe({
          next: (response: ClientWalletListDTO) => {
              const clients = response.Data || [];
              const formattedResponse = clients
                  .filter((client) => client.Id !== 1 && client.Id !== 2)
                  .map((client) => ({
                      Id: client.Id,
                      Name: client.Name,
                      Status: this.getStatusDescription(client.Status),
                      Balance: client.AvailableBalance,
                      TotalCashIn: client.TotalCashIn,
                      TotalCashOut: client.TotalCashOut,
                      TotalWalletWithdrawn: client.TotalSettlementWalletWithdrawn,
                      RemittanceWalletBalance: client.SettlementWalletBalance,
                      FilteredTotalWalletWithdrawn: client.FilteredTotalWalletWithdrawn,
                      FilteredTotalCashIn: client.FilteredTotalCashIn,
                      FilteredTotalCashOut: client.FilteredTotalCashOut,
                  }));

              this.totalCashIn = formattedResponse.reduce(
                  (sum, client) => sum + (client.FilteredTotalCashIn ?? 0),
                  0
              );
              this.totalCashOut = formattedResponse.reduce(
                  (sum, client) => sum + (client.FilteredTotalCashOut ?? 0),
                  0
              );
              this.totalWalletWithdrawn = formattedResponse.reduce(
                  (sum, client) => sum + (client.FilteredTotalWalletWithdrawn ?? 0),
                  0
              );
              this.totalBalance = formattedResponse.reduce(
                  (sum, client) => sum + (client.Balance ?? 0),
                  0
              );
              this.totalRemittanceWalletBalance = formattedResponse.reduce(
                  (sum, client) => sum + (client.RemittanceWalletBalance ?? 0),
                  0
              );

              this.dataSource.data = formattedResponse;
              this.totalItems = response.TotalRecordCount || 0;
          },
          error: (error: HttpErrorResponse) => {
              this.notification.showNotification('Error fetching clients: ' + error.message, "close", "error");
          },
          complete: () => {
              this.isLoading = false;
          },
      });
  }

  getStatusDescription(status?: number): string {
    const statusObj = Status.find((s) => s.Id === status);
    return statusObj ? statusObj.Type : 'Unknown';
  }

  getDisplayData(): Array<{
    Id: number | undefined;
    Name: string | undefined;
    Status: string;
    Balance: number | undefined;
  }> {
    return this.dataSource.data;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Inactive':
        return 'status-inactive';
      default:
        return 'status-default';
    }
  }

  onFirstPage(): void {
    this.currentPage = 1;
    this.loadPage(this.currentPage);
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPage(this.currentPage);
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.currentPage++;
      this.loadPage(this.currentPage);
    }
  }

  onLastPage(): void {
    this.currentPage = Math.ceil(this.totalItems / this.itemsPerPage);
    this.loadPage(this.currentPage);
  }

  onSearch(query: string): void {
    this.loadPage(1, query);
  }

  loadPage(page: number, keyword?: string): void {
    this.currentPage = page;
    const startDate = this.clientSummaryForm.get('StartDate')?.value;
    const endDate = this.clientSummaryForm.get('EndDate')?.value;
  
    this.getAllClientId(keyword, startDate, endDate);
  }

  isSticky(buttonToggleGroup: MatButtonToggleGroup, id: string) {
    return (buttonToggleGroup.value || []).indexOf(id) !== -1;
  }
}
