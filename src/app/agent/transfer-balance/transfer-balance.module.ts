import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransferBalanceRoutingModule } from './transfer-balance-routing.module';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { ComponentsModule } from 'src/shared/components/components.module';




@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    TransferBalanceRoutingModule,
    ComponentsModule,
    MaterialUIModule,
  ]
})
export class TransferBalanceModule { }
