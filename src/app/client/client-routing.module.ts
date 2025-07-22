import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ClientComponent } from './client.component';
import { roleGuard } from 'src/shared/guard/role.guard';

const routes : Routes = [
  {
    path: "",
    component: ClientComponent,
    children: [
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "prefix"
      },
      {
        path: "dashboard",
        loadChildren: () => import('./dashboard/dashboard.module').then(mod => mod.DashboardModule),
        data: {headerLabel: 'operatorDashboard', roles: ['Admin', 'Operator',"Customer Support","Financial Controller"],
          routeName: "Dashboard"
        },
        canActivate:[roleGuard]
      },
      {
        path: "manage/activity/logs",
        loadChildren: () => import('./activity-logs/activity-logs.module').then(mod => mod.ActivityLogsModule),
        data: {headerLabel: 'activityLogs', routeName:"Activity Logs"}
      },
      {
        path: "merchants",
        loadChildren: () => import('./merchants/merchants.module').then(mod => mod.MerchantsModule),
        data: {headerLabel: 'merchants', routeName: "Merchants"}
      },
      {
        path: "cards",
        loadChildren: () => import('./card-list/card-list.module').then(mod => mod.CardListModule),
        data: {headerLabel: 'cardList', routeName: "Card List"}
      },
      {
        path: "remittance",
        loadChildren: () => import('./remittance/remittance.module').then(mod => mod.RemittanceModule),
        data: {headerLabel: 'remittance', roles: ['Admin','Operator',"Customer Support","Financial Controller"]
          , routeName: "remittances"
        },
        canActivate:[roleGuard]
      },
      {
        path: "transactions",
        loadChildren: () => import('./transaction/transaction.module').then(mod => mod.TransactionModule),
        data: {headerLabel: 'transactions', routeName: "Transactions"}
      },
      {
        path: "coFundTransfer",
        loadChildren: () => import('./cofundtransfer/cofundtransfer.module').then(mod => mod.CofundtransferModule),
        data: {headerLabel: 'cashOutFundTransfer', routeName: "CashOut Funds"}
      },
       {
        path: "reports",
        loadChildren: () => import('./reports/reports.module').then(mod => mod.ReportsModule),
        data: {headerLabel: 'reports', roles: ['Admin', 'Operator',"Customer Support","Financial Controller"],
        routeName: "Reports"
        },
        canActivate:[roleGuard]
      },
       {
        path: "manage/users",
        loadChildren: () => import('./user-list/user-list.module').then(mod => mod.UserListModule),
        data: {headerLabel: 'userManagement',  roles: ['Admin', 'Operator',"Customer Support","Financial Controller"],
          routeName: "User Management"
        },
        canActivate:[roleGuard]
      },
      {
        path: "balance/transfer",
        loadChildren: () => import('./client-transfer-balance/client-transfer-balance.module').then(mod => mod.clientTransferBalanceModule),
        data: {headerLabel: 'balanceTransfer', routeName:"Balance Transfer" }
      },

      { 
        path: '', redirectTo: '/page1', pathMatch: 'full' 
      },


    ]
  },
  
];

@NgModule({
 imports: [RouterModule.forChild(routes)],
 exports: [RouterModule]
})

export class ClientRoutingModule { }
