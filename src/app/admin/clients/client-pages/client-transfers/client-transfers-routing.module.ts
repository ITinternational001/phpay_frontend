import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientTransfersComponent } from './client-transfers.component';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: '', component:ClientTransfersComponent
  }
];
@NgModule({
 imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientTransfersRoutingModule { }
