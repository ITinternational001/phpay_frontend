import { Component, Input, OnInit } from '@angular/core';
import { TopCardData } from '../../../shared/dataprovider/local/data/common';
import { ClientService } from 'src/shared/dataprovider/api';
import { Observable, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientAggregatesDTO } from 'src/shared/dataprovider/api/model/clientAggregatesDTO';
import { DecimalPipeConverter, getCurrentUserClientId, getUserPermissionsAccess } from 'src/shared/helpers/helper';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  topData = TopCardData.dashboard;
  public observable!: Observable<any>;
  public subscription!: Subscription;
  clientId: number = getCurrentUserClientId();
  public isReadAndWrite: boolean = false;
  language: string = "";

  constructor(private _clientService: ClientService, private _notification: NotificationService, private _decimalpipe: DecimalPipe,
    private route: ActivatedRoute, private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit(): void {

    this.getClientAggregates(this.clientId);
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
  }


  getClientAggregates(clientId: number) {
    this.observable = this._clientService.apiClientGetClientAggregatesGet(clientId);
    this.subscription = this.observable.subscribe({
      next: (response: ClientAggregatesDTO) => {
        console.log(response);
        this.topData[0].value = DecimalPipeConverter(response.AvailableBalance!, this._decimalpipe)!;
        this.topData[1].value = DecimalPipeConverter(response.TotalCashIn!, this._decimalpipe)!;
        this.topData[2].value = DecimalPipeConverter(response.TotalCashOut!, this._decimalpipe)!;
        this.topData[3].value = DecimalPipeConverter(response.TotalWithdrawals!, this._decimalpipe)!;

      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error: " + error.error, "close", "error");
      },
      complete: () => {

      }
    })

  }

}
