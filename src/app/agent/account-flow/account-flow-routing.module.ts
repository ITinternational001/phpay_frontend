import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountFlowComponent } from './account-flow.component';
import { Routes, RouterModule } from '@angular/router';



const routes : Routes = [
  {
    path: "",
    component: AccountFlowComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
 })
export class AccountFlowRoutingModule { }
