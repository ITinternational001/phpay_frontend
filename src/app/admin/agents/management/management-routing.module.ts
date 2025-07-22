import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementComponent } from './management.component';
import { Routes, RouterModule } from '@angular/router';




const routes : Routes = [
  {
    path: "",
    component: ManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
 })
export class ManagementRoutingModule { }
