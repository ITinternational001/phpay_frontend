import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { ClientConfigureComponent } from './clients/client-pages/client-configure/client-configure.component';
import { roleGuard } from 'src/shared/guard/role.guard';
import { RemittanceFormComponent } from './agents/remittance-form/remittance-form.component';

const routes: Routes = [
  {
    path: "",
    component: AdminComponent,
    children: [
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "prefix"
      },
      {
        path: "dashboard",
        loadChildren: () => import('./dashboard/dashboard.module').then(mod => mod.DashboardModule),
        data: { headerLabel: 'dashboard', routeName:"Dashboard" }
      },
      {
        path: "dpayclients/list",
        loadChildren: () => import('./clients/clients.module').then(mod => mod.ClientsModule),
        data: { headerLabel: 'clientsList',  routeName:"Client List"},
        canActivate:[roleGuard]
      },

      {
        path: "integration",
        loadChildren: () => import('./integration/integration.module').then(mod => mod.IntegrationModule),
        data: { headerLabel: 'integration', routeName:"Integration" }
      },
      {
        path: "vendors/list",
        loadChildren: () => import('./vendors/vendors.module').then(mod => mod.VendorsModule),
        data: { headerLabel: 'vendors', routeName: "Vendors" }
      },
      {
        path: "manage/users",
        loadChildren: () => import('./users/users.module').then(mod => mod.UsersModule),
        data: { headerLabel: 'userList', routeName:'User Management' }
      },
      {
        path: "manage/merchants",
        loadChildren: () => import('./merchants/merchants.module').then(mod => mod.MerchantsModule),
        data: { headerLabel: 'paymentChannel', routeName:"Merchants" }
      },
      {
        path: "manage/whitelisting",
        loadChildren: () => import('./whitelisting/whitelisting.module').then(mod => mod.WhitelistingModule),
        data: { headerLabel: 'ipWhitelisted', routeName: "IP Whitelisting" }
      },
      {
        path: "manage/activitylogs",
        loadChildren: () => import('./activitylogs/activitylogs.module').then(mod => mod.ActivitylogsModule),
        data: { headerLabel: 'activityLogs', routeName: "Activity Logs" }
      },
      {
        path: "cards/list",
        loadChildren: () => import('./cardlist/cardlist.module').then(mod => mod.CardlistModule),
        data: { headerLabel: 'cardList', routeName: "Card List" }
      },
      {
        path: "admin/transactions",
        loadChildren: () => import('./transactions/transactions.module').then(mod => mod.TransactionsModule),
        data: { headerLabel: 'transactions', routeName: "Transactions" }
      },
      {
        path: "admin/reports",
        loadChildren: () => import('./reports/reports.module').then(mod => mod.ReportsModule),
        data: { headerLabel: 'reports', routeName: "Reports" }
      },
      {
        path: "manage/roles",
        loadChildren: () => import('./roles/roles.module').then(mod => mod.RolesModule),
        data: { headerLabel: 'roleManagement', routeName: "Role Management" }
      },
    
      {
        path: 'dpayclients/configure',
        loadChildren: () => import('./clients/client-pages/client-configure/client-configure.module').then(mod => mod.ClientConfigureModule),
        data: { headerLabel: 'Configure Client', routeName: "Configure Client" }
      },
      {
        path: 'dpayclients/cashoutfunds',
        loadChildren: () => import('./clients/client-pages/client-funds/client-funds.module').then(mod => mod.ClientFundsModule),
        data: { headerLabel: 'availableBalance', routeName: "CashOut Funds" }
      },
      {
        path: 'dpayclients/transfers',
        loadChildren: () => import('./clients/client-pages/client-transfers/client-transfers.module').then(mod => mod.ClientTransfersModule),
        data: { headerLabel: 'transferBalance', routeName: "Balance Transfer" }
      },
      {
        path: 'dpayclients/remittances',
        loadChildren: () => import('./clients/client-pages/client-remittances/client-remittances.module').then(mod => mod.ClientRemittancesModule),
        data: { headerLabel: 'clientRemittances', routeName: "Remittances" }
      },
      {
        path: 'agent/dashboard',
        loadChildren: () => import('./agents/dashboard/dashboard.module').then(mod => mod.DashboardModule),
        data: { headerLabel: 'agentDashboard', routeName:"Agent Dashboard" }
      },
      {
        path: 'agent/management',
        loadChildren: () => import('./agents/management/management.module').then(mod => mod.ManagementModule),
        data: { headerLabel: 'agentManagement', routeName:"Agent Management" }
      },
      {
        path: 'agent/remittance',
        loadChildren: () => import('./agents/remittance/remittance.module').then(mod => mod.RemittanceModule),
        data: { headerLabel: 'agentRemittance', routeName: "Agent Remittance" }
      },
      {
        path: 'agent/balance/transfer',
        loadChildren: () => import('./agents/transfer-balance/transfer-balance.module').then(mod => mod.TransferBalanceModule),
        data: { headerLabel: 'agentTransferBalance', routeName: "Agent Balance Transfer" }
      },
      {
        path: 'agent/:id/profile/:name',
        loadChildren: () => import('./agents/profile/profile.module').then(mod => mod.ProfileModule),
        data: { headerLabel: 'agentProfile', routeName: "Agent Profile" }
      },
      {
        path: 'agent/agent/allocation',
        loadChildren: () => import('./agents/agent-allocation/agent-allocation.module').then(mod => mod.ManagementModule),
        data: { headerLabel: 'agentAllocation', routeName: "Agent Allocation" }
      },
      {
        path: 'agent/agent/cards/list',
        loadChildren: () => import('./agents/cards/cards.module').then(mod => mod.CardsModule),
        data: { headerLabel: 'agentCards', routeName: "Agent Cards" }
      },
      {
        path: 'agent/remittance/form',
        loadChildren: () => import('./agents/remittance-form/remittance-form.module').then(mod => mod.RemittanceFormModule),
        data: { headerLabel: 'agentRemittance', routeName: "Agent Remittance Form" }
      },
      {
        path: 'agent/account/flow/records',
        loadChildren: () => import('./agents/account-flow-records/account-flow-records-routing.module').then(mod => mod.AccountFlowRecordsRoutingModule),
        data: { headerLabel: 'agentAccountFlowRecords', routeName: "Agent Account Flow Records" }
      },


    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
