import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { AgentListDTO } from 'src/shared/dataprovider/api/model/agentListDTO';
import { Status, TopCardData } from 'src/shared/dataprovider/local/data/common';
import { getStatusName } from 'src/shared/helpers/helper';

@Component({
  selector: 'app-agent-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit{
 @Input() isAdmin: boolean = false;
 topData : any = [];

 public data: any;
 private observable! : Observable<any>;
 private subscription! : Subscription;
 isLoading : boolean = false;
 language: string = "";
 constructor(
  private route:ActivatedRoute,
  private router: Router, 
  private _agentService:AgentService, 
  private notification: NotificationService,
  private translateService: TranslateService){
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

 ngOnInit(){
  this.initializedData();
 }

 initializedData(){
  var agentId = Number(this.route.snapshot.paramMap.get('id'));
  if(agentId != null){
    this.getSpecificAgents(agentId);
  }
 }

 onAgentSaved() {
  // Refresh the data in the parent component
  this.initializedData();
}

getSpecificAgents(agentId: number) {
  this.isLoading = true;

  // Unsubscribe previous subscription if it exists
  if (this.subscription) {
    this.subscription.unsubscribe();
  }

  this.observable = this._agentService.apiAgentManagementListGet(100, 1, agentId, undefined, undefined);
  this.subscription = this.observable.subscribe({
    next: (response: AgentListDTO) => {
      if (response) {
        this.data = response;

        // Ensure Agents array exists and has at least one element before accessing properties
        if (response.Agents && response.Agents.length > 0) {
          const agent = response.Agents[0]; // Get the first agent safely

          this.topData = [
            { label: "walletBalance", value: agent.WalletBalance ?? 0 },
            { label: "cashInComms", value: agent.TotalCiCommission ?? 0 },
            { label: "cashOutComms", value: agent.TotalCoCommission ?? 0 }
          ];
        } else {
          // Handle case where there are no agents
          this.topData = [];
          this.notification.showNotification("No agents found.", "close", "error");
        }
      }
    },
    error: (error: HttpErrorResponse) => {
      this.notification.showNotification("Error: " + (error.error?.message || error.message), "close", "error");
    },
    complete: () => {
      this.isLoading = false;
    }
  });
}

}
