import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemittanceFormComponent } from './remittance-form.component';
import { RouterModule, Routes } from '@angular/router';



const routes : Routes = [
  {
    path: "",
    component: RemittanceFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
 })
export class RemittanceFormRoutingModule { }
