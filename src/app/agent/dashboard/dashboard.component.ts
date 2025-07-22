import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { AgentTopCardDTO } from 'src/shared/dataprovider/api/model/agentTopCardDTO';
import { getAgentId, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-agent-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @Input() isAdmin = false;

  topData: any = [];
  isLoading: boolean = false;
  clientData: any[] = []; 
  pagination: any[] = [];
  commsPerClientData: any[] = []; 
  currentPage: number = 1; // Current page
  @Output() totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0]; 
  public defaultAgentId: number = getAgentId('some-id') ?? 0; 
  private subscription!: Subscription;
  private observable!: Observable<any>;
  public isReadAndWrite:boolean = false;
  language: string = "";
  keyword: string = '';
  selectedAgentId: number = this.defaultAgentId;
  searchKeyword: string = ''; 

  constructor(
    private agentService: AgentService,
    private notification: NotificationService,
    private decimalPipe: DecimalPipe,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit() {
    console.log("SOME ID",getAgentId('some-id'))
    this.getTopCardData(this.defaultAgentId, this.keyword); 
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
  }


getTopCardData(agentId: number, keyword: string): void {
    this.isLoading = true;
    
    // Modify agentId based on user role
    const updatedAgentId = this.isAdmin ? 2 : (agentId || this.defaultAgentId);
    
    this.observable = this.agentService.apiAgentDashboardTopCardsGet(updatedAgentId, keyword, this.currentPage, this.itemsPerPage);
    this.subscription = this.observable.subscribe({
      next: (data: AgentTopCardDTO) => {
        this.totalItems = data.TotalClientCount || 0;
        this.topData = [
          { label: 'walletBalance', value: this.decimalPipe.transform(data.WalletBalance ?? 0, '1.2-2'), icon: "fa fa-wallet" },
          { label: 'remittanceWallet', value: this.decimalPipe.transform(data.RemittanceBalance ?? 0, '1.2-2'), icon: "fa fa-wallet" },
          { label: 'cashInComms', value: this.decimalPipe.transform(data.TotalCiCommission ?? 0, '1.2-2'), icon: "fa fa-coins" },
          { label: 'cashOutComms', value: this.decimalPipe.transform(data.TotalCoCommission ?? 0, '1.2-2'), icon: "fa fa-coins" }
        ];

        this.clientData = data.ListOfClients?.map(client => ({
          clientId: client.ClientId,
          clientName: client.ClientName,
          walletBalance: this.decimalPipe.transform(client.Walletbalance ?? 0, '1.2-2'),
          totalCashIn: this.decimalPipe.transform(client.TotalCashin ?? 0, '1.2-2'),
          totalCashOut: this.decimalPipe.transform(client.TotalCashout ?? 0, '1.2-2'),
        })) ?? [];

        this.commsPerClientData = data.CommsPerClient?.map(commission => ({
          clientId: commission.ClientId,
          clientName: commission.ClientName,
          totalCommission: this.decimalPipe.transform(commission.TotalCommission ?? 0, '1.2-2')
        })) ?? [];
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification('Failed to fetch dashboard data.' + error.error, 'Close', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onAgentTopCard(data: any) {
    // this.agentTopCard.emit(data);
  }

  loadPage(page: number): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const pageData = {
      page: this.currentPage,
      startIndex,
      itemsPerPage: this.itemsPerPage,
      keyword: this.keyword 
    };
    this.getTopCardData(this.defaultAgentId, this.keyword); 
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
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.loadPage(totalPages);
  }
  
  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    this.loadPage(1); // Reset to first page when changing items per page
  }
  

  // onItemsPerPageChanged(selectedItemsPerPage: number): void {
  //   this.itemsPerPage = selectedItemsPerPage;
 
  //   this.getTopCardData(this.selectedAgentId, this.keyword);
  // }

  onSearch(query: string): void { 
    this.keyword = query; 
    this.getTopCardData(this.defaultAgentId, this.keyword); 
  }
}
