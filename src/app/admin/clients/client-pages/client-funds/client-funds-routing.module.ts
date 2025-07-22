import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientFundsComponent } from './client-funds.component';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: '', component:ClientFundsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientFundsRoutingModule { }
