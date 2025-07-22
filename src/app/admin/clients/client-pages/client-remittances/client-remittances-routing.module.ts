import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientRemittancesComponent } from './client-remittances.component';
import { Routes, RouterModule } from '@angular/router';



const routes: Routes = [
  {
    path: '', component:ClientRemittancesComponent
  }
];
@NgModule({
 imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRemittancesRoutingModule { }
