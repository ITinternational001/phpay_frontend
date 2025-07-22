import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountFlowRecordsComponent } from './account-flow-records.component';
import { Routes, RouterModule } from '@angular/router';



const routes : Routes = [
  {
    path: "",
    component: AccountFlowRecordsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
 })
export class AccountFlowRecordsRoutingModule { }
