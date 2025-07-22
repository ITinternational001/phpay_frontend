

import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { AgentListDTO } from 'src/shared/dataprovider/api/model/agentListDTO';
import { BrandDTO } from 'src/shared/dataprovider/api/model/brandDTO';
import { getAgentId } from 'src/shared/helpers/helper';
import { ViewDetailsModalComponent } from '../components/view-details-modal/view-details-modal.component';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { AgentRemittanceListOfClientSummary } from 'src/shared/dataprovider/api/model/agentRemittanceListOfClientSummary';
import { AgentClientCard } from 'src/shared/dataprovider/api/model/agentClientCard';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-agent-remittance',
  templateUrl: './remittance.component.html',
  styleUrls: ['./remittance.component.scss'],
  providers: [DatePipe]
})
export class RemittanceComponent {
  @Input() isAdmin: boolean = false;
  topData: any = [];
  clientCard: any = [];
  public defaultAgentId: number = getAgentId('some-id') ?? 0;
  public data: any;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  isLoading: boolean = false;
  channels: { name: string, walletBalance: number }[] = [];
  transferService: any;
  currentPage: number = 1;
  language: string = "";
  constructor(
    private _agentService: AgentService,
    private _notification: NotificationService,
    private _dialog: MatDialog,
    private _datepipe: DatePipe,
    private _decimalPipe: DecimalPipe,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit() {
    console.log("From Remittance:", this.isAdmin)
    this.getSpecificAgents();  
  }

  onAgentSaved() {
    this.getSpecificAgents();  
  }

  getSpecificAgents() {
    this.isLoading = true;
    const agentId = this.isAdmin ? 2 : this.defaultAgentId;
    this.observable = this._agentService.apiAgentCardTransactionRemittanceListOfClientsGet(agentId, '');

    this.subscription = this.observable.subscribe({
      next: (response: AgentRemittanceListOfClientSummary) => {
        if (response?.TopCard) {
          this.topData = [
            {
              label: "walletBalance",
              value: this._decimalPipe.transform(response.TopCard.WalletBalance ?? 0, '1.2-2')
            },
            {
              label: "remittanceBalance",
              value: this._decimalPipe.transform(response.TopCard.RemittanceBalance ?? 0, '1.2-2')
            }
          ];
        }

        this.channels = response.ClientCards?.map((client: AgentClientCard) => ({
          name: client.ClientName || 'Unknown Client',
          walletBalance: client.CommissionWalletBalance || 0    
        })) || [];
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error fetching agent data:"+ error.error, "close", "error");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  


  wallets = [
    { channel: 'Gcash', value: 1500.75 },
    { channel: 'Maya Wallet', value: 2500.00 },
    { channel: 'Bank', value: 5000.50 },
  ];

  onViewDetails(row: any): void {
    const dialogRef = this._dialog.open(ViewDetailsModalComponent, {
      width: '600px',
      data: { wallets: this.wallets }, 
      panelClass: 'custom-modal' 
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle result if needed
      }
    });
  }

  onSearch(query: string): void {
    this.loadPage(1, { StartDate: new Date(), EndDate: new Date() }, query);
  }

  loadPage(page: number, data: any, keyword: string): void {
    this.currentPage = page;
    this.getSpecificAgents();
  }
}
