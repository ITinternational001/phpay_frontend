import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementRoutingModule } from './management-routing.module';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { ComponentsModule } from 'src/shared/components/components.module';



@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    ManagementRoutingModule,
    ComponentsModule,
    MaterialUIModule,
  ]
})
export class ManagementModule { }
