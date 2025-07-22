import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountFlowRecordsRoutingModule } from './account-flow-records-routing.module';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { ComponentsModule } from 'src/shared/components/components.module';


@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    AccountFlowRecordsRoutingModule,
    ComponentsModule,
    MaterialUIModule,
  ]
})
export class AccountFlowRecordsModule { }
