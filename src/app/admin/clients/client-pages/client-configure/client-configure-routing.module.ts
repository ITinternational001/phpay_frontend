import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientConfigureComponent } from './client-configure.component';
import { Routes, RouterModule } from '@angular/router';



const routes: Routes = [
  {
    path: '', component:ClientConfigureComponent
  }
];
@NgModule({
 imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientConfigureRoutingModule { }
