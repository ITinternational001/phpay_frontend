import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { AgentRemittanceListDataSummaryDTO } from 'src/shared/dataprovider/api/model/agentRemittanceListDataSummaryDTO';
import { AgentRemittanceListSummaryDTO } from 'src/shared/dataprovider/api/model/agentRemittanceListSummaryDTO';

import { agentremittancetable } from 'src/shared/dataprovider/local/data/common';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';
import { getAgentId } from 'src/shared/helpers/helper';

@Component({
  selector: 'app-agent-remittance-table',
  templateUrl: './remittance-table.component.html',
  styleUrls: ['./remittance-table.component.scss'],
})
export class RemittanceTableComponent implements OnInit {
  private observable!: Observable<any>;
  private subscription!: Subscription;
  @Input() isAdmin: boolean = false;
  public defaultAgentId: number = getAgentId('some-id') ?? 0;
  public agentId?: number; 
  isLoading = false;
  dataSource = new MatTableDataSource<any>();
  agentListofAgents!: FormGroup;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0]; 
  language: string = "";
  displayedColumns: string[] = [
    'agentId',
    'name',
    'noClient',
    'remittance',
    'walletBalance',
    'status',
  ];

  constructor(
    private notification: NotificationService,
    private agentService: AgentService,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit(): void {
    this.getAgentList();
    if (this.isAdmin) {
      this.agentId = 2; 
    } else {
      this.agentId = this.defaultAgentId; 
    }
  }

  getAgentList(
    agentId?: number,
    keywords?: string,
    pageNumber: number = this.currentPage, // Default to currentPage if not provided
    pageSize: number = this.itemsPerPage // Default to itemsPerPage if not provided
  ) {
    this.isLoading = true;
  
    // Use agentId 2 for admins, otherwise use the default agentId
    const currentAgentId = this.isAdmin ? 2 : (agentId || this.defaultAgentId);
  
    // Pass the correct agentId, pageNumber, and pageSize to the API call
    this.observable = this.agentService.apiAgentCardTransactionRemittanceListOfAgentsGet(
      currentAgentId, keywords, pageNumber, pageSize
    );
  
    this.subscription = this.observable.subscribe({
      next: (response: AgentRemittanceListSummaryDTO) => {
        if (response?.Data) {
          // Use the correct property from the response for the total number of items
          this.totalItems = response.Pagination?.TotalRecordCount || 0; // Corrected field name
  
          this.dataSource.data = response.Data
            .filter(item => item.Status === 1) // Filter for status 1 (Active)
            .map((item) => {
              // Map numeric status to descriptive status
              let statusDescription = '';
              switch (item.Status) {
                case 1:
                  statusDescription = 'Active';
                  break;
                case 2:
                  statusDescription = 'Inactive';
                  break;
                case 3:
                  statusDescription = 'Disabled';
                  break;
                default:
                  statusDescription = 'Unknown';
              }
  
              return {
                agentId: item.AgentId,
                name: item.AgentName,
                noClient: item.NoOfClients,
                remittance: item.Remittance,
                walletBalance: item.WalletBalance,
                status: statusDescription,
              };
            });
        }
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification('Failed to load agent data: ' + error.error, 'closed', 'error');
        console.error(error);
        this.isLoading = false;
      },
    });
  }
  
  
  
  
  loadPage(page: number, keywords: string): void {
    this.currentPage = page; 
    this.getAgentList(this.agentId, keywords, this.currentPage, this.itemsPerPage); 
  }
  
  onSearch(query: string): void {
    this.loadPage(1, query);
  }
  
  onFirstPage(): void {
    this.loadPage(1, ''); 
  }
  
  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, ''); 
    }
  }
  
  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1, ''); // Load the next page
    }
  }
  
  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), ''); 
  }

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage, '');
  }
  
  
}
