import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CofundtransferComponent } from './cofundtransfer.component';
import { RouterModule, Routes } from '@angular/router';


const routes : Routes = [
  {
    path: "",
    component: CofundtransferComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CofundtransferRoutingModule { }
