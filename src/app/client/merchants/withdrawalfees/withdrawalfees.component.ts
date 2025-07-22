import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService } from 'src/shared/dataprovider/api';
import { ClientConfigureFeesDTO } from 'src/shared/dataprovider/api/model/clientConfigureFeesDTO';
import { SessionManager } from 'src/shared/helpers/session-manager';

@Component({
  selector: 'app-merchant-withdrawalfees',
  templateUrl: './withdrawalfees.component.html',
  styleUrls: ['./withdrawalfees.component.scss']
})
export class WithdrawalfeesComponent implements OnInit, OnDestroy {
  public dataSource: MatTableDataSource<any> = new MatTableDataSource();
  public displayedColumns: string[] = ['Vendor', 'WithdrawalFee'];
  private subsClient: Subscription = new Subscription();

  constructor(
    private clientService: ClientService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {

    console.log('WithdrawalfeesComponent initialized');  // Add this for confirmation
    const clientId = parseInt(SessionManager.getFromToken('ClientId'));
    this.getClientConfiguration(clientId);
  }

  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    if (this.subsClient) {
      this.subsClient.unsubscribe();
    }
  }
  getClientConfiguration(clientId: number): void {
    this.clientService.apiClientGetFeesConfigurationGet(clientId).subscribe({
      next: (response) => {
        console.log('ClientConfig', response);
        const tableData = response.WithdrawalFees?.map(item => ({
          Vendor: item?.MethodDescription,
          Fee: (item?.FeeAtCostFixed || 0) + (item.FeeOnTopFixed || 0) + (item.FeeAtCostPercent|| 0 ) + (item.FeeOnTopPercent || 0),
        })) || [];
        this.dataSource.data = tableData;
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification('Error: ' + error.error, 'close', 'error');
      }
    });
  }
}
