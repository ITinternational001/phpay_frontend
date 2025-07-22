import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService } from 'src/shared/dataprovider/api';
import { ClientCOFundsBalanceDTO } from 'src/shared/dataprovider/api/model/clientCOFundsBalanceDTO';
import { CoWalletModalComponent } from './co-wallet-modal/co-wallet-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-co-wallets',
  templateUrl: './co-wallets.component.html',
  styleUrls: ['./co-wallets.component.scss']
})
export class CoWalletsComponent implements OnInit {
  private subscription!: Subscription;
  private observable!: Observable<any>;
  isLoading: boolean = false;
  language: string = "";
  clients: ClientCOFundsBalanceDTO[] = [];  // Keep the full DTO type here

  constructor(
    private clientService: ClientService,
    private notification: NotificationService,
    private _dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit(): void {
    this.getCoWallet();
  }

  getCoWallet(pageSize: number = 100, pageNumber: number = 1) {
    this.isLoading = true;
    let totalCOFundBalance = 0;
  
    this.observable = this.clientService.apiClientGetAllClientsCOFundsGet(pageSize, pageNumber);
    this.subscription = this.observable.subscribe({
      next: (response: ClientCOFundsBalanceDTO[]) => {
        // Filter out clients with clientId 1 and 2 or names "DynastyPay Tester" and "DynastyPay"
        this.clients = response.filter(client =>
          !(client.ClientId === 1 || client.ClientId === 2 || 
            client.Name === "DynastyPay Tester" || client.Name === "DynastyPay")
        );
  
        // Calculate total CO Fund Balance for the filtered clients
        totalCOFundBalance = this.clients.reduce((sum, client) => {
          return sum + (client.AvailableBalance || 0);
        }, 0);
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }


  onViewWalletDetails(client: ClientCOFundsBalanceDTO) {

    const dialogRef = this._dialog.open(CoWalletModalComponent, {
      width: '500px',
      data: {
        clientName: client.Name,
        clientId: client.ClientId,
        totalCOFundBalance: client.AvailableBalance
      }
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          console.log("Modal closed with:", val);
        }
      }
    });
  }
}
