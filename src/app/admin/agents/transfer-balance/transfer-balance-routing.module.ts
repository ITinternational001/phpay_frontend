import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransferBalanceComponent } from './transfer-balance.component';
import { Routes, RouterModule } from '@angular/router';



const routes : Routes = [
  {
    path: "",
    component: TransferBalanceComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
 })
export class TransferBalanceRoutingModule { }
