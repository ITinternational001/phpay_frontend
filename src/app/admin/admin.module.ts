import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from 'src/shared/components/components.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { RouterModule } from '@angular/router';
import { ManagementComponent } from './agents/management/management.component';
import { RemittanceComponent } from './agents/remittance/remittance.component';
import { TransferBalanceComponent } from './agents/transfer-balance/transfer-balance.component';
import { AgentModule } from '../agent/agent.module';
import { ProfileComponent } from './agents/profile/profile.component';
import { DashboardComponent } from './agents/dashboard/dashboard.component';
import { CardsComponent } from './agents/cards/cards.component';
import { RemittanceFormComponent } from './agents/remittance-form/remittance-form.component';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { AccountFlowRecordsComponent } from './agents/account-flow-records/account-flow-records.component';


@NgModule({
  declarations: [
    AdminComponent,
    ManagementComponent,
    RemittanceComponent,
    TransferBalanceComponent,
    ProfileComponent,
    DashboardComponent,
    CardsComponent,
    RemittanceFormComponent,
    AccountFlowRecordsComponent,

  ],
  imports: [
    CommonModule,
    ComponentsModule,
    AdminRoutingModule,
    RouterModule,
    AgentModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    HttpClient
  ]
})
export class AdminModule { }
