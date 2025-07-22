import { Component } from '@angular/core';
import { TopCardData } from '../../../shared/dataprovider/local/data/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService } from 'src/shared/dataprovider/api';
import { ClientAggregatesDTO } from 'src/shared/dataprovider/api/model/clientAggregatesDTO';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { DecimalPipe } from '@angular/common';
import { DecimalPipeConverter, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
    language: string = "";
    topData = TopCardData.clientDashboard;
    public observable! : Observable<any>;
    public subscription! : Subscription;
    clientId: number = parseInt(SessionManager.getFromToken("ClientId"));
    public isReadAndWrite:boolean = false;
    constructor(private _clientService:ClientService,
       private _notification: NotificationService, 
       private _decimalpipe: DecimalPipe,
       private route: ActivatedRoute,
       private translateService: TranslateService) { 

    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);

        }
  
    ngOnInit(): void {
      this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
      this.getClientAggregates(this.clientId);
    }
  
  
    getClientAggregates(clientId:number){
      this.observable = this._clientService.apiClientGetClientAggregatesGet(clientId);
      this.subscription = this.observable.subscribe({
        next:(response : ClientAggregatesDTO)=>{
          this.topData[0].value = DecimalPipeConverter(response.AvailableBalance!,this._decimalpipe)!;
          this.topData[1].value = DecimalPipeConverter(response.TotalCashIn!, this._decimalpipe)!;
          this.topData[2].value = DecimalPipeConverter(response.TotalCashOut!, this._decimalpipe)!;
        },
        error:(error: HttpErrorResponse)=>{
          this._notification.showNotification("Error: " + error.error, "close","error");
        },
        complete:()=>{
  
        }
      })
  
    }
}
