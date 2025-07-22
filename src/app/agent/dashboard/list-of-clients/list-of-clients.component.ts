import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { ViewAgentModalComponent } from 'src/app/admin/agents/agent-allocation/view-agent-modal/view-agent-modal.component';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { AgentTopCardDTO } from 'src/shared/dataprovider/api/model/agentTopCardDTO';
import { ClientAgentAllocationDTO } from 'src/shared/dataprovider/api/model/clientAgentAllocationDTO';
import { ListOfVendorUnderClient } from 'src/shared/dataprovider/api/model/listOfVendorUnderClient';
import { ViewCommsModalComponent } from '../view-comms-modal/view-comms-modal.component';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-list-of-clients',
  templateUrl: './list-of-clients.component.html',
  styleUrls: ['./list-of-clients.component.scss']
})
export class ListOfClientsComponent implements OnInit {
  displayedColumns: string[] = ['clientId', 'clientName', 'walletBalance', 'totalCashIn', 'totalCashOut', 'actions'];
  @Input() isLoading: boolean = false;
  @Input() set data(value: any) {
    this.dataSource.data = value; // Update the table's data source
  }
  @Output() itemsPerPageChange = new EventEmitter<number>();
  @Output() firstPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() previousPage = new EventEmitter<void>();
  @Output() lastPage = new EventEmitter<void>();
  vendorComms: any[] = [];
  @Input() isAdmin: boolean = false;
  clientId?: number;
  clientName?: string;
  agentName?: string;
  public observable!: Observable<any>;
  public subscription!: Subscription;
  @Output() search = new EventEmitter<string>();
  dataSource = new MatTableDataSource<any>();
  @Input() currentPage: number = 1; // Current page
  @Input() totalItems: number = 0; // Total number of items
  @Input() itemsPerPage = itemsPerPageOptions[0]; 
  @Input() language: string = "";
  constructor(
    private agentService: AgentService,
    private notification: NotificationService,
    private translateService: TranslateService,
    private _dialog: MatDialog,
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit(): void {
    if (!this.isAdmin) {
      // Remove 'actions' column for non-admin users
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'actions');
    } else {
      // Show all columns for admin
      this.displayedColumns = ['clientId', 'clientName', 'walletBalance', 'totalCashIn', 'totalCashOut', 'actions'];
    }
  }
  

  onSearch(query: string): void {
    this.search.emit(query); 
  }

  onFirstPage(): void {
    this.firstPage.emit();
  }

  onPreviousPage(): void {
    this.previousPage.emit();
  }

  onNextPage(): void {
    this.nextPage.emit();
  }

  onLastPage(): void {
    this.lastPage.emit();
  }


  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    this.itemsPerPageChange.emit(this.itemsPerPage); 
    this.loadPage(this.currentPage);
  }

  onClientSelect(selectedClientId: number, selectedClientName: string) {
    const clientId = this.dataSource.data;
    this.getAgentAllocation(selectedClientId, selectedClientName);
  }
  

  getAgentAllocation(
    clientId?: number,
    clientName?: string,
    agentName?: string,
    callback?: (data: any) => void
  ) {
    this.isLoading = true;
  
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  
    this.observable = this.agentService.apiAgentAllocationGetClientAgentListGet(clientId, clientName, agentName);
    this.subscription = this.observable.subscribe({
      next: (response: ClientAgentAllocationDTO[]) => {
        const tableData = response.map((clientAllocation: ClientAgentAllocationDTO) => {
          const agents = clientAllocation.Agents ?? [];
          const activeAgents = agents.filter(agent => agent.Status === 1);
          const coreAgents = activeAgents.filter(agent => agent.AgentType === 2);
          const primeAgents = activeAgents.filter(agent => agent.AgentType === 3);
  
          return {
            ClientId: clientAllocation.ClientId,
            ClientName: clientAllocation.ClientName,
            eliteAgent: activeAgents.find(agent => agent.AgentType === 1)?.Username || '-',
            coreAgent: coreAgents.length === 1 ? coreAgents[0].Username : coreAgents.length > 1 ? coreAgents.length : '-',
            primeAgent: primeAgents.length === 1 ? primeAgents[0].Username : primeAgents.length > 1 ? primeAgents.length : '-'
          };
        });
  
        // ✅ Only if a callback is passed, return the specific client's data
        if (callback && clientId) {
          const selectedClient = tableData.find(item => item.ClientId === clientId);
          if (selectedClient) {
            callback(selectedClient);
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error("Error fetching agent allocation:", error);
        this.notification.showNotification('Error fetching agent allocation:', error.error, 'error');
        this.dataSource.data = [];
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
  

  onViewAllocation(clientId: number, clientName: string): void {
    this.getAgentAllocation(clientId, clientName, undefined, (agentData: any) => {
      const dialogRef = this._dialog.open(ViewAgentModalComponent, {
        width: '850px',
        data: {
          ClientName: agentData.ClientName,
          eliteAgent: agentData.eliteAgent,
          coreAgent: agentData.coreAgent,
          primeAgent: agentData.primeAgent,
          eliteAgentUsername: agentData.eliteAgent || '-',
          coreAgentUsername: agentData.coreAgent || '-',
          primeAgentUsername: agentData.primeAgent || '-'
        }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Handle result
        }
      });
    });
  }
  
  


  loadPage(page: number, data?: any, keyword?: string): void {
    // this.currentPage = page;
    // const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    // // Determine if it's the last page
    // const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);

    // const convertedStartDate = this._datepipe.transform(data.StartDate, 'yyyy-MM-dd');
    // const convertedEndDate = this._datepipe.transform(data.EndDate, 'yyyy-MM-dd');
    // data.StartDate = new Date(convertedStartDate!);
    // data.EndDate = new Date(convertedEndDate!);

    // // Load data for the selected page here
    // this.getManualTopUps(data, keyword);


  }

  getVendorComms(clientId: number, clientName: string, callback?: (vendorData: any[], totals?: any) => void): void {
    this.isLoading = true;
  
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  
    this.observable = this.agentService.apiAgentDashboardTopCardsGet(2); // agentId = 2
    this.subscription = this.observable.subscribe({
      next: (response: AgentTopCardDTO) => {
        const selectedClient = response.ListOfClients?.find(client => client.ClientId === clientId);
  
        if (selectedClient) {
          const vendors = selectedClient.ListOfVendorsUnderClient ?? [];
  
          const vendorComms = vendors.map(vendor => ({
            VendorName: vendor.VendorName,
            CiComRate: vendor.CiComRate,
            COComRate: vendor.COComRate,
            TotalCI: vendor.TotalCI,
            TotalCO: vendor.TotalCO,
            TotalCommission: vendor.TotalCommission
          }));
  
          const totals = {
            GrandTotalCI: vendorComms.reduce((sum, v) => sum + (v.TotalCI || 0), 0),
            GrandTotalCO: vendorComms.reduce((sum, v) => sum + (v.TotalCO || 0), 0),
            GrandTotalCommission: vendorComms.reduce((sum, v) => sum + (v.TotalCommission || 0), 0)
          };
  
          if (callback) {
            callback(vendorComms, totals); // Return vendor data and grand totals
          }
        } else {
          console.warn(`Client with ClientId ${clientId} not found.`);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error: " + error.error, 'closed', 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  

  onViewComms(clientId: number, clientName: string): void {
    this.getVendorComms(clientId, clientName, (vendorData: any[], totals?: any) => {
      const dialogRef = this._dialog.open(ViewCommsModalComponent, {
        width: '1000px',
        data: {
          clientId: clientId,
          clientName: clientName,
          vendorComms: vendorData,
          GrandTotalCI: totals?.GrandTotalCI,
          GrandTotalCO: totals?.GrandTotalCO,
          GrandTotalCommission: totals?.GrandTotalCommission
        }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Handle result
        }
      });
    });
  }
  
  
  
  
  

  
}
