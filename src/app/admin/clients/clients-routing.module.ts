import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsComponent } from './clients.component';
import { Routes, RouterModule } from '@angular/router';

const routes : Routes = [
  {
    path: "",
    component: ClientsComponent
  }
];

@NgModule({
 imports: [RouterModule.forChild(routes)],
 exports: [RouterModule]
})
export class ClientsRoutingModule { }
