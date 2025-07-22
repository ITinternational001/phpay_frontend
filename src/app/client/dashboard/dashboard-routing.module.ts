import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from 'src/app/client/dashboard/dashboard.component';
import { RouterModule, Routes } from '@angular/router';

const routes : Routes = [
  {
    path: "",
    component: DashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
 })
export class DashboardRoutingModule { }
