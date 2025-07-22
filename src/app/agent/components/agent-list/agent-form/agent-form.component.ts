import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { UsersFormComponent } from 'src/app/admin/users/users-form/users-form.component';
import { ModalComponent } from 'src/shared/components/modals/modal/modal.component';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientDTO, ProvidersService, UserService, ClientService, CreateUserRequestDTO } from 'src/shared/dataprovider/api';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { RolePermissionService } from 'src/shared/dataprovider/api/api/rolePermission.service';
import { AgentTypeEnum } from 'src/shared/dataprovider/api/model/agentTypeEnum';
import { BrandNameDTO } from 'src/shared/dataprovider/api/model/brandNameDTO';
import { Role } from 'src/shared/dataprovider/api/model/role';
import { UpdateUserRequestDTO } from 'src/shared/dataprovider/api/model/updateUserRequestDTO';
import { CoreAgent, PrimeAgent, RoleAcessEnum, Status, StatusDropdown, TotalNumberOfDataPerTable } from 'src/shared/dataprovider/local/data/common';
import { SelectOptions } from 'src/shared/dataprovider/local/interface/commonInterface';
import { getStatusId } from 'src/shared/helpers/helper';

@Component({
  selector: 'app-agent-form',
  templateUrl: './agent-form.component.html',
  styleUrls: ['./agent-form.component.scss']
})
export class AgentFormComponent {
  actionDisable: boolean = false;
  agentForm: FormGroup;
  public clientsDropdown: SelectOptions[] = [];
  private observable!: Observable<any>;
  private subscription!: Subscription;
  private obsUser!: Observable<any>;
  private subsUser!: Subscription;
  clientsList: BrandNameDTO[] = [];
  public agentTypes: any[] = [];
  public disableGeneratePassword = false;
  public roleAccessEnum = RoleAcessEnum;
  public type : string = "";
  public action : string = "";
  public title : string = "";
  public statuses = StatusDropdown;
  public selectedStatus: { id: number; name: string} | null = null;
  public selectedClient: { id: number, name: string} | null = null;
  public isAgentCreation : boolean =true;
  clients: { ClientId: number, ClientName: string }[] = [];
  language: string = "";
  constructor(
    private _dialogRef: MatDialogRef<UsersFormComponent>,
    private _dialog: MatDialog,
    private _fb: FormBuilder,
    private _agentService: AgentService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _notification: NotificationService,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.agentForm = this._fb.group({
      Username: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Name: ['', Validators.required],
      Status: ['', Validators.required],
      AgentType:['',Validators.required],
      ParentAgentId: ['',Validators.required], 
      IsAgent : [true,Validators.required], 
      RoleId: 4,
      ClientName: ['', [Validators.required]],
      ClientId: [0, Validators.required], 
      CiComms:['',Validators.required],
      CoComms:['',Validators.required],
      AgentId:[''],
      BankWFee:['',Validators.required],
      UsdtWFee:['',Validators.required],
      CashPickupWFee:['',Validators.required],
      DateEffectivity:['',Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.checkCreationType(this.data.type);

      if (this.data.agent != null && this.data.agent.AgentType) {
        const agentType = this.data.agent.AgentType;
        const agentId = this.data.agent.AgentId;
        this.agentForm.patchValue({ 
          AgentType: agentType,
          AgentId: agentId,
        });

        this.getAllClients(agentType);
      } else {
        const defaultAgentType = this.data.isAdmin ? CoreAgent : PrimeAgent;
        const defaultAgentId = this.data.agentId || 0;
        this.agentForm.patchValue({ 
          AgentType: defaultAgentType, 
          AgentId: defaultAgentId 
        });

        this.getAllClients(defaultAgentType);
      }

      this.agentForm.patchValue({
        ParentAgentId: this.data.parentAgentId,
      });
    }
  }

  patchFormData(data: any) {
    // this.selectedStatus = this.statuses.find(status => status.name === data.Status) || null;
    this.agentForm.patchValue({
      AgentId: data.AgentId,
      Username: data.Username,
      Name: data.AgentName,
      Status: this.selectedStatus ? this.selectedStatus.id : null, 
      Email: data.Email,
      AgentType: data.agentType ? data.agentType : 0,
      ParentAgentId: data.parentAgentId ? data.parentAgentId : 2,
      CashPickupWFee: data.CashPickUpWithdrawalFee.toString(),
      UsdtWFee: data.USDTWithdrawalFee.toString(),
      BankWFee: data.BankWithdrawalFee.toString(),
    });
  
  }
  

  patchFormDataClient(data: any) {
    this.selectedStatus = this.statuses.find(status => status.name === data.Status) || null;

    // Use data.ClientName for display and data.ClientId for submission
    this.agentForm.patchValue(
      {
        AgentId: data.AgentId,
        ClientName: data.ClientName,  // Display ClientName instead of ClientId
        ClientId: data.ClientId,      // Pass ClientId to the form for submission
        CiComms: data.CiCommission.toString(),
        CoComms: data.CoCommission.toString(),
        Status: this.selectedStatus ? this.selectedStatus.id : null,
        DateEffectivity: data.DateEffectivity
      }
    );
}




  checkCreationType(type: string) {
    switch(type) {
      case 'clientAgentAdd':
        this.isAgentCreation = false;
        break;
  
      case 'agentAdd':
        this.isAgentCreation = true;
        break;
  
      case 'agentUpdate':
        if (this.data.agentToUpdate != null) {
          this.patchFormData(this.data.agentToUpdate);
        }
        break;
  
      case 'agentAddPrime':
        this.isAgentCreation = true;
        break; 
  
      case 'clientAgentUpdate':
        this.isAgentCreation = false;
        if (this.data.clientToUpdate != null) {
          this.patchFormDataClient(this.data.clientToUpdate);
        }
        break;
    }
  }
  
  onFormSubmit() {
    switch(this.data.type) {
      case 'clientAgentAdd':
        this._dialogRef.close({ agentClientLink: true, data: this.agentForm.value });
        break;
  
      case 'agentAdd':
        this._dialogRef.close({ agentCreate: true, data: this.agentForm.value });
        break;
  
      case 'agentAddPrime':
        this._dialogRef.close({ agentPrimeCreate: true, data: this.agentForm.value });
        break;
  
      case 'agentUpdate':
        this._dialogRef.close({ agentUpdate: true, data: this.agentForm.value });
        break;
  
      case 'clientAgentUpdate':
        this._dialogRef.close({ agentClientUpdate: true, data: this.agentForm.value });
        break;
    }
  }
  
  
  getAllClients(agentType?: AgentTypeEnum) {
    this.observable = this._agentService.apiAgentManagementGetAllBrandNamesGet(undefined, agentType);
    this.subscription = this.observable.subscribe({
      next: (response: BrandNameDTO[]) => {
        this.clientsDropdown = response.map(client => ({
          id: client.Id || 0,  
          name: client.BrandName || 'Unknown'  
        }));
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error: " + error.error, "close", "error");
      }
    });
  }
  

  onSelectStatus(selectedStatus: { id: number; name: string }) {
    this.selectedStatus = selectedStatus;
    this.agentForm.patchValue({
      Status: selectedStatus.id, 
    });
  }

  onSelectClient(selectedClient: {id: number; name: string}) {
    this.selectedClient = selectedClient;
    this.agentForm.patchValue({
      ClientId: selectedClient.id,
      ClientName: selectedClient.name
    })
  }
  
  
  
  
}

