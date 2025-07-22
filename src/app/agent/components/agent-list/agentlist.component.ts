import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { AgentListDTO } from 'src/shared/dataprovider/api/model/agentListDTO';
import { CoreAgent, PrimeAgent, SelectedTypes, Status, TableOption, TopCardData } from 'src/shared/dataprovider/local/data/common';
import { Topdata } from 'src/shared/dataprovider/local/interface/commonInterface';
import { convertFormattedAmount, getAgentId, getCurrentUserId, getStatusName, getUserPermissionsAccess, getWeekBeforeDateRange } from 'src/shared/helpers/helper';
import { AgentFormComponent } from './agent-form/agent-form.component';
import { AgentTypeEnum } from 'src/shared/dataprovider/api/model/agentTypeEnum';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateUserRequestDTO, UserService } from 'src/shared/dataprovider/api';
import { ModalComponent } from 'src/shared/components/modals/modal/modal.component';
import { UpdateUserRequestDTO } from 'src/shared/dataprovider/api/model/updateUserRequestDTO';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ResetUserPasswordComponent } from 'src/shared/components/reusables/reset-user-password/reset-user-password.component';
import { ConfirmationModalComponent } from 'src/shared/components/modals/confirmation-modal/confirmation-modal.component';
import { AgentDTOV2 } from 'src/shared/dataprovider/api/model/agentDTOV2';
import { AgentListData } from 'src/shared/dataprovider/api/model/agentListData';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-agent-agentlist',
  templateUrl: './agentlist.component.html',
  styleUrls: ['./agentlist.component.scss']
})
export class AgentlistComponent implements OnInit {
  @Input() isAdmin = false;
  displayedColumns: string[] = ['agentNumber', 'agentId', 'agentName','userName', 'agentType' ,'client', 'downlineAgents', 'walletBalance', 'status','action'];
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  public statusType = SelectedTypes;
  itemsPerPage = itemsPerPageOptions[0]; 
  dataSource!: MatTableDataSource<any>;
  isLoading : boolean = false;
  AgentForm!: FormGroup;
  topData : Array<Topdata> = [];
  public defaultAgentId: number = getCurrentUserId() || 0;
  agentTypes : any = [];
  private observable! : Observable<any>;
  private subscription! : Subscription;
  private obsAgentType! : Observable<any>;
  private subsAgentType! : Subscription;
  private obsUser! : Observable<any>;
  private subsUser! : Subscription;
  public isReadAndWrite : boolean = false;
  public defaultDateRange = getWeekBeforeDateRange();
  language: string = "";
  actionDisable: boolean = false;
  constructor( private _fb: FormBuilder, private _agentService : AgentService, 
    private _dialog:MatDialog, private router: Router, private _userService:UserService, private _notification : NotificationService,
    private route: ActivatedRoute,
    private translateService: TranslateService){
      this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);
    this.AgentForm = this._fb.group({
      StartDate: this.defaultDateRange.startDate,
      EndDate: this.defaultDateRange.endDate,
      ClientId: ''
    });
  }

  goToProfile(data: any): void {
    const userId = data.UserId; 
    const agentName = data.AgentName;
    let url: string = this.isAdmin 
      ? `/admin/agent/${userId}/profile/${agentName}` 
      : `/agent/${userId}/profile/${agentName}`;
  
    window.location.href = url;
  }

  getAllAgents(keyword?: string, agentType?: AgentTypeEnum, userId: number = this.defaultAgentId) {
    this.isLoading = true;
    if (this.observable) { this.subscription.unsubscribe(); }
    this.observable = this._agentService.apiAgentManagementListGet(this.itemsPerPage, this.currentPage, userId, keyword);

    this.subscription = this.observable.subscribe({
      next: (response: AgentListDTO) => {
        if (response != null) {
          this.totalItems = response.TotalRecordCount!;

          if (response.AgentTypeCounts != null) {
            this.topData = [];
           let agentTypeLabels = this.isAdmin
              ? [{ key: 'Core', label: 'coreAgentsCount' }, { key: 'Prime', label: 'primeAgentsCount' }]
              : [{ key: 'Prime', label: 'primeAgentsCount' }];
            agentTypeLabels.forEach(({ key, label }) => {
              const count = response.AgentTypeCounts![key] || 0;
              this.topData.push({
                label: label,  // Use new label format
                value: count, 
                icon: "fa fa-user"
              });
            });
          }

          if (response.Agents!.length > 0) {
            var subAgents = response.Agents![0].SubAgents;
            const tableData: any = subAgents?.map((res: AgentListData, index: number) => {
              let agentTypeName = '';
              switch (res.AgentType) {
                case 1:
                  agentTypeName = 'Elite';
                  break;
                case 2:
                  agentTypeName = 'Core';
                  break;
                case 3:
                  agentTypeName = 'Prime';
                  break;
                default:
                  agentTypeName = 'Unknown';
              }

              return {
                NumberSeries: index + 1,
                AgentId: res.AgentId,
                AgentName: res.AgentName,
                Username: res.Username,
                AgentType: agentTypeName,  
                Client: res.ClientCount,
                DownlineAgents: res.DownLineCount,
                WalletBalance: res.WalletBalance,
                Status: getStatusName(res.Status!, Status),
                Email: res.Email,
                BankWithdrawalFee: res.BankWithdrawalFee,
                USDTWithdrawalFee: res.USDTWithdrawalFee,
                CashPickUpWithdrawalFee: res.CashPickUpWithdrawalFee,
                UserId: res.UserId
              };
            });
            this.dataSource = new MatTableDataSource(tableData);
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error: " + error.error, "close", "error");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
}

  
  

  ngOnInit(): void {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    this.initializedData();
  }

  initializedData(){
    if(this.isAdmin){
      this.loadPage(1, undefined,  2);
    }else{
      this.loadPage(1, undefined, undefined, this.defaultAgentId);
    }
   
    this.getAgentType();
  }

  getAgentType(){
    if(this.obsAgentType){this.subsAgentType.unsubscribe;}
    this.obsAgentType = this._agentService.apiAgentManagementGetAgentTypesGet();
    this.subsAgentType = this.obsAgentType.subscribe({
      next:(response)=>{
        this.agentTypes = response;
      },
      error:(error: HttpErrorResponse)=>{
        this._notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete:()=>{}
    });
  }

  selectType(event:any){
   this.loadPage(1, undefined, event.value);
  }

  loadPage(page: number, keyword?: string, agentType?:AgentTypeEnum,userId?:number): void { // Make keyword optional
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);
    this.getAllAgents(keyword,agentType, userId);
  }

  openForm() {
    if (this.isReadAndWrite) {
      const dialogRef = this._dialog.open(AgentFormComponent, { 
        data: {
          type: 'agentAdd', 
          isAdmin: this.isAdmin,
          parentAgentId: this.isAdmin ? 2 : parseInt(sessionStorage.getItem("agentId")!)
        }, 
        width: '800px' 
      });
  
      dialogRef.afterClosed().subscribe({
        next: (val) => {
          if (val?.agentCreate) {
            this.saveAgent(val.data);
          }
        },
        error: (error) => {
          this._notification.showNotification("Error: " + error.message, "close", "error");
        }
      });
    } else {
      this._notification.showNotification("You don't have permission to add new agent", "close", "error");
    }
  }
  

  openEditForm(data:any){
    const dialogRef = this._dialog.open(AgentFormComponent, { 
      data:{
        type:'agentUpdate',  
        isAdmin:this.isAdmin,
        parentId: this.isAdmin ? 2 :parseInt(sessionStorage.getItem("agentId")!),
        agentToUpdate:data
      }, 
      width: '800px' });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val.agentUpdate) {
          this.updateAgent(val.data, data);
        }
      }
    });
  }

  updateAgent(agent:any, data:any){
    if(this.obsUser){this.subsUser.unsubscribe();}
    const tempPass = Math.random().toString(36).slice(-12);
    const email = agent.Email;
    const paramters : UpdateUserRequestDTO = {
      UserId: data.UserId,
      NewStatus: agent.Status,
      NewName: agent.Name,
      NewUsername: agent.Username,
      NewEmail: agent.Email,
      RoleId: agent.RoleId,
      BankWithdrawalFee: convertFormattedAmount(agent.BankWFee),
      USDTWithdrawalFee : convertFormattedAmount(agent.UsdtWFee),
      CashPickUpWithdrawalFee: convertFormattedAmount(agent.CashPickupWFee) 
    };
    this.obsUser = this._userService.apiUserUpdateUserPost(paramters);
    this.subsUser = this.obsUser.subscribe({
      next:(response)=>{  
       this.actionDisable = true;
        this.loadPage(1);
      },
      error:(error:HttpErrorResponse)=>{
        this._notification.showNotification("Error: " + error.error,"close","error");
      },
      complete:()=>{
        this._notification.showNotification("Agent details updated successfully","close","success");
      }
    });
  }

  openResetPasswordForm(data: any) {
    const dialogRef = this._dialog.open(ResetUserPasswordComponent, { data, width: '600px' });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.loadPage(1);
        }
      }
    });
  }

  onDisableAgent(agentId?: number) {
    const dialogRef = this._dialog.open(ConfirmationModalComponent, { data: { type: 'DisableAgent' } });
  
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val.continue) {  // Proceed only if the confirmation flag is true
          this.onDisable(agentId); 
        }
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification('Error handling dialog close:' + error.error, "close", "error");
      }
    });
  }
  
  onDisable(agentId?: number) {
    // Ensure existing subscription is cleaned up
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  
    this.observable = this._agentService.apiAgentAllocationEnableDisableAgentPut(agentId);
  
    this.subscription = this.observable.subscribe({
      next: (response: AgentDTOV2) => {
        const currentStatus = response.Status;
        const Status = currentStatus === 1 ? 2 : 1; 
        this.loadPage(1, undefined, CoreAgent);  
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this._notification.showNotification("Error:" + error.error, "close", "error");
      }
    });
  }
  
  saveAgent(agent:any){
      if(this.obsUser){this.subsUser.unsubscribe();}
      const tempPass = Math.random().toString(36).slice(-12);
      const email = agent.Email;
      const paramters : CreateUserRequestDTO = {
        Username:agent.Username,
        Password: tempPass,
        Email: agent.Email,
        Name : agent.Name,
        RoleId : agent.RoleId,
        ClientId: agent.ClientId,
        AgentType: agent.AgentType,
        Status: agent.Status,
        ParentAgentId: agent.ParentAgentId,
        IsAgent: agent.IsAgent,
        BankWithdrawalFee: convertFormattedAmount(agent.BankWFee),
        USDTWithdrawalFee : convertFormattedAmount(agent.UsdtWFee),
        CashPickUpWithdrawalFee: convertFormattedAmount(agent.CashPickupWFee)
      };
      this.obsUser = this._userService.apiUserCreateUserPost(paramters);
      this.subsUser = this.obsUser.subscribe({
        next:(response)=>{  
          this.actionDisable = true;
          const dialogRef = this._dialog.open(ModalComponent, {
            data: {
              message: 'Register new agent successfully',
              formType: 'Password',
              value: tempPass,
              email: email
            }, width: '600px'
          });
          dialogRef.afterClosed().subscribe({
            next: (val) => {
              if (val) {
               this.initializedData();
              }
            }
          });
        },
        error:(error:HttpErrorResponse)=>{
          this._notification.showNotification("Error: " + error.error,"close","error");
        },
        complete:()=>{
          
        }
      });
  }

  onSearch(query: string): void {
    // Handle the search query, e.g., make an API call or filter data
    this.loadPage(1, query);
  }

  onFirstPage(): void {
    this.loadPage(1, undefined, CoreAgent);
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1, undefined, CoreAgent);
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1, undefined, CoreAgent);
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage), undefined, CoreAgent);
  }

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage);
  }

  onStatusType(){
    
  }

}
