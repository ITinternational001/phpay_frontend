import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Status } from 'src/shared/dataprovider/local/data/common';
import { convertFormattedAmount, convertTimestamp, getStatusName } from 'src/shared/helpers/helper';
import { AgentFormComponent } from '../agent-list/agent-form/agent-form.component';
import { MatDialog } from '@angular/material/dialog';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { Observable, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AssignBrandRequest } from 'src/shared/dataprovider/api/model/assignBrandRequest';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { DecimalPipe } from '@angular/common';
import { Topdata } from 'src/shared/dataprovider/local/interface/commonInterface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-agent-list-of-brands',
  templateUrl: './list-of-brands.component.html',
  styleUrls: ['./list-of-brands.component.scss']
})
export class ListOfBrandsComponent implements OnInit {
  @Input() isAdmin: boolean = false;
  @Input() data: any;
  @Output() agentClientSaved = new EventEmitter<void>();
  agentBrandList!: FormGroup;
  isLoading: boolean = false;
  dataSource!: MatTableDataSource<any>;
  public obsAgent! : Observable<any>;
  public subsAgent! : Subscription;
  displayedColumns: string[] = [
    'status',
    'clientId',
    'clientName',
    'dateAdded',
    'walletBalance',
    'ciCom',
    'ciCount',
    'totalCi',
    'coCom',
    'coCount',
    'totalCo',
    'totalComm',
    'action',
  ];
  actionDisable: boolean = false;
  topData : Array<Topdata> = [];
  language: string = "";
  constructor(
    private fb: FormBuilder, 
    private _dialog:MatDialog, 
    private _agentService:AgentService, 
    private notification: NotificationService,
    private decimalPipe: DecimalPipe,
    private translateService: TranslateService) { 
      this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);
    }

  ngOnInit() {
    if (!this.isAdmin) {
      // If user is NOT admin, show all columns except 'action'
      this.displayedColumns = this.displayedColumns.filter(column =>
        column !== 'action'
      );
    } else {
      // If user is admin, show all columns
      this.displayedColumns = [
        'status',
        'clientId',
        'clientName',
        'dateAdded',
        'walletBalance',
        'ciCom',
        'ciCount',
        'totalCi',
        'coCom',
        'coCount',
        'totalCo',
        'action'
      ];
    }
    
    // // Initialize the form group
    // this.agentBrandList = this.fb.group({
    //   StartDate: ['', Validators.required],
    //   EndDate: ['', Validators.required]
    // });
    //this.dataSource = new MatTableDataSource(this.staticData);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.getTableData(this.data);
    }
  }

  getTableData(data: any) {
    if (data?.Agents?.length > 0 && data.Agents[0]?.Brands?.length > 0) { 
      const table = data.Agents[0].Brands.map((res: any) => ({
        ClientId: res.ClientId,
        ClientName: res.ClientName,
        DateAdded: convertTimestamp(res.DateAdded),
        WalletBalance: res.WalletBalance,
        CiCommission: res.CiCommission,
        CiCount: res.CiCount,
        CiTotal: this.decimalPipe.transform(res.CiTotal, '1.2-2'),
        CoCommission: res.CoCommission,
        CoCount: res.CoCount,
        CoTotal: this.decimalPipe.transform(res.CoTotal, '1.2-2'),
        TotalCommission: res.TotalCommission,
        Status: getStatusName(res.Status, Status),
        DateEffectivity: res.EffectivityDate
      }));
  
      this.dataSource = new MatTableDataSource(table);
    } else {
    }
  }
  

  addClient(){
    const dialogRef = this._dialog.open(AgentFormComponent, { data:{type:'clientAgentAdd', agent:this.data.Agents[0]}, width: '800px' });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val.agentClientLink) {
          this.saveAgentClient(val.data);
        }
      }
    });
  }

  configure(row:any){
    const dialogRef = this._dialog.open(AgentFormComponent, { data:{type:'clientAgentUpdate',agent:this.data.Agents[0], clientToUpdate:row}, width: '800px' });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val.agentClientUpdate) {
          console.log(val);
        this.saveAgentClient(val.data);
        }
      }
    });
  }

  saveAgentClient(agentClient: any) {
    // Get today's date without the time portion
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    // Get the dateEffectivity without the time portion
    const dateEffectivity = new Date(agentClient.DateEffectivity);
    dateEffectivity.setHours(0, 0, 0, 0);
  
    // Automatically show an error if the date is in the past
    if (dateEffectivity < today) {
      this.notification.showNotification(
        "Error: The selected date cannot be in the past.",
        "close",
        "error"
      );
      return; 
    }

    const parameters: AssignBrandRequest = {
      AgentId: agentClient.AgentId,
      BrandId: agentClient.ClientId,
      Status: agentClient.Status,
      CiCommissionRate: convertFormattedAmount(agentClient.CiComms),
      CoCommissionRate: convertFormattedAmount(agentClient.CoComms),
      EffectivityDate: agentClient.DateEffectivity,
    };
  
    // API call
    this.obsAgent = this._agentService.apiAgentManagementAssignNewClientPut(parameters);
    this.subsAgent = this.obsAgent.subscribe({
      next: (response) => {
        this.actionDisable = true;
        this.agentClientSaved.emit();
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification(
          "Error: Failed to save the client. " + error.error,
          "close",
          "error"
        );
      },
      complete: () => {
        this.notification.showNotification("Client successfully added.", "close", "success");
      },
    });
  }
  
  
  
}
