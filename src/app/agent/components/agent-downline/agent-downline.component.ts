import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ModalComponent } from 'src/shared/components/modals/modal/modal.component';
import { UserService, CreateUserRequestDTO } from 'src/shared/dataprovider/api';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { AgentListDTO } from 'src/shared/dataprovider/api/model/agentListDTO';
import { AgentTypeEnum } from 'src/shared/dataprovider/api/model/agentTypeEnum';
import { TableOption, Status, PrimeAgent } from 'src/shared/dataprovider/local/data/common';
import { Topdata } from 'src/shared/dataprovider/local/interface/commonInterface';
import { getWeekBeforeDateRange, getStatusName, convertFormattedAmount, convertToFormattedDate, convertTimestamp } from 'src/shared/helpers/helper';
import { AgentFormComponent } from '../agent-list/agent-form/agent-form.component';
import { AssignBrandRequest } from 'src/shared/dataprovider/api/model/assignBrandRequest';
import { DatePipe } from '@angular/common';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-agent-downline',
  templateUrl: './agent-downline.component.html',
  styleUrls: ['./agent-downline.component.scss']
})
export class AgentDownlineComponent implements OnInit {
  @Input() isAdmin: boolean = false;
  @Input() data: any;
  @Output() agentClientSaved = new EventEmitter<void>();
  agentBrandList!: FormGroup;
  isLoading: boolean = false;
  dataSource!: MatTableDataSource<any>;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage: number = TableOption.PageSize; // Number of items per page
  public obsUser!: Observable<any>;
  public subsUser!: Subscription;
  displayedColumns: string[] = [
    'status',
    'agentId',
    'agentName',
    'dateAdded',
    'username',
    'client',
    'downlineAgent',
    'action'
  ];
  language: string = "";
  constructor(private fb: FormBuilder, private _dialog: MatDialog,
    private _userService: UserService, private _datepipe: DatePipe,
    private _notification: NotificationService, private router:Router,
    private translateService: TranslateService) { 
      this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);
    }


    goToProfile(data: any): void {
      const userId = data.UserId; 
      const agentName = data.AgentName;
      let url: string = this.isAdmin 
        ? `/admin/agent/${userId}/profile/${agentName}` 
        : `/agent/${userId}/profile/${agentName}`;
    
      window.location.href = url;
    }

  ngOnInit() {
    if (!this.isAdmin) {
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.getTableData(this.data);
    }
  }

  getTableData(data: any) {
    if (data && data.Agents && data.Agents.length > 0) { 
      console.log(data);
  
      if (data.Agents[0].SubAgents && data.Agents[0].SubAgents.length > 0) {
        this.totalItems = data.Agents[0].SubAgents.length;
        
        const table = data.Agents[0].SubAgents.map((res: any) => ({
          AgentId: res.AgentId,
          AgentName: res.AgentName,
          DateAdded: convertTimestamp(res.DateCreated),
          Username: res.Username,
          Client: res.ClientCount,
          DownlineAgent: res.DownLineCount,
          Status: getStatusName(res.Status, Status),
          UserId: res.UserId
        }));
  
        this.dataSource = new MatTableDataSource<typeof table[0]>(table); // ✅ Explicit type
      } else {
        this.dataSource = new MatTableDataSource<{ 
          AgentId: string; 
          AgentName: string; 
          DateAdded: string; 
          Username: string; 
          Client: number; 
          DownlineAgent: number; 
          Status: string; 
        }>([]); // ✅ Empty array with explicit type
      }
    } else {
      this.dataSource = new MatTableDataSource<{ 
        AgentId: string; 
        AgentName: string; 
        DateAdded: string; 
        Username: string; 
        Client: number; 
        DownlineAgent: number; 
        Status: string; 
      }>([]); // ✅ Empty array with explicit type
    }
  }
  
  

  addClient() {
    if (!this.data || !this.data.Agents || this.data.Agents.length === 0) {
      console.error("Agents data is missing or empty");
      return; // Exit function if data is not valid
    }
  
    const dialogRef = this._dialog.open(AgentFormComponent, { 
      data: { 
        type: 'agentAddPrime', // Ensure 'agentAddPrime' is passed correctly
        agentType: PrimeAgent, 
        parentAgentId: this.data.Agents[0].AgentId // Safe access after validation
      }, 
      width: '800px' 
    });
  
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val && val.agentPrimeCreate) { // Check if the response corresponds to 'agentPrimeCreate'
          this.saveAgent(val.data); // Pass the data from 'agentAddPrime' form
        } 
      }
    });
  }
  
  
  saveAgent(agent: any) {
    console.log("pass data", agent); // Logging the received agent data for debugging
    if (this.obsUser) { 
      this.subsUser.unsubscribe(); 
    }
  
    const tempPass = Math.random().toString(36).slice(-12); // Generate a random password
    const email = agent.Email;
    
    const parameters: CreateUserRequestDTO = {
      Username: agent.Username,
      Password: tempPass,
      Email: agent.Email,
      Name: agent.Name,
      RoleId: agent.RoleId,
      ClientId: agent.ClientId,
      AgentType: agent.AgentType,
      Status: agent.Status,
      ParentAgentId: agent.ParentAgentId, // Ensure this is passed for Prime Agent
      IsAgent: agent.IsAgent,
      BankWithdrawalFee: convertFormattedAmount(agent.BankWFee),
      USDTWithdrawalFee: convertFormattedAmount(agent.UsdtWFee),
      CashPickUpWithdrawalFee: convertFormattedAmount(agent.CashPickupWFee)
    };
  
    this.obsUser = this._userService.apiUserCreateUserPost(parameters);
    this.subsUser = this.obsUser.subscribe({
      next: (response) => {
        const dialogRef = this._dialog.open(ModalComponent, {
          data: {
            message: 'Register new agent successfully',
            formType: 'Password',
            value: tempPass,
            email: email
          },
          width: '600px'
        });
        dialogRef.afterClosed().subscribe({
          next: (val) => {
            if (val) {
              this.loadPage(1); // Reload page after agent creation
            }
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error: " + error.error, "close", "error");
      },
      complete: () => { }
    });
  }
  


  loadPage(page: number, keyword?: string, agentType?:AgentTypeEnum): void { // Make keyword optional
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);
    this.agentClientSaved.emit();
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
}
