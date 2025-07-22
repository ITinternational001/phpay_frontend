import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { AgentsComm } from 'src/shared/dataprovider/api/model/agentsComm';
import { ClientAgentAllocationDTO } from 'src/shared/dataprovider/api/model/clientAgentAllocationDTO';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { HttpErrorResponse } from '@angular/common/http';
import { ViewAgentModalComponent } from './view-agent-modal/view-agent-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-agent-allocation',
  templateUrl: './agent-allocation.component.html',
  styleUrls: ['./agent-allocation.component.scss']
})
export class AgentAllocationComponent implements OnInit, OnDestroy {

  displayedColumnsViewAgent: string[] = ['clientName', 'eliteAgent', 'coreAgent', 'primeAgent', 'action'];
  dataSource = new MatTableDataSource<any>(); // Initialize dataSource
  clientId?: number;
  clientName?: string;
  agentName?: string;
  @Input() refresh: boolean = true;
  @Input() isLoading: boolean = false;
  @Input() agentId?: number; // Agent ID to filter the allocation
  @Input() isAdmin!: boolean; // Flag to check if the user is an admin
  public isReadAndWrite : boolean = false;
  currentPage: number = 1;
  language: string = "";
  private subscription!: Subscription;
  private observable!: Observable<any>;
  constructor(
    private agentService: AgentService,
    private notification: NotificationService,
    private _dialog: MatDialog,
    private route: ActivatedRoute,
    private translateService: TranslateService

  ) {
    this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);
  }

  ngOnInit() {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    this.determineAgentId(); 
    this.loadPage(this.currentPage); 
  }

  determineAgentId(): void {
    if (this.isAdmin) {
      this.agentId = undefined;
    } else {
      this.agentId = this.getCurrentUserId();
    }
  }

  getCurrentUserId(): number {
    return parseInt(SessionManager.getFromToken('Id'), 10);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getAgentAllocation(clientId?: number, clientName?: string, agentName?: string) {
    this.isLoading = true;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.observable = this.agentService.apiAgentAllocationGetClientAgentListGet(clientId, clientName, agentName);
    this.subscription = this.observable.subscribe({
      next: (response: ClientAgentAllocationDTO[]) => {
        const tableData = response.flatMap((clientAllocation: ClientAgentAllocationDTO) => {
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
  
        // Update the data source for the table
        this.dataSource = new MatTableDataSource(tableData);
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

  

refreshTable(clientId?: number, clientName?: string): void {
  this.loadPage(this.currentPage, clientId, clientName); // Reload the current page with the current filters
}


  loadPage(page: number, clientId?: number, clientName?: string, agentName?: string): void {
    this.isLoading = true;
    this.currentPage = page;
    this.getAgentAllocation(clientId, clientName, agentName);
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
    this.loadPage(this.currentPage + 1);
  }

  onSearch(clientId?: number, clientName?: string, agentName?: string): void {
    this.clientId = clientId ?? this.clientId;
    this.clientName = clientName ?? this.clientName;
    this.agentName = agentName ?? this.agentName;
    this.loadPage(1, this.clientId, this.clientName, this.agentName);
  }
  
  
  

  onViewAgent(row: any): void {
    const dialogRef = this._dialog.open(ViewAgentModalComponent, {
      width: '850px',
      data: {
        ClientName: row.ClientName,
        eliteAgent: row.eliteAgent,
        coreAgent: row.coreAgent,
        primeAgent: row.primeAgent,
        eliteAgentUsername: row.eliteAgent.Username,
        coreAgentUsername: row.coreAgent.Username,
        primeAgentUsername: row.primeAgent.Username
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle result if needed
      }
    });
  }
  
}
