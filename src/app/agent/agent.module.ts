import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentComponent } from './agent.component';
import { AgentRoutingModule } from './agent-routing.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { RouterModule } from '@angular/router';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RemittanceComponent } from './remittance/remittance.component';
import { TransferBalanceComponent } from './transfer-balance/transfer-balance.component';
import { ProfileComponent } from './profile/profile.component';
import { AgentlistComponent } from './components/agent-list/agentlist.component';
import { RemittanceTableComponent } from './remittance/remittance-agent-table/remittance-table.component';
import { RemittanceTransactionTableComponent } from './remittance/remittance-transaction-table/remittance-transaction-table.component';
import { GetListBalanceTransferRequestDTO } from 'src/shared/dataprovider/api/model/getListBalanceTransferRequestDTO';
import { TransferBalanceRequestTableComponent } from './transfer-balance/transfer-balance-request-table/transfer-balance-request-table.component';
import { TransferBalanceHistroyTableComponent } from './transfer-balance/transfer-balance-histroy-table/transfer-balance-histroy-table.component';
import { AgentFormComponent } from './components/agent-list/agent-form/agent-form.component';
import { ListOfBrandsComponent } from './components/list-of-brands/list-of-brands.component';
import { AgentDownlineComponent } from './components/agent-downline/agent-downline.component';
import { ManagementComponent } from './management/management.component';
import { TransactionComponent } from './transaction/transaction.component';
import { CardListComponent } from './card-list/card-list.component';
import { AccountFlowComponent } from './account-flow/account-flow.component';
import { RemittanceTransferbalanceFormComponent } from './components/remittance-transferbalance-form/remittance-transferbalance-form.component';
import { ViewDetailsModalComponent } from './components/view-details-modal/view-details-modal.component';
import { CardFormComponent } from './components/card-form/card-form.component';
import { TotalCommissionComponent } from './dashboard/total-commission/total-commission.component';
import { CommsPerClientComponent } from './dashboard/comms-per-client/comms-per-client.component';
import { ListOfClientsComponent } from './dashboard/list-of-clients/list-of-clients.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';




@NgModule({
  declarations: [
    AgentComponent,
    DashboardComponent,
    RemittanceComponent,
    TransferBalanceComponent,
    ProfileComponent,
    AgentlistComponent,
    RemittanceTableComponent,
    RemittanceTransactionTableComponent,
    TransferBalanceRequestTableComponent,
    TransferBalanceHistroyTableComponent,
    AgentFormComponent,
    ListOfBrandsComponent,
    AgentDownlineComponent,
    ManagementComponent,
    TransactionComponent,
    CardListComponent,
    AccountFlowComponent,
    RemittanceTransferbalanceFormComponent,
    ViewDetailsModalComponent,
    CardFormComponent,
    TotalCommissionComponent,
    CommsPerClientComponent,
    ListOfClientsComponent,
  ],
  imports: [
    CommonModule,
    AgentRoutingModule,
    ComponentsModule,
    MaterialUIModule,
    RouterModule,
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
    
  ],
  exports:[
    DashboardComponent,
    RemittanceComponent,
    TransferBalanceComponent,
    AgentlistComponent,
    RemittanceTableComponent,
    RemittanceTransactionTableComponent,
    TransferBalanceRequestTableComponent,
    TransferBalanceHistroyTableComponent,
    ProfileComponent,
    ListOfBrandsComponent,
    AccountFlowComponent,
    RemittanceTransferbalanceFormComponent,
    CardFormComponent,
    TotalCommissionComponent,
    CommsPerClientComponent,
    ListOfClientsComponent,
    CardListComponent,
    RemittanceComponent,
    


  ]
})
export class AgentModule { }
