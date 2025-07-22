import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemittanceFormRoutingModule } from './remittance-form-routing.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';



@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    RemittanceFormRoutingModule,
    ComponentsModule,
    MaterialUIModule,
  ]
})
export class RemittanceFormModule { }
