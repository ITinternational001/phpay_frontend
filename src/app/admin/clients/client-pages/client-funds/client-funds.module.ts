import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientFundsRoutingModule } from './client-funds-routing.module';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { ClientFundsComponent } from './client-funds.component';
import { ComponentsModule } from 'src/shared/components/components.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CoWalletsComponent } from '../../../../../shared/components/reusables/co-wallets/co-wallets.component';



@NgModule({
  declarations: [
    ClientFundsComponent,
  ],
  imports: [
    CommonModule,
    ClientFundsRoutingModule,
    MaterialUIModule,
    ComponentsModule,
    FormsModule,
     RouterModule.forChild([
      { path: '', component: ClientFundsComponent }
      // Add other routes if needed
    ])
  ]
})
export class ClientFundsModule { }
