import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy, Inject, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { ConfirmationModalComponent } from 'src/shared/components/modals/confirmation-modal/confirmation-modal.component';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { AgentDTOV2 } from 'src/shared/dataprovider/api/model/agentDTOV2';
import { ClientAgentAllocationDTO } from 'src/shared/dataprovider/api/model/clientAgentAllocationDTO';

@Component({
  selector: 'app-view-agent-modal',
  templateUrl: './view-agent-modal.component.html',
  styleUrls: ['./view-agent-modal.component.scss']
})
export class ViewAgentModalComponent implements OnInit {
  agentForm: FormGroup;
  @Input() isLoading: boolean = false;
  public ClientName = '';
  public eliteAgentUsername = '';
  public coreAgentUsername = '';
  public primeAgentUsername = '';
  private subscription!: Subscription;
  private observable!: Observable<any>;
  private subsdisable!: Subscription;
  private obsdisable!: Observable<any>;
  language: string = "";
  constructor(
    private agentService: AgentService,
    private notification: NotificationService,
    private _dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.agentForm = this.fb.group({
      eliteAgent: this.fb.array([]),
      coreAgent: this.fb.array([]),
      primeAgent: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.ClientName = this.data.ClientName;
      this.eliteAgentUsername = this.data.eliteAgent;
      this.coreAgentUsername = this.data.coreAgent;
      this.primeAgentUsername = this.data.primeAgent;
      this.getAgentAllocation(this.data.clientId);
    }
  }

  get eliteAgent(): FormArray {
    return this.agentForm.get('eliteAgent') as FormArray;
  }

  get coreAgent(): FormArray {
    return this.agentForm.get('coreAgent') as FormArray;
  }

  get primeAgent(): FormArray {
    return this.agentForm.get('primeAgent') as FormArray;
  }

  getAgentAllocation(clientId: number): void {

    this.observable = this.agentService.apiAgentAllocationGetClientAgentListGet(clientId);
    this.subscription = this.observable.subscribe({
      next: (response: ClientAgentAllocationDTO[]) => {
        this.filterAndPopulateAgents(response);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching agent allocation:', error);
      }
    });
  }

  filterAndPopulateAgents(allocations: ClientAgentAllocationDTO[]): void {
    this.clearAgentFormArrays();  
  
    allocations.forEach(allocation => {
      if (allocation.ClientName === this.ClientName) {
        if (this.data.eliteAgent && this.data.eliteAgent !== '-') {
          const eliteAgent = allocation.Agents?.find(agent => agent.AgentType === 1);
          if (eliteAgent) {
            this.addAgentFormGroup(eliteAgent, this.eliteAgent, 'Elite Agent');
          }
        }
  
        if (this.data.coreAgent && this.data.coreAgent !== '-') {
          const coreAgents = allocation.Agents?.filter(agent => agent.AgentType === 2 && agent.Status === 1) || [];
          coreAgents.forEach(coreAgent => {
            this.addAgentFormGroup(coreAgent, this.coreAgent, 'Core Agent');
          });
        }
  
        // Handle all Prime Agents
        if (this.data.primeAgent && this.data.primeAgent !== '-') {
          const primeAgents = allocation.Agents?.filter(agent => agent.AgentType === 3 && agent.Status === 1) || [];
          primeAgents.forEach(primeAgent => {
            this.addAgentFormGroup(primeAgent, this.primeAgent, 'Prime Agent');
          });
        }
      }
    });
  }
  
  

  // Method to add agent to the form array
  addAgentFormGroup(agent: any, agentArray: FormArray, label: string): void {
    const agentGroup = this.fb.group({
      Label: label,
      AgentId: [agent.AgentId],
      AgentName: [agent.AgentName],
      Email: [agent.Email],
      Username: [agent.Username],
      CommIn: [agent.CiCommissionRate],
      CommOut: [agent.CoCommissionRate],
      DateAdded: [this.formatDate(agent.DateAdded)]
    });
    agentArray.push(agentGroup);
  }

  private formatDate(date: string | Date): string {
    if (!date) return ''; // Return empty if no date is provided
    const d = new Date(date);
    return d.toLocaleDateString(); // Formats date based on the user's locale
  }

  // Clear all agent form arrays
  clearAgentFormArrays(): void {
    this.eliteAgent.clear();
    this.coreAgent.clear();
    this.primeAgent.clear();
  }

  

  onDisableAgent(row?: any, agentId?: number) {
    const dialogRef = this._dialog.open(ConfirmationModalComponent, { data: { type: 'DisableAgent' } });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val.continue) {
          this.onDisable(row); 
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error handling dialog close', error);
      }
    });
  }
  
  onDisable(agentId: number) {
    this.obsdisable = this.agentService.apiAgentAllocationEnableDisableAgentPut(agentId);
    this.subsdisable = this.obsdisable.subscribe({
      next: (response: AgentDTOV2) => {
        const currentStatus = response.Status;
        const Status = currentStatus === 1 ? 2 : 1; 
        this.refreshTable(); // Refresh the table after disabling the agent
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error retrieving agent status:', error);
        this.isLoading = false; 
      }
    });
  }
  
  refreshTable(): void {
    // Reload the entire page to reflect changes
    window.location.reload(); 
  }
  

}
