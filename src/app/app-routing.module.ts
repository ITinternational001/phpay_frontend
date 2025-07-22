import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from 'src/shared/guard/auth.guard';
import { loginGuard } from 'src/shared/guard/login.guard';
import { logoutGuard } from 'src/shared/guard/logout.guard';
import { LogoutComponent } from 'src/shared/components/logout/logout.component';
import { ClientConfigureComponent } from './admin/clients/client-pages/client-configure/client-configure.component';
import { TransactionRedirectComponent } from './transaction-redirect/transaction-redirect.component';


const routes: Routes = [
  {
    path: "",
    loadChildren: () => import('./login/login.module').then(mod => mod.LoginModule),
    canActivate: [loginGuard]
  },
  {
    path: "login",
    loadChildren: () => import('./login/login.module').then(mod => mod.LoginModule),
    canActivate: [loginGuard]
  },
  {
    path: "password/reset",
    loadChildren: () => import('./passwordreset/passwordreset.module').then(mod => mod.PasswordresetModule),
    canActivate: [authGuard],
  },
  {
    path: "authenticator",
    loadChildren: () => import('./google-auth/google-auth.module').then(mod => mod.GoogleAuthModule),
    canActivate: [authGuard],
  },
  {
    path: "admin",
    loadChildren: () => import('./admin/admin.module').then(mod => mod.AdminModule),
    canActivate: [authGuard],
  },
  {
    path: "client",
    loadChildren: () => import('./client/client.module').then(mod => mod.ClientModule),
    canActivate: [authGuard],
  },
  {
    path: "agent",
    loadChildren: () => import('./agent/agent.module').then(mod => mod.AgentModule),
    //canActivate: [authGuard],
  },
  {
    path: "transaction/success",
    component: TransactionRedirectComponent
    //canActivate: [authGuard],
  },
  {
    path: "transaction/{merchant}/{transactionNo}",
    component: TransactionRedirectComponent
    //canActivate: [authGuard],
  },
  {
    path: "admin/logout",
    component: LogoutComponent,
    canActivate: [logoutGuard],
  },
  {
    path: "client/logout",
    component: LogoutComponent,
    canActivate: [logoutGuard],
  },
  {
    path: "agent/logout",
    component: LogoutComponent,
    canActivate: [logoutGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
