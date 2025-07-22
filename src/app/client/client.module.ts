import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from 'src/shared/components/components.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientRoutingModule } from './client-routing.module';
import { RouterModule } from '@angular/router';
import { ClientComponent } from './client.component';

@NgModule({
  declarations: [
    ClientComponent,
  ],
  imports: [
    CommonModule,
    ClientRoutingModule,
    ComponentsModule,
    RouterModule,
  ]
})
export class ClientModule { }
