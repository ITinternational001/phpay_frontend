import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentComponent } from './agent.component';
import { RouterModule, Routes } from '@angular/router';



const routes : Routes = [
  {
    path: "",
    component: AgentComponent,
    children: [
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "prefix"
      },
      {
        path: "dashboard",
        loadChildren: () => import('./dashboard/dashboard.module').then(mod => mod.DashboardModule),
        data: {headerLabel: 'agentDashboard', routeName: "Agent Dashboard"}
      },
      {
        path: "remittance",
        loadChildren: () => import('./remittance/remittance.module').then(mod => mod.RemittanceModule),
        data: {headerLabel: 'agentRemittance', routeName: "Agent Remittance"},
       
      },
      {
        path: ":id/profile/:name",
        loadChildren: () => import('./profile/profile.module').then(mod => mod.ProfileModule),
        data: {headerLabel: 'agentProfile', routeName: "Agent Profile"}
      },
      {
        path: "management",
        loadChildren: () => import('./management/management.module').then(mod => mod.ManagementModule),
        data: {headerLabel: 'agentManagement', routeName: "Agent Management"}
      },
      
      {
        path: "card/list",
        loadChildren: () => import('./card-list/card-list.module').then(mod => mod.AgentCardListModule),
        data: {headerLabel: 'cardList', routeName: "Agent Card List"}
      },
      {
        path: "reports/transaction/logs",
        loadChildren: () => import('./transaction/transaction.module').then(mod => mod.TransactionModule),
        data: {headerLabel: 'transactionLogs', routeName: "Agent Transaction Logs"},
        
      },
      {
        path: "reports/account/flow/records",
        loadChildren: () => import('./account-flow/account-flow.module').then(mod => mod.AccountFlowModule),
        data: {headerLabel: 'accountFlowRecords', routeName: "Agent Account Flow Records"},
        
      },  
    ]
  }
];

@NgModule({
 imports: [RouterModule.forChild(routes)],
 exports: [RouterModule]
})
export class AgentRoutingModule { }
