import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';



@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ComponentsModule,
    MaterialUIModule,
  ]
})
export class DashboardModule { }
