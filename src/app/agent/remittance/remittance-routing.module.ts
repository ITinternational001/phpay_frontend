import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemittanceComponent } from './remittance.component';
import { Routes, RouterModule } from '@angular/router';



const routes : Routes = [
  {
    path: "",
    component: RemittanceComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
 })
export class RemittanceRoutingModule { }
